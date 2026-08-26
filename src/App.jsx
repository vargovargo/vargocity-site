import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import SiteNav from './components/layout/SiteNav'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ResearchPage from './pages/ResearchPage'
import MakingPage from './pages/MakingPage'
import AdventuresPage from './pages/AdventuresPage'
import LabPage from './pages/LabPage'
import GratitudeOptInPage from './pages/GratitudeOptInPage'

// Restoring the switcher: put these back as a `themes` array, thread them to
// Footer with an onThemeChange handler, and render the swatch buttons there.
// The token blocks for all three themes are still in index.css.
//   default  #FAFAF8 / ring #1A1A1A / Inter headings
//   warm     #F5EDE0 / ring #B87333 / Lora headings   <- current
//   alpine   #0F1621 / ring #7AB8CC / Barlow headings (fonts no longer loaded)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function SiteLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--c-bg)' }}>
      <SiteNav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// The site shipped with three switchable themes for a year. A visitor's read
// was that the typography looked unsettled — which is fair, since the heading
// face changed with a footer swatch. Warm is now the site's look. The switcher
// mechanism is kept but not rendered (see Footer), so re-enabling it is a
// one-line change rather than a rebuild.
const LOCKED_THEME = 'warm'

export default function App() {
  const [theme] = useState(LOCKED_THEME)

  useEffect(() => {
    // Ignore any previously stored preference — a browser holding 'alpine'
    // from before the lock must not resurrect it.
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route path="/gratitude-opt-in" element={<GratitudeOptInPage />} />
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/making" element={<MakingPage />} />
          <Route path="/adventures" element={<AdventuresPage />} />
          <Route path="/lab/*" element={<LabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
