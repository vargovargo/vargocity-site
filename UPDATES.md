# Website Updates — Running List

_Last updated: March 13, 2026_

---

## Features / UI

- [x] Add **region tab** to Peaks section to enable filtering/viewing by region
- [x] **Decade tabs on globe/map** — tabs above the map (80s · 90s · 00s · 10s · 20s) filtering countries by visit decade
- [x] Bring back **Citations** as its own counter (separate from other stats)
- [x] Peaks page toggle — show only climbed peaks or full SPS list, default to climbed only

---

## Content — Press

- [ ] [Smithsonian Magazine — "Humans Are Becoming City-Dwelling Metro Sapiens"](https://www.smithsonianmag.com/science-nature/humans-are-becoming-city-dwelling-metro-sapiens-180953449/) _(in Media & Press — needs context added)_
- [x] [NPR — "As More Adults Pedal, Biking Injuries and Deaths Are Spiking Too"](https://www.npr.org/sections/health-shots/2015/09/02/436662737/as-more-adults-pedal-their-biking-injuries-and-deaths-are-spiking-too)
- [x] [Madison.com — "UW-Madison, Monona to Collaborate on..."](https://madison.com/news/local/focus-on-dane-county-uw-madison-monona-to-collaborate-on/article_e28b7b44-4387-5ed0-ba75-57d44f524de7.html)
- [ ] [YouTube — University Alliance at UW-Madison](https://youtu.be/0lc5F0M_cjE?si=bcJUzuDM8Us3KMd-) — pair with Madison.com article as a single timeline entry
- [x] [Bloomberg — "Cycling Deaths Among Children Have Plummeted"](https://www.bloomberg.com/news/articles/2015-08-13/cycling-deaths-among-children-have-plummeted)
- [x] Scientific American — "How People Make the Summer Hotter" (Nov 2014)
- [ ] Wisconsin Public Radio — bicycle safety / cycling deaths (Aug 2015) — _find URL_
- [ ] The Courier-Journal — urban heat in Louisville neighborhoods (June 2014) — _find URL_

**Dead link:** NASA Applied Sciences — "Watching Wildfire Smoke Impacts for Healthier Communities" — 404, find replacement or remove

### Press placement notes
- Notable pieces (Bloomberg, Smithsonian) embedded in career timeline where tied to specific work
- Lead with Jason's angle/contribution, not just the outlet name
- UW initiative: single timeline entry combining Madison.com article + YouTube video

---

## Pre-launch checklist

- [x] France not showing up in the map
- [x] Add SEO — canonical, og:url, JSON-LD Person schema, robots.txt, sitemap.xml, per-page titles
- [x] Favicon — svg, .ico, apple-touch-icon.png
- [x] Site name changed to "vargocity" in nav and browser tab
- [x] Dark mode (alpine) CSS — writing page fixed; all themes now use CSS custom properties throughout
- [x] Gratitude-app card on making page
- [x] Strava print card on making page
- [x] Register vargo.city and configure GitHub Pages
- [x] Group peaks timeline by year
- [ ] Update citation counts
- [x] Submit sitemap to Google Search Console

---

## Copy / Tone

- [x] Sitewide tone revision — pulled back AI framing, leaned into human impact, curiosity, and community; revised homepage cards, about page, hero copy, making card, adventures card (March 2026)
- [ ] **AEI research graphics** — plots on the `/writing/blog/2026-03-13-aei-longitudinal` post are not up to the standard the rest of the site implies. For a site that leads with data viz as a strength, the current PNGs undercut the argument. Needs a proper visual redesign before broad rollout. See GitHub repo: [vargovargo/economic-index-trends](https://github.com/vargovargo/economic-index-trends).
- [ ] Remaining copy pass — hero closing lines still announce rather than invite (per CLAUDE.md notes); about page first paragraph most declaratory section remaining

---

## Strava Elevation Pipeline

- [x] Phase 1: `scripts/strava-auth.js`
- [x] Phase 2: `scripts/enrich-peaks.js`
- [x] Phase 3: SVG sparklines
- [x] Phase 4: Site component updates (PeakGrid, PeakTimeline, ElevationChart, PeakRegionList)
- [ ] Phase 5: README "Data Pipeline" section

---

## Notes / Future

- **Review 2010s travel** — verify countries.json has all visits from that decade
- London December 2013 and April 2015 still to add
