import { useMemo, useCallback } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = '/data/us-counties-10m.json'

const TYPE_COLORS = {
  shock:  '#C0583A',
  stress: '#D4813B',
  shift:  '#4B7CB8',
}

/**
 * @param {{ counties: import('../../types/heat-typology').CountyRecord[]|null, selectedFips: string|null, onSelect: (fips: string|null) => void }} props
 */
export default function HeatMap({ counties, selectedFips, onSelect }) {
  // Build FIPS lookup once when data arrives
  const fipsMap = useMemo(() => {
    if (!counties) return null
    const m = new Map()
    for (const c of counties) m.set(c.county_fips, c)
    return m
  }, [counties])

  const handleClick = useCallback((geo) => {
    if (!fipsMap) return
    const fips = geo.id
    if (fipsMap.has(fips)) {
      onSelect(fips === selectedFips ? null : fips)
    }
  }, [fipsMap, selectedFips, onSelect])

  return (
    <div className="relative w-full" style={{ cursor: 'default' }} onClick={(e) => {
      if (e.target.tagName === 'svg' || e.target.tagName === 'rect') onSelect(null)
    }}>
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

              let fill = 'var(--c-border)'
              let fillOpacity = 0.4

              if (county) {
                const { dominant, confidence } = county.hazards.heat
                fill = TYPE_COLORS[dominant]
                fillOpacity = Math.min(0.92, 0.22 + confidence * 1.0)
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(geo)}
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

      {!counties && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading counties…</p>
        </div>
      )}
    </div>
  )
}
