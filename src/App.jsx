import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SiteNav from './components/layout/SiteNav'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ResearchPage from './pages/ResearchPage'
import MakingPage from './pages/MakingPage'
import AdventuresPage from './pages/AdventuresPage'
import WritingPage from './pages/WritingPage'

const themes = [
  { id: 'default', label: 'Default', swatch: '#FAFAF8', ring: '#1A1A1A' },
  { id: 'warm',    label: 'Warm',    swatch: '#F5EDE0', ring: '#B87333' },
  { id: 'alpine',  label: 'Alpine',  swatch: '#0F1621', ring: '#7AB8CC' },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('site-theme') || 'default')

  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('site-theme', theme)
  }, [theme])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--c-bg)' }}>
        <SiteNav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/making" element={<MakingPage />} />
            <Route path="/adventures" element={<AdventuresPage />} />
            <Route path="/writing/*" element={<WritingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer theme={theme} themes={themes} onThemeChange={setTheme} />
      </div>
    </BrowserRouter>
  )
}
