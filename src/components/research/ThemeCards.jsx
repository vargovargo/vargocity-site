const themes = [
  {
    id: 'technology-society',
    title: 'Technology & Society',
    description: 'The same question — who bears the cost when powerful systems shift — is live in AI in ways it hasn\'t been in anything before. The disruption is coming fast, and so is the potential to do something about it.',
  },
  {
    id: 'climate-communities',
    title: 'Climate & Communities',
    description: 'The burdens of climate change — wildfire smoke, extreme heat, flooding, displacement — don\'t fall equally. The work is making those patterns visible and building the case for policy that gets at root causes, not just symptoms.',
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
    description: 'We are becoming an urban species — more than half of humanity now lives in cities. How that habitat is designed, and for whose benefit, may be the most consequential planning question of the coming decades.',
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
