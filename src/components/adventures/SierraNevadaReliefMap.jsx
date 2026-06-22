import { useEffect, useRef, useState, useCallback } from 'react'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

// ── Projection constants ──────────────────────────────────────────────────────
// Must match scripts/generate-sierra-hillshade.py exactly.
const ZOOM = 8
const TILE_X_MIN = 41
const TILE_Y_MIN = 97
const CANVAS_W = 1024  // 4 tiles × 256
const CANVAS_H = 1280  // 5 tiles × 256

const BASE_URL = import.meta.env.BASE_URL || '/'

// CNRA Sierra Nevada boundary (primary); local approximation as fallback
const CNRA_BOUNDARY_URL =
  'https://gis.data.cnra.ca.gov/datasets/727b3cc24f8549759fe946a298dc3a20_0.geojson'
const LOCAL_BOUNDARY_URL = BASE_URL + 'sierra-nevada-boundary.geojson'
const HILLSHADE_URL = BASE_URL + 'sierra-hillshade.webp'

function geoToCanvas(lng, lat) {
  const n = Math.pow(2, ZOOM)
  const tx = (lng + 180) / 360 * n
  const latRad = lat * Math.PI / 180
  const ty =
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  return [(tx - TILE_X_MIN) * 256, (ty - TILE_Y_MIN) * 256]
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

async function loadBoundary() {
  try {
    const r = await fetch(CNRA_BOUNDARY_URL, { mode: 'cors' })
    if (r.ok) return r.json()
  } catch (_) { /* fall through to local */ }
  const r = await fetch(LOCAL_BOUNDARY_URL)
  return r.json()
}

function drawBoundaryClip(ctx, geojson) {
  const geom = geojson.features[0].geometry
  const outerRings =
    geom.type === 'Polygon'
      ? [geom.coordinates[0]]
      : geom.coordinates.map(poly => poly[0])

  ctx.beginPath()
  for (const ring of outerRings) {
    const [x0, y0] = geoToCanvas(ring[0][0], ring[0][1])
    ctx.moveTo(x0, y0)
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = geoToCanvas(ring[i][0], ring[i][1])
      ctx.lineTo(x, y)
    }
    ctx.closePath()
  }
  ctx.clip('evenodd')
}

export default function SierraNevadaReliefMap() {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    Promise.all([
      fetch(HILLSHADE_URL).then(r => r.blob()).then(b => createImageBitmap(b)),
      loadBoundary(),
    ]).then(([bitmap, geojson]) => {
      ctx.save()
      drawBoundaryClip(ctx, geojson)
      ctx.drawImage(bitmap, 0, 0, CANVAS_W, CANVAS_H)
      ctx.restore()
      setReady(true)
    }).catch(err => {
      console.error('SierraNevadaReliefMap load error:', err)
    })
  }, [])

  const handleCanvasClick = useCallback(() => setSelected(null), [])

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  return (
    <div
      style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}
      onClick={handleCanvasClick}
    >
      {/* Terrain canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          filter: ready ? 'drop-shadow(2px 6px 28px rgba(0,0,0,0.13))' : 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
            Loading terrain…
          </span>
        </div>
      )}

      {/* SVG peak-marker overlay (rendered in hillshade coordinate space) */}
      {ready && (
        <svg
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {mappable.map(peak => {
            const [cx, cy] = geoToCanvas(peak.lng, peak.lat)
            const isSel = selected?.name === peak.name
            return (
              <circle
                key={peak.name}
                cx={cx}
                cy={cy}
                r={isSel ? 14 : 8}
                fill={isSel ? 'var(--c-accent, #FC4C02)' : 'rgba(255,255,255,0.88)'}
                stroke={isSel ? 'white' : 'rgba(20,50,70,0.55)'}
                strokeWidth={isSel ? 2.5 : 1.5}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={e => {
                  e.stopPropagation()
                  setSelected(isSel ? null : peak)
                }}
                onMouseEnter={e =>
                  setTooltip({ name: peak.name, x: e.clientX, y: e.clientY })
                }
                onMouseMove={e =>
                  setTooltip(t => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                }
                onMouseLeave={() => setTooltip(null)}
              />
            )
          })}
        </svg>
      )}

      {/* Peak detail panel */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 264,
            zIndex: 10,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 4,
            padding: '12px 14px',
            maxHeight: '80%',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: 7, right: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 15, lineHeight: 1, padding: '2px 4px',
              color: 'var(--c-text-muted)',
            }}
            aria-label="close"
          >×</button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
              paddingRight: 16,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>
              {selected.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--c-text-muted)',
                marginLeft: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {parseInt(selected.elevation_ft ?? selected.elevation, 10).toLocaleString()} ft
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected.ascents.map((ascent, i) => (
              <div
                key={i}
                style={
                  i > 0
                    ? { paddingTop: 12, borderTop: '1px solid var(--c-border)' }
                    : {}
                }
              >
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--c-text-muted)',
                    marginBottom: 4,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatDate(ascent.date)}
                </p>

                {ascent.notes && (
                  <p
                    style={{
                      fontSize: 11,
                      lineHeight: '1.55',
                      color: 'var(--c-text-body)',
                      marginBottom: 6,
                    }}
                  >
                    {ascent.notes}
                  </p>
                )}

                {ascent.strava?.sparkline_svg && (
                  <img
                    src={BASE_URL + ascent.strava.sparkline_svg.replace(/^\//, '')}
                    alt="elevation profile"
                    style={{
                      height: 28,
                      width: 'auto',
                      opacity: 0.65,
                      marginBottom: 4,
                      display: 'block',
                    }}
                  />
                )}

                {ascent.strava?.distance_miles && (
                  <p
                    style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 6 }}
                  >
                    ↑ {ascent.strava.elevation_gain_ft?.toLocaleString()} ft ·{' '}
                    {ascent.strava.distance_miles} mi · {ascent.strava.moving_time_hms}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {ascent.strava_url && (
                    <a
                      href={ascent.strava_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: '#FC4C02',
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      }}
                    >
                      Strava
                    </a>
                  )}

                  {ascent.photos?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ascent.photos.map((photo, pi) => (
                        <button
                          key={pi}
                          onClick={() =>
                            setLightbox({
                              photos: ascent.photos,
                              peakName: selected.name,
                              startIndex: pi,
                            })
                          }
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 3,
                            overflow: 'hidden',
                            flexShrink: 0,
                            padding: 0,
                            border: '1px solid var(--c-border)',
                            cursor: 'pointer',
                            background: 'none',
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || selected.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            pointerEvents: 'none',
            zIndex: 20,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 3,
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--c-text)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.name}
        </div>
      )}

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          peakName={lightbox.peakName}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
