export default function HeroSection() {
  return (
    <section className="pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs font-medium tracking-widest uppercase mb-6"
          style={{ color: 'var(--c-text-muted)' }}>
          Jason Vargo
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl"
          style={{ color: 'var(--c-text)' }}>
          measuring my own<br />rate of change
        </h1>
        <p className="mt-6 text-base leading-relaxed max-w-xl" style={{ color: 'var(--c-text-body)' }}>
          The question has been the same for twenty-five years, just wearing different clothes:
          when things shift, who gets left? Urban heat, wildfire smoke, a pandemic, economic
          disruption — the pattern holds. The terrain changes. The question doesn't. Right now
          it's turned toward AI, which might be the first disruption that could answer it differently.
        </p>
      </div>
    </section>
  )
}
