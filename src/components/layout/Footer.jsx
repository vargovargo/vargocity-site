// The theme swatches used to live here. The site is locked to one look now;
// see LOCKED_THEME in App.jsx for how to bring the switcher back.
export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }}
      className="mt-24 py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>vargocity</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>measuring my own rate of change</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-5">
            <a href="https://scholar.google.com/citations?user=18KgmXAAAAAJ"
              target="_blank" rel="noopener noreferrer"
              className="text-sm transition-colors theme-hover"
              style={{ color: 'var(--c-text-body)' }}>
              Scholar
            </a>
            <a href="https://www.frbsf.org/our-people/experts/jason-vargo/"
              target="_blank" rel="noopener noreferrer"
              className="text-sm transition-colors theme-hover"
              style={{ color: 'var(--c-text-body)' }}>
              Fed Profile
            </a>
            <a href="https://github.com/vargovargo"
              target="_blank" rel="noopener noreferrer"
              className="text-sm transition-colors theme-hover"
              style={{ color: 'var(--c-text-body)' }}>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
