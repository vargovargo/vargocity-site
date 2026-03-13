import { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/shared/SectionHeader'
import ThemeCards from '../components/research/ThemeCards'
import ScholarStats from '../components/research/ScholarStats'
import PublicationList from '../components/research/PublicationList'

const media = [
  { outlet: 'NASA Applied Sciences', title: 'Watching Wildfire Smoke Impacts for Healthier Communities', url: 'https://appliedsciences.nasa.gov/our-impact/people/watching-wildfire-smoke-impacts-healthier-communities', tags: ['air-quality', 'health'] },
  { outlet: 'Smithsonian Magazine', title: 'Humans Are Becoming City-Dwelling Metro Sapiens', url: 'https://www.smithsonianmag.com/science-nature/humans-are-becoming-city-dwelling-metro-sapiens-180953449/', tags: ['cities'] },
  { outlet: 'Scientific American', title: 'How People Make the Summer Hotter', url: 'https://www.scientificamerican.com/article/how-people-make-summer-hotter/', tags: ['climate'] },
  { outlet: 'FedCommunities', title: 'Unveiling the Effects of Wildfire Smoke on Vulnerable Communities', url: 'https://fedcommunities.org/unveiling-effects-wildfire-smoke-vulnerable-communities/', tags: ['air-quality', 'health'] },
  { outlet: 'HuffPost', title: 'Author archive', url: 'https://www.huffpost.com/author/jason-vargo', tags: ['cities', 'climate'] },
  { outlet: 'NPR', title: 'As More Adults Pedal, Biking Injuries and Deaths Are Spiking Too', url: 'https://www.npr.org/sections/health-shots/2015/09/02/436662737/as-more-adults-pedal-their-biking-injuries-and-deaths-are-spiking-too', tags: ['transportation', 'health'] },
  { outlet: 'Bloomberg', title: 'Cycling Deaths Among Children Have Plummeted', url: 'https://www.bloomberg.com/news/articles/2015-08-13/cycling-deaths-among-children-have-plummeted', tags: ['transportation', 'health'] },
  { outlet: 'Madison.com', title: 'UW-Madison, Monona to Collaborate on Sustainability', url: 'https://madison.com/news/local/focus-on-dane-county-uw-madison-monona-to-collaborate-on/article_e28b7b44-4387-5ed0-ba75-57d44f524de7.html', tags: ['cities', 'policy'] },
  { outlet: 'Bloomberg Law', title: 'Killer Heat Days to Surge Without Climate Action', url: 'https://news.bloomberglaw.com/environment-and-energy/killer-heat-days-to-surge-without-climate-action-report-says', tags: ['climate'] },
  { outlet: 'Wisconsin Public Radio', title: 'Adults Now Make Up Majority of Cycling Deaths, Data Shows', url: 'http://www.wpr.org/adults-now-make-majority-cycling-deaths-data-shows', tags: ['transportation', 'health'] },
  { outlet: 'HealthDay News', title: 'U.S. Bike Deaths Fall for Kids, But Rise for Adults', url: 'http://consumer.healthday.com/general-health-information-16/injury-health-news-413/u-s-bike-deaths-fall-for-kids-but-rise-for-adults-702308.html', tags: ['transportation', 'health'] },
  { outlet: 'The Courier-Journal', title: "'Hot Spots' Make Mercury Rise in Louisville", url: 'http://www.courier-journal.com/story/tech/science/environment/2014/06/27/top-hot-spots-louisville/11505235/', tags: ['climate'] },
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
        <a href="#independent" className="text-xs hover:underline" style={{ color: 'var(--c-text-muted)' }}>↓ Independent Work</a>
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

      {/* Independent Research */}
      <section id="independent" className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--c-text-muted)' }}>
          Independent Work
        </h2>
        <div style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }} className="px-5 py-4">
          <p className="text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>March 2026 · Work in progress</p>
          <Link to="/writing/blog/2026-03-13-aei-longitudinal" className="text-sm hover:underline" style={{ color: 'var(--c-text)' }}>
            AI Use in Lower-Income Worker Occupations
          </Link>
          <p className="text-sm mt-1.5" style={{ color: 'var(--c-text-body)' }}>
            A longitudinal panel of the Anthropic Economic Index, cross-walked to Kneebone & Holmes (2025). AI task share is growing in LMI-high occupations — and shifting toward automation.
          </p>
        </div>
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
              className="px-5 py-4" style={{ backgroundColor: 'var(--c-surface)' }}>
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
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.tags.map(tag => (
                      <button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                        className="px-2 py-0.5 text-xs rounded transition-colors"
                        style={{
                          backgroundColor: tag === activeTag ? 'var(--c-invert-bg)' : 'var(--c-border)',
                          color: tag === activeTag ? 'var(--c-invert-text)' : 'var(--c-text-body)',
                          cursor: 'pointer',
                          border: 'none',
                        }}>
                        {tag}
                      </button>
                    ))}
                  </div>
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
