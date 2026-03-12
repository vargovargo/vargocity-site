import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/shared/SectionHeader'
import TabBar from '../components/shared/TabBar'
import AdventureStats from '../components/adventures/AdventureStats'
import PeakGrid from '../components/adventures/PeakGrid'
import PeakTimeline from '../components/adventures/PeakTimeline'
import ElevationChart from '../components/adventures/ElevationChart'
import PeakRegionList from '../components/adventures/PeakRegionList'
import WorldMap from '../components/adventures/WorldMap'

const tabs = [
  { id: 'peaks', label: 'Sierra Peaks' },
  { id: 'countries', label: 'Countries Visited' },
]

const peakViews = [
  { id: 'grid', label: 'Grid' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'chart', label: 'Elevation' },
  { id: 'region', label: 'By Region' },
]

export default function AdventuresPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'peaks')
  const [peakView, setPeakView] = useState('chart')

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader
        label="Adventures"
        title="Sierra Peaks & Far Places"
        description="The window for hard adventuring is finite, so get to the top of high places. It's a good way to find out where you've been and which direction to go. "
      />

      <div className="mb-8">
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab === 'peaks' && (
        <div>
          <AdventureStats section="peaks" />

          {/* SPS list context */}
          <p className="text-sm leading-relaxed mt-6" style={{ color: 'var(--c-text-body)' }}>
            The <strong>Sierra Peaks Section (SPS) List</strong> is a roster of 248 peaks maintained
            by the Angeles Chapter of the Sierra Club — a lifetime project for most who attempt it.
            The peaks span the length of the Sierra Nevada, from the volcanic tableland near Mammoth
            to the granite walls of Sequoia. About half require technical scrambling (Class 3–4);
            a handful demand ropes.
          </p>

          {/* Peak sub-view switcher */}
          <div className="flex gap-3 my-6">
            {peakViews.map(v => (
              <button
                key={v.id}
                onClick={() => setPeakView(v.id)}
                className="text-xs px-3 py-1.5 rounded transition-colors"
                style={{
                  backgroundColor: peakView === v.id ? 'var(--c-invert-bg)' : 'var(--c-surface)',
                  color: peakView === v.id ? 'var(--c-invert-text)' : 'var(--c-text-muted)',
                  border: '1px solid var(--c-border)',
                  cursor: 'pointer',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {peakView === 'grid' && <PeakGrid />}
          {peakView === 'timeline' && <PeakTimeline />}
          {peakView === 'chart' && <ElevationChart />}
          {peakView === 'region' && <PeakRegionList />}
        </div>
      )}

      {tab === 'countries' && (
        <div>
          <AdventureStats section="countries" />
          <div className="mt-6">
            <WorldMap />
          </div>
        </div>
      )}
    </div>
  )
}
