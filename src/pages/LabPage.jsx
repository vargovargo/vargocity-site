import { useState, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import SectionHeader from '../components/shared/SectionHeader'
import TabBar from '../components/shared/TabBar'
import PostCard from '../components/writing/PostCard'
import SeriesCard from '../components/writing/SeriesCard'
import MarkdownPost from '../components/writing/MarkdownPost'
import { loadBlogPosts } from '../lib/loadContent'
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

export default function LabPage() {
  return (
    <Routes>
      <Route index element={<LabIndex />} />
      <Route path="posts/:slug" element={<SinglePost />} />
    </Routes>
  )
}
