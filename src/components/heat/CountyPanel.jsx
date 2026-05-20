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

const TYPE_META = {
  shock:  { label: 'Shock',  color: '#C0583A', oneliner: 'Rare extremes becoming regular' },
  stress: { label: 'Stress', color: '#D4813B', oneliner: 'Familiar heat exceeding its envelope' },
  shift:  { label: 'Shift',  color: '#4B7CB8', oneliner: 'Heat envelope reorganizing viable activity' },
}

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

function MetricRow({ label, baseline, projected, unit = 'days/yr' }) {
  if (baseline == null && projected == null) return null
  const delta = projected != null && baseline != null ? projected - baseline : null
  return (
    <div className="flex items-baseline justify-between text-xs py-1"
      style={{ borderBottom: '1px solid var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--c-text-body)' }}>
        {baseline != null ? baseline.toFixed(1) : '—'}
        <span style={{ color: 'var(--c-text-muted)' }}> → </span>
        {projected != null ? projected.toFixed(1) : '—'}
        {delta != null && (
          <span style={{ color: delta > 0 ? '#C0583A' : '#4B7CB8', marginLeft: 4 }}>
            ({delta > 0 ? '+' : ''}{delta.toFixed(1)})
          </span>
        )}
        <span className="ml-1" style={{ color: 'var(--c-text-muted)' }}>{unit}</span>
      </span>
    </div>
  )
}

/**
 * @param {{ county: CountyRecord, onClose: () => void }} props
 */
export default function CountyPanel({ county, onClose }) {
  const stateAbbr = STATE_ABBR[county.state] ?? county.state
  const heat = county.hazards.heat
  const { dominant, confidence, scores, metrics } = heat
  const meta = TYPE_META[dominant]
  const confidencePct = Math.round(confidence * 100)

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
        {/* Dominant type */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: meta.color + '22', color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
              {confidencePct}% confidence
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--c-text-body)' }}>{meta.oneliner}</p>
        </div>

        {/* Score bars */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Type scores
          </p>
          <ScoreBar type="shock"  score={scores.shock} />
          <ScoreBar type="stress" score={scores.stress} />
          <ScoreBar type="shift"  score={scores.shift} />
        </div>

        {/* Key metrics */}
        <div className="mb-3">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Heat index days (baseline → projected)
          </p>
          <MetricRow label="≥ 95°F days" baseline={metrics.baseline_hi95} projected={metrics.projected_hi95} />
          <MetricRow label="≥ 100°F days" baseline={metrics.baseline_hi100} projected={metrics.projected_hi100} />
        </div>

        {/* Vulnerability */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Community context
          </p>
          <div className="flex items-baseline justify-between text-xs py-1"
            style={{ borderBottom: '1px solid var(--c-border)' }}>
            <span style={{ color: 'var(--c-text-muted)' }}>Social vulnerability</span>
            <span className="font-mono" style={{ color: 'var(--c-text-body)' }}>
              {metrics.sovi_score.toFixed(1)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs py-1"
            style={{ borderBottom: '1px solid var(--c-border)' }}>
            <span style={{ color: 'var(--c-text-muted)' }}>Community resilience</span>
            <span className="font-mono" style={{ color: 'var(--c-text-body)' }}>
              {metrics.resl_score.toFixed(1)}
            </span>
          </div>
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
