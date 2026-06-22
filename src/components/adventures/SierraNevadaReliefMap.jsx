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
const SCALE_MAX = 5

// aspectRatio clips the ~120px of transparent space below the southern boundary
const VISIBLE_H = 1160

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
function cdnAuto(url) {
  if (!url?.includes('cloudinary.com')) return url
  if (url.includes('/upload/f_auto')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}

export default function SierraNevadaReliefMap() {
  const [selected, setSelected] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [xfm, setXfmState] = useState({ scale: 1, tx: 0, ty: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const xfmRef = useRef({ scale: 1, tx: 0, ty: 0 })
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const didDragRef = useRef(false)

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

  function zoomBy(factor) {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const curr = xfmRef.current
    const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, curr.scale * factor))
    if (newScale === curr.scale) return
    // Zoom toward the center of the visible container
    const cx = width / 2
    const cy = height / 2
    const canvasX = (cx - curr.tx) / curr.scale
    const canvasY = (cy - curr.ty) / curr.scale
    const newXfm = clampXfm(newScale, cx - canvasX * newScale, cy - canvasY * newScale)
    xfmRef.current = newXfm
    setXfmState(newXfm)
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return
    e.preventDefault()
    didDragRef.current = false
    dragRef.current = { x: e.clientX, y: e.clientY, tx: xfmRef.current.tx, ty: xfmRef.current.ty }
    setIsDragging(true)
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
    if (!didDragRef.current) setSelected(null)
    didDragRef.current = false
  }

  function handleDoubleClick() {
    const reset = { scale: 1, tx: 0, ty: 0 }
    xfmRef.current = reset
    setXfmState(reset)
  }

  const btnStyle = {
    width: 22, height: 22,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 14, lineHeight: 1,
    color: 'var(--c-text-muted)',
    padding: 0,
    userSelect: 'none',
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        maxWidth: 460,
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
      {/*
        Transform target — image + SVG markers move together.
        mask-image smooths the top edge where the boundary blur is clipped by
        the canvas edge (northernmost point sits only ~26px from canvas top).
      */}
      <div
        style={{
          transform: `matrix(${xfm.scale}, 0, 0, ${xfm.scale}, ${xfm.tx}, ${xfm.ty})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          position: 'relative',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%)',
        }}
      >
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
                  if (!didDragRef.current) setSelected(isSel ? null : peak)
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

      {/* Zoom controls */}
      <div
        style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 2 }}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          style={{ ...btnStyle, opacity: xfm.scale >= SCALE_MAX ? 0.35 : 1 }}
          onClick={() => zoomBy(1.6)}
          aria-label="Zoom in"
        >+</button>
        <button
          style={{ ...btnStyle, opacity: xfm.scale <= SCALE_MIN ? 0.35 : 1 }}
          onClick={() => zoomBy(1 / 1.6)}
          aria-label="Zoom out"
        >−</button>
      </div>

      {/* Peak detail panel — not transformed, stays fixed at top-right */}
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
