import { useState, useRef } from 'react'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

// ── Projection constants — must match generate-sierra-hillshade.py ────────────
const ZOOM = 8
const TILE_X_MIN = 41
const TILE_Y_MIN = 97
const CANVAS_W = 1024   // 4 tiles × 256
const CANVAS_H = 1280   // 5 tiles × 256
const SCALE_MIN = 1
const SCALE_MAX = 6

// aspectRatio clips the ~120px of transparent space below the southern boundary
const VISIBLE_H = 1160

const BASE_URL = import.meta.env.BASE_URL || '/'

// ── Z=10 detail overlay ───────────────────────────────────────────────────────
// The z=10 image covers tiles x:172-175, y:394-400 at zoom=10.
// In Mercator, z=10 tile (tx,ty) = z=8 tile (tx/4, ty/4).
// So the z=10 region maps to z=8 tile columns 43.0-44.0 and rows 98.5-100.25,
// which gives exact canvas pixel positions without any geographic reprojection.
const Z10_X_MIN = 172, Z10_Y_MIN = 394, Z10_COLS = 4, Z10_ROWS = 7
const z10Left   = (Z10_X_MIN / 4 - TILE_X_MIN) * 256   // 512
const z10Top    = (Z10_Y_MIN / 4 - TILE_Y_MIN) * 256   // 384
const z10Width  = (Z10_COLS  / 4) * 256                 // 256
const z10Height = (Z10_ROWS  / 4) * 256                 // 448

// Detail zoom target: center on the Palisades / Evolution cluster
const DETAIL_SCALE = 3.8
const DETAIL_LNG = -118.6
const DETAIL_LAT = 37.15

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

function cdnAuto(url) {
  if (!url?.includes('cloudinary.com')) return url
  if (url.includes('/upload/f_auto')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export default function SierraNevadaReliefMap() {
  const [selected, setSelected] = useState(null)
  const [disambig, setDisambig] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [xfm, setXfmState] = useState({ scale: 1, tx: 0, ty: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [animating, setAnimating] = useState(false)

  const xfmRef = useRef({ scale: 1, tx: 0, ty: 0 })
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const didDragRef = useRef(false)
  const animTimerRef = useRef(null)

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  function clampXfm(scale, tx, ty) {
    const el = containerRef.current
    if (!el) return { scale, tx, ty }
    const { width, height } = el.getBoundingClientRect()
    const imgW = width * scale
    const imgH = (CANVAS_H / CANVAS_W) * width * scale
    return {
      scale,
      tx: Math.max(Math.min(0, width - imgW), Math.min(0, tx)),
      ty: Math.max(Math.min(0, height - imgH), Math.min(0, ty)),
    }
  }

  function applyXfm(xfmVal, animated = false) {
    clearTimeout(animTimerRef.current)
    if (animated) {
      setAnimating(true)
      animTimerRef.current = setTimeout(() => setAnimating(false), 480)
    }
    xfmRef.current = xfmVal
    setXfmState(xfmVal)
  }

  function zoomToDetail() {
    const el = containerRef.current
    if (!el) return
    const { width: W, height: H } = el.getBoundingClientRect()
    const [cx, cy] = geoToCanvas(DETAIL_LNG, DETAIL_LAT)
    const ppp = W / CANVAS_W  // CSS pixels per canvas pixel at scale=1
    applyXfm(clampXfm(DETAIL_SCALE, W / 2 - cx * DETAIL_SCALE * ppp, H / 2 - cy * DETAIL_SCALE * ppp), true)
  }

  function resetZoom() {
    applyXfm({ scale: 1, tx: 0, ty: 0 }, true)
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return
    e.preventDefault()
    clearTimeout(animTimerRef.current)
    setAnimating(false)
    didDragRef.current = false
    dragRef.current = { x: e.clientX, y: e.clientY, tx: xfmRef.current.tx, ty: xfmRef.current.ty }
    setIsDragging(true)
    setDisambig(null)
  }

  function handleMouseMove(e) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true
    const curr = xfmRef.current
    const newXfm = clampXfm(curr.scale, dragRef.current.tx + dx, dragRef.current.ty + dy)
    xfmRef.current = newXfm
    setXfmState(newXfm)
  }

  function handleMouseUp() {
    dragRef.current = null
    setIsDragging(false)
  }

  function handleClick() {
    if (!didDragRef.current) { setSelected(null); setDisambig(null) }
    didDragRef.current = false
  }

  function handleDoubleClick() {
    // Toggle: zoom in from full extent, or reset when already zoomed
    if (xfmRef.current.scale <= 1.05) {
      zoomToDetail()
    } else {
      resetZoom()
    }
  }

  // Z=10 overlay opacity: fades in from scale 1.5 → 3
  const z10Opacity = Math.min(1, Math.max(0, (xfm.scale - 1.5) / 1.5))

  const isAtFullExtent = xfm.scale <= 1.05

  return (
    <div style={{ position: 'relative', maxWidth: 460 }}>
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: `${CANVAS_W} / ${VISIBLE_H}`,
        cursor: isDragging ? 'grabbing' : (xfm.scale > 1 ? 'grab' : 'default'),
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `matrix(${xfm.scale}, 0, 0, ${xfm.scale}, ${xfm.tx}, ${xfm.ty})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          position: 'relative',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%)',
          transition: animating ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        {/* Z=8 overview — always visible */}
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

        {/* Z=10 detail overlay — fades in as user zooms past 1.5×.
            Positioned in exact z=8 canvas pixel space using tile math:
            z10 tiles (172-175, 394-400) at zoom 10 = tiles (43-44, 98.5-100.25) at zoom 8. */}
        <img
          src={BASE_URL + 'sierra-hillshade-z10.webp'}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${z10Left / CANVAS_W * 100}%`,
            top: `${z10Top / CANVAS_H * 100}%`,
            width: `${z10Width / CANVAS_W * 100}%`,
            height: `${z10Height / CANVAS_H * 100}%`,
            opacity: z10Opacity,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            imageRendering: 'auto',
          }}
        />

        {/* SVG peak-marker overlay */}
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
                r={(isSel ? 14 : 8) / xfm.scale}
                fill={isSel ? 'var(--c-accent, #FC4C02)' : 'rgba(255,255,255,0.88)'}
                stroke={isSel ? 'white' : 'rgba(20,50,70,0.5)'}
                strokeWidth={(isSel ? 2.5 : 1.5) / xfm.scale}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={e => {
                  e.stopPropagation()
                  if (didDragRef.current) return
                  const svgEl = e.currentTarget.ownerSVGElement
                  const rect = svgEl.getBoundingClientRect()
                  const svgX = (e.clientX - rect.left) / rect.width * CANVAS_W
                  const svgY = (e.clientY - rect.top) / rect.height * CANVAS_H
                  const threshold = 12 * CANVAS_W / rect.width
                  const nearby = mappable
                    .filter(p => {
                      const [px, py] = geoToCanvas(p.lng, p.lat)
                      return Math.hypot(px - svgX, py - svgY) < threshold
                    })
                    .sort((a, b) =>
                      parseInt(b.elevation_ft ?? b.elevation, 10) -
                      parseInt(a.elevation_ft ?? a.elevation, 10)
                    )
                  if (nearby.length <= 1) {
                    setSelected(isSel ? null : peak)
                    setDisambig(null)
                  } else {
                    setDisambig({ peaks: nearby, clientX: e.clientX, clientY: e.clientY })
                  }
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
      </div>

      {/* Hint label — fades out once the user has zoomed */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          fontSize: 10,
          color: 'var(--c-text-muted)',
          letterSpacing: '0.03em',
          pointerEvents: 'none',
          opacity: isAtFullExtent ? 0.75 : 0,
          transition: 'opacity 0.4s ease',
          userSelect: 'none',
        }}
      >
        double click to zoom
      </div>
    </div>{/* end map viewport */}

      {/* Peak detail panel */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 'calc(100% + 16px)',
            width: 264,
            zIndex: 10,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 4,
            padding: '12px 14px',
            maxHeight: '100%',
            overflowY: 'auto',
          }}
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

      {/* Disambiguation popup */}
      {disambig && (
        <div
          style={{
            position: 'fixed',
            left: disambig.clientX + 10,
            top: disambig.clientY + 10,
            zIndex: 50,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 4,
            padding: '4px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            minWidth: 160,
          }}
          onClick={e => e.stopPropagation()}
        >
          {disambig.peaks.map(p => (
            <button
              key={p.name}
              onClick={() => { setSelected(p); setDisambig(null) }}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '5px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--c-text)' }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
                {parseInt(p.elevation_ft ?? p.elevation, 10).toLocaleString()} ft
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
