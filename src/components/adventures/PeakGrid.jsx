import { useState } from 'react'
import { allAscents } from '../../data/spsUtils'
import Lightbox from './Lightbox'

// One entry per ascent, newest first
const ascentsNewestFirst = [...allAscents].reverse()

function StravaLink({ url }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Strava activity (private — log in to view)"
      onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-xs mt-2"
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
    <p className="text-xs tabular-nums mt-1.5" style={{ color: '#8A8A8A' }}>
      {parts.join(' · ')}
    </p>
  )
}

export default function PeakGrid() {
  const [lightbox, setLightbox] = useState(null)

  if (ascentsNewestFirst.length === 0) {
    return (
      <p className="text-sm py-12 text-center" style={{ color: '#8A8A8A' }}>
        No peaks logged yet.
      </p>
    )
  }

  return (
    <>
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          peakName={lightbox.peakName}
          onClose={() => setLightbox(null)}
        />
      )}
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px"
        style={{ border: '1px solid #E5E5E0', backgroundColor: '#E5E5E0' }}
      >
        {ascentsNewestFirst.map((ascent, idx) => {
          const peak = ascent.peak
          const displayDate = ascent.date
            ? new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
            : null
          const photos = ascent.photos ?? []
          return (
            <div
              key={`${peak.id}-${ascent.date}-${idx}`}
              className="relative overflow-hidden flex cursor-pointer"
              style={{ backgroundColor: '#FFFFFF' }}
              onClick={() => photos.length > 0 && setLightbox({ photos, peakName: peak.name })}
            >
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                    {peak.name}
                  </h3>
                  <span className="text-xs tabular-nums shrink-0" style={{ color: '#8A8A8A' }}>
                    {peak.elevation.toLocaleString()} ft
                  </span>
                </div>
                {displayDate && (
                  <p className="text-xs mt-1" style={{ color: '#8A8A8A' }}>
                    {displayDate}
                  </p>
                )}
                {ascent.notes && (
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: '#4A4A4A' }}>
                    {ascent.notes.length > 120
                      ? ascent.notes.slice(0, 120) + '…'
                      : ascent.notes}
                  </p>
                )}
                {ascent.strava?.sparkline_svg && (
                  <img
                    src={`${import.meta.env.BASE_URL}${ascent.strava.sparkline_svg.replace(/^\//, '')}`}
                    alt="elevation profile"
                    className="w-full mt-3"
                    style={{ height: '40px', objectFit: 'fill' }}
                    onClick={e => e.stopPropagation()}
                  />
                )}
                <StravaStats strava={ascent.strava} />
                <div className="mt-auto pt-2">
                  <StravaLink url={ascent.strava_url} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
