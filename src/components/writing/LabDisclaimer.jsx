/**
 * Provenance note for Lab work. Shown on the Lab index and at the top of every
 * post, because most people arrive at a post from a direct link and never see
 * the index. `compact` is the in-post variant.
 *
 * Several posts carry an ad-hoc "Independent research · Work in progress" line
 * in their own markdown; this is the one consistent treatment for that.
 */
export default function LabDisclaimer({ compact = false }) {
  return (
    <div
      className={compact ? 'mb-6 pl-3' : 'mb-8 pl-3'}
      style={{ borderLeft: '2px solid var(--c-border)' }}
    >
      <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
        The Lab is where I work things out in public. These are self-assigned
        questions, run on my own time — exploratory, not peer-reviewed, and not
        the work of any employer.
        {!compact && ' The tools are built to think with, not to make decisions from.'}
        {' '}Figures change when better data lands, and when they do I say so in the post.
      </p>
    </div>
  )
}
