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
// Unit conversion helpers
// ---------------------------------------------------------------------------

function metersToFeet(m) { return Math.round(m * 3.28084) }
function metersToMiles(m) { return Math.round(m / 1609.344 * 10) / 10 }

function secondsToHMS(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// SVG sparkline generation
// ---------------------------------------------------------------------------

/**
 * Generate an SVG elevation sparkline from an array of altitude values (meters).
 * Uses a catmull-rom curve for smooth rendering.
 * Dimensions: 240×60 viewBox. Stroke: #2a4a35, 1.5px. Fill at 20% opacity.
 */
function generateSparklineSVG(altitudes) {
  if (!altitudes || altitudes.length < 2) return null

  const W = 240
  const H = 60
  const PAD = 4

  const min = Math.min(...altitudes)
  const max = Math.max(...altitudes)
  const range = max - min || 1

  // Map altitudes to (x, y) coordinates
  const pts = altitudes.map((alt, i) => ({
    x: (i / (altitudes.length - 1)) * W,
    y: H - PAD - ((alt - min) / range) * (H - PAD * 2),
  }))

  // Downsample to at most 120 points for a clean SVG
  const sampled = downsample(pts, 120)

  const pathD = catmullRomPath(sampled, W, H, PAD)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <path d="${pathD}" stroke="#2a4a35" stroke-width="1.5" fill="#2a4a35" fill-opacity="0.2"/>
</svg>`
}

/** Keep every Nth point to reduce path complexity */
function downsample(pts, maxPts) {
  if (pts.length <= maxPts) return pts
  const step = pts.length / maxPts
  const result = []
  for (let i = 0; i < maxPts; i++) {
    result.push(pts[Math.round(i * step)])
  }
  result.push(pts[pts.length - 1])
  return result
}

/**
 * Build an SVG path string using a catmull-rom spline.
 * The path closes down to the baseline (y = H) to create the filled area.
 */
function catmullRomPath(pts, W, H, PAD) {
  if (pts.length < 2) return ''

  const segments = []
  segments.push(`M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`)

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]

    // Catmull-rom → cubic bezier control points (tension = 0.5)
    const t = 0.5
    const cp1x = p1.x + (p2.x - p0.x) * t / 3
    const cp1y = p1.y + (p2.y - p0.y) * t / 3
    const cp2x = p2.x - (p3.x - p1.x) * t / 3
    const cp2y = p2.y - (p3.y - p1.y) * t / 3

    segments.push(`C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`)
  }

  // Close the fill area along the bottom
  const baseline = H - PAD + 2
  segments.push(`L ${fmt(pts[pts.length - 1].x)} ${baseline}`)
  segments.push(`L ${fmt(pts[0].x)} ${baseline}`)
  segments.push('Z')

  return segments.join(' ')
}

function fmt(n) { return Math.round(n * 10) / 10 }

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
