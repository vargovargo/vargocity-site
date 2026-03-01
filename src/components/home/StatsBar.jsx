import { Link } from 'react-router-dom'
import AnimatedCounter from '../shared/AnimatedCounter'
import scholar from '../../data/scholar.json'
import { climbedPeaks } from '../../data/spsUtils'
import countries from '../../data/countries.json'
import publications from '../../data/publications.json'

const stats = [
  { value: scholar.citations, label: 'Citations', suffix: '+', to: '/research' },
  { value: climbedPeaks.length, label: 'Sierra Peaks', to: '/adventures?tab=peaks' },
  { value: countries.length, label: 'Countries', to: '/adventures?tab=countries' },
  { value: publications.length, label: 'Publications', suffix: '+', to: '/research' },
]

export default function StatsBar() {
  return (
    <section style={{ borderTop: '1px solid #E5E5E0', borderBottom: '1px solid #E5E5E0' }}
      className="py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map(({ value, label, suffix, to }) => {
            const inner = (
              <>
                <p className="text-2xl font-semibold tabular-nums" style={{ color: '#1A1A1A' }}>
                  <AnimatedCounter value={value} />{suffix || ''}
                </p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#8A8A8A' }}>
                  {label}
                </p>
              </>
            )
            return to ? (
              <Link key={label} to={to} className="block hover:opacity-70 transition-opacity">
                {inner}
              </Link>
            ) : (
              <div key={label}>{inner}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
