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

function StravaStats({ strava }) {
  if (!strava) return null
  const timeParts = strava.moving_time_hms?.split(':').slice(0, 2).join(':')
  const parts = [
    strava.elevation_gain_ft != null && `↑ ${strava.elevation_gain_ft.toLocaleString()} ft`,
    strava.distance_miles != null && `${strava.distance_miles} mi`,
    timeParts && timeParts,
  ].filter(Boolean)
  if (parts.length === 0) return null
  return (
    <span className="text-xs tabular-nums font-data" style={{ color: 'var(--c-text-muted)' }}>
      {parts.join(' · ')}
    </span>
  )
}

export default function PeakRegionList() {
  const [selectedPeak, setSelectedPeak] = useState(null) // peak.name
  const [climbedOnly, setClimbedOnly] = useState(true)

  const regionsToShow = spsData.regions
    .map(region => {
      const climbedCount = region.peaks.filter(p => p.ascents?.length > 0).length
      const displayPeaks = climbedOnly
        ? region.peaks.filter(p => p.ascents?.length > 0)
        : region.peaks
      return { ...region, displayPeaks, climbedCount, totalCount: region.peaks.length }
    })
    .filter(r => r.displayPeaks.length > 0)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setClimbedOnly(v => !v); setSelectedPeak(null) }}
          className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{
            backgroundColor: 'var(--c-surface)',
            color: 'var(--c-text-muted)',
            border: '1px solid var(--c-border)',
            cursor: 'pointer',
          }}
        >
          {climbedOnly ? 'Show full list' : 'Climbed only'}
        </button>
      </div>

      <div className="space-y-10">
      {regionsToShow.map(region => {
        const { displayPeaks, climbedCount, totalCount } = region
        const selected = displayPeaks.find(p => p.name === selectedPeak)

        return (
          <div key={region.name}>
            <div className="flex items-baseline justify-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{region.name}</h3>
              <span className="text-xs tabular-nums font-data" style={{ color: climbedCount > 0 ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
                {climbedCount} / {totalCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {displayPeaks.map(peak => {
                const isClimbed = peak.ascents?.length > 0
                const isSelected = peak.name === selectedPeak
                return (
                  <div
                    key={peak.name}
                    onClick={isClimbed ? () => setSelectedPeak(isSelected ? null : peak.name) : undefined}
                    className="text-xs px-2.5 py-1"
                    style={{
                      backgroundColor: isSelected ? 'var(--c-peaks-bar-active, var(--c-selected))' : isClimbed ? 'var(--c-peaks-bar-idle, var(--c-invert-bg))' : 'var(--c-bg)',
                      color: isClimbed ? 'var(--c-invert-text)' : 'var(--c-text-muted)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--c-peaks-bar-active, var(--c-selected))' : isClimbed ? 'var(--c-peaks-bar-idle, var(--c-invert-bg))' : 'var(--c-border)',
                      cursor: isClimbed ? 'pointer' : 'default',
                    }}
                  >
                    {peak.name}
                  </div>
                )
              })}
            </div>

            {selected?.ascents?.length > 0 && (
              <div className="mt-3 pl-3 border-l-2 space-y-2" style={{ borderColor: 'var(--c-peaks-bar-active, var(--c-selected))' }}>
                {selected.ascents.map((ascent, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-medium font-data" style={{ color: 'var(--c-text)' }}>
                        {new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                      {selected.ascents.length > 1 && (
                        <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                          ascent {i + 1} of {selected.ascents.length}
                        </span>
                      )}
                      <StravaLink url={ascent.strava_url} />
                    </div>
                    {ascent.strava?.sparkline_svg && (
                      <img
                        src={`${import.meta.env.BASE_URL}${ascent.strava.sparkline_svg.replace(/^\//, '')}`}
                        alt="elevation profile"
                        className="mt-1 mb-1 sparkline"
                        style={{ width: '160px', height: '40px', objectFit: 'fill' }}
                      />
                    )}
                    <StravaStats strava={ascent.strava} />
                    {ascent.notes && (
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--c-text-body)' }}>
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
