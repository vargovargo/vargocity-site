# Changelog

All notable changes to vargocity-site are documented here.

## [0.0.1.0] - 2026-06-03

### Added
- **Social Fabric series posts 3 & 4** — "The Social Fabric, Mapped" (post 3, with interactive county-level map) and "Place, Displaced" (post 4, on platform indifference and the AI fork)
- **Heat series post 4** — "Who Can't Afford to Adapt": equity analysis across shock/stress/shift counties with double-burden map and scatter chart
- **SocialFabricMap component** — interactive choropleth map of 3,222 U.S. counties with toggleable dimensions (Social Fabric Score, Institutional Access, Civic Life, Community Connections) and hover tooltips
- **HeatMapToggle component** — interactive map showing double-burden counties by heat type, toggled by shock/stress/shift
- **HeatScatterToggle component** — scatter chart of heat type scores vs. social vulnerability or community resilience with regression line
- **Heat type CSS custom properties** — `--c-heat-shock`, `--c-heat-stress`, `--c-heat-shift` and soft background variants for theme-safe button and map styling
- **Vitest test suite** — bootstrapped with @testing-library/react; 6 tests covering HeatMapToggle and SocialFabricMap rendering and interaction

### Fixed
- Fetch error handling in HeatMapToggle and HeatScatterToggle (silent hang on data load failure → graceful empty state)
- Stale footer promise in "Place, Displaced" (no longer promises the county map as coming — it already exists in post 3)
- Duplicate italic subhead in Heat post 4 (was identical to excerpt)
- Social fabric county count in SocialFabricMap footer (now dynamic from data, was hardcoded 3,213)

### Changed
- Heat type button backgrounds now use CSS custom properties (`--c-heat-*-bg`) instead of hardcoded hex opacity
- Social Fabric post 3: tightened "this is what that picture looks like" → "this is what that index looks like"
- "Place, Displaced": compressed redundant newspaper-closure paragraph (2,500 closures stat already established in post 1); tempered AI assertion to stay grounded in the index's findings
- Heat post 4: added bridging sentence before scatter chart to contextualize what it shows across 2,992 counties; new italic subhead distinct from excerpt
