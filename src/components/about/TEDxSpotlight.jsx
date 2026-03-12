export default function TEDxSpotlight() {
  return (
    <div style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}
      className="rounded-sm p-6 sm:p-8">
      <p className="text-xs font-medium tracking-widest uppercase mb-4"
        style={{ color: 'var(--c-text-muted)' }}>
        TEDx Talk · 2013
      </p>
      <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--c-text)' }}>
        Our Urban Nature
      </h3>
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--c-text-body)' }}>
        At TEDxUWMadison, I argued that urbanization — the defining trend of our time —
        is an opportunity, not just a challenge. Cities must both sustain the planet's
        life support systems and improve people's lives. The two goals are the same goal.
      </p>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/7B9hSUXmTP8"
          title="Our Urban Nature — TEDxUWMadison"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
