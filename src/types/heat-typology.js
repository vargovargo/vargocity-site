/**
 * JSDoc type definitions for heat-counties-panel.json (schema_version: heat-typology-v1).
 *
 * The panel classifies each US county into one of three heat-trajectory types:
 *   shock  — rare extremes becoming regular; infrastructure not designed for them
 *   stress — familiar heat exceeding its envelope; cooling adaptations being pushed past design limits
 *   shift  — heat envelope moving in ways that reorganize viable economic activity
 *
 * Each county may have scores for multiple hazards (heat, wildfire, flood).
 * Only heat is fully populated in v1; others are null.
 */

/**
 * @typedef {Object} HazardScores
 * Normalized 0–1 scores that sum to 1 across the three types.
 * @property {number} shock
 * @property {number} stress
 * @property {number} shift
 */

/**
 * @typedef {Object} HazardMetrics
 * Raw climate and vulnerability indicators driving the scores.
 * Heat-index thresholds are annual day counts. CDD = cooling degree days.
 * sovi_score = Social Vulnerability Index; resl_score = community resilience.
 * @property {number} baseline_hi85   - Historical days/year with heat index ≥ 85°F
 * @property {number} baseline_hi95   - Historical days/year with heat index ≥ 95°F
 * @property {number} baseline_hi100  - Historical days/year with heat index ≥ 100°F
 * @property {number} projected_hi85  - Projected days/year with heat index ≥ 85°F
 * @property {number} projected_hi95  - Projected days/year with heat index ≥ 95°F
 * @property {number} projected_hi100 - Projected days/year with heat index ≥ 100°F
 * @property {number} baseline_hi_cdd
 * @property {number} projected_hi_cdd
 * @property {number|null} heatwave_afreq
 * @property {number} sovi_score
 * @property {number} resl_score
 * @property {number} migration_net_5yr_pct
 */

/**
 * @typedef {'shock'|'stress'|'shift'} HeatTypologyType
 */

/**
 * @typedef {Object} HeatHazard
 * @property {HazardScores} scores
 * @property {HazardMetrics} metrics
 * @property {HeatTypologyType} dominant - The highest-scoring type
 * @property {number} confidence - Score gap between first and second place (0–1)
 */

/**
 * @typedef {Object} Hazards
 * @property {HeatHazard} heat
 * @property {null} wildfire - Not populated in v1
 * @property {null} flood    - Not populated in v1
 */

/**
 * @typedef {Object} CountyRecord
 * @property {string} county_fips    - 5-digit FIPS code (zero-padded)
 * @property {string} name           - County name (no "County" suffix)
 * @property {string} state          - 2-digit state FIPS
 * @property {number} population
 * @property {number} median_income
 * @property {Hazards} hazards
 */

/**
 * @typedef {Object} HeatTypologyData
 * Top-level payload from heat-counties-panel.json.
 * @property {string} schema_version - e.g. "heat-typology-v1"
 * @property {CountyRecord[]} counties
 */

export {}
