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

export default function PeakMap() {
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const mappable = climbedPeaks.filter(p => p.lat && p.lng)

  return (
    <div style={{ position: 'relative' }}>
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

        {mappable.map(peak => {
          const isSelected = selected?.name === peak.name
          return (
            <Marker key={peak.id || peak.name} coordinates={[peak.lng, peak.lat]}>
              <circle
                r={isSelected ? 7 : 5}
                fill={isSelected ? '#e05c2d' : 'var(--c-invert-bg, #1a1a1a)'}
                stroke="var(--c-bg, #fff)"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : peak) }}
                onMouseEnter={e => setTooltip({ name: peak.name, x: e.clientX, y: e.clientY })}
                onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setTooltip(null)}
              />
            </Marker>
          )
        })}
      </ComposableMap>

      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 264,
            zIndex: 10,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '4px',
            padding: '12px 14px',
            maxHeight: '80%',
            overflowY: 'auto',
          }}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: 7, right: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '15px', lineHeight: 1, padding: '2px 4px',
              color: 'var(--c-text-muted)',
            }}
            aria-label="close"
          >×</button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', paddingRight: '16px' }}>
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
                    style={{ height: '28px', width: 'auto', opacity: 0.65, marginBottom: '4px', display: 'block' }}
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
                      style={{ fontSize: '11px', color: '#FC4C02', textDecoration: 'underline', textUnderlineOffset: '2px' }}
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
                            width: '44px', height: '44px', borderRadius: '3px',
                            overflow: 'hidden', flexShrink: 0, padding: 0,
                            border: '1px solid var(--c-border)', cursor: 'pointer', background: 'none',
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
        </div>
      )}

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            pointerEvents: 'none',
            zIndex: 20,
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '3px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--c-text)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.name}
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
