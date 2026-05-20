/** @import { HeatTypologyData } from '../types/heat-typology.js' */

const EXPECTED_SCHEMA_VERSION = 'heat-typology-v1'

/** @type {HeatTypologyData|null} */
let cache = null

/**
 * Fetches and caches heat-counties-panel.json.
 * Throws if schema_version doesn't match — catches pipeline/website drift early.
 * @returns {Promise<HeatTypologyData>}
 */
export async function loadHeatTypologyData() {
  if (cache) return cache

  const base = import.meta.env.BASE_URL || '/'
  const url = `${base}data/heat-counties-panel.json`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch heat data: ${res.status} ${res.statusText}`)

  const data = await res.json()

  if (data.schema_version !== EXPECTED_SCHEMA_VERSION) {
    throw new Error(
      `heat-counties-panel.json schema mismatch: expected "${EXPECTED_SCHEMA_VERSION}", got "${data.schema_version}". ` +
      `Regenerate the JSON from the pipeline or update EXPECTED_SCHEMA_VERSION in heat-data.js.`
    )
  }

  cache = data
  return data
}
