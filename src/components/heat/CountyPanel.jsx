/** @import { CountyRecord } from '../../types/heat-typology.js' */
import {
  TYPE_META, STATE_ABBR, UNTYPED_COPY, NO_DATA,
  hazardState, isMixed,
} from './hazards'

function ScoreBar({ type, score }) {
  const { label, color } = TYPE_META[type]
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: 'var(--c-text-body)' }}>{label}</span>
        <span className="font-mono" style={{ color: 'var(--c-text-muted)' }}>
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--c-border)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${score * 100}%`, backgroundColor: color, opacity: 0.85 }}
        />
      </div>
    </div>
  )
}

function MetricRow({ label, baseline, projected, unit = 'days/yr', digits = 1 }) {
  if (baseline == null && projected == null) return null
  const delta = projected != null && baseline != null ? projected - baseline : null
  return (
    <div className="flex items-baseline justify-between text-xs py-1"
      style={{ borderBottom: '1px solid var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--c-text-body)' }}>
        {baseline != null ? baseline.toFixed(digits) : '—'}
        <span style={{ color: 'var(--c-text-muted)' }}> → </span>
        {projected != null ? projected.toFixed(digits) : '—'}
        {delta != null && (
          <span style={{ color: delta > 0 ? 'var(--c-heat-shock)' : 'var(--c-heat-shift)', marginLeft: 4 }}>
            ({delta > 0 ? '+' : ''}{delta.toFixed(digits)})
          </span>
        )}
        <span className="ml-1" style={{ color: 'var(--c-text-muted)' }}>{unit}</span>
      </span>
    </div>
  )
}

function PlainRow({ label, value, hint }) {
  if (value == null) return null
  return (
    <div className="flex items-baseline justify-between text-xs py-1"
      style={{ borderBottom: '1px solid var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }} title={hint}>{label}</span>
      <span className="font-mono" style={{ color: 'var(--c-text-body)' }}>{value}</span>
    </div>
  )
}

/**
 * Annual heavy-smoke days, 2011–2025. The five-year comparison windows that
 * drive the typology average the spikes away; this is where they are visible.
 * New York County reads 1,0,0,1,1,0,0,1,1,3,6,0,14,1,4 and tells its own story.
 */
function SmokeSparkline({ values, years }) {
  if (!values?.length) return null
  const w = 212, h = 40, pad = 1, topPad = 12
  const max = Math.max(...values, 1)
  const bw = (w - pad * 2) / values.length
  const peakIdx = values.indexOf(max)
  const peakX = Math.min(w - pad - 20, Math.max(pad + 20, pad + peakIdx * bw + bw / 2))

  return (
    <div className="mt-1 mb-2">
      <svg width="100%" viewBox={`0 0 ${w} ${topPad + h + 12}`} role="img"
        aria-label={`Heavy-smoke days per year, ${years?.[0] ?? ''} to ${years?.[years.length - 1] ?? ''}`}>
        {values.map((v, i) => {
          const bh = max ? (v / max) * h : 0
          return (
            <rect
              key={i}
              x={pad + i * bw + 0.6}
              y={topPad + h - bh}
              width={Math.max(1, bw - 1.2)}
              height={bh}
              rx={0.8}
              fill="var(--c-heat-shock)"
              fillOpacity={i === peakIdx ? 0.95 : 0.42}
            >
              <title>{`${years?.[i] ?? i}: ${v} heavy-smoke ${v === 1 ? 'day' : 'days'}`}</title>
            </rect>
          )
        })}
        <line x1={0} y1={topPad + h} x2={w} y2={topPad + h} stroke="var(--c-border)" strokeWidth={0.8} />
        {/* The peak callout sits above its own bar rather than on the year axis:
            the spike is usually 2023, close enough to the end of the window that
            an axis label would collide with the final year. */}
        <text x={peakX} y={topPad - 3.5} fontSize={8.5} textAnchor="middle" fill="var(--c-text-body)">
          {years?.[peakIdx]}: {max}
        </text>
        <text x={pad} y={topPad + h + 10} fontSize={8} fill="var(--c-text-muted)">{years?.[0]}</text>
        <text x={w - pad} y={topPad + h + 10} fontSize={8} textAnchor="end"
          fill="var(--c-text-muted)">{years?.[years.length - 1]}</text>
      </svg>
    </div>
  )
}

function HeatMetrics({ metrics }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
        Heat index days (baseline → projected)
      </p>
      <MetricRow label="≥ 95°F days" baseline={metrics.baseline_hi95} projected={metrics.projected_hi95} />
      <MetricRow label="≥ 100°F days" baseline={metrics.baseline_hi100} projected={metrics.projected_hi100} />
    </div>
  )
}

function WildfireMetrics({ metrics, years }) {
  // Lead with the population-independent drivers. Person-days scale with
  // population and are deliberately *not* in the typology, so they sit below
  // and are labelled as magnitude rather than trajectory.
  const recur = v => (v == null ? null : `${(v * 5).toFixed(0)} of 5`)
  const pd = v => (v == null ? null : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v.toLocaleString())

  return (
    <>
      <div className="mb-3">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
          Heavy smoke (2011–15 → 2021–25)
        </p>
        <MetricRow
          label="Days for the typical resident"
          baseline={metrics.heavy_pd_per_capita_p1}
          projected={metrics.heavy_pd_per_capita_p2}
          unit="days/5yr"
          digits={0}
        />
        <PlainRow label="Years in five with heavy smoke" value={recur(metrics.recurrence_p2)} />
        <PlainRow
          label="Person-days, 2021–25"
          value={pd(metrics.heavy_pd_p2)}
          hint="Total exposure magnitude — scales with population, and is not an input to the typology."
        />
      </div>

      {metrics.heavy_days_annual?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Heavy-smoke days per year
          </p>
          <SmokeSparkline values={metrics.heavy_days_annual} years={years} />
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
          Who is exposed
        </p>
        <PlainRow
          label="Frontline workers"
          value={metrics.frontline_share != null ? `${(metrics.frontline_share * 100).toFixed(0)}%` : null}
          hint="ACS C24050: natural resources, construction and maintenance plus production, transportation and material moving — people who work outdoors or indoors without adequate ventilation."
        />
        <PlainRow
          label="In CRA-eligible tracts"
          value={metrics.cra_pop_share != null ? `${(metrics.cra_pop_share * 100).toFixed(0)}%` : null}
          hint="Share of population in low- and moderate-income census tracts."
        />
        <PlainRow
          label="Student poverty"
          value={metrics.student_poverty_share != null ? `${(metrics.student_poverty_share * 100).toFixed(0)}%` : null}
        />
      </div>
    </>
  )
}

/**
 * @param {{ county: CountyRecord, onClose: () => void, hazard: string, meta: object|null }} props
 */
export default function CountyPanel({ county, onClose, hazard = 'heat', meta = null }) {
  const stateAbbr = STATE_ABBR[county.state] ?? county.state
  const { state, record } = hazardState(county, hazard)
  const heatMetrics = county.hazards.heat?.metrics ?? {}
  const years = meta?.hazards?.[hazard]?.annual_years

  const typed = state === 'typed'
  const typeMeta = typed ? TYPE_META[record.dominant] : null
  const mixed = typed && isMixed(record.confidence)

  return (
    <div
      className="rounded-lg border"
      style={{
        width: '100%',
        borderColor: 'var(--c-border)',
        backgroundColor: 'var(--c-surface)',
        maxHeight: '540px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3"
        style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--c-text)' }}>
            {county.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
            {stateAbbr} · FIPS {county.county_fips}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none ml-3 mt-0.5 flex-shrink-0"
          style={{ color: 'var(--c-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        {/* Dominant type — or an honest account of why there isn't one */}
        <div className="mb-4">
          {typed ? (
            <>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {mixed ? (
                  // Below 0.15 the top score barely separates from the others.
                  // Naming a type here would assert more than the data supports.
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--c-border)', color: 'var(--c-text-body)' }}
                  >
                    Mixed signal
                  </span>
                ) : (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: typeMeta.color + '22', color: typeMeta.color }}
                  >
                    {typeMeta.label}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                  {Math.round(record.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--c-text-body)' }}>
                {mixed
                  ? `Leans ${record.dominant}, but the three scores are close enough that this county reads as in transition rather than as a type.`
                  : typeMeta.oneliner}
              </p>
            </>
          ) : (
            <>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--c-border)', color: 'var(--c-text-body)' }}
              >
                {UNTYPED_COPY[state]?.short ?? 'Unclassified'}
              </span>
              <p className="text-xs mt-1.5" style={{ color: 'var(--c-text-body)' }}>
                {UNTYPED_COPY[state]?.long ?? 'No classification for this county.'}
              </p>
            </>
          )}
        </div>

        {/* Score bars — only where the scores mean something */}
        {typed && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
              Type scores
            </p>
            <ScoreBar type="shock"  score={record.scores.shock} />
            <ScoreBar type="stress" score={record.scores.stress} />
            <ScoreBar type="shift"  score={record.scores.shift} />
            {!mixed && record.dominant !== 'shock' && record.scores.shock >= 0.25 && (
              <p className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
                {Math.round(record.scores.shock * 100)}% shock weight — {hazard === 'wildfire'
                  ? 'episodic-event response still applies alongside the recurring burden.'
                  : 'some baseline cooling infrastructure still applies.'}
              </p>
            )}
          </div>
        )}

        {/* Hazard-specific metrics */}
        {state !== NO_DATA && (
          hazard === 'wildfire'
            ? <WildfireMetrics metrics={record?.metrics ?? {}} years={years} />
            : <HeatMetrics metrics={heatMetrics} />
        )}

        {/* Community context — county attributes, same under either hazard */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Community context
          </p>
          <PlainRow label="Social vulnerability" value={heatMetrics.sovi_score?.toFixed(1)} />
          <PlainRow label="Community resilience" value={heatMetrics.resl_score?.toFixed(1)} />
          <div className="flex items-baseline justify-between text-xs py-1">
            <span style={{ color: 'var(--c-text-muted)' }}>Population</span>
            <span className="font-mono" style={{ color: 'var(--c-text-body)' }}>
              {county.population.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
