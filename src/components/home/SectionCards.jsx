import { Link } from 'react-router-dom'

const cards = [
  {
    to: '/research',
    label: 'Research',
    title: 'A Career of Asking For Whom',
    description: 'Twenty-five years of tracking who bears the cost when powerful systems shift — and building tools to make that visible and changeable. Cities, climate, health, economy.',
  },
  {
    to: '/making',
    label: 'Making',
    title: 'Code & Design',
    description: 'Tools built when something useful didn\'t exist, and design work that helps ideas reach the people who need them.',
  },
  {
    to: '/adventures',
    label: 'Adventures',
    title: 'Sierra Peaks & Far Places',
    description: 'The window for hard adventuring is finite. A running count of Sierra peaks and far places.',
  },
  {
    to: '/writing',
    label: 'Writing',
    title: 'Blog, Letters & Reading',
    description: 'Essays, dispatches from the newsletter, and notes from a reading life.',
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
