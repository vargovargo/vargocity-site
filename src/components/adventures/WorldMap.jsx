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

// Get the earliest year from a country's visit records
function firstVisitYear(country) {
  let min = Infinity
  for (const v of country.visits) {
    const y = v.year ?? v.year_start
    if (y && y < min) min = y
  }
  return min === Infinity ? null : min
}

function toDecade(year) {
  return Math.floor(year / 10) * 10
}

function decadeLabel(d) {
  const yr = d % 100
  return yr === 0 ? "'00s" : `'${yr < 10 ? '0' + yr : yr}s`
}

// Map ISO → set of all visit decades
const isoToDecades = {}
countries.forEach(c => {
  if (!c.iso) return
  const decades = new Set()
  for (const v of c.visits) {
    const y = v.year ?? v.year_start
    if (y) decades.add(toDecade(y))
  }
  if (decades.size) isoToDecades[c.iso] = decades
})

// Sorted list of decades that have at least one visit (excluding 70s and 90s)
const availableDecades = [...new Set(Object.values(isoToDecades).flatMap(s => [...s]))]
  .filter(d => d !== 1970 && d !== 1990)
  .sort()

function yearLabel(v) {
  if (v.type === 'lived') {
    return v.year_end ? `${v.year_start}–${v.year_end}` : `${v.year_start}–present`
  }
  return v.year ?? '—'
}

export default function WorldMap() {
  const [tooltip, setTooltip] = useState(null) // { country, x, y }
  const [selectedDecade, setSelectedDecade] = useState(null) // null = All
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
    <div>
      {/* Decade tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedDecade(null)}
          className="text-xs px-3 py-1.5 transition-colors"
          style={{
            backgroundColor: selectedDecade === null ? '#1A1A1A' : '#FFFFFF',
            color: selectedDecade === null ? '#FFFFFF' : '#8A8A8A',
            border: '1px solid',
            borderColor: selectedDecade === null ? '#1A1A1A' : '#E5E5E0',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {availableDecades.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDecade(selectedDecade === d ? null : d)}
            className="text-xs px-3 py-1.5 transition-colors"
            style={{
              backgroundColor: selectedDecade === d ? '#1A1A1A' : '#FFFFFF',
              color: selectedDecade === d ? '#FFFFFF' : '#8A8A8A',
              border: '1px solid',
              borderColor: selectedDecade === d ? '#1A1A1A' : '#E5E5E0',
              cursor: 'pointer',
            }}
          >
            {decadeLabel(d)}
          </button>
        ))}
      </div>

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
                const countryDecades = iso ? isoToDecades[iso] : null
                const isThisDecade = countryDecades?.has(selectedDecade)

                let fill
                if (isSelected) {
                  fill = '#FC4C02'
                } else if (selectedDecade === null) {
                  fill = isVisited ? '#1A1A1A' : '#E5E5E0'
                } else {
                  fill = isThisDecade ? '#1A1A1A' : isVisited ? '#D0D0C8' : '#E5E5E0'
                }

                let hoverFill
                if (isSelected) {
                  hoverFill = '#FC4C02'
                } else if (selectedDecade === null) {
                  hoverFill = isVisited ? '#4A4A4A' : '#D0D0C8'
                } else {
                  hoverFill = isThisDecade ? '#4A4A4A' : isVisited ? '#D0D0C8' : '#D0D0C8'
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={(e) => handleClick(geo, e)}
                    fill={fill}
                    stroke="#FAFAF8"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none', cursor: isVisited ? 'pointer' : 'default' },
                      hover: { outline: 'none', fill: hoverFill, cursor: isVisited ? 'pointer' : 'default' },
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
    </div>
  )
}
