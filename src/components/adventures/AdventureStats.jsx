import { climbedPeaks, highestClimbed, SPS_TOTAL } from '../../data/spsUtils'
import countries from '../../data/countries.json'

const CONTINENT_ORDER = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania']

export default function AdventureStats({ section }) {
  if (section === 'peaks') {
    return (
      <div style={{ borderBottom: '1px solid #E5E5E0' }}>
        <div className="flex flex-wrap gap-8 py-6">
          <div>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
              {climbedPeaks.length}
              <span className="text-base font-normal" style={{ color: '#8A8A8A' }}>
                {' '}/ {SPS_TOTAL}
              </span>
            </p>
            <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>SPS Peaks Climbed</p>
          </div>
          {highestClimbed > 0 && (
            <div>
              <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
                {highestClimbed.toLocaleString()}
                <span className="text-sm font-normal"> ft</span>
              </p>
              <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Highest Summit</p>
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
    <div style={{ borderBottom: '1px solid #E5E5E0' }}>
      <div className="flex flex-wrap gap-8 py-6">
        <div>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>{countries.length}</p>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Countries</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>{continentRows.length}</p>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Continents</p>
        </div>
      </div>
      {continentRows.length > 0 && (
        <div className="pb-4 flex flex-wrap gap-x-6 gap-y-2">
          {continentRows.map(c => (
            <span key={c.name} className="text-xs" style={{ color: '#4A4A4A' }}>
              <span className="font-medium">{c.name}</span>
              <span style={{ color: '#8A8A8A' }}> {c.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
