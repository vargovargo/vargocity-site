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
        <div className="grid sm:grid-cols-2 gap-px" style={{ border: '1px solid #E5E5E0', backgroundColor: '#E5E5E0' }}>
          {cards.map(({ to, label, title, description }) => (
            <Link
              key={to}
              to={to}
              className="group block p-8 transition-colors"
              style={{ backgroundColor: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAF8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <p className="text-xs font-medium tracking-widest uppercase mb-3"
                style={{ color: '#8A8A8A' }}>
                {label}
              </p>
              <h3 className="text-lg font-semibold mb-2 tracking-tight"
                style={{ color: '#1A1A1A' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
                {description}
              </p>
              <p className="mt-4 text-xs" style={{ color: '#8A8A8A' }}>
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
