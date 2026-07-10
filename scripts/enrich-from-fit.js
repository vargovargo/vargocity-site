/**
 * enrich-from-fit.js
 * Fallback to enrich-peaks.js for when the Strava API is unavailable
 * (e.g. subscription-gated). Parses a locally downloaded .fit file and
 * writes the same `strava` object shape onto one or more named peaks'
 * most recent ascent.
 *
 * Usage:
 *   node scripts/enrich-from-fit.js <path-to-fit-file> <"Peak Name"> [<"Peak Name 2"> ...]
 *
 * Multiple peak names are treated as summits from a single hike (shared
 * activity/sparkline), matching how enrich-peaks.js handles multi-peak days.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import FitParser from 'fit-file-parser'
import { metersToFeet, metersToMiles, secondsToHMS, generateSparklineSVG } from './peak-enrich-utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PEAKS_PATH = resolve(__dirname, '../src/data/sps-peaks.json')
const SVG_DIR = resolve(__dirname, '../public/strava')

const [, , fitPath, ...peakNames] = process.argv

if (!fitPath || peakNames.length === 0) {
  console.error('Usage: node scripts/enrich-from-fit.js <path-to-fit-file> <"Peak Name"> [<"Peak Name 2"> ...]')
  process.exit(1)
}

function parseFit(path) {
  return new Promise((resolvePromise, reject) => {
    const parser = new FitParser({ force: true, mode: 'list' })
    const buf = readFileSync(path)
    parser.parse(buf, (err, data) => {
      if (err) reject(new Error(err))
      else resolvePromise(data)
    })
  })
}

function findLatestAscent(data, peakName) {
  for (const region of data.regions) {
    for (const peak of region.peaks) {
      if (peak.name !== peakName) continue
      const ascents = (peak.ascents || []).filter(a => a.strava_url)
      if (ascents.length === 0) return null
      return ascents.reduce((latest, a) => (a.date > latest.date ? a : latest))
    }
  }
  return null
}

async function main() {
  const fit = await parseFit(fitPath)
  const session = fit.sessions?.[0]
  if (!session) throw new Error('No session summary found in .fit file')

  const altitudes = (fit.records || [])
    .map(r => r.altitude)
    .filter(alt => typeof alt === 'number')

  const svgContent = generateSparklineSVG(altitudes)

  const data = JSON.parse(readFileSync(PEAKS_PATH, 'utf8'))

  let activityId = null
  const targets = []

  for (const peakName of peakNames) {
    const ascent = findLatestAscent(data, peakName)
    if (!ascent) {
      console.error(`SKIP  ${peakName} — no ascent with strava_url found`)
      continue
    }
    const id = ascent.strava_url.split('/').pop()
    activityId ??= id
    targets.push({ peakName, ascent })
  }

  if (targets.length === 0) {
    console.error('No matching ascents found. Nothing to do.')
    process.exit(1)
  }

  const svgPath = `/strava/${activityId}.svg`
  if (svgContent) {
    mkdirSync(SVG_DIR, { recursive: true })
    writeFileSync(resolve(SVG_DIR, `${activityId}.svg`), svgContent)
    console.log(`SVG written → public/strava/${activityId}.svg`)
  }

  const strava = {
    activity_id: activityId,
    distance_miles: metersToMiles(session.total_distance ?? 0),
    elevation_gain_ft: metersToFeet(session.total_ascent ?? 0),
    moving_time_hms: secondsToHMS(session.total_timer_time ?? 0),
    avg_heart_rate: session.avg_heart_rate ?? null,
    max_heart_rate: session.max_heart_rate ?? null,
    sparkline_svg: svgContent ? svgPath : null,
    fetched_at: new Date().toISOString().slice(0, 10),
    source: 'fit_file',
  }

  for (const { peakName, ascent } of targets) {
    ascent.strava = strava
    console.log(`ENRICHED ${peakName} (${activityId})`)
  }

  writeFileSync(PEAKS_PATH, JSON.stringify(data, null, 2) + '\n')
  console.log(`\nWrote updated peaks JSON → src/data/sps-peaks.json`)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
