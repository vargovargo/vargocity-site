/** The one caption treatment for every chart in the Lab. */
export default function ChartCaption({ children }) {
  return (
    <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
      {children}
    </p>
  )
}
