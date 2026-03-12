export default function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ borderBottom: '1px solid var(--c-border)' }} className="flex gap-0">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-4 py-3 text-sm transition-colors relative"
            style={{ color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)', fontWeight: isActive ? '500' : '400', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: 'var(--c-text)' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
