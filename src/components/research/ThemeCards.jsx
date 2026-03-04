const themes = [
  {
    id: 'technology-society',
    title: 'Technology & Society',
    description: 'The question I\'ve spent a career asking — who bears the cost of powerful systems — applies with full force to AI. AGI is arriving. The tools I\'ve built for measuring harm, identifying root causes, and translating findings into policy are the right tools for this moment. That\'s the work I\'m moving toward.',
  },
  {
    id: 'climate-communities',
    title: 'Climate & Communities',
    description: 'The burdens of climate change — wildfire smoke, extreme heat, flooding, displacement — do not fall equally. My research makes those patterns legible and builds the case for policy that addresses root causes rather than symptoms.',
    quote: '"The unequal nature of those impacts demands attention to the root causes of climate-related suffering."',
  },
  {
    id: 'urban-health',
    title: 'Urban Health',
    description: 'How the built environment shapes human health. Walkability, green space, housing density, transit access — design choices that determine whether healthy choices are easy choices.',
  },
  {
    id: 'metro-sapiens',
    title: 'Metro Sapiens & Sustainable Urbanism',
    description: 'We are becoming an urban species — more than half of humanity now lives in cities. That habitat can sustain the planet\'s life support systems or degrade them. Understanding it, designing it well, and making it equitable is the challenge of our century.',
  },
]

export default function ThemeCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-px" style={{ border: '1px solid #E5E5E0', backgroundColor: '#E5E5E0' }}>
      {themes.map((t) => (
        <div key={t.id} className="p-6"
          style={{ backgroundColor: t.highlight ? '#1A1A1A' : '#FFFFFF' }}>
          <h3 className="text-base font-semibold mb-2"
            style={{ color: t.highlight ? '#FFFFFF' : '#1A1A1A' }}>
            {t.title}
          </h3>
          <p className="text-sm leading-relaxed"
            style={{ color: t.highlight ? '#A0A0A0' : '#4A4A4A' }}>
            {t.description}
          </p>
          {t.quote && (
            <blockquote className="mt-4 pl-3 text-sm italic leading-relaxed"
              style={{ color: '#4A4A4A', borderLeft: '2px solid #E5E5E0' }}>
              {t.quote}
            </blockquote>
          )}
        </div>
      ))}
    </div>
  )
}
