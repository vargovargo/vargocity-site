import { useState } from 'react'
import { allAscents } from '../../data/spsUtils'
import Lightbox from './Lightbox'

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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
    <p className="text-xs tabular-nums mt-1 font-data" style={{ color: 'var(--c-text-muted)' }}>
      {parts.join(' · ')}
    </p>
  )
}

export default function PeakTimeline() {
  const [lightbox, setLightbox] = useState(null)

  if (allAscents.length === 0) {
    return (
      <p className="text-sm py-12 text-center" style={{ color: 'var(--c-text-muted)' }}>
        No ascents logged yet.
      </p>
    )
  }

  // Group ascents by year, preserving sort order (oldest → newest)
  const ascentsByYear = []
  let currentYear = null
  for (const ascent of allAscents) {
    const year = ascent.date.slice(0, 4)
    if (year !== currentYear) {
      ascentsByYear.push({ year, ascents: [] })
      currentYear = year
    }
    ascentsByYear[ascentsByYear.length - 1].ascents.push(ascent)
  }

  return (
    <>
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          peakName={lightbox.peakName}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
      <div className="relative">
        <div className="absolute left-2.5 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--c-border)' }} />
        <div className="space-y-10">
          {ascentsByYear.map(({ year, ascents }) => (
            <div key={year}>
              <div className="relative pl-10 mb-6">
                <div
                  className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-accent)' }}
                />
                <p className="text-xs font-semibold tracking-widest uppercase font-data" style={{ color: 'var(--c-text-muted)' }}>
                  {year} season
                </p>
              </div>
              <div className="space-y-8">
                {ascents.map((ascent, i) => {
            const { peak } = ascent
            const displayDate = new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            return (
              <div key={`${peak.id}-${ascent.date}-${i}`} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 w-5 h-5 rounded-full border-2"
                  style={{ backgroundColor: 'var(--c-invert-bg)', borderColor: 'var(--c-invert-bg)' }}
                />
                <p className="text-xs tabular-nums mb-0.5 font-data" style={{ color: 'var(--c-text-muted)' }}>
                  {displayDate}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                    {peak.name}
                  </h3>
                  <span className="text-xs tabular-nums font-data" style={{ color: 'var(--c-text-muted)' }}>
                    {peak.elevation.toLocaleString()} ft
                  </span>
                  <StravaLink url={ascent.strava_url} />
                  {ascent.strava?.sparkline_svg && (
                    <img
                      src={`${import.meta.env.BASE_URL}${ascent.strava.sparkline_svg.replace(/^\//, '')}`}
                      alt="elevation profile"
                      className="sparkline"
                      style={{ width: '72px', height: '20px', objectFit: 'fill' }}
                    />
                  )}
                </div>
                {peak.routes?.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-body)' }}>
                    {peak.routes.map(r => r.description).join(' · ')}
                  </p>
                )}
                {ascent.notes && (
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--c-text-body)' }}>
                    {ascent.notes}
                  </p>
                )}
                <StravaStats strava={ascent.strava} />
                {ascent.photos?.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {ascent.photos.map((photo, pi) => (
                      <img
                        key={pi}
                        src={photo.url}
                        alt={photo.caption || `${peak.name} photo`}
                        className="h-32 w-auto rounded object-cover cursor-pointer"
                        onClick={() => setLightbox({ photos: ascent.photos, peakName: peak.name, startIndex: pi })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
