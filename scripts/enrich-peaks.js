/**
 * enrich-peaks.js
 * Fetches Strava data for each ascent that has a strava_url,
 * generates SVG elevation sparklines, and writes enriched data
 * back to src/data/sps-peaks.json.
 *
 * Usage:
 *   node scripts/enrich-peaks.js              # enrich only missing entries
 *   node scripts/enrich-peaks.js --force      # re-fetch all strava entries
 *   node scripts/enrich-peaks.js --dry-run    # log what would be fetched, write nothing
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getAccessToken } from './strava-auth.js'
import { metersToFeet, metersToMiles, secondsToHMS, generateSparklineSVG } from './peak-enrich-utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PEAKS_PATH = resolve(__dirname, '../src/data/sps-peaks.json')
const SVG_DIR = resolve(__dirname, '../public/strava')
const STRAVA_API = 'https://www.strava.com/api/v3'

const FORCE = process.argv.includes('--force')
const DRY_RUN = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Rate limit tracking
// ---------------------------------------------------------------------------

const rateLimits = { usage15min: 0, limit15min: 100, usageDay: 0, limitDay: 1000 }

function updateRateLimits(headers) {
  const usage = headers.get('x-ratelimit-usage')
  const limit = headers.get('x-ratelimit-limit')
  if (usage) {
    const [u15, uDay] = usage.split(',').map(Number)
    rateLimits.usage15min = u15
    rateLimits.usageDay = uDay
  }
  if (limit) {
    const [l15, lDay] = limit.split(',').map(Number)
    rateLimits.limit15min = l15
    rateLimits.limitDay = lDay
  }
  console.log(`  Rate limits — 15min: ${rateLimits.usage15min}/${rateLimits.limit15min}, day: ${rateLimits.usageDay}/${rateLimits.limitDay}`)
}

async function checkRateLimits() {
  if (rateLimits.usage15min >= rateLimits.limit15min - 5) {
    console.log('Approaching 15-min rate limit — pausing 15 minutes...')
    await new Promise(r => setTimeout(r, 15 * 60 * 1000))
  }
  if (rateLimits.usageDay >= rateLimits.limitDay - 5) {
    throw new Error('Daily Strava rate limit nearly exhausted. Run again tomorrow.')
  }
}

// ---------------------------------------------------------------------------
// Strava API helpers
// ---------------------------------------------------------------------------

async function stravaGet(path, token) {
  await checkRateLimits()
  const res = await fetch(`${STRAVA_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  updateRateLimits(res.headers)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strava API ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Main enrichment logic
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : FORCE ? 'FORCE (re-fetch all)' : 'incremental (skip existing)'}`)

  const token = DRY_RUN ? null : await getAccessToken()
  const data = JSON.parse(readFileSync(PEAKS_PATH, 'utf8'))

  if (!DRY_RUN) {
    mkdirSync(SVG_DIR, { recursive: true })
  }

  let enriched = 0
  let skipped = 0
  let total = 0

  for (const region of data.regions) {
    for (const peak of region.peaks) {
      if (!peak.ascents) continue
      for (const ascent of peak.ascents) {
        if (!ascent.strava_url) continue
        total++

        const activityId = ascent.strava_url.split('/').pop()
        const alreadyEnriched = !!ascent.strava

        if (alreadyEnriched && !FORCE) {
          console.log(`SKIP  ${peak.name} (${activityId}) — already enriched`)
          skipped++
          continue
        }

        console.log(`FETCH ${peak.name} — activity ${activityId}`)

        if (DRY_RUN) {
          console.log(`  [dry-run] would fetch /activities/${activityId} and /activities/${activityId}/streams`)
          enriched++
          continue
        }

        try {
          // Fetch activity summary
          const activity = await stravaGet(`/activities/${activityId}`, token)

          // Fetch altitude + distance streams
          const streams = await stravaGet(
            `/activities/${activityId}/streams?keys=altitude,distance&key_by_type=true`,
            token
          )

          const altitudes = streams.altitude?.data ?? []
          const svgContent = generateSparklineSVG(altitudes)
          const svgPath = `/strava/${activityId}.svg`

          if (svgContent) {
            writeFileSync(resolve(SVG_DIR, `${activityId}.svg`), svgContent)
            console.log(`  SVG written → public/strava/${activityId}.svg`)
          }

          ascent.strava = {
            activity_id: activityId,
            distance_miles: metersToMiles(activity.distance ?? 0),
            elevation_gain_ft: metersToFeet(activity.total_elevation_gain ?? 0),
            moving_time_hms: secondsToHMS(activity.moving_time ?? 0),
            avg_heart_rate: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
            max_heart_rate: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
            sparkline_svg: svgContent ? svgPath : null,
            fetched_at: new Date().toISOString().slice(0, 10),
          }

          enriched++
        } catch (err) {
          console.error(`  ERROR fetching ${activityId}: ${err.message}`)
        }
      }
    }
  }

  console.log(`\nDone. ${enriched} enriched, ${skipped} skipped, ${total} total with strava_url.`)

  if (!DRY_RUN && enriched > 0) {
    writeFileSync(PEAKS_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`Wrote updated peaks JSON → src/data/sps-peaks.json`)
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
