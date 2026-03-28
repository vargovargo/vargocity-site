import { Link } from 'react-router-dom'

function CardBody({ post }) {
  return (
    <div className="py-5">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3 className="text-sm font-semibold group-hover:underline"
          style={{ color: 'var(--c-text)' }}>
          {post.title}{post.link && <span className="ml-1 font-normal" style={{ color: 'var(--c-text-muted)' }}>↗</span>}
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
  )
}

export default function PostCard({ post, basePath }) {
  if (post.link) {
    return (
      <a href={post.link} target="_blank" rel="noopener noreferrer"
        className="block group" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <CardBody post={post} />
      </a>
    )
  }
  return (
    <Link to={`${basePath}/${post.slug}`} className="block group"
      style={{ borderBottom: '1px solid var(--c-border)' }}>
      <CardBody post={post} />
    </Link>
  )
}
