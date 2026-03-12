export default function SectionHeader({ label, title, description }) {
  return (
    <div className="mb-10">
      {label && (
        <p className="text-xs font-medium tracking-widest uppercase mb-3"
          style={{ color: 'var(--c-text-muted)' }}>
          {label}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--c-text)' }}>
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-base leading-relaxed max-w-2xl" style={{ color: 'var(--c-text-body)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
