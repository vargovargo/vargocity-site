export default function ToolCard({ tool }) {
  return (
    <div style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}
      className="p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>{tool.name}</h3>
        <span className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: tool.status === 'live' ? 'var(--c-card-hover)' : 'var(--c-bg)',
            color: 'var(--c-text-muted)',
            border: '1px solid var(--c-border)',
          }}>
          {tool.status === 'live' ? 'Live' : 'In Progress'}
        </span>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--c-text-body)' }}>{tool.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.tech.map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--c-card-hover)', color: 'var(--c-text-body)' }}>
            {t}
          </span>
        ))}
      </div>
      {tool.url && (
        <a href={tool.url} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: 'var(--c-text-muted)' }}>
          Open app →
        </a>
      )}
    </div>
  )
}
