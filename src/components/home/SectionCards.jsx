import { Link } from 'react-router-dom'

const cards = [
  {
    to: '/about',
    label: 'About',
    title: 'In Motion',
    description: 'Raised in the suburbs, but love cities. From the Midwest, but long for higher elevation. Born in the Motor City, but get everywhere by bike.',
  },
  {
    to: '/research',
    label: 'Research',
    title: 'A Career of Asking For Whom',
    description: 'Find the signal. Cut the noise. Make it beautiful enough that people can\'t ignore it. Cities, climate, health, opportunity.',
  },
  {
    to: '/lab',
    label: 'Lab',
    title: 'Self-Assigned Problems',
    description: 'Datasets that needed someone to look at them. AI and labor markets. The cost of not being poor. Streets and cities. The research that starts before anyone thought to ask for it.',
  },
  {
    to: '/adventures',
    label: 'Adventures',
    title: 'Sierra Peaks & Far Places',
    description: 'The window for hard adventuring is finite. Keep surprising yourself.',
  },
  {
    to: '/making',
    label: 'Making',
    title: 'Code & Design',
    description: 'Creativity and knowledge come from the same place. The first version is just permission to make the next one better.',
  },
]

export default function SectionCards() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 gap-px" style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-border)' }}>
          {cards.map(({ to, label, title, description }, i) => (
            <Link
              key={to}
              to={to}
              className={`group block p-8 transition-colors${i === cards.length - 1 && cards.length % 2 !== 0 ? ' sm:col-span-2' : ''}`}
              style={{ backgroundColor: 'var(--c-surface)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--c-surface)'}
            >
              <p className="text-xs font-medium tracking-widest uppercase mb-3"
                style={{ color: 'var(--c-text-muted)' }}>
                {label}
              </p>
              <h3 className="text-lg font-semibold mb-2 tracking-tight"
                style={{ color: 'var(--c-text)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-body)' }}>
                {description}
              </p>
              <p className="mt-4 text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
