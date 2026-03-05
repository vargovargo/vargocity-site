export default function HeroSection() {
  return (
    <section className="pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs font-medium tracking-widest uppercase mb-6"
          style={{ color: '#8A8A8A' }}>
          Jason Vargo
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl"
          style={{ color: '#1A1A1A' }}>
          measuring my own<br />rate of change
        </h1>
        <p className="mt-6 text-base leading-relaxed max-w-xl" style={{ color: '#4A4A4A' }}>
          For twenty-five years I've been asking the same question across different problems:
          when powerful systems shift, who bears the cost? I've tracked it through urban heat,
          wildfire smoke, COVID, and economic disruption. The pattern holds — big disruptions
          land hardest on people with the least cushion. AI looks like the next one. But unlike
          most disruptions, it might also be the biggest equalizer we've ever had access to.
          Whether that happens depends on who's paying attention.
        </p>
        <p className="mt-3 text-sm" style={{ color: '#8A8A8A' }}>
          Senior Researcher · Federal Reserve Bank of San Francisco
        </p>
      </div>
    </section>
  )
}
