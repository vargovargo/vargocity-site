import { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'

/**
 * Shared plumbing and one type scale for every chart in the Lab.
 *
 * AEICharts, SBICharts and SocialFabricCharts each carried their own copy of
 * PLOT_STYLE, usePlot and useContainerWidth, and the in-chart font sizes had
 * drifted across five values (9, 9.5, 10, 11, 12) with captions at four
 * (text-xs, 11px, 12px, 13px). Charts sitting in the same post read as if they
 * came from different projects. One import, one scale.
 */

// ── Type scale ──────────────────────────────────────────────────────────────
// Three roles, three sizes. If a label has to go below DATA to fit, the chart
// has too many labels — thin them with topLabels() instead of shrinking them.
export const TYPE_SCALE = {
  AXIS: 11,   // axis titles and tick labels (Plot reads this off `style`)
  DATA: 10,   // direct labels on marks
  MICRO: 9,   // annotations that must sit inside a mark
}

/** How many points a scatter should direct-label before deferring to the tip. */
export const LABEL_LIMIT = 6

export const PLOT_STYLE = {
  fontFamily: 'inherit',
  fontSize: TYPE_SCALE.AXIS,
  color: 'var(--c-text-body)',
  background: 'transparent',
}

// ── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Render an Observable Plot into a ref'd div.
 * Accepts either a spec object or a thunk returning one — the three chart
 * files grew both conventions independently.
 */
export function usePlot(spec, deps) {
  const ref = useRef()
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const chart = Plot.plot(typeof spec === 'function' ? spec() : spec)
    node.appendChild(chart)
    return () => { node.innerHTML = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

export function useContainerWidth(fallback = 640) {
  const containerRef = useRef()
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])
  return [containerRef, width]
}

// ── Label thinning ──────────────────────────────────────────────────────────

/**
 * Pick the rows worth direct-labelling. Observable Plot has no collision
 * avoidance for text marks, so labelling every point in a scatter reliably
 * produces a pile of overlapping words. Label the few that carry the argument
 * and let `tip: true` cover the rest.
 *
 * @param {Array} rows
 * @param {(d: any) => number} weight  larger = more worth labelling
 * @param {number} limit
 */
export function topLabels(rows, weight, limit = LABEL_LIMIT) {
  return [...rows]
    .filter(d => { const w = weight(d); return w != null && !Number.isNaN(w) })
    .sort((a, b) => weight(b) - weight(a))
    .slice(0, limit)
}
