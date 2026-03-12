import scholar from '../../data/scholar.json'

export default function ScholarStats() {
  return (
    <div style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}
      className="p-6 flex flex-wrap gap-8 items-end">
      <div>
        <p className="text-3xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
          {scholar.citations.toLocaleString()}
        </p>
        <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
          Citations
        </p>
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
          {scholar.h_index}
        </p>
        <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
          h-index
        </p>
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums font-data" style={{ color: 'var(--c-text)' }}>
          {scholar.i10_index}
        </p>
        <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
          i10-index
        </p>
      </div>
      <div className="ml-auto">
        <a href={scholar.profile_url} target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: 'var(--c-text-muted)' }}>
          View on Google Scholar →
        </a>
        <p className="text-xs mt-0.5 font-data" style={{ color: 'var(--c-text-light)' }}>
          Updated {scholar.last_updated}
        </p>
      </div>
    </div>
  )
}
