import { useRef, useEffect, useState, useMemo } from 'react'

/** @import { CountyRecord } from '../../types/heat-typology.js' */

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
    <div ref={containerRef} className="my-6">
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
          >
            <title>{d.name} ({d.dominant})</title>
          </circle>
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

      <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
        Each dot is a US county. Position reflects shock/stress/shift score mix; counties near a corner are dominated by that type.
        Dot size scales with log population. Click to select.
      </p>
    </div>
  )
}
