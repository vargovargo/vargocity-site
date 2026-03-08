/**
 * strava-login.js
 * One-time OAuth flow to get a valid refresh token from Strava.
 *
 * Usage: node scripts/strava-login.js
 *
 * 1. Opens (or prints) the Strava auth URL
 * 2. Listens on localhost:8888 for the callback
 * 3. Exchanges the code for tokens and writes them to .env
 */

import { readFileSync, writeFileSync } from 'fs'
import { createServer } from 'http'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = resolve(__dirname, '../.env')

const REDIRECT_URI = 'http://localhost:8888/callback'
const SCOPE = 'activity:read_all'

function parseEnv(raw) {
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function serializeEnv(env) {
  return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'
}

async function main() {
  let envRaw
  try {
    envRaw = readFileSync(ENV_PATH, 'utf8')
  } catch {
    throw new Error('.env not found. Copy .env.example to .env and fill in CLIENT_ID and CLIENT_SECRET.')
  }

  const env = parseEnv(envRaw)
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = env

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in .env')
  }

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`

  console.log('\nOpen this URL in your browser:\n')
  console.log(authUrl)
  console.log('\nWaiting for callback on http://localhost:8888 ...\n')

  // Try to open in browser automatically
  const { execSync } = await import('child_process')
  try { execSync(`open "${authUrl}"`) } catch { /* ignore if open fails */ }

  await new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, 'http://localhost:8888')
      if (url.pathname !== '/callback') {
        res.end('Not found')
        return
      }

      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')

      if (error) {
        res.end(`<h2>Authorization denied: ${error}</h2>`)
        server.close()
        reject(new Error(`Strava authorization denied: ${error}`))
        return
      }

      if (!code) {
        res.end('<h2>No code received</h2>')
        server.close()
        reject(new Error('No authorization code in callback'))
        return
      }

      console.log('Authorization code received. Exchanging for tokens...')

      try {
        const tokenRes = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
          }),
        })

        if (!tokenRes.ok) {
          const text = await tokenRes.text()
          throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`)
        }

        const data = await tokenRes.json()
        env.STRAVA_ACCESS_TOKEN = data.access_token
        env.STRAVA_REFRESH_TOKEN = data.refresh_token
        writeFileSync(ENV_PATH, serializeEnv(env))

        console.log('Tokens saved to .env')
        console.log(`  Athlete: ${data.athlete?.firstname} ${data.athlete?.lastname}`)
        console.log(`  Access token expires: ${new Date(data.expires_at * 1000).toLocaleString()}`)

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<h2>Success! Tokens saved. You can close this tab.</h2>')
        server.close()
        resolve()
      } catch (err) {
        res.end(`<h2>Error: ${err.message}</h2>`)
        server.close()
        reject(err)
      }
    })

    server.listen(8888, () => {})
    server.on('error', reject)
  })
}

main().catch(err => {
  console.error('\nError:', err.message)
  process.exit(1)
})
