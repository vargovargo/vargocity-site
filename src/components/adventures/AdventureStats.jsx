import { climbedPeaks, highestClimbed, SPS_TOTAL } from '../../data/spsUtils'
import countries from '../../data/countries.json'

const CONTINENT_ORDER = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania']

export default function AdventureStats({ section }) {
  if (section === 'peaks') {
    return (
      <div style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex flex-wrap gap-8 py-6">
          <div>
            <p className="text-2xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
              {climbedPeaks.length}
              <span className="text-base font-normal" style={{ color: 'var(--c-text-muted)' }}>
                {' '}/ {SPS_TOTAL}
              </span>
            </p>
            <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>SPS Peaks Climbed</p>
          </div>
          {highestClimbed > 0 && (
            <div>
              <p className="text-2xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
                {highestClimbed.toLocaleString()}
                <span className="text-sm font-normal"> ft</span>
              </p>
              <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Highest Summit</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const continentCounts = countries.reduce((acc, c) => {
    if (c.continent) acc[c.continent] = (acc[c.continent] || 0) + 1
    return acc
  }, {})
  const continentRows = CONTINENT_ORDER
    .filter(c => continentCounts[c])
    .map(c => ({ name: c, count: continentCounts[c] }))

  return (
    <div style={{ borderBottom: '1px solid var(--c-border)' }}>
      <div className="flex flex-wrap gap-8 py-6">
        <div>
          <p className="text-2xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>{countries.length}</p>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Countries</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>{continentRows.length}</p>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Continents</p>
        </div>
      </div>
      {continentRows.length > 0 && (
        <div className="pb-4 flex flex-wrap gap-x-6 gap-y-2">
          {continentRows.map(c => (
            <span key={c.name} className="text-xs" style={{ color: 'var(--c-text-body)' }}>
              <span className="font-medium">{c.name}</span>
              <span style={{ color: 'var(--c-text-muted)' }}> {c.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
