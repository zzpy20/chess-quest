const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

const LABELS_KEY = 'admin:labels'
const TTL = 60 * 60 * 24 * 730

const DEFAULT_PROGRESS = {
  stars: 0, badges: [], piecesLearned: {}, questsCompleted: [],
  checkmateSolved: [], checkmate2Solved: [], streak: 0, lastActiveDate: null, totalMinutes: 0,
}

async function getLabels(env) {
  try {
    const data = await env.CHESS_PROGRESS.get(LABELS_KEY)
    return data ? JSON.parse(data) : {}
  } catch { return {} }
}

async function setLabel(env, pin, label) {
  const labels = await getLabels(env)
  if (label) { labels[pin] = label } else { delete labels[pin] }
  await env.CHESS_PROGRESS.put(LABELS_KEY, JSON.stringify(labels))
}

function summarize(pin, p, label) {
  const aiGames = (p.gameLog || []).filter(g => g.mode === 'ai')
  const aiWins = aiGames.filter(g => g.result === 'win').length
  return {
    pin,
    label: label || null,
    stars: p.stars || 0,
    streak: p.streak || 0,
    lastActiveDate: p.lastActiveDate || null,
    totalMinutes: p.totalMinutes || 0,
    piecesMastered: (p.badges || []).filter(b => b.startsWith('piece-')).length,
    questsDone: (p.questsCompleted || []).length,
    mate1Done: (p.checkmateSolved || []).length,
    mate2Done: (p.checkmate2Solved || []).length,
    gamesPlayed: (p.gameLog || []).length,
    aiWinRate: aiGames.length ? Math.round((aiWins / aiGames.length) * 100) : null,
  }
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const secret = env.ADMIN_SECRET
  const auth = request.headers.get('Authorization') || ''
  if (!secret || auth !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)

  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'accounts'
  const pin = url.searchParams.get('pin')

  // ── GET ────────────────────────────────────────────────────────────────────

  if (request.method === 'GET') {
    if (action === 'accounts') {
      const [list, labels] = await Promise.all([
        env.CHESS_PROGRESS.list({ prefix: 'progress:' }),
        getLabels(env),
      ])
      const accounts = await Promise.all(
        list.keys.map(async ({ name }) => {
          const p = name.replace('progress:', '')
          const data = await env.CHESS_PROGRESS.get(name)
          if (!data) return null
          try { return summarize(p, JSON.parse(data), labels[p]) }
          catch { return null }
        })
      )
      return json({ accounts: accounts.filter(Boolean) })
    }

    if (action === 'account') {
      if (!pin || !/^\d{4,8}$/.test(pin)) return json({ error: 'invalid_pin' }, 400)
      const [data, labels] = await Promise.all([
        env.CHESS_PROGRESS.get(`progress:${pin}`),
        getLabels(env),
      ])
      if (!data) return json({ error: 'not_found' }, 404)
      try { return json({ pin, label: labels[pin] || null, progress: JSON.parse(data) }) }
      catch { return json({ error: 'parse_error' }, 500) }
    }

    return json({ error: 'unknown_action' }, 400)
  }

  // ── POST ───────────────────────────────────────────────────────────────────

  if (request.method === 'POST') {
    if (!pin || !/^\d{4,8}$/.test(pin)) return json({ error: 'invalid_pin' }, 400)

    let body = {}
    try { body = await request.json() } catch { /* no body needed for reset */ }

    if (action === 'gift') {
      const amount = parseInt(body.stars, 10)
      if (!amount || amount < 1 || amount > 9999) return json({ error: 'invalid_stars' }, 400)
      const data = await env.CHESS_PROGRESS.get(`progress:${pin}`)
      if (!data) return json({ error: 'not_found' }, 404)
      const p = JSON.parse(data)
      p.stars = (p.stars || 0) + amount
      await env.CHESS_PROGRESS.put(`progress:${pin}`, JSON.stringify(p), { expirationTtl: TTL })
      return json({ ok: true, stars: p.stars })
    }

    if (action === 'reset') {
      await env.CHESS_PROGRESS.put(`progress:${pin}`, JSON.stringify(DEFAULT_PROGRESS), { expirationTtl: TTL })
      return json({ ok: true })
    }

    if (action === 'label') {
      const label = typeof body.label === 'string' ? body.label.trim().slice(0, 32) : ''
      await setLabel(env, pin, label)
      return json({ ok: true, label: label || null })
    }

    return json({ error: 'unknown_action' }, 400)
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────

  if (request.method === 'DELETE') {
    if (!pin || !/^\d{4,8}$/.test(pin)) return json({ error: 'invalid_pin' }, 400)
    if (action === 'delete') {
      await Promise.all([
        env.CHESS_PROGRESS.delete(`progress:${pin}`),
        setLabel(env, pin, ''),
      ])
      return json({ ok: true })
    }
    return json({ error: 'unknown_action' }, 400)
  }

  return new Response('Method not allowed', { status: 405, headers: CORS })
}
