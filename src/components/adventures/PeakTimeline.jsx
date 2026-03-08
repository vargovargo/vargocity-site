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
    <p className="text-xs tabular-nums mt-1" style={{ color: '#8A8A8A' }}>
      {parts.join(' · ')}
    </p>
  )
}

export default function PeakTimeline() {
  const [lightbox, setLightbox] = useState(null)

  if (allAscents.length === 0) {
    return (
      <p className="text-sm py-12 text-center" style={{ color: '#8A8A8A' }}>
        No ascents logged yet.
      </p>
    )
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
        <div className="absolute left-2.5 top-0 bottom-0 w-px" style={{ backgroundColor: '#E5E5E0' }} />
        <div className="space-y-8">
          {allAscents.map((ascent, i) => {
            const { peak } = ascent
            const displayDate = new Date(ascent.date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
            return (
              <div key={`${peak.id}-${ascent.date}-${i}`} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 w-5 h-5 rounded-full border-2"
                  style={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' }}
                />
                <p className="text-xs tabular-nums mb-0.5" style={{ color: '#8A8A8A' }}>
                  {displayDate}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                    {peak.name}
                  </h3>
                  <span className="text-xs tabular-nums" style={{ color: '#8A8A8A' }}>
                    {peak.elevation.toLocaleString()} ft
                  </span>
                  <StravaLink url={ascent.strava_url} />
                  {ascent.strava?.sparkline_svg && (
                    <img
                      src={ascent.strava.sparkline_svg}
                      alt="elevation profile"
                      style={{ width: '72px', height: '20px', objectFit: 'fill' }}
                    />
                  )}
                </div>
                {peak.routes?.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: '#4A4A4A' }}>
                    {peak.routes.map(r => r.description).join(' · ')}
                  </p>
                )}
                {ascent.notes && (
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#4A4A4A' }}>
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
    </>
  )
}
