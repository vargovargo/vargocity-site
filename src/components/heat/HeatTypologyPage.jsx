import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import usePageTitle from '../../lib/usePageTitle'
import { loadHeatTypologyData } from '../../lib/heat-data'
import HeatMap from './HeatMap'
import CountyPanel from './CountyPanel'
import TernaryChart from './TernaryChart'

const SERIES_POSTS = [
  { slug: '2026-04-23-two-kinds-of-summer', title: 'Two Kinds of Summer' },
  { slug: '2026-04-23-shocked-stressed-and-shifting-who-suffers', title: 'Shocked, Stressed & Shifting' },
  { slug: '2026-05-20-what-the-type-demands', title: 'Three Counties, Three Playbooks' },
  { slug: '2026-07-01-who-cant-afford-to-adapt', title: "Who Can't Afford to Adapt" },
]

const TYPE_META = {
  shock: {
    label: 'Shock',
    color: '#C0583A',
    desc: 'Rare extremes becoming regular — infrastructure built for a climate that no longer exists.',
  },
  stress: {
    label: 'Stress',
    color: '#D4813B',
    desc: 'Familiar heat exceeding its envelope — cooling adaptations being pushed past design limits.',
  },
  shift: {
    label: 'Shift',
    color: '#4B7CB8',
    desc: 'Heat envelope reorganizing viable activity — who can work, live, and move outdoors is changing.',
  },
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

function ConfidenceNote() {
  return (
    <p className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
      Color = dominant type · Opacity = confidence (faint = mixed signals, saturated = clear dominant)
    </p>
  )
}

export default function HeatTypologyPage() {
  usePageTitle('Heat Typology')
  const [counties, setCounties] = useState(null)
  const [error, setError] = useState(null)
  const [selectedFips, setSelectedFips] = useState(null)

  useEffect(() => {
    loadHeatTypologyData()
      .then(d => setCounties(d.counties))
      .catch(e => setError(e.message))
  }, [])

  const handleSelect = useCallback((fips) => setSelectedFips(fips), [])

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
          Heat Typology Tool
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3" style={{ color: 'var(--c-text)' }}>
          Shock, Stress &amp; Shift
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--c-text-body)' }}>
          Three shapes of heat trajectory across U.S. counties — each with different implications
          for infrastructure, labor, and community adaptation.
        </p>
        <SeriesLinks />
      </div>

      {/* Type explainer */}
      <TypeExplainer />

      {/* Map + Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="min-w-0" style={{ flex: selectedCounty ? '1 1 0%' : '1 1 100%' }}>
          <HeatMap
            counties={counties}
            selectedFips={selectedFips}
            onSelect={handleSelect}
          />
          <ConfidenceNote />
        </div>

        {selectedCounty && (
          <div className="w-full sm:w-[260px] flex-shrink-0">
            <CountyPanel
              county={selectedCounty}
              onClose={() => setSelectedFips(null)}
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
          Counties cluster near the shift corner (most of the country), with stress concentrated in
          the Gulf Coast and shock in high-elevation and Pacific coast counties.
        </p>
        <TernaryChart
          counties={counties}
          selectedFips={selectedFips}
          onSelect={handleSelect}
        />
      </div>

      {/* Footer note */}
      <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
        <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
          Data: ERA5 historical climatology (1991–2021) + GDPCIR 20-GCM ensemble (SSP3-7.0).
          Scores reflect heat-index day-count changes at the 85°F, 95°F, and 100°F thresholds.
          Social vulnerability (SoVI) and community resilience (BRIC) from CDC/FEMA.
          Pipeline: schema heat-typology-v1.
        </p>
      </div>
    </div>
  )
}
