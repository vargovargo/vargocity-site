# CLAUDE.md — vargocity-site

Personal website built with React + Vite + Tailwind CSS v4.

## Project layout

```
vargocity-site/        ← repo root (also git root)
  vargocity-site/      ← actual app (nested from Vite scaffold)
    src/
      App.jsx           ← router + layout shell
      pages/            ← one file per route (HomePage, AboutPage, …)
      components/       ← subdirs per section (home, about, research, making, adventures, writing, layout, shared)
      content/          ← markdown source files
        about.md
        blog/           ← blog posts (frontmatter + body)
        newsletter/     ← newsletter posts
        vreadings/      ← reading notes
      data/             ← static JSON (countries, furniture, peaks, publications, scholar, tools)
      lib/
        loadContent.js  ← loads + parses markdown at build time via import.meta.glob
      index.css
      main.jsx
    index.html
    vite.config.js
    package.json
      data/             ← static JSON (countries, furniture, peaks, publications, scholar, tools)
```

## Routes

| Path | Page |
|------|------|
| `/` | HomePage |
| `/about` | AboutPage |
| `/research` | ResearchPage |
| `/making` | MakingPage |
| `/adventures` | AdventuresPage |
| `/writing/*` | WritingPage |

Unmatched paths redirect to `/`.

## Key tech

- **React 19** with React Router v7
- **Vite 7** — dev server and build tool
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **react-markdown** + **remark-gfm** for rendering markdown content
- **gray-matter** (available but markdown parsing is currently done manually in `loadContent.js`)
- **react-simple-maps** for map components

## Content authoring

Markdown files live in `src/content/`. Frontmatter fields:

```
---
title: "Post title"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
excerpt: "Short description"
source: ""        # for vreadings
book: ""          # for vreadings
book_author: ""   # for vreadings
---
```

Posts are loaded with `import.meta.glob` (build-time), sorted by date descending.

## Dev commands

```bash
cd vargocity-site   # enter the app directory
npm run dev         # start dev server
npm run build       # production build
npm run preview     # preview production build
npm run lint        # run ESLint
```

## Base URL

Configured via `VITE_BASE_URL` env var (defaults to `/`). Set this for subdirectory deployments.

---

## Site voice & narrative framing (established 2026-03)

The site was significantly reframed in early March 2026. Key decisions to preserve:

- **AGI as north star**: The site now leads with AGI as where Jason's work is pointing. The hero and about page open with the 25-year question about AGI's societal impact. Avoid reverting to older "climate equity" or narrow disciplinary framing.
- **"Learning how to learn"** and **"diverse viewpoints, shared values"** are two explicit organizing principles woven through the About page — keep them.
- **About page title**: "In Motion" (was "How I Got Here") — intentional, keep it.
- **Research section**: Soft title "A Career of Asking For Whom"; description names AI as the current direction alongside past climate/health work. The old "Climate Equity Research" label was deliberately retired.
- **ThemeCards**: "Technology & Society" card is first. "Climate Equity" was renamed to "Climate & Communities".
- **CareerTimeline**: No equity flag visual treatment. Language is universal but accurate. The 2019 CDPH entry is split into two: climate work (2019) and COVID-19 modeling lead (2020).
- **Mentors named in about.md**: Jonathan Patz, Joel Rogers (UW), DJ Patil (CDPH/COVID era) — these are real formative figures, keep them accurate.

## SPS peaks data (`sps-peaks.json`)

Located at `src/data/sps-peaks.json`. Structure:

```json
{
  "source": "Sierra Peak Section (SPS) Peaks List with Scrambler Ratings",
  "source_url": "...",
  "legend": { ... },
  "regions": [
    {
      "name": "Region Name",
      "peaks": [
        {
          "name": "Peak Name",
          "elevation_ft": 14000,
          "yds_rating": "3",
          "scrambling_rating": "S-2.1",
          "flags": ["emblem_peak"],
          "status": "active",
          "ascents": [          ← only present if ascended
            {
              "date": "YYYY-MM-DD",
              "notes": "free text trip notes",
              "strava_url": "https://www.strava.com/activities/..."
            }
          ]
        }
      ]
    }
  ]
}
```

- 248 total peaks across 24 regions
- 14 peaks ascended as of 2026-03 (each with date, notes, optional Strava link)
- `ascents` is an array — multiple summit dates per peak are supported
- The Adventures page reads this data to display a checklist/map of summits

## Deployment

Hosted on GitHub Pages. A `404.html` redirect hack is in place to support React Router's client-side routing on direct URL access and refresh (see `public/404.html` and the script in `index.html`).
