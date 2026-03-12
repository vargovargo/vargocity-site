import { useState } from 'react'
import { peaksByElevation, climbedPeaks } from '../../data/spsUtils'

const climbedMap = new Map(climbedPeaks.map(p => [p.id, p]))

function StravaLink({ url, hasData }) {
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
      {hasData ? 'view full recording →' : 'Strava'}
    </a>
  )
}

function StravaDetail({ strava, stravaUrl }) {
  if (!strava) return <StravaLink url={stravaUrl} hasData={false} />
  const parts = [
    strava.elevation_gain_ft != null && `↑ ${strava.elevation_gain_ft.toLocaleString()} ft`,
    strava.distance_miles != null && `${strava.distance_miles} mi`,
    strava.moving_time_hms && strava.moving_time_hms,
    strava.avg_heart_rate != null && `avg ${strava.avg_heart_rate} bpm`,
    strava.max_heart_rate != null && `max ${strava.max_heart_rate} bpm`,
  ].filter(Boolean)
  return (
    <div>
      {strava.sparkline_svg && (
        <img
          src={`${import.meta.env.BASE_URL}${strava.sparkline_svg.replace(/^\//, '')}`}
          alt="elevation profile"
          className="mb-1.5 sparkline"
          style={{ width: '160px', height: '40px', objectFit: 'fill' }}
        />
      )}
      {parts.length > 0 && (
        <p className="text-xs tabular-nums font-data" style={{ color: 'var(--c-text-muted)' }}>
          {parts.join(' · ')}
        </p>
      )}
      <StravaLink url={stravaUrl} hasData={!!strava.sparkline_svg} />
    </div>
  )
}

export default function ElevationChart() {
  const [selectedId, setSelectedId] = useState(null)
  const [climbedOnly, setClimbedOnly] = useState(true)

  if (peaksByElevation.length === 0) return null

  const maxElev = peaksByElevation[0].elevation
  const displayPeaks = climbedOnly
    ? peaksByElevation.filter(p => climbedMap.has(p.id))
    : peaksByElevation

  return (
    <div>
      <div className="flex items-center gap-6 mb-5">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
          {climbedOnly
            ? `${climbedPeaks.length} Climbed Peaks by Elevation`
            : 'All 248 SPS Peaks by Elevation'}
        </p>
        <div className="flex items-center gap-4 ml-auto">
          {!climbedOnly && (
            <>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text)' }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--c-peaks-bar-idle, var(--c-invert-bg))' }} />
                Climbed
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--c-border)' }} />
                On the list
              </span>
            </>
          )}
          <button
            onClick={() => { setClimbedOnly(v => !v); setSelectedId(null) }}
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
      </div>

      <div className="space-y-1">
        {displayPeaks.map((peak) => {
          const climbed = climbedMap.has(peak.id)
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
                    style={{ color: climbed ? 'var(--c-text)' : 'var(--c-border)', fontWeight: climbed ? 600 : 400 }}
                  >
                    {peak.name}
                  </span>
                </div>
                <div className="flex-1 h-4 relative" style={{ backgroundColor: 'var(--c-card-hover)' }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(peak.elevation / maxElev) * 100}%`,
                      backgroundColor: climbed ? (isSelected ? 'var(--c-peaks-bar-active, var(--c-selected))' : 'var(--c-peaks-bar-idle, var(--c-invert-bg))') : 'var(--c-border)',
                    }}
                  />
                </div>
                <span
                  className="text-xs tabular-nums whitespace-nowrap shrink-0 font-data"
                  style={{ color: climbed ? 'var(--c-text-body)' : 'var(--c-border)' }}
                >
                  {peak.elevation.toLocaleString()} ft
                </span>
              </div>

              {isSelected && peakData && (
                <div
                  className="ml-[9.75rem] mt-1 mb-2 pl-3 border-l-2 space-y-2"
                  style={{ borderColor: 'var(--c-peaks-bar-active, var(--c-selected))' }}
                >
                  {peakData.ascents.map((ascent, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium font-data" style={{ color: 'var(--c-text)' }}>
                          {new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
                        {peakData.ascents.length > 1 && (
                          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                            ascent {i + 1} of {peakData.ascents.length}
                          </span>
                        )}
                      </div>
                      {ascent.notes && (
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--c-text-body)' }}>
                          {ascent.notes}
                        </p>
                      )}
                      <StravaDetail strava={ascent.strava} stravaUrl={ascent.strava_url} />
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
