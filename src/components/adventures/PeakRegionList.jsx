import { useState } from 'react'
import spsData from '../../data/sps-peaks.json'

function StravaLink({ url }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Strava activity (private — log in to view)"
      className="inline-flex items-center gap-1 text-xs mt-1"
      style={{ color: '#FC4C02' }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Strava
    </a>
  )
}

export default function PeakRegionList() {
  const [selectedPeak, setSelectedPeak] = useState(null) // peak.name

  return (
    <div className="space-y-10">
      {spsData.regions.map(region => {
        const total = region.peaks.length
        const climbed = region.peaks.filter(p => p.ascents?.length > 0).length
        const selected = region.peaks.find(p => p.name === selectedPeak)

        return (
          <div key={region.name}>
            <div className="flex items-baseline justify-between mb-3 pb-2" style={{ borderBottom: '1px solid #E5E5E0' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{region.name}</h3>
              <span className="text-xs tabular-nums" style={{ color: climbed > 0 ? '#1A1A1A' : '#8A8A8A' }}>
                {climbed} / {total}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {region.peaks.map(peak => {
                const isClimbed = peak.ascents?.length > 0
                const isSelected = peak.name === selectedPeak
                return (
                  <div
                    key={peak.name}
                    onClick={isClimbed ? () => setSelectedPeak(isSelected ? null : peak.name) : undefined}
                    className="text-xs px-2.5 py-1"
                    style={{
                      backgroundColor: isSelected ? '#FC4C02' : isClimbed ? '#1A1A1A' : '#FAFAF8',
                      color: isClimbed ? '#FFFFFF' : '#8A8A8A',
                      border: '1px solid',
                      borderColor: isSelected ? '#FC4C02' : isClimbed ? '#1A1A1A' : '#E5E5E0',
                      cursor: isClimbed ? 'pointer' : 'default',
                    }}
                  >
                    {peak.name}
                  </div>
                )
              })}
            </div>

            {selected?.ascents?.length > 0 && (
              <div className="mt-3 pl-3 border-l-2 space-y-2" style={{ borderColor: '#FC4C02' }}>
                {selected.ascents.map((ascent, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                        {new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                      {selected.ascents.length > 1 && (
                        <span className="text-xs" style={{ color: '#8A8A8A' }}>
                          ascent {i + 1} of {selected.ascents.length}
                        </span>
                      )}
                      <StravaLink url={ascent.strava_url} />
                    </div>
                    {ascent.notes && (
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#4A4A4A' }}>
                        {ascent.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
