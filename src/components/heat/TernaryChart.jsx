import { useRef, useEffect, useState, useMemo, useCallback } from 'react'

/** @import { CountyRecord } from '../../types/heat-typology.js' */

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

const TYPE_COLORS = {
  shock:  '#C0583A',
  stress: '#D4813B',
  shift:  '#4B7CB8',
}

// Equilateral triangle vertices in viewBox space (viewBox: 0 0 520 500)
// shock = top, stress = bottom-left, shift = bottom-right
const Ax = 260, Ay = 45   // shock
const Bx = 20,  By = 460  // stress
const Cx = 500, Cy = 460  // shift

// Grid interval lines at 25%, 50%, 75%
const GRID_LEVELS = [0.25, 0.5, 0.75]

function bary(shock, stress, shift) {
  return {
    x: shock * Ax + stress * Bx + shift * Cx,
    y: shock * Ay + stress * By + shift * Cy,
  }
}

function gridLines() {
  const lines = []
  for (const k of GRID_LEVELS) {
    // Lines parallel to stress-shift base (fixed shock = k)
    const a1 = bary(k, 1 - k, 0), a2 = bary(k, 0, 1 - k)
    // Lines parallel to shock-shift edge (fixed stress = k)
    const b1 = bary(1 - k, k, 0), b2 = bary(0, k, 1 - k)
    // Lines parallel to shock-stress edge (fixed shift = k)
    const c1 = bary(1 - k, 0, k), c2 = bary(0, 1 - k, k)
    lines.push(a1, a2, null, b1, b2, null, c1, c2, null)
  }
  return lines
}

function popRadius(pop) {
  if (!pop || pop < 1) return 1.5
  return Math.max(1.5, Math.min(7, 1.5 + (Math.log10(pop) - 2) * 1.1))
}

function useContainerWidth(fallback = 520) {
  const ref = useRef()
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, width]
}

/**
 * @param {{ counties: CountyRecord[]|null, selectedFips: string|null, onSelect: (fips: string|null) => void }} props
 */
export default function TernaryChart({ counties, selectedFips, onSelect }) {
  const [containerRef, width] = useContainerWidth()
  const [hoverEntry, setHoverEntry] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [containerRef])

  const viewW = 520
  const viewH = 500

  const { regular, selected } = useMemo(() => {
    if (!counties) return { regular: [], selected: null }
    const reg = []
    let sel = null
    for (const c of counties) {
      const { scores, dominant } = c.hazards.heat
      const pt = bary(scores.shock, scores.stress, scores.shift)
      const entry = {
        fips: c.county_fips,
        name: c.name,
        state: c.state,
        dominant,
        x: pt.x,
        y: pt.y,
        r: popRadius(c.population),
        color: TYPE_COLORS[dominant],
      }
      if (c.county_fips === selectedFips) {
        sel = entry
      } else {
        reg.push(entry)
      }
    }
    return { regular: reg, selected: sel }
  }, [counties, selectedFips])

  // SVG path for equilateral triangle
  const triPath = `M${Ax},${Ay} L${Bx},${By} L${Cx},${Cy} Z`

  // Grid line pairs for rendering
  const grids = useMemo(() => {
    const result = []
    for (const k of GRID_LEVELS) {
      const a1 = bary(k, 1 - k, 0), a2 = bary(k, 0, 1 - k)
      const b1 = bary(1 - k, k, 0), b2 = bary(0, k, 1 - k)
      const c1 = bary(1 - k, 0, k), c2 = bary(0, 1 - k, k)
      result.push([a1, a2], [b1, b2], [c1, c2])
    }
    return result
  }, [])

  const svgHeight = Math.round((viewH / viewW) * width)

  return (
    <div ref={containerRef} className="my-6 relative" onMouseMove={handleMouseMove}>
      <svg
        width={width}
        height={svgHeight}
        viewBox={`0 0 ${viewW} ${viewH}`}
        style={{ display: 'block', overflow: 'visible' }}
        onClick={(e) => { if (e.target.tagName === 'svg') onSelect(null) }}
      >
        {/* Triangle outline */}
        <path d={triPath} fill="none" stroke="var(--c-border)" strokeWidth={1.5} />

        {/* Grid lines */}
        {grids.map(([p1, p2], i) => (
          <line
            key={i}
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            stroke="var(--c-border)"
            strokeWidth={0.6}
            strokeDasharray="3,2"
          />
        ))}

        {/* Vertex labels */}
        <text x={Ax} y={Ay - 18} textAnchor="middle" fontSize={12} fontWeight={600}
          fill={TYPE_COLORS.shock}>
          Shock
        </text>
        <text x={Bx} y={By + 24} textAnchor="middle" fontSize={12} fontWeight={600}
          fill={TYPE_COLORS.stress}>
          Stress
        </text>
        <text x={Cx} y={Cy + 24} textAnchor="middle" fontSize={12} fontWeight={600}
          fill={TYPE_COLORS.shift}>
          Shift
        </text>

        {/* County dots — regular (unselected) */}
        {regular.map((d) => (
          <circle
            key={d.fips}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.color}
            fillOpacity={0.55}
            stroke="none"
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); onSelect(d.fips) }}
            onMouseEnter={() => setHoverEntry(d)}
            onMouseLeave={() => setHoverEntry(null)}
          />
        ))}

        {/* Selected county — rendered last to appear on top */}
        {selected && (
          <g>
            <circle
              cx={selected.x}
              cy={selected.y}
              r={selected.r + 3}
              fill="none"
              stroke={selected.color}
              strokeWidth={1.5}
              pointerEvents="none"
            />
            <circle
              cx={selected.x}
              cy={selected.y}
              r={selected.r}
              fill={selected.color}
              fillOpacity={0.95}
              stroke="var(--c-surface)"
              strokeWidth={0.75}
              pointerEvents="none"
            />
          </g>
        )}

        {/* Scale hint */}
        <text x={Ax} y={viewH - 8} textAnchor="middle" fontSize={9} fill="var(--c-text-muted)">
          dot size = population (log scale)
        </text>
      </svg>

      {hoverEntry && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 36,
            pointerEvents: 'none',
            zIndex: 10,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            lineHeight: '1.5',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>
            {hoverEntry.name}, {STATE_ABBR[hoverEntry.state] ?? hoverEntry.state}
          </span>
          <span style={{ color: 'var(--c-text-muted)', margin: '0 5px' }}>·</span>
          <span style={{ color: hoverEntry.color, textTransform: 'capitalize' }}>
            {hoverEntry.dominant}
          </span>
        </div>
      )}

      <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
        Each dot is a US county. Position reflects shock/stress/shift score mix; counties near a corner are dominated by that type.
        Dot size scales with log population. Click to select.
      </p>
    </div>
  )
}
