import { Link } from 'react-router-dom'
import AnimatedCounter from '../shared/AnimatedCounter'
import { climbedPeaks } from '../../data/spsUtils'
import countries from '../../data/countries.json'
import publications from '../../data/publications.json'
import scholar from '../../data/scholar.json'

export default function StatsBar() {
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }}
      className="py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-8">
          <Link to="/research" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--c-text)' }}>
              <AnimatedCounter value={publications.length} />+
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
              Publications
            </p>
          </Link>
          <Link to="/research" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--c-text)' }}>
              <AnimatedCounter value={scholar.citations} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
              Citations
            </p>
          </Link>
          <Link to="/adventures?tab=peaks" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--c-text)' }}>
              <AnimatedCounter value={climbedPeaks.length} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Sierra Peaks</p>
          </Link>
          <Link to="/adventures?tab=countries" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--c-text)' }}>
              <AnimatedCounter value={countries.length} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>Countries</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
