import { useMemo, useCallback, useState, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = '/data/us-counties-10m.json'

const TYPE_COLORS = {
  shock:  '#C0583A',
  stress: '#D4813B',
  shift:  '#4B7CB8',
}

const STATE_ABBR = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY',
}

/**
 * @param {{ counties: import('../../types/heat-typology').CountyRecord[]|null, selectedFips: string|null, onSelect: (fips: string|null) => void }} props
 */
export default function HeatMap({ counties, selectedFips, onSelect }) {
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

      {hoveredCounty && (
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
          <span style={{ color: TYPE_COLORS[hoveredCounty.hazards.heat.dominant], textTransform: 'capitalize' }}>
            {hoveredCounty.hazards.heat.dominant}
          </span>
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
