import { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'
import sbiData from '../../data/sbi-data.json'

const FAMILY_TYPES = ['2a_0c', '2a_1c_infant', '2a_2c_school']
const FAMILY_LABELS = sbiData.family_type_labels
const COUNTY_ORDER = sbiData.county_order

const COLORS = {
  band:    '#4a7c59',
  gap:     '#c4713b',
  minwage: '#6a9bcc',
  text:    'var(--c-text-body)',
  muted:   'var(--c-text-muted)',
}

const PLOT_STYLE = {
  fontFamily: 'inherit',
  fontSize: 12,
  color: 'var(--c-text-body)',
  background: 'transparent',
}

function usePlot(specFn, deps) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const chart = Plot.plot(specFn())
    ref.current.appendChild(chart)
    return () => { if (ref.current) ref.current.innerHTML = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

function useContainerWidth(fallback = 600) {
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

function FamilyTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1 rounded transition-colors"
      style={{
        backgroundColor: active ? 'var(--c-card-hover)' : 'transparent',
        color: active ? 'var(--c-text)' : 'var(--c-text-muted)',
        border: '1px solid',
        borderColor: active ? 'var(--c-border)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ── Chart 1: Wage gap — required wage vs minimum wage ──────────────────────
export function SBIWageGap() {
  const [containerRef, width] = useContainerWidth()
  const [familyType, setFamilyType] = useState('2a_1c_infant')

  const data = sbiData.wage_gap
    .filter(d => d.family_type === familyType)
    .sort((a, b) => COUNTY_ORDER.indexOf(a.fips) - COUNTY_ORDER.indexOf(b.fips))

  // Rows: one per county. Show floor bar, ceiling bar, min wage line, gap fill.
  // Build range data for the sufficiency band
  const bandData = data.map(d => ({
    county: `${d.county}, ${d.state}`,
    state: d.state,
    lo: d.required_floor,
    hi: d.required_ceiling,
    min_wage: d.min_wage,
    gap: d.gap_floor,
  }))

  // State-bounded min wage lines: group counties by state, draw rule from first to last.
  // Generalizes as long as same-state counties are contiguous in COUNTY_ORDER.
  const stateWageLines = (() => {
    const groups = {}
    bandData.forEach(d => {
      if (!groups[d.state]) groups[d.state] = []
      groups[d.state].push(d.county)
    })
    return Object.entries(groups).map(([state, counties]) => ({
      wage: sbiData.min_wages[state],
      y1: counties[0],
      y2: counties[counties.length - 1],
    }))
  })()

  const plotRef = usePlot(() => ({
    width,
    height: 200,
    marginLeft: 140,
    marginRight: 80,
    marginBottom: 45,
    style: PLOT_STYLE,
    x: {
      label: 'Hourly wage required (dual earner)',
      tickFormat: d => '$' + d,
      domain: [0, 35],
    },
    y: { label: null, tickSize: 0 },
    marks: [
      // Gap fill: from min wage to floor (the shortfall)
      Plot.barX(bandData, {
        x1: d => d.min_wage,
        x2: d => d.lo,
        y: d => d.county,
        fill: COLORS.gap,
        fillOpacity: 0.25,
      }),
      // Sufficiency band: floor to ceiling
      Plot.barX(bandData, {
        x1: d => d.lo,
        x2: d => d.hi,
        y: d => d.county,
        fill: COLORS.band,
        fillOpacity: 0.75,
      }),
      // Floor tick
      Plot.tickX(bandData, {
        x: d => d.lo,
        y: d => d.county,
        stroke: COLORS.band,
        strokeWidth: 2,
      }),
      // Min wage lines — bounded to each state's county rows
      Plot.ruleX(stateWageLines, {
        x: 'wage',
        y1: 'y1',
        y2: 'y2',
        stroke: COLORS.minwage,
        strokeWidth: 2,
        strokeDasharray: '5,3',
      }),
      // Labels: required floor
      Plot.text(bandData, {
        x: d => d.lo,
        y: d => d.county,
        text: d => `$${d.lo.toFixed(2)}`,
        textAnchor: 'end',
        dx: -6,
        fontSize: 10,
        fill: COLORS.band,
      }),
    ],
  }), [width, familyType])

  return (
    <div ref={containerRef} className="my-6">
      <div className="flex gap-2 mb-3 flex-wrap">
        {FAMILY_TYPES.map(ft => (
          <FamilyTab
            key={ft}
            label={FAMILY_LABELS[ft]}
            active={familyType === ft}
            onClick={() => setFamilyType(ft)}
          />
        ))}
      </div>
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 20, height: 8, background: COLORS.band, opacity: 0.75, borderRadius: 2 }} />
          Required wage (floor–ceiling range)
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 20, height: 8, background: COLORS.gap, opacity: 0.4, borderRadius: 2 }} />
          Shortfall from minimum wage to floor
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: COLORS.minwage, borderRadius: 1 }} />
          State minimum wage
        </span>
      </div>
      <ChartCaption>
        Required hourly wage assumes both adults working full-time (2,080 hrs/year).
        Floor = SSS ensemble minimum; ceiling = EPI ensemble maximum (2025 dollars).
        Shortfall = gap between state minimum wage and the sufficiency floor.
        Sources: EPI Family Budget Calculator, MIT Living Wage Calculator, Self-Sufficiency Standard (2025–2026).
      </ChartCaption>
    </div>
  )
}

// ── Chart 2: Monthly cost bands per county ─────────────────────────────────
export function SBIMonthlyCost() {
  const [containerRef, width] = useContainerWidth()
  const [familyType, setFamilyType] = useState('2a_1c_infant')

  const data = sbiData.anchor_totals
    .filter(d => d.family_type === familyType)
    .sort((a, b) => COUNTY_ORDER.indexOf(a.fips) - COUNTY_ORDER.indexOf(b.fips))

  const plotRef = usePlot(() => ({
    width,
    height: 190,
    marginLeft: 140,
    marginRight: 70,
    marginBottom: 45,
    style: PLOT_STYLE,
    x: {
      label: 'Monthly cost (2025 dollars)',
      tickFormat: d => '$' + d.toLocaleString(),
      domain: [0, 12000],
    },
    y: { label: null, tickSize: 0 },
    marks: [
      // Band: floor to ceiling
      Plot.barX(data, {
        x1: d => d.floor,
        x2: d => d.ceiling,
        y: d => `${d.county}, ${d.state}`,
        fill: COLORS.band,
        fillOpacity: 0.6,
        height: 18,
      }),
      // Floor tick
      Plot.tickX(data, {
        x: d => d.floor,
        y: d => `${d.county}, ${d.state}`,
        stroke: COLORS.band,
        strokeWidth: 2,
      }),
      // Mean dot
      Plot.dot(data, {
        x: d => d.mean,
        y: d => `${d.county}, ${d.state}`,
        fill: 'white',
        stroke: COLORS.band,
        strokeWidth: 1.5,
        r: 4,
      }),
      // Floor label
      Plot.text(data, {
        x: d => d.floor,
        y: d => `${d.county}, ${d.state}`,
        text: d => '$' + Math.round(d.floor).toLocaleString(),
        textAnchor: 'end',
        dx: -6,
        fontSize: 10,
        fill: COLORS.band,
      }),
      // Ceiling label
      Plot.text(data, {
        x: d => d.ceiling,
        y: d => `${d.county}, ${d.state}`,
        text: d => '$' + Math.round(d.ceiling).toLocaleString(),
        textAnchor: 'start',
        dx: 6,
        fontSize: 10,
        fill: 'var(--c-text-muted)',
      }),
    ],
  }), [width, familyType])

  return (
    <div ref={containerRef} className="my-6">
      <div className="flex gap-2 mb-3 flex-wrap">
        {FAMILY_TYPES.map(ft => (
          <FamilyTab
            key={ft}
            label={FAMILY_LABELS[ft]}
            active={familyType === ft}
            onClick={() => setFamilyType(ft)}
          />
        ))}
      </div>
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 20, height: 8, background: COLORS.band, opacity: 0.6, borderRadius: 2 }} />
          Range across anchor sources (floor–ceiling)
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'white', border: `1.5px solid ${COLORS.band}` }} />
          Ensemble mean
        </span>
      </div>
      <ChartCaption>
        Monthly sufficiency budget in 2025 dollars. Bar shows range across three anchor sources
        (Self-Sufficiency Standard = floor, EPI Family Budget Calculator = ceiling for most counties).
        White dot = ensemble mean. Range reflects genuine methodological disagreement, not data error.
      </ChartCaption>
    </div>
  )
}

// ── Chart 3: Cost of a child — incremental monthly cost by step ─────────────
export function SBICostOfChild() {
  const [containerRef, width] = useContainerWidth()

  const stepOrder = ['Couple', 'Add infant', 'School-age family']
  const stepColors = { 'Couple': COLORS.band, 'Add infant': COLORS.gap, 'School-age family': '#8a9a78' }

  // Each county group gets a blank header row (shows county name as axis label)
  // followed by three data rows (one per household step). This eliminates label
  // overlap between county names and step names — each gets its own band slot.
  const allRows = COUNTY_ORDER.flatMap(fips => {
    const row = ft => sbiData.anchor_totals.find(d => d.fips === fips && d.family_type === ft)
    const couple    = row('2a_0c')
    const newFamily = row('2a_1c_infant')
    const schoolAge = row('2a_2c_school')
    const label = `${couple.county}, ${couple.state}`
    return [
      { y: `${label}~~hdr`,              step: null,               value: null, delta: null },
      { y: `${label}~~Couple`,           step: 'Couple',           value: couple.floor,    delta: null },
      { y: `${label}~~Add infant`,       step: 'Add infant',       value: newFamily.floor, delta: newFamily.floor - couple.floor },
      { y: `${label}~~School-age family`,step: 'School-age family',value: schoolAge.floor, delta: schoolAge.floor - newFamily.floor },
    ]
  })

  const yDomain = allRows.map(r => r.y)
  const longData = allRows.filter(r => r.value !== null)

  const plotRef = usePlot(() => ({
    width,
    height: yDomain.length * 22 + 55,
    marginLeft: 145,
    marginRight: 115,
    marginBottom: 45,
    marginTop: 8,
    style: PLOT_STYLE,
    x: {
      label: 'Monthly floor (2025 dollars)',
      tickFormat: d => '$' + d.toLocaleString(),
      domain: [0, 12000],
    },
    y: {
      label: null,
      tickSize: 0,
      domain: yDomain,
      // Header rows show the county name; data rows show the step name
      tickFormat: key => key.endsWith('~~hdr')
        ? key.replace('~~hdr', '')
        : key.split('~~')[1],
    },
    marks: [
      Plot.barX(longData, {
        x: 'value',
        y: 'y',
        fill: d => stepColors[d.step],
        fillOpacity: 0.7,
      }),
      // Delta labels
      Plot.text(longData.filter(d => d.delta !== null), {
        x: 'value',
        y: 'y',
        text: d => `+$${Math.round(d.delta).toLocaleString()}/mo`,
        textAnchor: 'start',
        dx: 6,
        fontSize: 10,
        fill: d => stepColors[d.step],
      }),
    ],
  }), [width])

  return (
    <div ref={containerRef} className="my-6">
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        {stepOrder.map(step => (
          <span key={step} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: stepColors[step], opacity: 0.8 }} />
            {step}
          </span>
        ))}
      </div>
      <ChartCaption>
        Monthly sufficiency floor (SSS ensemble minimum, 2025 dollars) at each household step.
        "+$X/mo" shows the incremental cost of each transition.
        The infant step includes childcare (~$950–$1,421/mo depending on county) plus a housing bedroom upgrade.
      </ChartCaption>
    </div>
  )
}
