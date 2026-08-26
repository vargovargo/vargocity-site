import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LabDisclaimer from './LabDisclaimer'
import { AEITaskTrends, AEICollabTrends, AEIPrimitivesScatter, AEISummaryTable, SOC43SubgroupChart, StateScatter, StateSOC43Bar, StateThresholdChart, HawaiiSOCMix, HonoluluExposure } from './AEICharts'
import { SBIWageGap, SBIMonthlyCost, SBICostOfChild } from './SBICharts'
import { ChettyScatter } from './SocialFabricCharts'
import { SocialFabricMap } from './SocialFabricMap'
import HeatMapToggle from './HeatMapToggle'
import HeatScatterToggle from './HeatScatterToggle'

const SERIES_LABELS = {
  'heat':          'Heat in the West',
  'aei':           'Anthropic Economic Index',
  'sbi':           'Survival Budget Index',
  'social-fabric': 'Social Fabric & Infrastructure',
}

const SERIES_TOOLS = {
  'heat': { path: '/lab/heat', label: 'Heat Typology Tool' },
}

const AEI_CHARTS = {
  '/plots/task_pct_trends.png':              AEITaskTrends,
  '/plots/automation_augmentation_trends.png': AEICollabTrends,
  '/plots/primitives_scatter.png':           AEIPrimitivesScatter,
  '/plots/soc_summary_table.png':            AEISummaryTable,
  '/plots/soc43_subgroup.png':               SOC43SubgroupChart,
  '/plots/state_scatter.png':                StateScatter,
  '/plots/state_soc43_bar.png':              StateSOC43Bar,
  '/plots/state_threshold.png':              StateThresholdChart,
  '/plots/sbi_wage_gap.png':                 SBIWageGap,
  '/plots/sbi_monthly_cost.png':             SBIMonthlyCost,
  '/plots/sbi_cost_of_child.png':            SBICostOfChild,
  '/plots/chetty_scatter.png':               ChettyScatter,
  '/plots/social_fabric_map.png':            SocialFabricMap,
  '/plots/heat-map-toggle.png':             HeatMapToggle,
  '/plots/heat-scatter-toggle.png':         HeatScatterToggle,
  '/plots/hawaii_soc_mix.png':              HawaiiSOCMix,
  '/plots/honolulu_exposure.png':           HonoluluExposure,
}

function PostImage({ src, alt }) {
  const Chart = AEI_CHARTS[src]
  if (Chart) return <Chart />
  return <img src={src} alt={alt} className="rounded" />
}

function PostParagraph({ children, ...props }) {
  // If the paragraph's only child is a chart component (rendered by PostImage),
  // unwrap it — div-in-p is invalid HTML and crashes React's render tree.
  const kids = Array.isArray(children) ? children : [children]
  if (kids.length === 1 && kids[0]?.type && typeof kids[0].type !== 'string') {
    return <>{children}</>
  }
  return <p {...props}>{children}</p>
}

function SeriesNav({ post, seriesPosts }) {
  const location = useLocation()
  if (!seriesPosts || seriesPosts.length < 2) return null

  const basePath = location.pathname.replace(/\/[^/]+$/, '')
  const idx = seriesPosts.findIndex(p => p.slug === post.slug)
  const prev = idx > 0 ? seriesPosts[idx - 1] : null
  const next = idx < seriesPosts.length - 1 ? seriesPosts[idx + 1] : null
  const label = SERIES_LABELS[post.series_slug] || post.series_slug

  return (
    <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--c-border)' }}>
      <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--c-text-muted)' }}>
        {label} · Part {post.series_order} of {seriesPosts.length}
      </p>
      <ol className="space-y-1 mb-6">
        {seriesPosts.map((p, i) => (
          <li key={p.slug} className="flex items-baseline gap-2">
            <span className="text-xs tabular-nums w-4 shrink-0 text-right" style={{ color: 'var(--c-text-muted)' }}>{i + 1}.</span>
            {p.slug === post.slug ? (
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{p.title}</span>
            ) : (
              <Link
                to={`${basePath}/${p.slug}`}
                className="text-sm transition-colors"
                style={{ color: 'var(--c-text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
                {p.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {(prev || next) && (
        <div className="flex justify-between gap-4">
          {prev ? (
            <Link
              to={`${basePath}/${prev.slug}`}
              className="flex-1 text-sm transition-colors group"
              style={{ color: 'var(--c-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
              <span className="text-xs block mb-0.5">← Previous</span>
              <span>{prev.title}</span>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link
              to={`${basePath}/${next.slug}`}
              className="flex-1 text-sm text-right transition-colors"
              style={{ color: 'var(--c-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
              <span className="text-xs block mb-0.5">Next →</span>
              <span>{next.title}</span>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  )
}

export default function MarkdownPost({ post, backPath, backLabel, seriesPosts }) {
  if (!post) return (
    <div className="max-w-2xl py-16">
      <p className="text-sm mb-4" style={{ color: 'var(--c-text-body)' }}>That post doesn't exist — it may have moved or the URL is wrong.</p>
      <Link to={backPath || '/lab'} className="text-sm transition-colors" style={{ color: 'var(--c-text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
        ← {backLabel || 'Back to Lab'}
      </Link>
    </div>
  )
  return (
    <article className="max-w-2xl">
      <div className="mb-8">
        <Link to={backPath}
          className="text-xs transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
          ← {backLabel}
        </Link>
        {SERIES_TOOLS[post.series_slug] && (
          <Link
            to={SERIES_TOOLS[post.series_slug].path}
            className="ml-3 inline-flex items-center text-xs px-2.5 py-1 rounded-full border transition-opacity hover:opacity-70"
            style={{
              color: 'var(--c-text-muted)',
              borderColor: 'var(--c-border)',
              backgroundColor: 'var(--c-surface)',
            }}
          >
            {SERIES_TOOLS[post.series_slug].label} →
          </Link>
        )}
      </div>

      {post.book && (
        <div className="mb-4 px-4 py-3 rounded"
          style={{ backgroundColor: 'var(--c-card-hover)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{post.book}</p>
          <p className="text-xs" style={{ color: 'var(--c-text-body)' }}>{post.book_author}</p>
        </div>
      )}

      {seriesPosts && seriesPosts.length > 1 && (
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--c-text-muted)' }}>
          {SERIES_LABELS[post.series_slug] || post.series_slug} · Part {post.series_order} of {seriesPosts.length}
        </p>
      )}
      <h1 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: 'var(--c-text)' }}>
        {post.title}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
        {post.date}
        {post.source === 'newsletter' && ' · Originally sent via TinyLetter'}
      </p>

      <LabDisclaimer compact />

      <div className="prose prose-sm max-w-none themed-prose"
        style={{ lineHeight: '1.75' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: PostImage, p: PostParagraph }}>
          {post.content}
        </ReactMarkdown>
      </div>

      <SeriesNav post={post} seriesPosts={seriesPosts} />
    </article>
  )
}
