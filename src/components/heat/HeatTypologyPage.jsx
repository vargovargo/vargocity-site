import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import usePageTitle from '../../lib/usePageTitle'
import { loadHeatTypologyData } from '../../lib/heat-data'
import HeatMap from './HeatMap'
import CountyPanel from './CountyPanel'
import TernaryChart from './TernaryChart'
import {
  TYPE_META, HAZARDS, HAZARD_IDS, FILTERS,
  countyMatchesFilter, basisEyebrow, basisText,
} from './hazards'

const SERIES_POSTS = [
  { slug: '2026-04-23-two-kinds-of-summer', title: 'Two Kinds of Summer' },
  { slug: '2026-04-23-shocked-stressed-and-shifting-who-suffers', title: 'Shocked, Stressed & Shifting' },
  { slug: '2026-05-20-what-the-type-demands', title: 'Three Counties, Three Playbooks' },
  { slug: '2026-07-01-who-cant-afford-to-adapt', title: "Who Can't Afford to Adapt" },
]

const HAZARD_COPY = {
  heat: {
    eyebrow: 'Heat Typology Tool',
    lede: 'Three shapes of heat trajectory across U.S. counties — each with different implications for infrastructure, labor, and community adaptation.',
    ternaryLede: 'Counties cluster near the shift corner (most of the country), with stress concentrated in the Gulf Coast and shock in high-elevation and Pacific coast counties.',
  },
  wildfire: {
    eyebrow: 'Wildfire Smoke Typology Tool',
    lede: 'The same three shapes, applied to wildfire smoke. Smoke is not local — it arrives from fires a thousand miles away and lands on people with no relationship to the burn.',
    ternaryLede: 'The smoke cloud sits closer to the centre of the simplex than the heat cloud. Many counties are mid-transition between wind-driven episodes and recurrent burden, and the scores say so.',
  },
}

function HazardSwitcher({ value, onChange, meta }) {
  const eyebrow = basisEyebrow(meta, value)
  const basis = basisText(meta, value)

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Hazard:</span>
      {HAZARDS.map(({ id, label, available }) => {
        const active = value === id
        return (
          <button
            key={id}
            onClick={() => available && onChange(id)}
            disabled={!available}
            title={available ? undefined : 'Not in the panel yet'}
            style={{
              fontSize: '11px',
              padding: '3px 11px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: active ? 'var(--c-text)' : 'var(--c-border)',
              backgroundColor: active ? 'var(--c-text)' : 'transparent',
              color: active ? 'var(--c-bg)' : available ? 'var(--c-text-muted)' : 'var(--c-text-light)',
              cursor: available ? 'pointer' : 'not-allowed',
              opacity: available ? 1 : 0.55,
              transition: 'all 0.12s',
            }}
          >
            {label}
          </button>
        )
      })}
      {/* The basis label is the whole reason this switcher is safe. Heat is a
          projection and wildfire is a measurement; identical chrome invites the
          reader to treat them as the same kind of claim. Never hardcode these —
          the windows move when new data lands. */}
      {eyebrow && (
        <span
          className="text-xs font-medium tracking-widest uppercase ml-1"
          style={{ color: 'var(--c-text-muted)' }}
          title={basis ?? undefined}
        >
          {eyebrow}
        </span>
      )}
    </div>
  )
}

function OverlayFilterBar({ hazard, value, onChange, count }) {
  const filters = FILTERS[hazard] ?? FILTERS.heat
  const active = filters.find(f => f.id === value)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Show:</span>
        {filters.map(({ id, label, note }) => {
          const isActive = value === id
          return (
            <button
              key={String(id)}
              onClick={() => onChange(id)}
              title={note ?? undefined}
              style={{
                fontSize: '11px',
                padding: '2px 10px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: isActive ? 'var(--c-text)' : 'var(--c-border)',
                backgroundColor: isActive ? 'var(--c-text)' : 'transparent',
                color: isActive ? 'var(--c-bg)' : 'var(--c-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          )
        })}
        {count != null && (
          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            — {count.toLocaleString()} counties
          </span>
        )}
      </div>
      {active?.caption && (
        <p className="text-xs mb-4 max-w-3xl leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
          {active.caption}
        </p>
      )}
    </>
  )
}

function SeriesLinks() {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-6">
      <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>In the series:</span>
      {SERIES_POSTS.map(({ slug, title }) => (
        <Link
          key={slug}
          to={`/lab/posts/${slug}`}
          className="text-xs px-2.5 py-1 rounded-full border transition-opacity hover:opacity-70"
          style={{
            color: 'var(--c-text-muted)',
            borderColor: 'var(--c-border)',
            backgroundColor: 'var(--c-surface)',
          }}
        >
          {title}
        </Link>
      ))}
    </div>
  )
}

function TypeExplainer() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
      {Object.entries(TYPE_META).map(([key, { label, color, desc }]) => (
        <div key={key} className="flex items-start gap-2 text-xs max-w-xs">
          <span
            className="mt-0.5 flex-shrink-0"
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.85,
            }}
          />
          <div>
            <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{label} — </span>
            <span style={{ color: 'var(--c-text-muted)' }}>{desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfidenceNote({ hazard, untypedCount }) {
  return (
    <p className="text-xs mt-2 max-w-3xl leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
      Color = dominant type · Opacity = confidence (faint = mixed signals, saturated = clear dominant)
      {hazard === 'wildfire' && untypedCount > 0 && (
        <> · {untypedCount.toLocaleString()} counties are left neutral — either too little smoke
        in both windows to classify, no directional signal between them, or no data for this
        boundary vintage. Smoke confidence runs well below heat confidence, and most of the
        low-confidence mass sits in the shock counties, so read strong colour as a clear type
        and washed colour as a place still in transition.</>
      )}
    </p>
  )
}

export default function HeatTypologyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedFips, setSelectedFips] = useState(null)
  const [overlayFilter, setOverlayFilter] = useState(null)

  const hazardParam = searchParams.get('hazard')
  const hazard = HAZARD_IDS.includes(hazardParam) ? hazardParam : 'heat'
  const copy = HAZARD_COPY[hazard]

  usePageTitle(hazard === 'wildfire' ? 'Wildfire Smoke Typology' : 'Heat Typology')

  useEffect(() => {
    loadHeatTypologyData()
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  const counties = data?.counties ?? null

  // Switching hazards keeps the selected county — comparing one place across
  // hazards is the most useful thing this tool does. The overlay filter does
  // not carry over, because the fourth pill means something different in each.
  const handleHazardChange = useCallback((next) => {
    setOverlayFilter(null)
    setSearchParams(next === 'heat' ? {} : { hazard: next }, { replace: true })
  }, [setSearchParams])

  const handleSelect = useCallback((fips) => setSelectedFips(fips), [])

  const filterCount = useMemo(() => {
    if (!counties || !overlayFilter) return null
    return counties.filter(c => countyMatchesFilter(c, hazard, overlayFilter)).length
  }, [counties, hazard, overlayFilter])

  const untypedCount = useMemo(() => {
    if (!counties) return 0
    return counties.filter(c => !c.hazards?.[hazard]?.dominant).length
  }, [counties, hazard])

  const selectedCounty = counties && selectedFips
    ? counties.find(c => c.county_fips === selectedFips) ?? null
    : null

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          Error loading heat data: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase mb-3"
          style={{ color: 'var(--c-text-muted)' }}>
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3" style={{ color: 'var(--c-text)' }}>
          Shock, Stress &amp; Shift
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--c-text-body)' }}>
          {copy.lede}
        </p>
        <SeriesLinks />
      </div>

      {/* Type explainer */}
      <TypeExplainer />

      {/* Hazard + overlay controls */}
      <HazardSwitcher value={hazard} onChange={handleHazardChange} meta={data?.meta} />
      <OverlayFilterBar hazard={hazard} value={overlayFilter} onChange={setOverlayFilter} count={filterCount} />

      {/* Map + Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="min-w-0" style={{ flex: selectedCounty ? '1 1 0%' : '1 1 100%' }}>
          <HeatMap
            counties={counties}
            selectedFips={selectedFips}
            onSelect={handleSelect}
            overlayFilter={overlayFilter}
            hazard={hazard}
          />
          <ConfidenceNote hazard={hazard} untypedCount={untypedCount} />
        </div>

        {selectedCounty && (
          <div className="w-full sm:w-[260px] flex-shrink-0">
            <CountyPanel
              county={selectedCounty}
              onClose={() => setSelectedFips(null)}
              hazard={hazard}
              meta={data?.meta}
            />
          </div>
        )}
      </div>

      {/* Ternary chart */}
      <div className="mt-10">
        <p className="text-xs font-medium tracking-widest uppercase mb-1"
          style={{ color: 'var(--c-text-muted)' }}>
          Type distribution
        </p>
        <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
          County positions in score space
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--c-text-body)' }}>
          {copy.ternaryLede}
        </p>
        <TernaryChart
          counties={counties}
          selectedFips={selectedFips}
          onSelect={handleSelect}
          hazard={hazard}
        />
      </div>

      {/* Footer note */}
      <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
          {basisText(data?.meta, hazard) && (
            <>Basis: {basisText(data?.meta, hazard)}. </>
          )}
          {hazard === 'wildfire'
            ? 'Smoke exposure method from Lappe & Vargo, Federal Reserve Bank of San Francisco (2022), extended with CDC colleagues (2023). Frontline-worker share is ACS 2019 table C24050. Puerto Rico, Alaska, Hawaii and the territories sit outside the source domain and are absent.'
            : 'Scores reflect heat-index day-count changes at the 85°F, 95°F, and 100°F thresholds.'}
          {' '}Social vulnerability (SoVI) and community resilience (BRIC) from CDC/FEMA.
          Pipeline: schema heat-typology-v1.
        </p>
      </div>
    </div>
  )
}
