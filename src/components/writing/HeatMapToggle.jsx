import { useState, useEffect, useMemo } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = '/data/us-counties-10m.json'

const TYPE_COLORS = {
  shock:  'var(--c-heat-shock)',
  stress: 'var(--c-heat-stress)',
  shift:  'var(--c-heat-shift)',
}

const TYPE_BG = {
  shock:  'var(--c-heat-shock-bg)',
  stress: 'var(--c-heat-stress-bg)',
  shift:  'var(--c-heat-shift-bg)',
}

const TYPES = ['shock', 'stress', 'shift']

// National median county household income (ACS 2023, 2,992-county panel)
const NATIONAL_INCOME_MEDIAN = 60691

const BURDEN = {
  shock: {
    test:  (h, m, c) => h.scores.shock >= 0.4 && m.sovi_score >= 70,
    description: 'Shock score ≥ 0.4 and social vulnerability ≥ 70 — high shock trajectory, high vulnerability. New adaptation programs may not reach these communities.',
  },
  stress: {
    test:  (h, m, c) => h.scores.stress >= 0.5 && m.sovi_score >= 70 && m.resl_score <= 40,
    description: 'Stress score ≥ 0.5, social vulnerability ≥ 70, resilience ≤ 40 — the places that most need to extend their heat infrastructure have the least capacity to do it.',
  },
  shift: {
    test:  (h, m, c) => h.scores.shift >= 0.5 && c.median_income > 0 && c.median_income < NATIONAL_INCOME_MEDIAN,
    description: 'Shift score ≥ 0.5 and median household income below the national county median ($60,691) — shift-trajectory places where the fiscal capacity to plan ahead of climate pressure does not exist. Income is a proxy for planning capacity; FEMA resilience scores do not reliably capture institutional resources in post-industrial cities.',
  },
}

export default function HeatMapToggle() {
  const [counties, setCounties] = useState(null)
  const [activeType, setActiveType] = useState('stress')

  useEffect(() => {
    fetch('/data/heat-counties-panel.json')
      .then(r => r.json())
      .then(d => setCounties(d.counties))
  }, [])

  const burdenSet = useMemo(() => {
    if (!counties) return new Set()
    const { test } = BURDEN[activeType]
    const s = new Set()
    for (const c of counties) {
      const h = c.hazards.heat
      if (test(h, h.metrics, c)) s.add(c.county_fips)
    }
    return s
  }, [counties, activeType])

  const color = TYPE_COLORS[activeType]
  const n = burdenSet.size

  return (
    <div className="my-6 not-prose">
      {/* Type toggle */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {TYPES.map((type) => {
          const active = type === activeType
          const c = TYPE_COLORS[type]
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? c : 'var(--c-border)'}`,
                background: active ? TYPE_BG[type] : 'transparent',
                color: active ? c : 'var(--c-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        })}
        {counties && (
          <span style={{ fontSize: '11px', color: 'var(--c-text-muted)', alignSelf: 'center', marginLeft: 4 }}>
            {n.toLocaleString()} counties
          </span>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          borderRadius: '6px',
          border: '1px solid var(--c-border)',
          background: 'var(--c-surface)',
          overflow: 'hidden',
        }}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isBurden = burdenSet.has(geo.id)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isBurden ? color : 'var(--c-border)',
                        fillOpacity: isBurden ? 0.82 : 0.38,
                        stroke: 'var(--c-bg)',
                        strokeWidth: 0.3,
                        outline: 'none',
                      },
                      hover: {
                        fill: isBurden ? color : 'var(--c-border)',
                        fillOpacity: isBurden ? 0.82 : 0.38,
                        stroke: 'var(--c-bg)',
                        strokeWidth: 0.3,
                        outline: 'none',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
        {!counties && (
          <p style={{ textAlign: 'center', padding: '24px', fontSize: '13px', color: 'var(--c-text-muted)' }}>
            Loading…
          </p>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', color: 'var(--c-text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
        <span style={{ color, fontWeight: 500 }}>{activeType.charAt(0).toUpperCase() + activeType.slice(1)} double-burden</span>
        {' — '}
        {BURDEN[activeType].description}
      </p>
    </div>
  )
}
