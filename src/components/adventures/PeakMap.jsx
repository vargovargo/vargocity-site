import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

const GEO_URL = 'https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json'

const BASE_URL = import.meta.env.BASE_URL || '/'

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatElev(ft) {
  return parseInt(ft, 10).toLocaleString() + ' ft'
}

export default function PeakMap() {
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  return (
    <div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-119.5, 37.5], scale: 3200 }}
        style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
        onClick={() => setSelected(null)}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => geo.properties.name === 'California')
              .map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--c-surface)"
                  stroke="var(--c-border)"
                  strokeWidth={1}
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
          }
        </Geographies>

        {mappable.map(peak => (
          <Marker key={peak.id || peak.name} coordinates={[peak.lng, peak.lat]}>
            <circle
              r={5}
              fill={selected?.name === peak.name ? 'var(--c-accent, #4A6CF7)' : 'var(--c-invert-bg, #1A1A1A)'}
              stroke="var(--c-bg, #fff)"
              strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setSelected(peak) }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {selected && (
        <div
          className="mt-4 rounded p-4"
          style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
              {selected.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
              {formatElev(selected.elevation)}
            </span>
          </div>

          <div className="space-y-4">
            {selected.ascents.map((ascent, i) => (
              <div key={i} className={i > 0 ? 'pt-4' : ''} style={i > 0 ? { borderTop: '1px solid var(--c-border)' } : {}}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(ascent.date)}
                </p>

                {ascent.notes && (
                  <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--c-text-body)' }}>
                    {ascent.notes}
                  </p>
                )}

                {ascent.strava?.sparkline_svg && (
                  <img
                    src={BASE_URL + ascent.strava.sparkline_svg.replace(/^\//, '')}
                    alt="elevation profile"
                    className="h-8 w-auto mb-2 opacity-70"
                  />
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  {ascent.strava_url && (
                    <a
                      href={ascent.strava_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-2"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      Strava
                    </a>
                  )}

                  {ascent.photos?.length > 0 && (
                    <div className="flex gap-2">
                      {ascent.photos.map((photo, pi) => (
                        <button
                          key={pi}
                          onClick={() => setLightbox({ photos: ascent.photos, peakName: selected.name, startIndex: pi })}
                          className="h-16 w-16 rounded overflow-hidden flex-shrink-0"
                          style={{ border: '1px solid var(--c-border)' }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || selected.name}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          peakName={lightbox.peakName}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
