import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SeriesCard({ series, posts, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  // Sort posts by series_order ascending
  const sorted = [...posts].sort((a, b) => a.series_order - b.series_order)
  const lastUpdated = sorted[sorted.length - 1]?.date || ''

  return (
    <div className="mb-4" style={{ border: '1px solid var(--c-border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-6 transition-colors"
        style={{ backgroundColor: open ? 'var(--c-card-hover)' : 'var(--c-surface)' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.backgroundColor = 'var(--c-card-hover)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.backgroundColor = 'var(--c-surface)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold tracking-tight mb-1"
              style={{ color: 'var(--c-text)' }}>
              {series.title}
            </h3>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--c-text-body)' }}>
              {series.description}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} · Last updated {lastUpdated}
              </span>
              {series.github && (
                <a
                  href={series.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
          <span className="text-xs mt-0.5 shrink-0" style={{ color: 'var(--c-text-muted)' }}>
            {open ? '↑' : '↓'}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--c-border)' }}>
          {sorted.map((post, i) => (
            <Link
              key={post.slug}
              to={`/lab/posts/${post.slug}`}
              className="flex items-baseline justify-between px-6 py-3 transition-colors"
              style={{
                backgroundColor: 'var(--c-surface)',
                borderTop: i > 0 ? '1px solid var(--c-border)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--c-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--c-surface)'}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-xs shrink-0" style={{ color: 'var(--c-text-muted)' }}>
                  {post.series_order}
                </span>
                <span className="text-sm" style={{ color: 'var(--c-text)' }}>
                  {post.title}
                </span>
              </div>
              <span className="text-xs ml-4 shrink-0" style={{ color: 'var(--c-text-muted)' }}>
                {post.date}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
