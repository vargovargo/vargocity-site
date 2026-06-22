import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { climbedPeaks } from '../../data/spsUtils'
import Lightbox from './Lightbox'

const BASE_URL = import.meta.env.BASE_URL || '/'

// Bounds that frame all 17 climbed peaks with breathing room
const SIERRA_BOUNDS = [[36.3, -120.7], [39.7, -117.8]]

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PeakMap() {
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        bounds={SIERRA_BOUNDS}
        style={{ height: '560px', width: '100%', borderRadius: '4px' }}
        scrollWheelZoom={true}
        onClick={() => setSelected(null)}
      >
        <TileLayer
          url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
          attribution='<a href="https://www.usgs.gov/">USGS</a>'
          maxZoom={16}
        />

        {mappable.map(peak => {
          const isSelected = selected?.name === peak.name
          return (
            <CircleMarker
              key={peak.name}
              center={[peak.lat, peak.lng]}
              radius={isSelected ? 8 : 6}
              pathOptions={{
                fillColor: isSelected ? '#e05c2d' : '#1a1a1a',
                fillOpacity: 1,
                color: '#ffffff',
                weight: 1.5,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation()
                  setSelected(selected?.name === peak.name ? null : peak)
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{peak.name}</span>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 272,
            zIndex: 1000,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '4px',
            padding: '12px 14px',
            maxHeight: '520px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text)' }}>
              {selected.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--c-text-muted)', marginLeft: '8px', whiteSpace: 'nowrap' }}>
              {parseInt(selected.elevation, 10).toLocaleString()} ft
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selected.ascents.map((ascent, i) => (
              <div
                key={i}
                style={i > 0 ? { paddingTop: '12px', borderTop: '1px solid var(--c-border)' } : {}}
              >
                <p style={{ fontSize: '11px', color: 'var(--c-text-muted)', marginBottom: '4px', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(ascent.date)}
                </p>

                {ascent.notes && (
                  <p style={{ fontSize: '11px', lineHeight: '1.55', color: 'var(--c-text-body)', marginBottom: '6px' }}>
                    {ascent.notes}
                  </p>
                )}

                {ascent.strava?.sparkline_svg && (
                  <img
                    src={BASE_URL + ascent.strava.sparkline_svg.replace(/^\//, '')}
                    alt="elevation profile"
                    style={{ height: '28px', width: 'auto', opacity: 0.65, marginBottom: '6px', display: 'block' }}
                  />
                )}

                {ascent.strava?.distance_miles && (
                  <p style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginBottom: '6px' }}>
                    ↑ {ascent.strava.elevation_gain_ft?.toLocaleString()} ft · {ascent.strava.distance_miles} mi · {ascent.strava.moving_time_hms}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {ascent.strava_url && (
                    <a
                      href={ascent.strava_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: 'var(--c-text-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      Strava
                    </a>
                  )}

                  {ascent.photos?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {ascent.photos.map((photo, pi) => (
                        <button
                          key={pi}
                          onClick={() => setLightbox({ photos: ascent.photos, peakName: selected.name, startIndex: pi })}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid var(--c-border)',
                            padding: 0,
                            cursor: 'pointer',
                            background: 'none',
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || selected.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--c-text-muted)',
              lineHeight: 1,
              padding: '2px 4px',
            }}
            aria-label="close"
          >
            ×
          </button>
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
