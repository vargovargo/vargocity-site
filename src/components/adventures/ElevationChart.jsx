import { useState } from 'react'
import { peaksByElevation, climbedPeaks } from '../../data/spsUtils'

const climbedIds = new Set(climbedPeaks.map(p => p.id))
const climbedMap = new Map(climbedPeaks.map(p => [p.id, p]))

function StravaLink({ url }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Strava activity (private — log in to view)"
      className="inline-flex items-center gap-1 text-xs"
      style={{ color: '#FC4C02' }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Strava
    </a>
  )
}

export default function ElevationChart() {
  const [selectedId, setSelectedId] = useState(null)

  if (peaksByElevation.length === 0) return null

  const maxElev = peaksByElevation[0].elevation

  return (
    <div>
      <div className="flex items-center gap-6 mb-5">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8A8A8A' }}>
          All 248 SPS Peaks by Elevation
        </p>
        <div className="flex items-center gap-4 ml-auto">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#1A1A1A' }}>
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#1A1A1A' }} />
            Climbed
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#8A8A8A' }}>
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#E5E5E0' }} />
            On the list
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {peaksByElevation.map((peak) => {
          const climbed = climbedIds.has(peak.id)
          const isSelected = selectedId === peak.id
          const peakData = climbed ? climbedMap.get(peak.id) : null

          return (
            <div key={peak.id}>
              <div
                className="flex items-center gap-3"
                style={{ cursor: climbed ? 'pointer' : 'default' }}
                onClick={climbed ? () => setSelectedId(isSelected ? null : peak.id) : undefined}
              >
                <div className="w-36 shrink-0 text-right">
                  <span
                    className="text-xs"
                    style={{ color: climbed ? '#1A1A1A' : '#C0C0BA', fontWeight: climbed ? 600 : 400 }}
                  >
                    {peak.name}
                  </span>
                </div>
                <div className="flex-1 h-4 relative" style={{ backgroundColor: '#F4F4F0' }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(peak.elevation / maxElev) * 100}%`,
                      backgroundColor: climbed ? (isSelected ? '#FC4C02' : '#1A1A1A') : '#E5E5E0',
                    }}
                  />
                </div>
                <span
                  className="text-xs tabular-nums w-16 shrink-0"
                  style={{ color: climbed ? '#4A4A4A' : '#C0C0BA' }}
                >
                  {peak.elevation.toLocaleString()} ft
                </span>
              </div>

              {isSelected && peakData && (
                <div
                  className="ml-[9.75rem] mt-1 mb-2 pl-3 border-l-2 space-y-2"
                  style={{ borderColor: '#FC4C02' }}
                >
                  {peakData.ascents.map((ascent, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                          {new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
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
    </div>
  )
}
