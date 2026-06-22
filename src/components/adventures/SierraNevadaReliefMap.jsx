import { useState } from 'react'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

// ── Projection constants — must match generate-sierra-hillshade.py ────────────
const ZOOM = 8
const TILE_X_MIN = 41
const TILE_Y_MIN = 97
const CANVAS_W = 1024   // 4 tiles × 256
const CANVAS_H = 1280   // 5 tiles × 256

const BASE_URL = import.meta.env.BASE_URL || '/'

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

// Cloudinary serves HEIC as JPEG/WebP when f_auto is present.
// Without it, non-Safari browsers silently blank on .heic uploads.
function cdnAuto(url) {
  if (!url?.includes('cloudinary.com')) return url
  if (url.includes('/upload/f_auto')) return url  // already transformed
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export default function SierraNevadaReliefMap() {
  const [selected, setSelected] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  return (
    <div
      style={{ position: 'relative', maxWidth: 460 }}
      onClick={() => setSelected(null)}
    >
      {/*
        The WebP has a pre-baked feathered alpha channel — the terrain fades
        naturally at the edges with no hard boundary line.
        CSS drop-shadow follows the alpha shape to create the floating effect.
      */}
      <img
        src={BASE_URL + 'sierra-hillshade.webp'}
        alt="Sierra Nevada relief"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(3px 8px 32px rgba(0,0,0,0.18))',
        }}
      />

      {/* SVG peak-marker overlay — same coordinate space as the image */}
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
              stroke={isSel ? 'white' : 'rgba(20,50,70,0.5)'}
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
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 10, paddingRight: 16,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>
              {selected.name}
            </span>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)', marginLeft: 8, whiteSpace: 'nowrap' }}>
              {parseInt(selected.elevation_ft ?? selected.elevation, 10).toLocaleString()} ft
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected.ascents.map((ascent, i) => (
              <div
                key={i}
                style={i > 0 ? { paddingTop: 12, borderTop: '1px solid var(--c-border)' } : {}}
              >
                <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(ascent.date)}
                </p>

                {ascent.notes && (
                  <p style={{ fontSize: 11, lineHeight: '1.55', color: 'var(--c-text-body)', marginBottom: 6 }}>
                    {ascent.notes}
                  </p>
                )}

                {ascent.strava?.sparkline_svg && (
                  <img
                    src={BASE_URL + ascent.strava.sparkline_svg.replace(/^\//, '')}
                    alt="elevation profile"
                    style={{ height: 28, width: 'auto', opacity: 0.65, marginBottom: 4, display: 'block' }}
                  />
                )}

                {ascent.strava?.distance_miles && (
                  <p style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 6 }}>
                    ↑ {ascent.strava.elevation_gain_ft?.toLocaleString()} ft · {ascent.strava.distance_miles} mi · {ascent.strava.moving_time_hms}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {ascent.strava_url && (
                    <a
                      href={ascent.strava_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#FC4C02', textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      Strava
                    </a>
                  )}

                  {ascent.photos?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ascent.photos.map((photo, pi) => (
                        <button
                          key={pi}
                          onClick={() => setLightbox({
                            photos: ascent.photos.map(p => ({ ...p, url: cdnAuto(p.url) })),
                            peakName: selected.name,
                            startIndex: pi,
                          })}
                          style={{
                            width: 44, height: 44, borderRadius: 3, overflow: 'hidden',
                            flexShrink: 0, padding: 0, border: '1px solid var(--c-border)',
                            cursor: 'pointer', background: 'none',
                          }}
                        >
                          <img
                            src={cdnAuto(photo.url)}
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

      {/* Hover tooltip */}
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
