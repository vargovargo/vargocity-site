import { Link } from 'react-router-dom'

export default function PostCard({ post, basePath }) {
  const href = `${basePath}/${post.slug}`
  return (
    <Link to={href} className="block group" style={{ borderBottom: '1px solid var(--c-border)' }}>
      <div className="py-5">
        <div className="flex items-baseline justify-between gap-4 mb-1">
          <h3 className="text-sm font-semibold group-hover:underline"
            style={{ color: 'var(--c-text)' }}>
            {post.title}
          </h3>
          <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--c-text-muted)' }}>
            {post.date}
          </span>
        </div>
        {post.excerpt && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-body)' }}>
            {post.excerpt}
          </p>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs"
                style={{ color: 'var(--c-text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        {post.book && (
          <p className="text-xs mt-1 italic" style={{ color: 'var(--c-text-body)' }}>
            {post.book} — {post.book_author}
          </p>
        )}
      </div>
    </Link>
  )
}
