import { useState, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import SectionHeader from '../components/shared/SectionHeader'
import TabBar from '../components/shared/TabBar'
import PostCard from '../components/writing/PostCard'
import SeriesCard from '../components/writing/SeriesCard'
import MarkdownPost from '../components/writing/MarkdownPost'
import { loadBlogPosts } from '../lib/loadContent'
import { loadHeatTypologyData } from '../lib/heat-data'
import seriesData from '../data/series.json'
import usePageTitle from '../lib/usePageTitle'

const tabs = [
  { id: 'research', label: 'Inquiries' },
  { id: 'published', label: 'Published' },
]

function ResearchList({ posts }) {
  if (!posts.length) {
    return <p className="text-sm py-12 text-center" style={{ color: 'var(--c-text-muted)' }}>Nothing here yet.</p>
  }

  // Group posts by series_slug
  const grouped = {}
  const ungrouped = []
  posts.forEach(post => {
    if (post.series_slug && seriesData[post.series_slug]) {
      if (!grouped[post.series_slug]) grouped[post.series_slug] = []
      grouped[post.series_slug].push(post)
    } else {
      ungrouped.push(post)
    }
  })

  // Order series by most recent post date, descending
  const seriesSlugs = Object.keys(grouped).sort((a, b) => {
    const latestA = Math.max(...grouped[a].map(p => p.date))
    const latestB = Math.max(...grouped[b].map(p => p.date))
    return latestB > latestA ? 1 : -1
  })

  return (
    <div>
      {seriesSlugs.map((slug, i) => (
        <SeriesCard
          key={slug}
          series={seriesData[slug]}
          posts={grouped[slug]}
          defaultOpen={false}
        />
      ))}
      {ungrouped.map(post => (
        <PostCard key={post.slug} post={post} basePath="/lab/posts" />
      ))}
    </div>
  )
}

function LabIndex() {
  usePageTitle('Lab')
  const [tab, setTab] = useState('research')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlogPosts().then(p => {
      setPosts(p)
      setLoading(false)
    })
  }, [])

  const researchPosts = posts.filter(p => p.type !== 'published')
  const publishedPosts = posts.filter(p => p.type === 'published')

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader
        label="Independent Work"
        title="Lab"
        description="Data pursuits, independent analyses, and published writing."
      />
      <div className="mb-8">
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>
      {loading ? (
        <p className="text-sm py-12 text-center" style={{ color: 'var(--c-text-muted)' }}>Loading…</p>
      ) : tab === 'research' ? (
        <ResearchList posts={researchPosts} />
      ) : (
        <div>
          {publishedPosts.length === 0
            ? <p className="text-sm py-12 text-center" style={{ color: 'var(--c-text-muted)' }}>Nothing here yet.</p>
            : publishedPosts.map(post => (
                <PostCard key={post.slug} post={post} basePath="/lab/posts" />
              ))
          }
        </div>
      )}
    </div>
  )
}

function SinglePost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  usePageTitle(post?.title || null)

  useEffect(() => {
    loadBlogPosts().then(posts => {
      setPost(posts.find(p => p.slug === slug) || null)
    })
  }, [slug])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <MarkdownPost post={post} backPath="/lab" backLabel="Lab" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// /lab/heat — Phase B placeholder (data proof-of-life; UI in Phase C)
// ---------------------------------------------------------------------------

function HeatTypologyDraft() {
  usePageTitle('Heat Typology (draft)')
  const [status, setStatus] = useState('loading')
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHeatTypologyData()
      .then(data => {
        const sample = data.counties.slice(0, 5).map(c => ({
          fips: c.county_fips,
          name: `${c.name}, ${c.state}`,
          dominant: c.hazards.heat.dominant,
          confidence: c.hazards.heat.confidence.toFixed(2),
        }))
        setPreview({ total: data.counties.length, schema_version: data.schema_version, sample })
        setStatus('ok')
      })
      .catch(err => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-2 text-xs font-mono px-2 py-0.5 rounded inline-block" style={{ backgroundColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}>
        draft — Phase C pending
      </div>
      <h1 className="text-3xl font-bold mt-3 mb-2" style={{ color: 'var(--c-text)' }}>
        Heat Typology Explorer
      </h1>
      <p className="text-base mb-10" style={{ color: 'var(--c-text-body)' }}>
        Shock, stress, and shift — three shapes of heat trajectory across U.S. counties.
        Interactive maps and charts coming in Phase C.
      </p>

      <div className="rounded-lg border p-5 font-mono text-sm" style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text-body)' }}>
        <p className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Data probe</p>

        {status === 'loading' && <p style={{ color: 'var(--c-text-muted)' }}>Loading heat-counties-panel.json…</p>}

        {status === 'error' && (
          <p style={{ color: '#c0392b' }}>Error: {error}</p>
        )}

        {status === 'ok' && preview && (
          <>
            <p>schema_version: <span style={{ color: 'var(--c-text)' }}>{preview.schema_version}</span></p>
            <p className="mt-1">county count: <span style={{ color: 'var(--c-text)' }}>{preview.total.toLocaleString()}</span></p>
            <p className="mt-3 mb-1" style={{ color: 'var(--c-text-muted)' }}>first 5 counties:</p>
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ color: 'var(--c-text-muted)' }}>
                  <th className="pr-4">FIPS</th>
                  <th className="pr-4">Name</th>
                  <th className="pr-4">Dominant</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.map(row => (
                  <tr key={row.fips}>
                    <td className="pr-4">{row.fips}</td>
                    <td className="pr-4">{row.name}</td>
                    <td className="pr-4">{row.dominant}</td>
                    <td>{row.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

export default function LabPage() {
  return (
    <Routes>
      <Route index element={<LabIndex />} />
      <Route path="posts/:slug" element={<SinglePost />} />
      <Route path="heat" element={<HeatTypologyDraft />} />
    </Routes>
  )
}
