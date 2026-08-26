import { useMemo, useCallback, useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import {
  TYPE_COLORS, STATE_ABBR, UNTYPED_COPY, NO_DATA,
  hazardState, confidenceOpacity, countyMatchesFilter,
} from './hazards'

const GEO_URL = '/data/us-counties-10m.json'

/**
 * @param {{ counties: import('../../types/heat-typology').CountyRecord[]|null, selectedFips: string|null, onSelect: (fips: string|null) => void, overlayFilter: string|null, hazard: string }} props
 */
export default function HeatMap({ counties, selectedFips, onSelect, overlayFilter = null, hazard = 'heat' }) {
  const containerRef = useRef(null)
  const [hoveredFips, setHoveredFips] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Build FIPS lookup once when data arrives
  const fipsMap = useMemo(() => {
    if (!counties) return null
    const m = new Map()
    for (const c of counties) m.set(c.county_fips, c)
    return m
  }, [counties])

  const hoveredCounty = hoveredFips ? (fipsMap?.get(hoveredFips) ?? null) : null
  const hovered = hoveredCounty ? hazardState(hoveredCounty, hazard) : null

  const handleClick = useCallback((geo) => {
    if (!fipsMap) return
    const fips = geo.id
    if (fipsMap.has(fips)) {
      onSelect(fips === selectedFips ? null : fips)
    }
  }, [fipsMap, selectedFips, onSelect])

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ cursor: 'default' }}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        if (e.target.tagName === 'svg' || e.target.tagName === 'rect') onSelect(null)
      }}
    >
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id
              const county = fipsMap?.get(fips)
              const isSelected = fips === selectedFips

              // Counties outside the panel, counties with no record for this
              // hazard, and counties the pipeline declined to classify all get
              // the neutral land fill. Unclassified records still carry
              // `scores`, but they are not meaningful — never colour by them.
              let fill = 'var(--c-border)'
              let fillOpacity = 0.4

              if (county) {
                const { state, record } = hazardState(county, hazard)
                const matches = countyMatchesFilter(county, hazard, overlayFilter)
                if (state === 'typed') {
                  fill = TYPE_COLORS[record.dominant]
                  fillOpacity = matches ? confidenceOpacity(record.confidence) : 0.06
                } else {
                  fillOpacity = matches ? 0.4 : 0.06
                }
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(geo)}
                  onMouseEnter={() => county && setHoveredFips(fips)}
                  onMouseLeave={() => setHoveredFips(null)}
                  style={{
                    default: {
                      fill,
                      fillOpacity,
                      stroke: isSelected ? 'var(--c-text)' : 'var(--c-bg)',
                      strokeWidth: isSelected ? 1.5 : 0.3,
                      outline: 'none',
                      cursor: county ? 'pointer' : 'default',
                    },
                    hover: {
                      fill,
                      fillOpacity: county ? Math.min(0.99, fillOpacity + 0.12) : fillOpacity,
                      stroke: isSelected ? 'var(--c-text)' : 'var(--c-bg)',
                      strokeWidth: isSelected ? 1.5 : 0.3,
                      outline: 'none',
                      cursor: county ? 'pointer' : 'default',
                    },
                    pressed: {
                      fill,
                      fillOpacity,
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {hoveredCounty && hovered && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x + 14,
            top: mousePos.y - 36,
            pointerEvents: 'none',
            zIndex: 10,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            lineHeight: '1.5',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>
            {hoveredCounty.name}, {STATE_ABBR[hoveredCounty.state] ?? hoveredCounty.state}
          </span>
          <span style={{ color: 'var(--c-text-muted)', margin: '0 5px' }}>·</span>
          {hovered.state === 'typed' ? (
            <span style={{ color: TYPE_COLORS[hovered.record.dominant], textTransform: 'capitalize' }}>
              {hovered.record.dominant}
            </span>
          ) : (
            <span style={{ color: 'var(--c-text-muted)' }}>
              {hovered.state === NO_DATA
                ? UNTYPED_COPY[NO_DATA].long
                : UNTYPED_COPY[hovered.state]?.short ?? 'unclassified'}
            </span>
          )}
        </div>
      )}

      {!counties && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading counties…</p>
        </div>
      )}
    </div>
  )
}
