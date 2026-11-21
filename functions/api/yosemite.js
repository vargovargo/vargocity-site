// Yosemite trip survey — Cloudflare Pages Function.
// Storage: KV namespace bound as YOSEMITE_KV (Pages → Settings → Bindings).
// One key per phone, `vote:<deviceId>`, so answering again overwrites.
// Counts aren't stored; GET tallies the votes each time.

// Keep in sync with QUESTIONS in public/yosemite/index.html.
const OPTIONS = {
  hike: ['mirror-lake', 'yosemite-falls', 'glacier-point', 'mist-trail'],
  fall: ['yosemite', 'vernal', 'nevada', 'bridalveil', 'horsetail'],
  film: ['free-solo', 'dawn-wall'],
}
// Questions with a free-text "suggest another" box, stored as suggest_<id>.
const SUGGEST = ['hike', 'film']
const PREFIX = 'vote:'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

const emptyCounts = () =>
  Object.fromEntries(Object.entries(OPTIONS).map(([q, opts]) => [q, Object.fromEntries(opts.map((o) => [o, 0]))]))

export async function onRequestGet({ request, env }) {
  const kv = env.YOSEMITE_KV
  if (!kv) return json({ error: 'not_configured' }, 503)
  const me = PREFIX + (new URL(request.url).searchParams.get('me') || '')

  const counts = emptyCounts()
  const suggestions = Object.fromEntries(SUGGEST.map((q) => [q, []]))
  let respondents = 0
  let mine = false
  let cursor
  do {
    const page = await kv.list({ prefix: PREFIX, cursor })
    if (page.keys.some((k) => k.name === me)) mine = true
    const votes = await Promise.all(page.keys.map((k) => kv.get(k.name, 'json')))
    for (const v of votes) {
      if (!v) continue
      respondents++
      for (const q of Object.keys(OPTIONS)) if (v[q] in counts[q]) counts[q][v[q]]++
      for (const q of SUGGEST) if (v[`suggest_${q}`]) suggestions[q].push(v[`suggest_${q}`])
    }
    cursor = page.list_complete ? null : page.cursor
  } while (cursor)

  // `mine` lets the page add its own just-saved answers if KV's listing hasn't caught up yet.
  return json({ counts, suggestions, respondents, mine })
}

export async function onRequestPost({ request, env }) {
  const kv = env.YOSEMITE_KV
  if (!kv) return json({ error: 'not_configured' }, 503)

  let b
  try {
    b = await request.json()
  } catch {
    return json({ error: 'bad_json' }, 400)
  }

  const deviceId = String(b.deviceId ?? '')
  if (!/^[A-Za-z0-9-]{8,64}$/.test(deviceId)) return json({ error: 'bad_device' }, 400)

  const answers = {}
  for (const [q, opts] of Object.entries(OPTIONS)) {
    const a = b[q] ?? ''
    if (a && !opts.includes(a)) return json({ error: 'bad_answer', question: q }, 400)
    answers[q] = a
  }
  for (const q of SUGGEST) {
    answers[`suggest_${q}`] = String(b[`suggest_${q}`] ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
  }
  if (!Object.values(answers).some(Boolean)) return json({ error: 'empty' }, 400)

  const key = PREFIX + deviceId
  const existing = await kv.get(key, 'json')
  const now = new Date().toISOString()
  const record = { ...answers, createdAt: existing?.createdAt ?? now, updatedAt: now }
  await kv.put(key, JSON.stringify(record))

  return json({ ok: true, vote: record })
}
