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

- **The "for whom" question is the north star** — not AGI specifically. AI is where that question is currently applied, not the identity. The twenty-five-year thread is what matters; terrain changes. Do not lead with AI as the headline or treat it as the destination.
- **"Learning how to learn"** and **"diverse viewpoints, shared values"** are two explicit organizing principles woven through the About page — keep them.
- **About page title**: "In Motion" (was "How I Got Here") — intentional, keep it.
- **Research section**: Soft title "A Career of Asking For Whom"; description names AI as the current direction alongside past climate/health work. The old "Climate Equity Research" label was deliberately retired.
- **ThemeCards**: "Technology & Society" card is first. "Climate Equity" was renamed to "Climate & Communities".
- **CareerTimeline**: No equity flag visual treatment. Language is universal but accurate. The 2019 CDPH entry is split into two: climate work (2019) and COVID-19 modeling lead (2020).
- **Mentors named in about.md**: Jonathan Patz, Joel Rogers (UW), DJ Patil (CDPH/COVID era) — these are real formative figures, keep them accurate.

---

## Writing voice & tone

### The problem to avoid
The site should feel like a thoughtful person's personal site — not a LinkedIn profile or a startup founder's manifesto. Competence and creativity come through in specificity and warmth, not proclamations. When copy sounds like it could appear in a consulting firm's brochure or a VC blog post, rewrite it.

**Pull back from:**
- Grand declarations about AI and "defining-generation" framing
- Theatrical pivots: "That's where I'm pointed," "Now I'm turning it toward X"
- Sentences that lead with credentials instead of curiosity
- Chest-puffing in the Making section: "If something useful doesn't exist, build it" → warmer, more specific

**Lean into:**
- Specific people, places, and moments — Joel Rogers choosing Madison for its public parks; field work in Bogotá studying transit and libraries; being among the first friends to have an iPod or iPhone
- Questions over declarations; curiosity over conclusions
- "We" and community alongside "I" — the work happened with and for people
- The gap between what research produces and what communities can use — that tension is where the most interesting work lives

### Core values to surface
These should come through in how things are described, not as explicit claims:

- **Patience & humility**: "Things only grow if you bless them with your patience" (First Aid Kit). Work that matters takes time. Interventions that work require trust.
- **Public goods as a value**: The Central Park model — the best things in a city belong to everyone. 8-80 cities (Gil Peñalosa): a place is good if it works for an 8-year-old and an 80-year-old. Bogotá's public transit, parks, libraries, and bike paths as formative reference for what good public investment looks like.
- **Trust as prerequisite**: "Trust is the active ingredient in public health." The Apple Health analogy: people voluntarily share health data with a company but would laugh a state health department out of the room for asking the same thing. Trust takes forever to build and a second to lose. Relevant to AI.
- **Lifelong tinkerer, not a tech evangelist**: First iPod, first iPhone, now Claude Code — genuine enthusiasm for tools, not identity. The drive is to build things that do good, not to be early. Eagerness to explore emerging disciplinary intersections.
- **"Move purposefully and fix things"** — DJ Patil's deliberate rebuttal to Silicon Valley's "move fast and break things." This is the technology philosophy in a sentence.
- **Design as communication**: Aesthetics aren't decorative — they're how ideas reach people. Algorithmic filtering and shrinking attention spans make design more important than ever for science communication.
- **Specificity**: "Specificity is the heart of narrative" (John Hodgman; George Saunders has a version too). Vague language kills credibility. Name the city, name the year, name the person.

### Phrases worth preserving (his own words)
Use where they fit naturally — don't force them:
- **"right now used to be the future"** — his framing on technology and time (his best tweet, he thinks)
- **"the future happens here first"** — his feeling about California (Newsom's SF era; Ezra Klein's version: "the future is already here, it's just unevenly distributed")
- **"trust is the active ingredient in public health"**
- **"things only grow if you bless them with your patience"**
- **"learning how to learn"** — his honest description of what a chemical engineering degree actually taught him
- **"move purposefully and fix things"** — DJ Patil

### Specific copy notes by section
- **Hero**: The current last two sentences announce rather than invite. The opening line ("measuring my own rate of change") is strong — personal, a little playful. The close should match that register.
- **About page**: Best-written section on the site. First paragraph is the most declaratory — consider making it more exploratory. The rest of the body is already close to the right voice.
- **Making card**: Could be warmer and more specific about why making matters to him (communication, not just capability).
- **Adventures**: Good — specific and honest about limits. The SPS description in AdventuresPage.jsx is earned, not boastful.

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
