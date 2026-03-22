import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SectionHeader from '../components/shared/SectionHeader'
import CareerTimeline from '../components/about/CareerTimeline'
import TEDxSpotlight from '../components/about/TEDxSpotlight'
import usePageTitle from '../lib/usePageTitle'

// Import the about markdown as raw text via Vite's ?raw suffix
import aboutRaw from '../content/about.md?raw'

export default function AboutPage() {
  usePageTitle('About')
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader label="About" title="In Motion" />

      <div className="grid lg:grid-cols-5 gap-16">
        {/* Narrative prose */}
        <div className="lg:col-span-3">
          <div className="prose prose-sm max-w-none"
            style={{ color: 'var(--c-text-body)', lineHeight: '1.85' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aboutRaw}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timeline sidebar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--c-text-muted)' }}>
              Career
            </h2>
            <a href="/jason_vargo_cv.pdf" target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--c-text-muted)' }}>
              CV ↓
            </a>
          </div>
          <CareerTimeline />
        </div>
      </div>

      {/* TEDx */}
      <div className="mt-16">
        <TEDxSpotlight />
      </div>
    </div>
  )
}
