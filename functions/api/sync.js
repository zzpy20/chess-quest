const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const pin = new URL(request.url).searchParams.get('pin')
  if (!pin || !/^\d{4,8}$/.test(pin)) return json({ error: 'invalid_pin' }, 400)

  const key = `progress:${pin}`

  if (request.method === 'GET') {
    const data = await env.CHESS_PROGRESS.get(key)
    return json({ progress: data ? JSON.parse(data) : null })
  }

  if (request.method === 'POST') {
    let body
    try { body = await request.text(); JSON.parse(body) }
    catch { return json({ error: 'invalid_json' }, 400) }
    // Store for 2 years
    await env.CHESS_PROGRESS.put(key, body, { expirationTtl: 60 * 60 * 24 * 730 })
    return json({ ok: true })
  }

  if (request.method === 'DELETE') {
    await env.CHESS_PROGRESS.delete(key)
    return json({ ok: true })
  }

  return new Response('Method not allowed', { status: 405, headers: CORS })
}
