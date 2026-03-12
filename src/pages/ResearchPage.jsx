import { useState } from 'react'
import SectionHeader from '../components/shared/SectionHeader'
import ThemeCards from '../components/research/ThemeCards'
import ScholarStats from '../components/research/ScholarStats'
import PublicationList from '../components/research/PublicationList'

const media = [
  { outlet: 'NASA Applied Sciences', title: 'Watching Wildfire Smoke Impacts for Healthier Communities', url: 'https://appliedsciences.nasa.gov/our-impact/people/watching-wildfire-smoke-impacts-healthier-communities', tags: ['wildfire', 'air-quality', 'health'] },
  { outlet: 'Smithsonian Magazine', title: 'Humans Are Becoming City-Dwelling Metro Sapiens', url: 'https://www.smithsonianmag.com/science-nature/humans-are-becoming-city-dwelling-metro-sapiens-180953449/', tags: ['urbanism', 'metro-sapiens'] },
  { outlet: 'Scientific American', title: 'How People Make the Summer Hotter', url: 'https://www.scientificamerican.com/article/how-people-make-summer-hotter/', tags: ['urban-heat', 'climate'] },
  { outlet: 'FedCommunities', title: 'Unveiling the Effects of Wildfire Smoke on Vulnerable Communities', url: 'https://fedcommunities.org/unveiling-effects-wildfire-smoke-vulnerable-communities/', tags: ['wildfire', 'air-quality', 'health'] },
  { outlet: 'HuffPost', title: 'Author archive', url: 'https://www.huffpost.com/author/jason-vargo', tags: ['urbanism', 'climate'] },
  { outlet: 'NPR', title: 'As More Adults Pedal, Biking Injuries and Deaths Are Spiking Too', url: 'https://www.npr.org/sections/health-shots/2015/09/02/436662737/as-more-adults-pedal-their-biking-injuries-and-deaths-are-spiking-too', tags: ['active-transport', 'health'] },
  { outlet: 'Bloomberg', title: 'Cycling Deaths Among Children Have Plummeted', url: 'https://www.bloomberg.com/news/articles/2015-08-13/cycling-deaths-among-children-have-plummeted', tags: ['active-transport', 'health'] },
  { outlet: 'Madison.com', title: 'UW-Madison, Monona to Collaborate on Sustainability', url: 'https://madison.com/news/local/focus-on-dane-county-uw-madison-monona-to-collaborate-on/article_e28b7b44-4387-5ed0-ba75-57d44f524de7.html', tags: ['urbanism', 'policy'] },
]

export default function ResearchPage() {
  const [activeTag, setActiveTag] = useState(null)

  const filteredMedia = activeTag
    ? media.filter(m => m.tags.includes(activeTag))
    : media

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader
        label="Research"
        title="A Career of Asking For Whom"
        description="I study how large systems — urban environments, climate, economies — shape opportunity unevenly, and what measurement and policy can do about it. Cities, climate, health. The same pattern keeps showing up."
      />

      {/* Page jump links */}
      <div className="flex gap-5 mb-12 -mt-4">
        <a href="#media" className="text-xs hover:underline" style={{ color: 'var(--c-text-muted)' }}>↓ Media & Press</a>
      </div>

      {/* Research Themes */}
      <section className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--c-text-muted)' }}>
          Research Themes
        </h2>
        <ThemeCards />
      </section>

      {/* Scholar Stats */}
      <section className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--c-text-muted)' }}>
          Google Scholar
        </h2>
        <ScholarStats />
      </section>

      {/* Publications */}
      <section className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--c-text-muted)' }}>
          Selected Publications
        </h2>
        <PublicationList activeTag={activeTag} onTagChange={setActiveTag} />
      </section>

      {/* Media */}
      {filteredMedia.length > 0 && (
      <section id="media">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--c-text-muted)' }}>
          Media & Press
        </h2>
        <div className="space-y-0" style={{ border: '1px solid var(--c-border)' }}>
          {filteredMedia.map((m, i) => (
            <div key={i}
              style={{ borderBottom: i < filteredMedia.length - 1 ? '1px solid var(--c-border)' : 'none' }}
              className="px-5 py-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--c-text-muted)' }}>{m.outlet}</p>
                  {m.url ? (
                    <a href={m.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm hover:underline" style={{ color: 'var(--c-text)' }}>
                      {m.title}
                    </a>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--c-text)' }}>{m.title}</p>
                  )}
                </div>
                {m.url && (
                  <span className="text-xs shrink-0" style={{ color: 'var(--c-text-muted)' }}>↗</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
