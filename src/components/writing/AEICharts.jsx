import { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'
import panelData from '../../data/aei-panel.json'
import subgroupData from '../../data/soc43-subgroup.json'
import statePanelData from '../../data/aei-state-panel.json'

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
    marginBottom: 45,
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

// ── Chart 5: SOC 43 subgroup — task share + automation slope ────────────────
export function SOC43SubgroupChart() {
  const [containerRef, width] = useContainerWidth()

  const data = subgroupData.subgroups
  const MAIN_GROUPS = ['43-9', '43-4', '43-6']
  const GROUP_COLORS = {
    '43-9': '#6B52A0',
    '43-4': '#C0583A',
    '43-6': '#2E7A9E',
  }
  const groupColor = (g) => GROUP_COLORS[g] ?? '#AAAAAA'
  const isMain = (g) => MAIN_GROUPS.includes(g)

  const sorted = [...data].sort((a, b) => b.share_of_soc43_v5 - a.share_of_soc43_v5)

  const slopeData = data.flatMap(d => [
    { broad_group: d.broad_group, broad_title: d.broad_title, release: 'Sep 2025', automation_pct: d.automation_pct_v3 },
    { broad_group: d.broad_group, broad_title: d.broad_title, release: 'Jan 2026', automation_pct: d.automation_pct_v4 },
    { broad_group: d.broad_group, broad_title: d.broad_title, release: 'Mar 2026', automation_pct: d.automation_pct_v5 },
  ])

  const barRef = usePlot({
    width,
    height: 195,
    marginLeft: 155,
    marginRight: 55,
    marginBottom: 45,
    style: PLOT_STYLE,
    x: {
      label: 'Share of SOC 43 task interactions (V5, %)',
      domain: [0, 65],
    },
    y: { label: null },
    marks: [
      Plot.barX(sorted, {
        x: 'share_of_soc43_v5',
        y: 'broad_title',
        fill: d => groupColor(d.broad_group),
        fillOpacity: d => isMain(d.broad_group) ? 0.75 : 0.35,
        sort: { y: '-x' },
      }),
      Plot.text(sorted, {
        x: 'share_of_soc43_v5',
        y: 'broad_title',
        text: d => d.share_of_soc43_v5.toFixed(1) + '%',
        dx: 5,
        textAnchor: 'start',
        fontSize: 10,
        fill: d => groupColor(d.broad_group),
        fillOpacity: d => isMain(d.broad_group) ? 1 : 0.6,
        sort: { y: '-x' },
      }),
    ],
  }, [width])

  const slopeRef = usePlot({
    width,
    height: 230,
    marginRight: 110,
    style: PLOT_STYLE,
    x: {
      label: null,
      domain: ['Sep 2025', 'Jan 2026', 'Mar 2026'],
      padding: 0.5,
    },
    y: {
      label: 'Automation-type interactions (%)',
      grid: true,
      tickFormat: d => d + '%',
      domain: [22, 62],
    },
    marks: [
      Plot.line(slopeData, {
        x: 'release',
        y: 'automation_pct',
        z: 'broad_group',
        stroke: d => groupColor(d.broad_group),
        strokeWidth: d => isMain(d.broad_group) ? 2 : 1.2,
        strokeOpacity: d => isMain(d.broad_group) ? 0.85 : 0.4,
      }),
      Plot.dot(slopeData, {
        x: 'release',
        y: 'automation_pct',
        fill: d => groupColor(d.broad_group),
        r: d => isMain(d.broad_group) ? 4 : 3,
        fillOpacity: d => isMain(d.broad_group) ? 0.85 : 0.4,
      }),
      Plot.text(slopeData.filter(d => d.release === 'Mar 2026'), {
        x: 'release',
        y: 'automation_pct',
        text: 'broad_group',
        textAnchor: 'start',
        dx: 8,
        fill: d => groupColor(d.broad_group),
        fillOpacity: d => isMain(d.broad_group) ? 1 : 0.55,
        fontSize: 11,
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
        Task share within SOC 43 (V5, Mar 2026)
      </p>
      <div ref={barRef} />
      <p className="text-xs font-medium mt-5 mb-1" style={{ color: 'var(--c-text-muted)' }}>
        Automation rate shift, Sep 2025 → Jan 2026 → Mar 2026
      </p>
      <div ref={slopeRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        {[
          ['43-9', 'Other Office & Admin (43-9)'],
          ['43-4', 'Info & Record Clerks (43-4)'],
          ['43-6', 'Secretaries & Admin (43-6)'],
        ].map(([g, label]) => (
          <span key={g} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: GROUP_COLORS[g] }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#AAAAAA', opacity: 0.5 }} />
          Small-n subgroups (43-1, 43-2, 43-3, 43-5)
        </span>
      </div>
      <ChartCaption>
        Task share: V5 raw (Mar 2026), US geography. Automation rate: count-weighted from global collaboration data across V3 (Sep 2025), V4 (Jan 2026), and V5 (Mar 2026).
        Denominator includes not_classified and none interactions. Task corpus changed between releases — V4→V5 automation shifts for 43-4, 43-3, 43-5 reflect both behavioral change and task-set composition change. Small-n subgroups (&lt;5% share) are indicative only.
      </ChartCaption>
    </div>
  )
}

// ── State scatter: two-mode geographic explorer ────────────────────────────
const LMI_HIGH_CODES = new Set([31, 41, 43, 53])
const COMP_CODE = 15

// States worth labeling in Mode 1 (tell the story)
// UT and OR dropped — they cluster with NV on the right; left cluster (CT/CA/NY/MA) needs per-state offsets
const LABEL_STATES = new Set(['CT','NV','WA','LA','FL','TX','CA','NY','MA'])

// Per-state label offsets to prevent collision in the left (CA/CT/NY/MA) and right (NV) clusters
const LABEL_OFFSETS = {
  CT: { dx:  7, dy: -9  },  // top of left cluster
  CA: { dx:  7, dy:  9  },  // just below CT (same X band)
  NY: { dx: -26, dy:  6 },  // anchor left so it doesn't crowd MA
  MA: { dx:  7, dy:  0  },
  NV: { dx:  7, dy: -8  },  // nudge up from NV dot
  WA: { dx:  7, dy:  0  },
  FL: { dx:  7, dy: -8  },
  TX: { dx:  7, dy:  8  },
  LA: { dx:  7, dy:  0  },
}

export function StateScatter() {
  const [containerRef, width] = useContainerWidth()
  const [selectedState, setSelectedState] = useState(null)
  const overviewRef = useRef()
  const parityRef = useRef()

  const { state_soc, national_v5 } = statePanelData

  // ── Derived: per-state aggregates for Mode 1 ──────────────────────────────
  const stateMap = {}
  for (const row of state_soc) {
    if (!stateMap[row.geo_id]) {
      stateMap[row.geo_id] = {
        geo_id: row.geo_id, state_name: row.state_name,
        n_soc: row.n_soc, comp_share: null, lmi_high_share: 0,
        automation_pct: row.automation_pct,
      }
    }
    if (row.soc_major_code === COMP_CODE) stateMap[row.geo_id].comp_share = row.task_pct
    if (LMI_HIGH_CODES.has(row.soc_major_code)) stateMap[row.geo_id].lmi_high_share += (row.task_pct || 0)
  }
  const stateData = Object.values(stateMap).filter(d => d.comp_share != null)

  // National reference values
  const natComp = national_v5.find(d => d.soc_major_code === COMP_CODE)?.task_pct ?? 32.2
  const natLmiHigh = national_v5
    .filter(d => LMI_HIGH_CODES.has(d.soc_major_code))
    .reduce((s, d) => s + (d.task_pct || 0), 0)

  // ── Mode 1: overview scatter ───────────────────────────────────────────────
  useEffect(() => {
    if (!overviewRef.current || selectedState) return
    overviewRef.current.innerHTML = ''
    const labeled = stateData.filter(d => LABEL_STATES.has(d.geo_id))
    const chart = Plot.plot({
      width,
      height: 320,
      marginLeft: 55,
      marginBottom: 45,
      marginRight: 20,
      marginTop: 12,
      style: PLOT_STYLE,
      x: { label: 'Computer & Math task share (%)', tickSize: 0, grid: true },
      y: { label: 'LMI-high task share (%)', tickSize: 0, grid: true },
      marks: [
        Plot.ruleX([natComp], { stroke: 'var(--c-border)', strokeDasharray: '4,3' }),
        Plot.ruleY([natLmiHigh], { stroke: 'var(--c-border)', strokeDasharray: '4,3' }),
        // Low-coverage states (grayed)
        Plot.dot(stateData.filter(d => d.n_soc < 5), {
          x: 'comp_share', y: 'lmi_high_share',
          fill: '#CCCCCC', stroke: '#BBBBBB', r: 4, fillOpacity: 0.5,
        }),
        // Full-coverage states
        Plot.dot(stateData.filter(d => d.n_soc >= 5), {
          x: 'comp_share', y: 'lmi_high_share',
          fill: d => d.lmi_high_share > natLmiHigh ? LMI_COLORS.high : LMI_COLORS.low,
          fillOpacity: 0.75, r: 5,
          title: d => `${d.state_name}\nLMI-high: ${d.lmi_high_share.toFixed(1)}%\nComp & Math: ${d.comp_share.toFixed(1)}%\n(${d.n_soc} occupation groups tracked)`,
          tip: true,
        }),
        // Labels for notable states (per-state offsets to avoid collisions)
        Plot.text(labeled, {
          x: 'comp_share', y: 'lmi_high_share',
          text: 'geo_id',
          dx: d => LABEL_OFFSETS[d.geo_id]?.dx ?? 7,
          dy: d => LABEL_OFFSETS[d.geo_id]?.dy ?? 0,
          fontSize: 10,
          fill: 'var(--c-text-muted)',
        }),
      ],
    })
    overviewRef.current.appendChild(chart)
  }, [width, selectedState, stateData, natComp, natLmiHigh])

  // ── Mode 2: parity scatter for selected state ──────────────────────────────
  const parityData = selectedState
    ? (() => {
        const natMap = Object.fromEntries(national_v5.map(d => [d.soc_major_code, d]))
        const stateRows = state_soc.filter(d => d.geo_id === selectedState)
        return stateRows.map(d => ({
          ...d,
          national_pct: natMap[d.soc_major_code]?.task_pct ?? null,
        })).filter(d => d.national_pct != null)
      })()
    : []

  useEffect(() => {
    if (!parityRef.current || !selectedState) return
    parityRef.current.innerHTML = ''
    if (parityData.length === 0) return
    const maxVal = Math.max(...parityData.flatMap(d => [d.task_pct, d.national_pct])) * 1.1
    const labelDots = parityData.filter(d =>
      d.lmi_flag === 'high' || Math.abs((d.task_pct - d.national_pct)) > 2.5
    )
    const chart = Plot.plot({
      width,
      height: 320,
      marginLeft: 55,
      marginBottom: 45,
      marginRight: 20,
      marginTop: 12,
      style: PLOT_STYLE,
      x: { label: 'National task share (%)', tickSize: 0, grid: true, domain: [0, maxVal] },
      y: { label: `${stateMap[selectedState]?.state_name ?? selectedState} task share (%)`, tickSize: 0, grid: true, domain: [0, maxVal] },
      marks: [
        Plot.line([[0, 0], [maxVal, maxVal]], { stroke: 'var(--c-border)', strokeDasharray: '4,3' }),
        Plot.dot(parityData, {
          x: 'national_pct', y: 'task_pct',
          fill: d => LMI_COLORS[d.lmi_flag],
          fillOpacity: 0.8, r: 5,
          title: d => `${d.soc_label}\nNational: ${d.national_pct.toFixed(1)}%\n${stateMap[selectedState]?.state_name ?? selectedState}: ${d.task_pct.toFixed(1)}%\nΔ ${(d.task_pct - d.national_pct) > 0 ? '+' : ''}${(d.task_pct - d.national_pct).toFixed(1)}pp`,
          tip: true,
        }),
        Plot.text(labelDots, {
          x: 'national_pct', y: 'task_pct',
          text: 'soc_label', dy: -10, fontSize: 10,
          fill: d => LMI_COLORS[d.lmi_flag],
        }),
      ],
    })
    parityRef.current.appendChild(chart)
  }, [width, selectedState, parityData])

  // States with n_soc >= 5, for dropdown
  const comparableStates = [...new Set(state_soc.filter(d => d.n_soc >= 5).map(d => d.geo_id))]
    .map(id => ({ id, name: stateMap[id]?.state_name ?? id }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div ref={containerRef} className="my-6">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
          Compare a state:
        </label>
        <select
          value={selectedState ?? ''}
          onChange={e => setSelectedState(e.target.value || null)}
          className="text-xs rounded px-2 py-1"
          style={{
            border: '1px solid var(--c-border)',
            background: 'var(--c-surface)',
            color: 'var(--c-text-body)',
          }}
        >
          <option value=''>— Overview: all states —</option>
          {comparableStates.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {selectedState && (
          <button
            onClick={() => setSelectedState(null)}
            className="text-xs"
            style={{ color: 'var(--c-text-muted)' }}
          >
            ← All states
          </button>
        )}
      </div>

      {/* Charts */}
      {!selectedState && <div ref={overviewRef} />}
      {selectedState && <div ref={parityRef} />}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2">
        {!selectedState ? (
          <>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: LMI_COLORS.high, opacity:0.75 }} />
              Above national LMI-high average
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: LMI_COLORS.low, opacity:0.75 }} />
              Below national LMI-high average
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#CCC', opacity:0.75 }} />
              Fewer than 5 occupation groups tracked
            </span>
          </>
        ) : (
          Object.entries(LMI_LABELS).map(([flag, label]) => (
            <span key={flag} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: LMI_COLORS[flag], opacity:0.8 }} />
              {label}
            </span>
          ))
        )}
        {!selectedState && (
          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            · Dashed lines = national averages. Hover for details.
          </span>
        )}
        {selectedState && (
          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            · Dashed line = parity. Above = over-represented vs. national. Hover for details.
          </span>
        )}
      </div>

      <ChartCaption>
        {!selectedState
          ? `V5 (Mar 2026). LMI-high = Office & Admin (43), Sales (41), Healthcare Support (31), Transportation (53). States with fewer than 5 occupation groups above Anthropic's conversation threshold are grayed — their profiles reflect exclusion, not true absence. Select a state from the dropdown to compare its occupation mix against the national distribution.`
          : `V5 (Mar 2026). Each dot is a major occupation group. Above the parity line = that occupation accounts for a larger share of AI usage in ${stateMap[selectedState]?.state_name ?? selectedState} than nationally. ${comparableStates.length - (stateMap[selectedState]?.n_soc ?? 0) > 0 ? `${23 - (stateMap[selectedState]?.n_soc ?? 0)} of 23 occupation groups are below Anthropic's conversation threshold for this state and not shown.` : ''}`
        }
      </ChartCaption>
    </div>
  )
}

// ── SOC 43 by state: horizontal bar chart ─────────────────────────────────
const SOC43_NATIONAL = 9.44  // V5 national SOC 43 task share

export function StateSOC43Bar() {
  const [containerRef, width] = useContainerWidth()

  const data = statePanelData.state_soc
    .filter(d => d.soc_major_code === 43 && d.task_pct != null)
    .sort((a, b) => b.task_pct - a.task_pct)

  const plotRef = usePlot({
    width,
    height: data.length * 16 + 60,
    marginLeft: 130,
    marginRight: 55,
    marginBottom: 40,
    marginTop: 10,
    style: PLOT_STYLE,
    x: {
      label: 'SOC 43 share of AI task usage (%)',
      tickSize: 0,
      grid: true,
      domain: [0, Math.ceil(Math.max(...data.map(d => d.task_pct)) / 2) * 2 + 1],
    },
    y: { label: null, tickSize: 0 },
    marks: [
      // National reference line
      Plot.ruleX([SOC43_NATIONAL], {
        stroke: 'var(--c-text-muted)',
        strokeDasharray: '4,3',
        strokeWidth: 1.5,
      }),
      // Bars
      Plot.barX(data, {
        x: 'task_pct',
        y: 'state_name',
        fill: d => d.n_soc < 5 ? '#CCCCCC' : d.task_pct >= SOC43_NATIONAL ? LMI_COLORS.high : '#8BACC8',
        fillOpacity: d => d.n_soc < 5 ? 0.45 : 0.75,
        sort: { y: '-x' },
      }),
      // Value labels at bar end
      Plot.text(data, {
        x: 'task_pct',
        y: 'state_name',
        text: d => d.task_pct.toFixed(1) + '%',
        dx: 4,
        textAnchor: 'start',
        fontSize: 9.5,
        fill: d => d.n_soc < 5 ? '#999' : 'var(--c-text-body)',
        sort: { y: '-x' },
      }),
      // "National" label on reference line
      Plot.text([{ x: SOC43_NATIONAL, label: 'National\n9.4%' }], {
        x: 'x',
        y: data[data.length - 1]?.state_name,
        text: 'label',
        dy: 22,
        fontSize: 9,
        fill: 'var(--c-text-muted)',
        textAnchor: 'middle',
        lineWidth: 8,
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <div ref={plotRef} />
      <div className="flex flex-wrap gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 12, height: 10, background: LMI_COLORS.high, opacity: 0.75, borderRadius: 1 }} />
          Above national average
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 12, height: 10, background: '#8BACC8', opacity: 0.75, borderRadius: 1 }} />
          Below national average
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span style={{ display: 'inline-block', width: 12, height: 10, background: '#CCC', opacity: 0.5, borderRadius: 1 }} />
          Fewer than 5 occupation groups tracked (low confidence)
        </span>
      </div>
      <ChartCaption>
        V5 (Mar 2026). Office and Administrative Support (SOC 43) task share among all AI interactions attributed to that state.
        Dashed line = national average (9.4%). States with fewer than 5 major occupation groups tracked above threshold are shown at reduced opacity — their SOC 43 figures may reflect threshold exclusion rather than true concentration.
      </ChartCaption>
    </div>
  )
}

// ── Threshold diagnostic: n_soc vs CS and SOC43 shares ────────────────────
// Shows that CS share is a coverage artifact but SOC43 geographic variation is real

function ols(xs, ys) {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) /
                xs.reduce((s, x) => s + (x - mx) ** 2, 0)
  const intercept = my - slope * mx
  const fitted = xs.map(x => intercept + slope * x)
  const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0)
  const ssRes = ys.reduce((s, y, i) => s + (y - fitted[i]) ** 2, 0)
  return { slope, intercept, r2: 1 - ssRes / ssTot, r: Math.sqrt(1 - ssRes / ssTot) * (slope < 0 ? -1 : 1) }
}

const CS_LABEL_STATES  = new Set(['CT', 'OH', 'DE', 'WA', 'CA', 'NY'])
const SOC43_LABEL_STATES = new Set(['CT', 'LA', 'CO', 'WA', 'CA'])

export function StateThresholdChart() {
  const [containerRef, width] = useContainerWidth()
  const { state_soc } = statePanelData

  // Build per-state lookup
  const sm = {}
  for (const r of state_soc) {
    if (!sm[r.geo_id]) sm[r.geo_id] = { geo_id: r.geo_id, state_name: r.state_name, n_soc: r.n_soc }
    if (r.soc_major_code === 15 && r.task_pct != null) sm[r.geo_id].cs = r.task_pct
    if (r.soc_major_code === 43 && r.task_pct != null) sm[r.geo_id].soc43 = r.task_pct
  }
  const csData   = Object.values(sm).filter(d => d.cs   != null)
  const s43Data  = Object.values(sm).filter(d => d.soc43 != null)

  const csStats  = ols(csData.map(d => d.n_soc),  csData.map(d => d.cs))
  const s43Stats = ols(s43Data.map(d => d.n_soc), s43Data.map(d => d.soc43))

  // Regression line endpoints for each panel
  const nMin = 1, nMax = 22
  const csLine  = [{ n: nMin, y: csStats.intercept  + csStats.slope  * nMin },
                   { n: nMax, y: csStats.intercept  + csStats.slope  * nMax }]
  const s43Line = [{ n: nMin, y: s43Stats.intercept + s43Stats.slope * nMin },
                   { n: nMax, y: s43Stats.intercept + s43Stats.slope * nMax }]

  const panelH = 195
  const panelOpts = { width, height: panelH, marginLeft: 55, marginBottom: 40, marginTop: 10, marginRight: 20, style: PLOT_STYLE }

  const csRef = usePlot({
    ...panelOpts,
    x: { label: 'Occupation groups above threshold', tickSize: 0, grid: true, domain: [0, nMax + 1] },
    y: { label: 'Computer & Math share (%)', tickSize: 0, grid: true },
    marks: [
      Plot.line(csLine, { x: 'n', y: 'y', stroke: LMI_COLORS.low, strokeWidth: 1.5, strokeDasharray: '4,3' }),
      Plot.dot(csData, {
        x: 'n_soc', y: 'cs',
        fill: d => CS_LABEL_STATES.has(d.geo_id) ? LMI_COLORS.low : '#CCCCCC',
        fillOpacity: d => CS_LABEL_STATES.has(d.geo_id) ? 0.9 : 0.5,
        r: d => CS_LABEL_STATES.has(d.geo_id) ? 5 : 3.5,
      }),
      Plot.text(csData.filter(d => CS_LABEL_STATES.has(d.geo_id)), {
        x: 'n_soc', y: 'cs', text: 'geo_id',
        dy: d => ['CT','DE'].includes(d.geo_id) ? -10 : 10,
        dx: d => ['NY','CA'].includes(d.geo_id) ? -14 : 0,
        fontSize: 10, fill: LMI_COLORS.low,
      }),
      Plot.text([{ x: nMax - 1, y: csStats.intercept + csStats.slope * (nMax - 1) + 4 }], {
        x: 'x', y: 'y',
        text: () => `r = ${csStats.r.toFixed(2)}`,
        fontSize: 10, fill: LMI_COLORS.low, textAnchor: 'end',
      }),
    ],
  }, [width])

  const s43Ref = usePlot({
    ...panelOpts,
    x: { label: 'Occupation groups above threshold', tickSize: 0, grid: true, domain: [0, nMax + 1] },
    y: { label: 'Office & Admin share (%)', tickSize: 0, grid: true },
    marks: [
      Plot.line(s43Line, { x: 'n', y: 'y', stroke: LMI_COLORS.high, strokeWidth: 1.5, strokeDasharray: '4,3' }),
      Plot.dot(s43Data, {
        x: 'n_soc', y: 'soc43',
        fill: d => SOC43_LABEL_STATES.has(d.geo_id) ? LMI_COLORS.high : '#CCCCCC',
        fillOpacity: d => SOC43_LABEL_STATES.has(d.geo_id) ? 0.9 : 0.5,
        r: d => SOC43_LABEL_STATES.has(d.geo_id) ? 5 : 3.5,
      }),
      Plot.text(s43Data.filter(d => SOC43_LABEL_STATES.has(d.geo_id)), {
        x: 'n_soc', y: 'soc43', text: 'geo_id',
        dy: d => ['CT','CO'].includes(d.geo_id) ? -10 : 10,
        dx: d => ['CA'].includes(d.geo_id) ? -14 : 0,
        fontSize: 10, fill: LMI_COLORS.high,
      }),
      Plot.text([{ x: nMax - 1, y: s43Stats.intercept + s43Stats.slope * (nMax - 1) + 0.8 }], {
        x: 'x', y: 'y',
        text: () => `r = ${s43Stats.r.toFixed(2)}`,
        fontSize: 10, fill: LMI_COLORS.high, textAnchor: 'end',
      }),
    ],
  }, [width])

  return (
    <div ref={containerRef} className="my-6">
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
        Computer &amp; Math share — declines with coverage (threshold artifact)
      </p>
      <div ref={csRef} />
      <p className="text-xs font-medium mt-5 mb-1" style={{ color: 'var(--c-text-muted)' }}>
        Office &amp; Admin share — flat across coverage levels (genuine geography)
      </p>
      <div ref={s43Ref} />
      <ChartCaption>
        Each dot = one state, V5 (Mar 2026). X-axis = number of major occupation groups above
        Anthropic&apos;s conversation threshold. Top panel: Computer &amp; Math share falls sharply
        as more groups appear (r = {csStats.r.toFixed(2)}) — states with thin coverage show inflated CS
        share because CS clears the threshold first. Bottom panel: Office &amp; Admin share is
        essentially flat (r ≈ {s43Stats.r.toFixed(2)}) — its geographic variation is independent of
        how many groups a state has above threshold.
      </ChartCaption>
    </div>
  )
}
