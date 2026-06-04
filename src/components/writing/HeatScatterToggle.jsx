import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

const TYPE_COLORS = {
  shock:  'var(--c-heat-shock)',
  stress: 'var(--c-heat-stress)',
  shift:  'var(--c-heat-shift)',
}

const TYPE_BG = {
  shock:  'var(--c-heat-shock-bg)',
  stress: 'var(--c-heat-stress-bg)',
  shift:  'var(--c-heat-shift-bg)',
}

const TYPES    = ['shock', 'stress', 'shift']
const Y_OPTS   = ['vulnerability', 'resilience']
const Y_LABELS = { vulnerability: 'Social Vulnerability', resilience: 'Community Resilience' }
const Y_NOTE   = { vulnerability: 'higher = more vulnerable', resilience: 'higher = more resilient' }

// SVG layout constants
const W = 460, H = 340
const ML = 44, MR = 14, MT = 16, MB = 44
const PW = W - ML - MR   // 402
const PH = H - MT - MB   // 280

function px(score) { return ML + score * PW }
function py(val)   { return MT + (1 - val / 100) * PH }

function linRegress(xs, ys) {
  const n = xs.length
  if (n < 2) return null
  const xm = xs.reduce((a, b) => a + b, 0) / n
  const ym = ys.reduce((a, b) => a + b, 0) / n
  const num = xs.reduce((acc, x, i) => acc + (x - xm) * (ys[i] - ym), 0)
  const dx2 = xs.reduce((acc, x) => acc + (x - xm) ** 2, 0)
  const dy2 = ys.reduce((acc, y) => acc + (y - ym) ** 2, 0)
  if (dx2 === 0) return null
  const slope = num / dx2
  const intercept = ym - slope * xm
  const r = num / Math.sqrt(dx2 * dy2)
  return { slope, intercept, r }
}

function useContainerWidth(fallback = 460) {
  const ref = useRef()
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, width]
}

export default function HeatScatterToggle() {
  const [counties, setCounties] = useState(null)
  const [activeDomain, setActiveDomain] = useState('stress')
  const [activeY, setActiveY]           = useState('vulnerability')
  const [hovered, setHovered]           = useState(null)
  const [tooltipPos, setTooltipPos]     = useState({ x: 0, y: 0 })
  const [containerRef, width]           = useContainerWidth()

  useEffect(() => {
    fetch('/data/heat-counties-panel.json')
      .then(r => r.json())
      .then(d => setCounties(d.counties))
  }, [])

  // Build plot points
  const { points, reg } = useMemo(() => {
    if (!counties) return { points: [], reg: null }
    const pts = counties.map(c => {
      const h = c.hazards.heat
      const m = h.metrics
      return {
        fips:      c.county_fips,
        name:      c.name,
        state:     c.state,
        dominant:  h.dominant,
        scoreVal:  h.scores[activeDomain],
        metricVal: activeY === 'vulnerability' ? m.sovi_score : m.resl_score,
      }
    }).filter(p => p.scoreVal != null && p.metricVal != null)

    const reg = linRegress(pts.map(p => p.scoreVal), pts.map(p => p.metricVal))
    return { points: pts, reg }
  }, [counties, activeDomain, activeY])

  const svgH = Math.round((H / W) * width)
  const scale = width / W

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [containerRef])

  const domainColor = TYPE_COLORS[activeDomain]

  // Axis ticks
  const xTicks = [0, 0.25, 0.5, 0.75, 1.0]
  const yTicks = [0, 25, 50, 75, 100]

  const STATE_ABBR = {
    '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
    '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
    '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
    '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
    '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
    '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
    '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
    '55':'WI','56':'WY',
  }

  return (
    <div className="my-6 not-prose">
      {/* Controls row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 items-center">
        {/* Domain toggle */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px', color: 'var(--c-text-muted)', marginRight: 2 }}>Score</span>
          {TYPES.map((type) => {
            const active = type === activeDomain
            const c = TYPE_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => setActiveDomain(type)}
                style={{
                  padding: '3px 11px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? c : 'var(--c-border)'}`,
                  background: active ? TYPE_BG[type] : 'transparent',
                  color: active ? c : 'var(--c-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          })}
        </div>

        {/* Y-axis toggle */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '11px', color: 'var(--c-text-muted)', marginRight: 2 }}>vs.</span>
          {Y_OPTS.map((opt) => {
            const active = opt === activeY
            return (
              <button
                key={opt}
                onClick={() => setActiveY(opt)}
                style={{
                  padding: '3px 11px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? 'var(--c-text-muted)' : 'var(--c-border)'}`,
                  background: active ? 'var(--c-border)' : 'transparent',
                  color: active ? 'var(--c-text)' : 'var(--c-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {Y_LABELS[opt]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="relative"
        style={{ border: '1px solid var(--c-border)', borderRadius: '6px', background: 'var(--c-surface)' }}
        onMouseMove={handleMouseMove}
      >
        <svg
          width={width}
          height={svgH}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid */}
          {yTicks.map(v => (
            <line key={v}
              x1={ML} y1={py(v)} x2={W - MR} y2={py(v)}
              stroke="var(--c-border)" strokeWidth={0.6} opacity={0.7}
            />
          ))}
          {xTicks.map(v => (
            <line key={v}
              x1={px(v)} y1={MT} x2={px(v)} y2={H - MB}
              stroke="var(--c-border)" strokeWidth={0.6} opacity={0.7}
            />
          ))}

          {/* Trend line */}
          {reg && (() => {
            const x0 = 0, x1 = 1
            const y0 = reg.intercept + reg.slope * x0
            const y1 = reg.intercept + reg.slope * x1
            return (
              <line
                x1={px(x0)} y1={py(Math.max(0, Math.min(100, y0)))}
                x2={px(x1)} y2={py(Math.max(0, Math.min(100, y1)))}
                stroke={domainColor} strokeWidth={1.4}
                strokeDasharray="5,3" opacity={0.65}
              />
            )
          })()}

          {/* Dots */}
          {points.map((p) => (
            <circle
              key={p.fips}
              cx={px(p.scoreVal)}
              cy={py(p.metricVal)}
              r={2.2}
              fill={TYPE_COLORS[p.dominant]}
              fillOpacity={0.38}
              stroke="none"
              style={{ cursor: 'default' }}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Highlighted focal type on top */}
          {points.filter(p => p.dominant === activeDomain).map(p => (
            <circle
              key={`f-${p.fips}`}
              cx={px(p.scoreVal)}
              cy={py(p.metricVal)}
              r={2.4}
              fill={domainColor}
              fillOpacity={0.62}
              stroke="none"
              style={{ cursor: 'default' }}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* X-axis ticks + labels */}
          {xTicks.map(v => (
            <text key={v}
              x={px(v)} y={H - MB + 14}
              textAnchor="middle" fontSize={9} fill="var(--c-text-muted)"
            >
              {(v * 100).toFixed(0)}%
            </text>
          ))}

          {/* Y-axis ticks + labels */}
          {yTicks.map(v => (
            <text key={v}
              x={ML - 6} y={py(v) + 3.5}
              textAnchor="end" fontSize={9} fill="var(--c-text-muted)"
            >
              {v}
            </text>
          ))}

          {/* Axis labels */}
          <text
            x={ML + PW / 2} y={H - 4}
            textAnchor="middle" fontSize={10} fill="var(--c-text-muted)"
          >
            {activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1)} score
          </text>
          <text
            x={10} y={MT + PH / 2}
            textAnchor="middle" fontSize={10} fill="var(--c-text-muted)"
            transform={`rotate(-90, 10, ${MT + PH / 2})`}
          >
            {Y_LABELS[activeY]}
          </text>

          {/* Correlation badge */}
          {reg && (
            <g>
              <rect
                x={W - MR - 72} y={MT + 4}
                width={68} height={18}
                rx={3}
                fill={domainColor} fillOpacity={0.12}
                stroke={domainColor} strokeWidth={0.6} strokeOpacity={0.5}
              />
              <text
                x={W - MR - 36} y={MT + 16}
                textAnchor="middle" fontSize={9.5} fontWeight={600}
                fill={domainColor}
              >
                r = {reg.r >= 0 ? '+' : ''}{reg.r.toFixed(2)}
              </text>
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hovered && (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 32,
            pointerEvents: 'none',
            zIndex: 10,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '5px',
            padding: '4px 9px',
            fontSize: '11px',
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          }}>
            <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>
              {hovered.name}, {STATE_ABBR[hovered.state] ?? hovered.state}
            </span>
            <span style={{ color: 'var(--c-text-muted)', margin: '0 4px' }}>·</span>
            <span style={{ color: TYPE_COLORS[hovered.dominant], textTransform: 'capitalize' }}>
              {hovered.dominant}
            </span>
          </div>
        )}

        {!counties && (
          <p style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--c-text-muted)' }}>
            Loading…
          </p>
        )}
      </div>

      {/* Caption */}
      <p style={{ fontSize: '11px', color: 'var(--c-text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
        Each dot = one US county, colored by dominant heat type.{' '}
        <span style={{ color: domainColor }}>
          {activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1)} score (x-axis)
        </span>
        {' '}vs. {Y_LABELS[activeY].toLowerCase()} ({Y_NOTE[activeY]}).
        {reg && (
          <> Trend line across all counties: r&nbsp;=&nbsp;{reg.r >= 0 ? '+' : ''}{reg.r.toFixed(2)}.</>
        )}
      </p>
    </div>
  )
}
