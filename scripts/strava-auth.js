/**
 * strava-auth.js
 * Handles Strava OAuth2 token refresh.
 * Reads credentials from .env in the repo root.
 *
 * Required .env keys:
 *   STRAVA_CLIENT_ID
 *   STRAVA_CLIENT_SECRET
 *   STRAVA_REFRESH_TOKEN
 *
 * Optional (will be refreshed automatically if stale):
 *   STRAVA_ACCESS_TOKEN
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = resolve(__dirname, '../.env')

function parseEnv(raw) {
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = val
  }
  return env
}

function serializeEnv(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n'
}

export async function getAccessToken() {
  let envRaw
  try {
    envRaw = readFileSync(ENV_PATH, 'utf8')
  } catch {
    throw new Error(`.env not found at ${ENV_PATH}. Create it with STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN.`)
  }

  const env = parseEnv(envRaw)
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = env

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    throw new Error('Missing required .env keys: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN')
  }

  console.log('Refreshing Strava access token...')
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const { access_token, refresh_token: new_refresh } = data

  // Persist updated tokens back to .env
  env.STRAVA_ACCESS_TOKEN = access_token
  if (new_refresh && new_refresh !== STRAVA_REFRESH_TOKEN) {
    env.STRAVA_REFRESH_TOKEN = new_refresh
    console.log('Refresh token rotated — updated in .env')
  }
  writeFileSync(ENV_PATH, serializeEnv(env))
  console.log('Access token refreshed and saved to .env')

  return access_token
}
