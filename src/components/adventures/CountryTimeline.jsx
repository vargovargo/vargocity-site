import countries from '../../data/countries.json'

// Flatten all visits, attach country info
const allVisits = countries.flatMap(c =>
  c.visits.map(v => ({ ...v, country: c }))
)

// Sort by start year (lived) or year (visited), then month, nulls last
const sorted = [...allVisits].sort((a, b) => {
  const aYear = a.type === 'lived' ? a.year_start : a.year
  const bYear = b.type === 'lived' ? b.year_start : b.year
  if (aYear === null && bYear === null) return 0
  if (aYear === null) return 1
  if (bYear === null) return -1
  if (aYear !== bYear) return aYear - bYear
  return (a.month ?? 0) - (b.month ?? 0)
})

function yearLabel(v) {
  if (v.type === 'lived') {
    return v.year_end ? `${v.year_start}–${v.year_end}` : `${v.year_start}–present`
  }
  return v.year ?? '—'
}

export default function CountryTimeline() {
  if (sorted.length === 0) {
    return <p className="text-sm py-12 text-center" style={{ color: 'var(--c-text-muted)' }}>No countries logged yet.</p>
  }
  return (
    <div className="space-y-2">
      {sorted.map((v, i) => (
        <div key={i} className="flex items-start gap-4">
          <span className="text-xs tabular-nums w-24 shrink-0 pt-px font-data" style={{ color: 'var(--c-text-muted)' }}>
            {yearLabel(v)}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{v.country.name}</span>
              {v.type === 'lived' && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--c-card-hover)', color: 'var(--c-text-muted)' }}>
                  lived
                </span>
              )}
              {v.cities?.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--c-text-body)' }}>
                  {v.cities.join(', ')}
                </span>
              )}
            </div>
            {v.notes && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{v.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
