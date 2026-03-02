import { Link } from 'react-router-dom'
import AnimatedCounter from '../shared/AnimatedCounter'
import { climbedPeaks } from '../../data/spsUtils'
import countries from '../../data/countries.json'
import publications from '../../data/publications.json'

export default function StatsBar() {
  return (
    <section style={{ borderTop: '1px solid #E5E5E0', borderBottom: '1px solid #E5E5E0' }}
      className="py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8">
          <Link to="/research" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
              <AnimatedCounter value={publications.length} />+
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>
              Publications
            </p>
          </Link>
          <Link to="/adventures?tab=peaks" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
              <AnimatedCounter value={climbedPeaks.length} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Sierra Peaks</p>
          </Link>
          <Link to="/adventures?tab=countries" className="block hover:opacity-70 transition-opacity">
            <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
              <AnimatedCounter value={countries.length} />
            </p>
            <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>Countries</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
