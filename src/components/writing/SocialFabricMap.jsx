import { useState, useMemo, useCallback, useRef } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import mapData from '../../data/social-fabric-map.json'

const GEO_URL = '/data/us-counties-10m.json'

const DIMS = [
  {
    key: 'overall',
    label: 'Social Fabric Score',
    desc: 'A composite of all three dimensions — institutional access, civic life, and community connections. Higher scores mean a denser, more interconnected civic environment.',
    sources: 'Averages the three dimension scores below.',
  },
  {
    key: 'linking',
    label: 'Institutional Access',
    desc: 'The density of public institutions where residents can show up — libraries, advocacy nonprofits, civic organizations tied to public services. These are the places that route people into civic life and connect them to resources.',
    sources: 'Library visit rates (IMLS), IRS-registered nonprofit density, voter turnout (MIT Election Lab).',
  },
  {
    key: 'bridging',
    label: 'Civic Life',
    desc: 'Civic participation and the spaces where people from different backgrounds encounter each other — third places, civic organizations, community events. The layer of social life that builds trust across groups.',
    sources: 'Third-place establishment density (Census Bureau Business Patterns: restaurants, coffee shops, recreation), civic org density.',
  },
  {
    key: 'bonding',
    label: 'Community Connections',
    desc: 'Within-group ties and close community bonds — religious organizations, social associations, the institutions where people know each other by name. Strongly associated with lower rates of drug overdose mortality and social isolation.',
    sources: 'Religious organization density (IRS BMF), social association rate (County Health Rankings).',
  },
]

// Low → high: muted sage-grey → deep forest green
const COLOR_LOW  = [220, 224, 218]
const COLOR_HIGH = [44,  95,  74]

function lerpColor(t) {
  const r = Math.round(COLOR_LOW[0] + t * (COLOR_HIGH[0] - COLOR_LOW[0]))
  const g = Math.round(COLOR_LOW[1] + t * (COLOR_HIGH[1] - COLOR_LOW[1]))
  const b = Math.round(COLOR_LOW[2] + t * (COLOR_HIGH[2] - COLOR_LOW[2]))
  return `rgb(${r},${g},${b})`
}

function ScoreRow({ label, value, active }) {
  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{
        padding: '3px 0',
        borderBottom: active ? '1px solid var(--c-border)' : 'none',
        marginBottom: active ? 4 : 0,
      }}
    >
      <span
        className="text-xs"
        style={{
          color: active ? 'var(--c-text)' : 'var(--c-text-muted)',
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: value != null ? lerpColor(value / 100) : 'var(--c-text-muted)' }}
      >
        {value != null ? value.toFixed(1) : '—'}
      </span>
    </div>
  )
}

const TOOLTIP_W = 210
const TOOLTIP_OFFSET_X = 14
const TOOLTIP_OFFSET_Y = -10

function CountyTooltip({ county, activeDim, mousePos, containerW }) {
  if (!county || !mousePos) return null

  // Flip to left of cursor when too close to right edge
  const flipX = mousePos.x + TOOLTIP_OFFSET_X + TOOLTIP_W > containerW
  const left  = flipX
    ? mousePos.x - TOOLTIP_W - TOOLTIP_OFFSET_X
    : mousePos.x + TOOLTIP_OFFSET_X
  const top   = Math.max(8, mousePos.y + TOOLTIP_OFFSET_Y)

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 6,
        padding: '10px 13px',
        pointerEvents: 'none',
        width: TOOLTIP_W,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 5,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)', marginBottom: 1 }}>
        {county.county}
      </p>
      <p className="text-xs" style={{ color: 'var(--c-text-muted)', marginBottom: 8 }}>
        {county.state} · {county.metro ? 'Metro' : 'Non-metro'}
      </p>
      <ScoreRow label="Social Fabric Score"    value={county.overall}  active={activeDim === 'overall'} />
      <ScoreRow label="Institutional Access"   value={county.linking}  active={activeDim === 'linking'} />
      <ScoreRow label="Civic Life"             value={county.bridging} active={activeDim === 'bridging'} />
      <ScoreRow label="Community Connections"  value={county.bonding}  active={activeDim === 'bonding'} />
    </div>
  )
}

function DimPopover({ dim, visible }) {
  if (!visible || !dim) return null
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 6,
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 6,
        padding: '10px 13px',
        pointerEvents: 'none',
        width: 260,
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        zIndex: 10,
      }}
    >
      <p className="text-xs font-semibold" style={{ color: 'var(--c-text)', marginBottom: 4 }}>
        {dim.label}
      </p>
      <p className="text-xs" style={{ color: 'var(--c-text-body)', lineHeight: 1.5, marginBottom: 6 }}>
        {dim.desc}
      </p>
      <p className="text-xs" style={{ color: 'var(--c-text-muted)', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 500 }}>Data: </span>{dim.sources}
      </p>
    </div>
  )
}

function Legend({ dimLabel }) {
  return (
    <div className="flex items-center gap-3 mt-3 mb-1">
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Weaker</span>
        <div
          style={{
            width: 100,
            height: 8,
            borderRadius: 2,
            background: `linear-gradient(to right, ${lerpColor(0)}, ${lerpColor(0.5)}, ${lerpColor(1)})`,
          }}
        />
        <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Stronger</span>
      </div>
      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>— {dimLabel}</span>
    </div>
  )
}

export function SocialFabricMap() {
  const [dim, setDim] = useState('overall')
  const [hoveredFips, setHoveredFips] = useState(null)
  const [hoveredDimKey, setHoveredDimKey] = useState(null)
  const [mousePos, setMousePos] = useState(null)
  const containerRef = useRef(null)

  const fipsMap = useMemo(() => {
    const m = new Map()
    for (const c of mapData) m.set(c.fips, c)
    return m
  }, [])

  const getColor = useCallback((fips) => {
    const c = fipsMap.get(fips)
    if (!c || c[dim] == null) return 'var(--c-border)'
    return lerpColor(c[dim] / 100)
  }, [fipsMap, dim])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleMouseLeaveContainer = useCallback(() => {
    setHoveredFips(null)
    setMousePos(null)
  }, [])

  const currentDim    = DIMS.find(d => d.key === dim)
  const hoveredCounty = hoveredFips ? fipsMap.get(hoveredFips) : null
  const containerW    = containerRef.current?.offsetWidth ?? 600

  return (
    <div className="my-6">
      {/* Dimension toggle */}
      <div className="flex flex-wrap gap-1 mb-3" style={{ position: 'relative' }}>
        {DIMS.map(d => (
          <div
            key={d.key}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredDimKey(d.key)}
            onMouseLeave={() => setHoveredDimKey(null)}
          >
            <button
              onClick={() => setDim(d.key)}
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={{
                background: dim === d.key ? 'var(--c-text)' : 'var(--c-border)',
                color:      dim === d.key ? 'var(--c-bg)'   : 'var(--c-text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: dim === d.key ? 600 : 400,
              }}
            >
              {d.label}
            </button>
            <DimPopover dim={d} visible={hoveredDimKey === d.key} />
          </div>
        ))}
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveContainer}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id
                const fill = getColor(fips)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredFips(fips)}
                    onMouseLeave={() => setHoveredFips(null)}
                    style={{
                      default: {
                        fill,
                        stroke: 'var(--c-map-stroke)',
                        strokeWidth: 0.3,
                        outline: 'none',
                      },
                      hover: {
                        fill,
                        stroke: 'var(--c-text)',
                        strokeWidth: 0.8,
                        outline: 'none',
                      },
                      pressed: { fill, outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        <CountyTooltip
          county={hoveredCounty}
          activeDim={dim}
          mousePos={mousePos}
          containerW={containerW}
        />
      </div>

      <Legend dimLabel={currentDim.label} />

      <p className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
        {mapData.length.toLocaleString()} U.S. counties · Scores 0–100, higher = stronger fabric ·
        Connecticut shown without data — Census replaced county boundaries with planning regions in 2022, creating a FIPS mismatch with the map geometry. ·
        Hover a county for all four scores. Hover a label above for what each measures.
      </p>
    </div>
  )
}
