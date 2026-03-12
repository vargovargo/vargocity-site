import publications from '../../data/publications.json'

const sorted = [...publications].sort((a, b) => b.year - a.year)

const allTags = [...new Set(publications.flatMap(p => p.tags))].sort()

export default function PublicationList({ activeTag, onTagChange }) {
  const filtered = activeTag
    ? sorted.filter(p => p.tags.includes(activeTag))
    : sorted

  return (
    <div>
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => onTagChange(null)}
          className="px-3 py-1 text-xs rounded-full transition-colors"
          style={{
            backgroundColor: !activeTag ? 'var(--c-invert-bg)' : 'var(--c-surface)',
            color: !activeTag ? 'var(--c-invert-text)' : 'var(--c-text-muted)',
            border: '1px solid var(--c-border)',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagChange(tag === activeTag ? null : tag)}
            className="px-3 py-1 text-xs rounded-full transition-colors"
            style={{
              backgroundColor: activeTag === tag ? 'var(--c-invert-bg)' : 'var(--c-surface)',
              color: activeTag === tag ? 'var(--c-invert-text)' : 'var(--c-text-muted)',
              border: '1px solid var(--c-border)',
              cursor: 'pointer',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Publications */}
      <div className="space-y-0" style={{ border: '1px solid var(--c-border)' }}>
        {filtered.map((pub, i) => (
          <div key={pub.id}
            className="p-5"
            style={{
              backgroundColor: 'var(--c-surface)',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--c-border)' : 'none',
            }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {pub.url ? (
                  <a href={pub.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                    style={{ color: 'var(--c-text)' }}>
                    {pub.title}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                    {pub.title}
                  </p>
                )}
                <p className="text-xs mt-1 font-data" style={{ color: 'var(--c-text-body)' }}>
                  {pub.venue} · {pub.year}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pub.tags.map(tag => (
                    <button key={tag} onClick={() => onTagChange(tag === activeTag ? null : tag)}
                      className="px-2 py-0.5 text-xs rounded transition-colors"
                      style={{
                        backgroundColor: tag === activeTag ? 'var(--c-invert-bg)' : 'var(--c-border)',
                        color: tag === activeTag ? 'var(--c-invert-text)' : 'var(--c-text-body)',
                        cursor: 'pointer',
                        border: 'none',
                      }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
                  {pub.citations}
                </p>
                <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>cited</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
