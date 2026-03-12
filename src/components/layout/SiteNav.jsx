import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/about', label: 'About' },
  { to: '/research', label: 'Research' },
  { to: '/adventures', label: 'Adventures' },
  { to: '/making', label: 'Making' },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{ backgroundColor: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold tracking-tight" style={{ color: 'var(--c-text)' }}>
          Jason Vargo
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)',
                fontWeight: isActive ? '500' : '400',
              })}
              className="text-sm transition-colors theme-hover"
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div style={{ color: 'var(--c-text-body)' }} className="flex flex-col gap-1.5">
            <span className={`block w-5 h-px bg-current transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }}
          className="md:hidden px-6 py-4 flex flex-col gap-4">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({ color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)', fontWeight: isActive ? '500' : '400' })}
              className="text-sm"
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
