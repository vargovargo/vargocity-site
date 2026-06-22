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
// Tiles x:169-175, y:388-400 at zoom=10 cover all 17 climbed SPS peaks.
// Exact z=8 canvas position via tile-coordinate math (z10/4 = z8 tile):
//   z10Left   = (169/4 - 41)  * 256 = 320   (31.25% of canvas width)
//   z10Top    = (388/4 - 97)  * 256 = 0     (flush with canvas top)
//   z10Width  = (7/4)         * 256 = 448   (43.75% of canvas width)
//   z10Height = (13/4)        * 256 = 832   (65% of canvas height)
const Z10_X_MIN = 169, Z10_Y_MIN = 388, Z10_COLS = 7, Z10_ROWS = 13
const z10Left   = (Z10_X_MIN / 4 - TILE_X_MIN) * 256   // 320
const z10Top    = (Z10_Y_MIN / 4 - TILE_Y_MIN) * 256   // 0
const z10Width  = (Z10_COLS  / 4) * 256                 // 448
const z10Height = (Z10_ROWS  / 4) * 256                 // 832

const DETAIL_SCALE = 3.8

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

  function resetZoom() {
    applyXfm({ scale: 1, tx: 0, ty: 0 }, true)
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return
    didDragRef.current = false
    // No panning when map is at full extent — only zoom/click allowed
    if (xfmRef.current.scale <= 1.05) return
    e.preventDefault()
    clearTimeout(animTimerRef.current)
    setAnimating(false)
    dragRef.current = { x: e.clientX, y: e.clientY, tx: xfmRef.current.tx, ty: xfmRef.current.ty }
    setIsDragging(true)
    setDisambig(null)
  }

  function handleTouchStart(e) {
    didDragRef.current = false
    if (xfmRef.current.scale <= 1.05) return
    if (e.touches.length !== 1) return
    clearTimeout(animTimerRef.current)
    setAnimating(false)
    const t = e.touches[0]
    dragRef.current = { x: t.clientX, y: t.clientY, tx: xfmRef.current.tx, ty: xfmRef.current.ty }
    setIsDragging(true)
    setDisambig(null)
  }

  function handleTouchMove(e) {
    if (!dragRef.current || e.touches.length !== 1) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.x
    const dy = t.clientY - dragRef.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true
    const curr = xfmRef.current
    const newXfm = clampXfm(curr.scale, dragRef.current.tx + dx, dragRef.current.ty + dy)
    xfmRef.current = newXfm
    setXfmState(newXfm)
  }

  function handleTouchEnd() {
    dragRef.current = null
    setIsDragging(false)
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

  function handleDoubleClick(e) {
    const curr = xfmRef.current
    if (curr.scale > 1.05) {
      // Already zoomed → reset to full extent
      resetZoom()
      return
    }
    // At full extent → zoom in, centered exactly on the double-clicked point
    const el = containerRef.current
    if (!el) return
    const { left, top, width: W, height: H } = el.getBoundingClientRect()
    const ppp = W / CANVAS_W  // CSS px per canvas unit at scale=1
    // Convert screen position to canvas coordinates (works for any transform state)
    const canvasX = (e.clientX - left - curr.tx) / curr.scale / ppp
    const canvasY = (e.clientY - top  - curr.ty) / curr.scale / ppp
    applyXfm(clampXfm(
      DETAIL_SCALE,
      W / 2 - canvasX * DETAIL_SCALE * ppp,
      H / 2 - canvasY * DETAIL_SCALE * ppp,
    ), true)
  }

  // Z=10 overlay fades in from scale 1.5 → 3
  const z10Opacity = Math.min(1, Math.max(0, (xfm.scale - 1.5) / 1.5))

  // Constant-screen-size markers. Touch devices get larger targets.
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const containerW = containerRef.current?.offsetWidth ?? 460
  const ppp = containerW / CANVAS_W
  const mR  = (isTouch ? 9  : 5)  / (ppp * xfm.scale)   // normal marker radius in canvas units
  const mRS = (isTouch ? 14 : 9)  / (ppp * xfm.scale)   // selected marker radius
  const mSW = 1.5 / (ppp * xfm.scale)  // normal stroke width
  const mSSW = 2  / (ppp * xfm.scale)  // selected stroke width

  const isZoomed = xfm.scale > 1.05

  return (
    <div style={{ position: 'relative', maxWidth: 460 }}>
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: `${CANVAS_W} / ${VISIBLE_H}`,
        cursor: isDragging ? 'grabbing' : (isZoomed ? 'grab' : 'default'),
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // Capture touch when zoomed so the browser doesn't scroll the page instead
        touchAction: isZoomed ? 'none' : 'auto',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          transform: `matrix(${xfm.scale}, 0, 0, ${xfm.scale}, ${xfm.tx}, ${xfm.ty})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          position: 'relative',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 91%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 85%, transparent 91%)',
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

        {/* Z=10 detail overlay — fades in past 1.5× zoom.
            x:169-175, y:388-400 at zoom=10 → covers all 17 climbed peaks. */}
        <img
          src={BASE_URL + 'sierra-hillshade-z10.webp'}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            left:   `${z10Left   / CANVAS_W * 100}%`,
            top:    `${z10Top    / CANVAS_H * 100}%`,
            width:  `${z10Width  / CANVAS_W * 100}%`,
            height: `${z10Height / CANVAS_H * 100}%`,
            opacity: z10Opacity,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* SVG peak-marker overlay — markers stay constant screen size via scaled r */}
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
                r={isSel ? mRS : mR}
                fill={isSel ? 'var(--c-accent, #FC4C02)' : 'rgba(255,255,255,0.88)'}
                stroke={isSel ? 'white' : 'rgba(20,50,70,0.5)'}
                strokeWidth={isSel ? mSSW : mSW}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={e => {
                  e.stopPropagation()
                  if (didDragRef.current) return
                  const svgEl = e.currentTarget.ownerSVGElement
                  const rect = svgEl.getBoundingClientRect()
                  const svgX = (e.clientX - rect.left) / rect.width * CANVAS_W
                  const svgY = (e.clientY - rect.top) / rect.height * CANVAS_H
                  // threshold in canvas units — wider on touch to compensate for finger imprecision
                  const threshold = (isTouch ? 20 : 12) * CANVAS_W / rect.width
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
    </div>{/* end map viewport */}

      {/* Peak detail panel — floats right on desktop, expands below map on mobile */}
      {selected && (
        <div
          style={window.innerWidth < 600 ? {
            marginTop: 8,
            width: '100%',
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 4,
            padding: '12px 14px',
          } : {
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

      {/* Disambiguation popup — inline below map on mobile, floating on desktop */}
      {disambig && (window.innerWidth < 600 ? (
        <div
          style={{
            marginTop: 8,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 4,
            padding: '4px 0',
          }}
        >
          <p style={{ fontSize: 10, color: 'var(--c-text-muted)', padding: '4px 12px 2px', margin: 0 }}>
            Select a peak:
          </p>
          {disambig.peaks.map(p => (
            <button
              key={p.name}
              onClick={() => { setSelected(p); setDisambig(null) }}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                width: '100%', textAlign: 'left', padding: '6px 12px',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--c-text)' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                {parseInt(p.elevation_ft ?? p.elevation, 10).toLocaleString()} ft
              </span>
            </button>
          ))}
        </div>
      ) : (() => {
        const popupW = 180
        const popupH = disambig.peaks.length * 30 + 20
        const popupLeft = disambig.clientX + 10 + popupW > window.innerWidth
          ? Math.max(4, disambig.clientX - popupW)
          : disambig.clientX + 10
        const popupTop = disambig.clientY + 10 + popupH > window.innerHeight
          ? Math.max(4, disambig.clientY - popupH)
          : disambig.clientY + 10
        return (
          <div
            style={{
              position: 'fixed',
              left: popupLeft,
              top: popupTop,
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
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  width: '100%', textAlign: 'left', padding: '5px 12px',
                  background: 'none', border: 'none', cursor: 'pointer',
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
        )
      })())}
    </div>
  )
}
