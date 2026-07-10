/**
 * Shared helpers for enrich-peaks.js and enrich-from-fit.js:
 * unit conversion and SVG elevation sparkline generation.
 */

export function metersToFeet(m) { return Math.round(m * 3.28084) }
export function metersToMiles(m) { return Math.round(m / 1609.344 * 10) / 10 }

export function secondsToHMS(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.round(s % 60)
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/**
 * Generate an SVG elevation sparkline from an array of altitude values (meters).
 * Uses a catmull-rom curve for smooth rendering.
 * Dimensions: 240×60 viewBox. Stroke: #2a4a35, 1.5px. Fill at 20% opacity.
 */
export function generateSparklineSVG(altitudes) {
  if (!altitudes || altitudes.length < 2) return null

  const W = 240
  const H = 60
  const PAD = 4

  const min = Math.min(...altitudes)
  const max = Math.max(...altitudes)
  const range = max - min || 1

  const pts = altitudes.map((alt, i) => ({
    x: (i / (altitudes.length - 1)) * W,
    y: H - PAD - ((alt - min) / range) * (H - PAD * 2),
  }))

  const sampled = downsample(pts, 120)
  const pathD = catmullRomPath(sampled, W, H, PAD)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <path d="${pathD}" stroke="#2a4a35" stroke-width="1.5" fill="#2a4a35" fill-opacity="0.2"/>
</svg>`
}

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

function catmullRomPath(pts, W, H, PAD) {
  if (pts.length < 2) return ''

  const segments = []
  segments.push(`M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`)

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]

    const t = 0.5
    const cp1x = p1.x + (p2.x - p0.x) * t / 3
    const cp1y = p1.y + (p2.y - p0.y) * t / 3
    const cp2x = p2.x - (p3.x - p1.x) * t / 3
    const cp2y = p2.y - (p3.y - p1.y) * t / 3

    segments.push(`C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`)
  }

  const baseline = H - PAD + 2
  segments.push(`L ${fmt(pts[pts.length - 1].x)} ${baseline}`)
  segments.push(`L ${fmt(pts[0].x)} ${baseline}`)
  segments.push('Z')

  return segments.join(' ')
}

function fmt(n) { return Math.round(n * 10) / 10 }
