/**
 * generate-sitemap.js
 *
 * Writes public/sitemap.xml from the actual routes and content on disk.
 *
 * The hand-maintained version drifted badly: it still listed /writing and
 * /writing/blog/* five months after those routes were renamed to /lab and
 * /lab/posts/*, and carried 1 of 17 Lab posts. A sitemap advertising dead
 * URLs is worse than no sitemap, so this is generated as part of the build
 * and committed, which makes route changes visible in the diff.
 *
 * Usage:
 *   node scripts/generate-sitemap.js            # write public/sitemap.xml
 *   node scripts/generate-sitemap.js --check    # exit 1 if out of date (CI)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BLOG_DIR = resolve(ROOT, 'src/content/blog')
const OUT = resolve(ROOT, 'public/sitemap.xml')
const ORIGIN = 'https://vargo.city'

const CHECK = process.argv.includes('--check')

// Static routes, mirroring App.jsx and LabPage.jsx. /gratitude-opt-in is
// deliberately omitted — it is a private family signup, not content.
const STATIC_ROUTES = [
  { path: '/',           changefreq: 'monthly', priority: '1.0' },
  { path: '/about',      changefreq: 'monthly', priority: '0.9' },
  { path: '/research',   changefreq: 'monthly', priority: '0.9' },
  { path: '/lab',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/lab/heat',   changefreq: 'monthly', priority: '0.8' },
  { path: '/adventures', changefreq: 'monthly', priority: '0.8' },
  { path: '/making',     changefreq: 'monthly', priority: '0.8' },
]

/** Pull `date` out of a post's frontmatter. Same shape loadContent.js parses. */
function frontmatterDate(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const line = m[1].split('\n').find(l => l.trim().startsWith('date:'))
  if (!line) return null
  const val = line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '')
  return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : null
}

const posts = readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => ({
    slug: f.replace(/\.md$/, ''),
    date: frontmatterDate(readFileSync(resolve(BLOG_DIR, f), 'utf8')),
  }))
  .sort((a, b) => b.slug.localeCompare(a.slug)) // newest first, stable ordering

const newest = posts.reduce((max, p) => (p.date > max ? p.date : max), '')

const entries = [
  ...STATIC_ROUTES.map(r => ({
    loc: r.path === '/' ? `${ORIGIN}/` : `${ORIGIN}${r.path}`,
    // Lab index moves whenever a post lands; the rest have no meaningful date.
    lastmod: r.path === '/lab' ? newest : null,
    changefreq: r.changefreq,
    priority: r.priority,
  })),
  ...posts.map(p => ({
    loc: `${ORIGIN}/lab/posts/${p.slug}`,
    lastmod: p.date,
    changefreq: 'yearly',
    priority: '0.7',
  })),
]

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(e => [
    '  <url>',
    `    <loc>${e.loc}</loc>`,
    ...(e.lastmod ? [`    <lastmod>${e.lastmod}</lastmod>`] : []),
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n')

if (CHECK) {
  const current = readFileSync(OUT, 'utf8')
  if (current !== xml) {
    console.error('sitemap.xml is out of date — run: node scripts/generate-sitemap.js')
    process.exit(1)
  }
  console.log(`sitemap.xml up to date (${entries.length} URLs)`)
} else {
  writeFileSync(OUT, xml)
  console.log(`sitemap.xml written — ${entries.length} URLs (${posts.length} posts)`)
}
