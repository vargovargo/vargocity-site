import { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'
import panelData from '../../data/aei-panel.json'

const LMI_COLORS = {
  high:     '#C0583A',
  moderate: '#4B7CB8',
  low:      '#5C9E6B',
  none:     '#AAAAAA',
}

const LMI_LABELS = {
  high:     'High LMI exposure',
  moderate: 'Moderate LMI exposure',
  low:      'Low LMI exposure',
  none:     'Not flagged',
}

const PLOT_STYLE = {
  fontFamily: 'inherit',
  fontSize: 12,
  color: 'var(--c-text-body)',
  background: 'transparent',
}

function usePlot(spec, deps) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const chart = Plot.plot(spec)
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

// ── Chart 1: Task share trends ──────────────────────────────────────────────
export function AEITaskTrends() {
  const [containerRef, width] = useContainerWidth()

  const highlighted = ['high', 'moderate']
  const data = panelData.panel
    .filter(d => d.task_pct != null && highlighted.includes(d.lmi_flag))
    .map(d => ({ ...d, date: new Date(d.release_date) }))

  const lastRelease = new Date('2026-01-15')

  // SOC 31 and 53 are both tiny and cluster at the bottom — label them jointly
  const lastPoint = (soc) => data.find(d => d.soc_major_code === soc && d.date.getTime() === lastRelease.getTime())
  const p31 = lastPoint(31)
  const p53 = lastPoint(53)
  const combinedLabel = (p31 && p53) ? [{
    date: lastRelease,
    task_pct: (p31.task_pct + p53.task_pct) / 2,
    soc_label: 'Healthcare Support\nTransportation',
    lmi_flag: 'high',
  }] : []

  const labelData = data.filter(d =>
    d.date.getTime() === lastRelease.getTime() &&
    d.soc_major_code !== 31 &&
    d.soc_major_code !== 53
  )

  const plotRef = usePlot({
    width,
    height: 260,
    marginRight: 130,
    style: PLOT_STYLE,
    x: {
      label: null,
      tickFormat: d => {
        const labels = { '2025-02-10': 'Feb 2025', '2025-03-27': 'Mar 2025', '2025-09-15': 'Sep 2025', '2026-01-15': 'Jan 2026' }
        return labels[d.toISOString().slice(0, 10)] ?? ''
      },
      ticks: [new Date('2025-02-10'), new Date('2025-03-27'), new Date('2025-09-15'), new Date('2026-01-15')],
    },
    y: {
      label: '% of Claude interactions',
      grid: true,
      tickFormat: d => d + '%',
    },
    marks: [
      Plot.line(data, {
        x: 'date',
        y: 'task_pct',
        z: 'soc_label',
        stroke: d => LMI_COLORS[d.lmi_flag],
        strokeWidth: d => d.lmi_flag === 'high' ? 2.5 : 1.8,
        strokeDasharray: d => d.lmi_flag === 'moderate' ? '5,3' : null,
      }),
      Plot.dot(data, {
        x: 'date',
        y: 'task_pct',
        fill: d => LMI_COLORS[d.lmi_flag],
        r: 3,
      }),
      Plot.text(labelData, {
        x: 'date',
        y: 'task_pct',
        text: 'soc_label',
        textAnchor: 'start',
        dx: 8,
        fill: d => LMI_COLORS[d.lmi_flag],
        fontSize: 11,
      }),
      Plot.text(combinedLabel, {
        x: 'date',
        y: 'task_pct',
        text: 'soc_label',
        textAnchor: 'start',
        dx: 8,
        fill: LMI_COLORS.high,
        fillOpacity: 0.7,
        fontSize: 10,
        lineWidth: 12,
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        {['high', 'moderate'].map(flag => (
          <span key={flag} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <span style={{ display: 'inline-block', width: 20, height: 2, background: LMI_COLORS[flag], borderRadius: 1, ...(flag === 'moderate' ? { borderBottom: `2px dashed ${LMI_COLORS[flag]}`, background: 'transparent', height: 0 } : {}) }} />
            {LMI_LABELS[flag]}
          </span>
        ))}
      </div>
      <ChartCaption>
        Task share of Claude interactions mapped to each SOC major group, Feb 2025–Jan 2026.
        Includes LMI-high (solid) and moderate (dashed) groups only. V1 rates conditional on 84.21% classifiable interactions.
      </ChartCaption>
    </div>
  )
}

// ── Chart 2: Automation shift (LMI-high, v2–v4) ────────────────────────────
export function AEICollabTrends() {
  const [containerRef, width] = useContainerWidth()

  const highGroups = [31, 41, 43, 53]
  const data = panelData.panel
    .filter(d => highGroups.includes(d.soc_major_code) && d.soc_automation_pct != null)
    .map(d => ({ ...d, date: new Date(d.release_date) }))

  // Cross-SOC average per release (v2+)
  const releases = ['2025-03-27', '2025-09-15', '2026-01-15']
  const avgData = releases.map(r => {
    const rows = panelData.panel.filter(d => d.release_date === r && d.soc_automation_pct != null)
    return {
      date: new Date(r),
      soc_label: 'All-SOC avg',
      soc_automation_pct: rows.reduce((s, d) => s + d.soc_automation_pct, 0) / rows.length,
    }
  })

  const lastRelease = new Date('2026-01-15')
  const labelData = data.filter(d => d.date.getTime() === lastRelease.getTime())
  const avgLabel = avgData.filter(d => d.date.getTime() === lastRelease.getTime())

  const plotRef = usePlot({
    width,
    height: 260,
    marginRight: 130,
    style: PLOT_STYLE,
    x: {
      label: null,
      tickFormat: d => {
        const labels = { '2025-03-27': 'Mar 2025', '2025-09-15': 'Sep 2025', '2026-01-15': 'Jan 2026' }
        return labels[d.toISOString().slice(0, 10)] ?? ''
      },
      ticks: [new Date('2025-03-27'), new Date('2025-09-15'), new Date('2026-01-15')],
    },
    y: {
      label: 'Automation-type interactions (%)',
      grid: true,
      tickFormat: d => d + '%',
      domain: [20, 70],
    },
    marks: [
      // Reference line: all-SOC average
      Plot.line(avgData, {
        x: 'date',
        y: 'soc_automation_pct',
        stroke: '#BBBBBB',
        strokeWidth: 1.5,
        strokeDasharray: '4,3',
      }),
      Plot.text(avgLabel, {
        x: 'date',
        y: 'soc_automation_pct',
        text: () => 'All-SOC avg',
        textAnchor: 'start',
        dx: 8,
        fill: '#999999',
        fontSize: 11,
      }),
      // LMI-high lines
      Plot.line(data, {
        x: 'date',
        y: 'soc_automation_pct',
        z: 'soc_label',
        stroke: LMI_COLORS.high,
        strokeWidth: 2,
        strokeOpacity: d => d.soc_major_code === 43 ? 1 : 0.55,
      }),
      Plot.dot(data, {
        x: 'date',
        y: 'soc_automation_pct',
        fill: LMI_COLORS.high,
        fillOpacity: d => d.soc_major_code === 43 ? 1 : 0.55,
        r: 3,
      }),
      Plot.text(labelData, {
        x: 'date',
        y: 'soc_automation_pct',
        text: 'soc_label',
        textAnchor: 'start',
        dx: 8,
        fill: LMI_COLORS.high,
        fillOpacity: d => d.soc_major_code === 43 ? 1 : 0.6,
        fontSize: 11,
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <div ref={plotRef} />
      <ChartCaption>
        Share of automation-type Claude interactions per SOC group, v2–v4 (Mar 2025–Jan 2026).
        LMI-high groups shown; Office &amp; Admin (SOC 43) highlighted. Dashed line = cross-SOC average.
        V1 excluded (SOC-level collaboration data unavailable).
      </ChartCaption>
    </div>
  )
}

// ── Chart 3: V4 scatter — autonomy vs education ────────────────────────────
export function AEIPrimitivesScatter() {
  const [containerRef, width] = useContainerWidth()

  const data = panelData.panel
    .filter(d => d.version === 'v4' && d.mean_ai_autonomy != null && d.mean_human_education_years != null)

  // Cross-SOC averages for reference lines
  const avgAutonomy = data.reduce((s, d) => s + d.mean_ai_autonomy, 0) / data.length
  const avgEducation = data.reduce((s, d) => s + d.mean_human_education_years, 0) / data.length

  const plotRef = usePlot({
    width,
    height: 300,
    marginRight: 20,
    style: PLOT_STYLE,
    x: {
      label: 'Avg. education years (SOC group)',
      grid: true,
    },
    y: {
      label: 'Avg. AI autonomy score (0–4)',
      grid: true,
      domain: [2.9, 3.65],
    },
    marks: [
      // Reference lines
      Plot.ruleX([avgEducation], { stroke: '#DDDDDD', strokeDasharray: '4,3' }),
      Plot.ruleY([avgAutonomy], { stroke: '#DDDDDD', strokeDasharray: '4,3' }),
      // Bubble size by task_pct
      Plot.dot(data, {
        x: 'mean_human_education_years',
        y: 'mean_ai_autonomy',
        r: d => Math.sqrt(d.task_pct) * 2.5,
        fill: d => LMI_COLORS[d.lmi_flag],
        fillOpacity: 0.75,
        stroke: d => LMI_COLORS[d.lmi_flag],
        strokeWidth: 1,
        tip: true,
        title: d => `${d.soc_label}\nAutonomy: ${d.mean_ai_autonomy.toFixed(2)}\nSuccess rate: ${d.mean_task_success.toFixed(1)}%\nTask share: ${d.task_pct.toFixed(2)}%`,
      }),
      // Labels for LMI-flagged groups
      Plot.text(data.filter(d => d.lmi_flag === 'high' || d.lmi_flag === 'moderate'), {
        x: 'mean_human_education_years',
        y: 'mean_ai_autonomy',
        text: 'soc_label',
        dy: -10,
        fontSize: 10,
        fill: d => LMI_COLORS[d.lmi_flag],
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        {Object.entries(LMI_LABELS).filter(([k]) => k !== 'none').concat([['none', 'Not flagged']]).map(([flag, label]) => (
          <span key={flag} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: LMI_COLORS[flag], opacity: 0.8 }} />
            {label}
          </span>
        ))}
        <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>· Bubble size = task share. Dashed lines = cross-SOC averages.</span>
      </div>
      <ChartCaption>
        V4 (Jan 2026) only. AI autonomy: Claude&apos;s self-assessed autonomy on tasks mapped to each SOC group (0–4 scale).
        Education years: average formal education requirement for the occupation group (O*NET). Hover for details.
      </ChartCaption>
    </div>
  )
}

// ── Table: Full SOC summary ─────────────────────────────────────────────────
export function AEISummaryTable() {
  const releases = ['2025-02-10', '2025-03-27', '2025-09-15', '2026-01-15']
  const releaseLabels = { '2025-02-10': 'Feb 2025', '2025-03-27': 'Mar 2025', '2025-09-15': 'Sep 2025', '2026-01-15': 'Jan 2026' }

  const socs = [...new Map(
    panelData.panel
      .filter(d => d.soc_major_code !== 55)
      .map(d => [d.soc_major_code, { code: d.soc_major_code, label: d.soc_label, lmi_flag: d.lmi_flag }])
  ).values()].sort((a, b) => a.code - b.code)

  const lookup = {}
  panelData.panel.forEach(d => {
    lookup[`${d.soc_major_code}:${d.release_date}`] = d
  })

  const flagBadge = (flag) => {
    if (flag === 'none') return null
    const colors = {
      high:     { bg: '#FEE2D5', text: '#A63D20' },
      moderate: { bg: '#DBEAFE', text: '#1D4ED8' },
      low:      { bg: '#D1FAE5', text: '#065F46' },
    }
    const { bg, text } = colors[flag]
    return (
      <span className="text-xs px-1.5 py-0.5 rounded font-medium"
        style={{ backgroundColor: bg, color: text }}>
        {flag}
      </span>
    )
  }

  // Trend arrow: direction from overall change, weight from magnitude, opacity from monotonicity
  const TrendArrow = ({ socCode }) => {
    const allDates = ['2025-02-10', '2025-03-27', '2025-09-15', '2026-01-15']
    const vals = allDates.map(r => lookup[`${socCode}:${r}`]?.task_pct ?? null)
    const v1 = vals[0], v4 = vals[3]
    if (v1 == null || v4 == null) return <span style={{ color: 'var(--c-text-muted)' }}>—</span>

    const delta = v4 - v1
    const absDelta = Math.abs(delta)
    if (absDelta < 0.25) return <span style={{ color: 'var(--c-text-muted)', opacity: 0.4 }}>—</span>

    // Monotonicity: how many of the 3 transitions agree with the overall direction
    const dir = delta > 0 ? 1 : -1
    let consistent = 0, total = 0
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i] != null && vals[i + 1] != null) {
        total++
        const step = vals[i + 1] - vals[i]
        if (Math.abs(step) > 0.05 && (step > 0 ? 1 : -1) === dir) consistent++
      }
    }
    const monotonicity = total > 0 ? consistent / total : 0
    const opacity = monotonicity >= 0.67 ? 1 : monotonicity >= 0.33 ? 0.55 : 0.3

    const isUp = delta > 0
    const isLarge = absDelta > 2
    const color = isUp ? '#2E7D32' : '#B55B2E'
    const symbol = isLarge ? (isUp ? '↑↑' : '↓↓') : (isUp ? '↑' : '↓')

    return (
      <span
        className="font-mono select-none"
        style={{ color, opacity, fontWeight: isLarge ? 700 : 400, fontSize: isLarge ? '1em' : '0.85em' }}
        title={`${isUp ? '+' : ''}${delta.toFixed(2)}pp overall · ${Math.round(monotonicity * 100)}% monotone`}
      >
        {symbol}
      </span>
    )
  }

  const fmt = (v) => v == null ? '—' : v.toFixed(1) + '%'

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-xs border-collapse" style={{ borderColor: 'var(--c-border)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
            <th className="text-left py-2 pr-3 font-medium whitespace-nowrap">Occupation group</th>
            <th className="text-center py-2 px-2 font-medium">LMI</th>
            <th className="text-center py-2 px-1 font-medium" title="Direction and magnitude of overall task share change (Feb 2025→Jan 2026). ↑↑/↓↓ = >2pp; ↑/↓ = 0.25–2pp. Opacity reflects how consistently the trend held direction.">Trend</th>
            {releases.map(r => (
              <th key={r} className="text-right py-2 px-2 font-medium whitespace-nowrap">{releaseLabels[r]}</th>
            ))}
            <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">Autonomy</th>
            <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">Success</th>
          </tr>
        </thead>
        <tbody>
          {socs.map((soc) => {
            const v4 = lookup[`${soc.code}:2026-01-15`]
            const isHighlighted = soc.lmi_flag === 'high' || soc.lmi_flag === 'moderate'
            return (
              <tr key={soc.code}
                style={{
                  borderBottom: '1px solid var(--c-border)',
                  backgroundColor: isHighlighted ? 'var(--c-card-hover)' : 'transparent',
                  color: 'var(--c-text-body)',
                }}>
                <td className="py-1.5 pr-3 whitespace-nowrap" style={{ color: isHighlighted ? 'var(--c-text)' : 'var(--c-text-body)' }}>
                  <span className="font-mono text-xs mr-1.5" style={{ color: 'var(--c-text-muted)' }}>{soc.code}</span>
                  {soc.label}
                </td>
                <td className="text-center py-1.5 px-2">{flagBadge(soc.lmi_flag)}</td>
                <td className="text-center py-1.5 px-1"><TrendArrow socCode={soc.code} /></td>
                {releases.map(r => (
                  <td key={r} className="text-right py-1.5 px-2 font-mono">
                    {fmt(lookup[`${soc.code}:${r}`]?.task_pct)}
                  </td>
                ))}
                <td className="text-right py-1.5 pl-2 font-mono">
                  {v4?.mean_ai_autonomy != null ? v4.mean_ai_autonomy.toFixed(2) : '—'}
                </td>
                <td className="text-right py-1.5 pl-2 font-mono">
                  {v4?.mean_task_success != null ? v4.mean_task_success.toFixed(1) + '%' : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <ChartCaption>
        Task share = % of Claude interactions. LMI-flagged rows highlighted.
        Trend: ↑↑/↓↓ = &gt;2pp change (Feb→Jan); ↑/↓ = 0.25–2pp; opacity reflects monotonicity across all 4 releases. Hover for exact values.
        Autonomy and Success: Claude self-assessed (V4 only, 0–4 and % scales). Military (SOC 55) excluded.
      </ChartCaption>
    </div>
  )
}
