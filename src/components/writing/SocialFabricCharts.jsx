import { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'
import scatterData from '../../data/social-fabric-scatter.json'

const PLOT_STYLE = {
  fontFamily: 'inherit',
  fontSize: 12,
  color: 'var(--c-text-body)',
  background: 'transparent',
}

const COLORS = {
  metro:    '#4a7c59',
  nonmetro: '#c4713b',
}

function usePlot(buildSpec, deps) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const chart = Plot.plot(buildSpec())
    ref.current.appendChild(chart)
    return () => { if (ref.current) ref.current.innerHTML = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

function useContainerWidth(fallback = 640) {
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

function ChartCaption({ children }) {
  return (
    <p className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
      {children}
    </p>
  )
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length * p)]
}

export function ChettyScatter() {
  const [activeDim, setActiveDim] = useState('linking')
  const [containerRef, width] = useContainerWidth()

  const dim = scatterData.dimensions.find(d => d.id === activeDim)
  const counties = scatterData.counties.filter(c =>
    c[dim.x_col] != null && c[dim.y_col] != null
  )

  const maxPop = Math.max(...counties.map(c => c.population || 1))

  // Clip y to p95 so outliers don't compress the main distribution
  const yVals = counties.map(c => c[dim.y_col])
  const yMax = percentile(yVals, 0.95)
  const yMin = percentile(yVals, 0.02)

  const plotRef = usePlot(() => ({
    width,
    height: Math.round(width * 0.6),
    marginLeft: 65,
    marginBottom: 45,
    marginRight: 16,
    marginTop: 12,
    style: PLOT_STYLE,
    x: { label: dim.x_label, tickSize: 0 },
    y: { label: null, tickSize: 0, domain: [yMin, yMax] },
    marks: [
      Plot.dot(counties, {
        x: dim.x_col,
        y: dim.y_col,
        clip: true,
        r: d => Math.max(1.5, Math.sqrt((d.population || 0) / maxPop) * 10),
        fill: d => d.metro ? COLORS.metro : COLORS.nonmetro,
        fillOpacity: 0.35,
        stroke: 'white',
        strokeWidth: 0.3,
        title: d => `${d.label}\n${dim.x_label}: ${d[dim.x_col]}\n${dim.y_label}: ${d[dim.y_col]}`,
        tip: true,
      }),
      Plot.linearRegressionY(counties, {
        x: dim.x_col,
        y: dim.y_col,
        clip: true,
        stroke: 'var(--c-text-body)',
        strokeWidth: 1.5,
        strokeOpacity: 0.5,
        strokeDasharray: '4 3',
      }),
    ],
  }), [activeDim, width])

  const dimLabels = { linking: 'Linking', bridging: 'Bridging', bonding: 'Bonding' }

  return (
    <div className="my-6">
      <div className="flex gap-2 mb-4">
        {scatterData.dimensions.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDim(d.id)}
            className="text-xs px-3 py-1 rounded transition-colors"
            style={{
              border: '1px solid var(--c-border)',
              backgroundColor: activeDim === d.id ? 'var(--c-text)' : 'transparent',
              color: activeDim === d.id ? 'var(--c-bg)' : 'var(--c-text-muted)',
              cursor: 'pointer',
            }}
          >
            {dimLabels[d.id]}
          </button>
        ))}
      </div>

      {/* y-axis label as rotated React element to avoid Plot overlap */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{
          width: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11,
            color: 'var(--c-text-muted)',
            whiteSpace: 'nowrap',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            display: 'block',
            width: 'max-content',
          }}>
            {dim.y_label}
          </span>
        </div>
        <div ref={containerRef} style={{ flex: 1, minWidth: 0 }}>
          <div ref={plotRef} />
        </div>
      </div>

      <ChartCaption>
        Pearson r = {dim.r} · {dim.n.toLocaleString()} counties · Dot size proportional to population ·{' '}
        <span style={{ color: COLORS.metro }}>■</span> Metro (RUCC 1–3){' '}
        <span style={{ color: COLORS.nonmetro }}>■</span> Non-metro ·{' '}
        Y-axis clipped at 95th percentile. Source: Chetty Social Capital Atlas (2022); index built from Census CBP, IMLS, IRS BMF.
      </ChartCaption>
    </div>
  )
}
