import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AEITaskTrends, AEICollabTrends, AEIPrimitivesScatter, AEISummaryTable } from './AEICharts'

const AEI_CHARTS = {
  '/plots/task_pct_trends.png':              AEITaskTrends,
  '/plots/automation_augmentation_trends.png': AEICollabTrends,
  '/plots/primitives_scatter.png':           AEIPrimitivesScatter,
  '/plots/soc_summary_table.png':            AEISummaryTable,
}

function PostImage({ src, alt }) {
  const Chart = AEI_CHARTS[src]
  if (Chart) return <Chart />
  return <img src={src} alt={alt} className="rounded" />
}

export default function MarkdownPost({ post, backPath, backLabel }) {
  if (!post) return <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Post not found.</p>
  return (
    <article className="max-w-2xl">
      <div className="mb-8">
        <Link to={backPath}
          className="text-xs transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
          ← {backLabel}
        </Link>
      </div>

      {post.book && (
        <div className="mb-4 px-4 py-3 rounded"
          style={{ backgroundColor: 'var(--c-card-hover)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{post.book}</p>
          <p className="text-xs" style={{ color: 'var(--c-text-body)' }}>{post.book_author}</p>
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: 'var(--c-text)' }}>
        {post.title}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
        {post.date}
        {post.source === 'newsletter' && ' · Originally sent via TinyLetter'}
      </p>

      <div className="prose prose-sm max-w-none themed-prose"
        style={{ lineHeight: '1.75' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: PostImage }}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
