import { useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import countries from '../../data/countries.json'

// Natural Earth GeoJSON — separates overseas territories (French Guiana, etc.)
// Uses ISO_A2 property directly, no numeric ID lookup needed
const GEO_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson'

const visitedISOs = new Set(countries.map(c => c.iso).filter(Boolean))

// Map ISO → country data for click panel
const isoToCountry = {}
countries.forEach(c => { if (c.iso) isoToCountry[c.iso] = c })

function yearLabel(v) {
  if (v.type === 'lived') {
    return v.year_end ? `${v.year_start}–${v.year_end}` : `${v.year_start}–present`
  }
  return v.year ?? '—'
}

export default function WorldMap() {
  const [tooltip, setTooltip] = useState(null) // { country, x, y }
  const containerRef = useRef(null)

  const handleClick = (geo, e) => {
    const iso = geo.properties?.ISO_A2
    const country = iso ? isoToCountry[iso] : null
    if (!country) return

    if (tooltip?.country.iso === country.iso) {
      setTooltip(null)
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setTooltip({ country, x, y })
  }

  return (
    <div ref={containerRef} className="relative" onClick={(e) => {
      // click on map background dismisses tooltip
      if (e.target.tagName === 'svg' || e.target.tagName === 'rect') setTooltip(null)
    }}>
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.filter(geo => geo.properties?.ISO_A2 !== 'AQ').map((geo) => {
              const iso = geo.properties?.ISO_A2
              const isVisited = iso && visitedISOs.has(iso)
              const isSelected = iso && tooltip?.country.iso === iso
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={(e) => handleClick(geo, e)}
                  fill={isSelected ? '#FC4C02' : isVisited ? '#1A1A1A' : '#E5E5E0'}
                  stroke="#FAFAF8"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none', cursor: isVisited ? 'pointer' : 'default' },
                    hover: { outline: 'none', fill: isSelected ? '#FC4C02' : isVisited ? '#4A4A4A' : '#D0D0C8', cursor: isVisited ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="absolute z-10 p-3 shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            minWidth: '160px',
            maxWidth: '240px',
          }}
        >
          <p className="text-xs font-semibold mb-2">{tooltip.country.name}</p>
          <div className="space-y-1">
            {tooltip.country.visits.map((v, i) => {
              const cities = v.cities?.filter(c => c).join(', ')
              return (
                <div key={i}>
                  <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {yearLabel(v)}{v.type === 'lived' ? ' · lived' : ''}
                  </span>
                  {cities && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>{cities}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
