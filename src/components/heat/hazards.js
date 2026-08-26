/**
 * Shared typology constants and helpers.
 *
 * The tool started as heat-only and every component grew its own copy of the
 * type colours, the FIPS→state table and the overlay-filter predicates. Adding
 * wildfire made that untenable — four copies of a rule that now has to branch
 * per hazard. Everything shared lives here.
 *
 * @import { CountyRecord } from '../../types/heat-typology.js'
 */

// Re-stepped 2026-08; see the note on --c-heat-* in index.css for why.
// The three colours are deliberately identical across hazards: the series'
// whole claim is that these are the same three shapes whatever the hazard.
export const TYPE_COLORS = {
  shock:  '#B4442F',
  stress: '#E0A03C',
  shift:  '#4B7CB8',
}

export const TYPE_META = {
  shock: {
    label: 'Shock',
    color: TYPE_COLORS.shock,
    oneliner: 'Rare extremes becoming regular',
    desc: 'Rare extremes becoming regular — infrastructure built for a climate that no longer exists.',
  },
  stress: {
    label: 'Stress',
    color: TYPE_COLORS.stress,
    oneliner: 'Familiar pressure exceeding its envelope',
    desc: 'Familiar pressure exceeding its envelope — adaptations being pushed past design limits.',
  },
  shift: {
    label: 'Shift',
    color: TYPE_COLORS.shift,
    oneliner: 'The envelope reorganizing viable activity',
    desc: 'The envelope reorganizing viable activity — who can work, live, and move outdoors is changing.',
  },
}

export const STATE_ABBR = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY',
}

// ── Hazards ─────────────────────────────────────────────────────────────────

export const HAZARDS = [
  { id: 'heat',     label: 'Heat',     available: true },
  { id: 'wildfire', label: 'Wildfire', available: true },
  { id: 'flood',    label: 'Flood',    available: false },
  { id: 'drought',  label: 'Drought',  available: false },
]

export const HAZARD_IDS = HAZARDS.filter(h => h.available).map(h => h.id)

/**
 * Short eyebrow for the basis label, derived from meta rather than hardcoded —
 * these windows move when new data lands.
 *
 * The two kinds want different spans, because they make different claims:
 *   observed  "…2011-2015 vs 2021-2025 (HMS smoke plumes)" → OBSERVED 2011–2025
 *             the measurement covers the whole span.
 *   projected "…1990-2020 baseline vs 2040-2069 (ERA5 …)"  → PROJECTED 2040–2069
 *             the claim is about the future window, not the baseline it is
 *             measured against, so first-to-last would read as 1990–2069.
 */
export function basisEyebrow(meta, hazard) {
  const h = meta?.hazards?.[hazard]
  if (!h) return null
  const kind = (h.kind ?? '').toUpperCase()
  const ranges = (h.basis ?? '').match(/\d{4}\s*[-–]\s*\d{4}/g) ?? []
  if (!ranges.length) return kind || null

  const norm = r => r.replace(/\s*[-–]\s*/, '–')
  const span = h.kind === 'projected'
    ? norm(ranges[ranges.length - 1])
    : `${ranges[0].match(/\d{4}/)[0]}–${ranges[ranges.length - 1].match(/\d{4}(?!.*\d{4})/)[0]}`

  return `${kind} ${span}`.trim()
}

/** Full basis sentence, straight from the pipeline. Never hardcode these. */
export function basisText(meta, hazard) {
  return meta?.hazards?.[hazard]?.basis ?? null
}

// ── The three distinct "no type" states ─────────────────────────────────────
// Do not collapse these. A county with no data is not a county with minimal
// exposure is not a county whose trend has no direction.

export const NO_DATA = 'no-data'                 // hazards[h] === null (10 counties)
export const MINIMAL = 'minimal_exposure'        // 213 counties
export const NO_SIGNAL = 'no_directional_signal' // 6 counties

/**
 * Classify a county's record for one hazard.
 * @returns {{ state: 'typed'|'no-data'|'minimal_exposure'|'no_directional_signal', record: object|null }}
 */
export function hazardState(county, hazard) {
  const rec = county?.hazards?.[hazard] ?? null
  if (!rec) return { state: NO_DATA, record: null }
  if (rec.dominant == null) {
    return { state: rec.unclassified_reason ?? NO_SIGNAL, record: rec }
  }
  return { state: 'typed', record: rec }
}

export const UNTYPED_COPY = {
  [NO_DATA]:   { short: 'no data',            long: 'No wildfire data for this county boundary vintage.' },
  [MINIMAL]:   { short: 'minimal exposure',   long: 'Too little smoke exposure in either window to classify.' },
  [NO_SIGNAL]: { short: 'no clear trend',     long: 'Exposure present, but no directional signal between windows.' },
}

// ── Confidence ──────────────────────────────────────────────────────────────
// Wildfire confidence is much lower than heat, and the low-confidence mass sits
// exactly where the interesting story is: 76% of wildfire shock counties score
// below 0.20, and New York County is 0.060 — a near three-way tie. That is not
// a defect; a county mid-transition *should* sit near the middle of the simplex.
// But painting it the same solid red as a 0.8-confidence county asserts more
// than the data supports, so colour is scaled by confidence and anything under
// MIXED reads as mixed rather than as a type.

export const CONFIDENCE_FULL = 0.30
export const CONFIDENCE_MIXED = 0.15

/** Map fill opacity: full chroma at >= CONFIDENCE_FULL, washing out below it. */
export function confidenceOpacity(confidence) {
  const c = confidence ?? 0
  return Math.min(0.92, 0.22 + Math.min(c, CONFIDENCE_FULL) * (0.70 / CONFIDENCE_FULL))
}

export const isMixed = (confidence) => (confidence ?? 0) < CONFIDENCE_MIXED

// ── Overlay filters ─────────────────────────────────────────────────────────
// SoVI and community resilience are county attributes, not heat attributes, but
// the schema still nests them under hazards.heat.metrics. Read them from there
// regardless of the active hazard; promoting them to the county root would be a
// breaking schema change.

const sovi = c => c?.hazards?.heat?.metrics?.sovi_score
const resl = c => c?.hazards?.heat?.metrics?.resl_score

// Both cuts are the 75th percentile over the 3,099 counties carrying wildfire
// data. Shipped as fixed constants rather than recomputed at render time: the
// typed-only population gives 0.345 / 39 and the count would drift.
export const FRONTLINE_SHARE_P75 = 0.344
export const HEAVY_DAYS_P75 = 37

export const FILTERS = {
  heat: [
    { id: null,              label: 'All counties',    note: null },
    { id: 'high-sovi',       label: 'SoVI ≥ 70',       note: 'High social vulnerability' },
    { id: 'low-resilience',  label: 'Resilience ≤ 40', note: 'Low community resilience' },
    {
      id: 'double-burden',
      label: 'Double burden',
      note: 'Stress ≥ 0.5 · SoVI ≥ 70 · Resilience ≤ 40',
      caption: 'Heat stress correlates +0.43 with social vulnerability and −0.36 with community resilience. The places that most need to extend their infrastructure past its limits are the least positioned to do it.',
    },
  ],
  wildfire: [
    { id: null,              label: 'All counties',    note: null },
    { id: 'high-sovi',       label: 'SoVI ≥ 70',       note: 'High social vulnerability' },
    { id: 'low-resilience',  label: 'Resilience ≤ 40', note: 'Low community resilience' },
    {
      id: 'smoke-frontline',
      label: 'Smoke × frontline workers',
      note: `Frontline share ≥ ${FRONTLINE_SHARE_P75} · ≥ ${HEAVY_DAYS_P75} heavy-smoke days per resident, 2021–25 (both 75th percentile)`,
      // This one has to travel with the filter. Smoke exposure and frontline
      // share are statistically independent (r = −0.036), the opposite of the
      // heat result — so this marks an intersection, not a pattern.
      caption: 'An intersection, not a correlation: smoke exposure and frontline-worker share are statistically independent (r = −0.04). These 164 counties are concentrated in the northern agricultural and manufacturing belt — Iowa, Wisconsin, Nebraska, Minnesota — under the Canadian smoke track, not the West. Frontline here is ACS C24050: natural resources/construction/maintenance plus production/transportation/material moving — people who work outdoors or indoors without adequate ventilation.',
    },
  ],
}

/** @param {CountyRecord} county */
export function countyMatchesFilter(county, hazard, filter) {
  if (!filter) return true
  if (filter === 'high-sovi')      return sovi(county) >= 70
  if (filter === 'low-resilience') return resl(county) <= 40
  if (filter === 'double-burden') {
    return county?.hazards?.heat?.scores?.stress >= 0.5 && sovi(county) >= 70 && resl(county) <= 40
  }
  if (filter === 'smoke-frontline') {
    const m = county?.hazards?.wildfire?.metrics
    if (!m) return false
    return m.frontline_share >= FRONTLINE_SHARE_P75 && m.heavy_pd_per_capita_p2 >= HEAVY_DAYS_P75
  }
  return true
}
