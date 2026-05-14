import { useState, useEffect } from 'react'

const PIECE_IDS = ['pawn', 'rook', 'bishop', 'knight', 'queen', 'king']
const AI_LEVELS = ['dragon', 'puppy', 'knight', 'lion', 'wizard']
const LEVEL_LABELS = { dragon: '🐉 Dragon', puppy: '🐶 Puppy', knight: '🏇 Knight', lion: '🦁 Lion', wizard: '🧙 Wizard' }

const fmtTime = (mins) => {
  if (!mins) return '—'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`
}

const fmtDate = (dateStr) => {
  if (!dateStr) return '—'
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

// ─── Login ─────────────────────────────────────────────────────────────────────

function Login({ onAuth }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const attempt = async () => {
    if (!pw) return
    setBusy(true)
    setError(false)
    try {
      const res = await fetch('/api/admin?action=accounts', {
        headers: { Authorization: `Bearer ${pw}` },
      })
      if (!res.ok) { setError(true); setBusy(false); return }
      const data = await res.json()
      onAuth(pw, data.accounts || [])
    } catch {
      setError(true)
    }
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-black text-white">Admin</h1>
          <p className="text-white/50 text-sm mt-1">Chess Quest</p>
        </div>
        <input
          type="password"
          placeholder="Admin password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mb-3">Wrong password</p>}
        <button
          onClick={attempt}
          disabled={busy || !pw}
          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </div>
  )
}

// ─── Game stats ────────────────────────────────────────────────────────────────

function GameStats({ gameLog }) {
  if (!gameLog.length) return (
    <div className="bg-white/5 rounded-3xl p-5 mb-5 text-white/30 text-sm text-center">
      No games logged yet — play a game with Buddy or 2-player to start tracking!
    </div>
  )

  const aiGames = gameLog.filter(g => g.mode === 'ai')
  const passGames = gameLog.filter(g => g.mode === 'pass')
  const recent = [...gameLog].reverse().slice(0, 10)

  // Per-level breakdown
  const byLevel = AI_LEVELS.map(id => {
    const games = aiGames.filter(g => g.level === id)
    const wins = games.filter(g => g.result === 'win').length
    const losses = games.filter(g => g.result === 'loss').length
    const draws = games.filter(g => g.result === 'draw').length
    const total = games.length
    const pct = total ? Math.round((wins / total) * 100) : null
    return { id, wins, losses, draws, total, pct }
  }).filter(r => r.total > 0)

  const totalAiWins = aiGames.filter(g => g.result === 'win').length
  const overallWinRate = aiGames.length ? Math.round((totalAiWins / aiGames.length) * 100) : null

  const resultStyle = (r) => {
    if (r === 'win' || r === 'white') return 'text-green-300 font-bold'
    if (r === 'loss' || r === 'black') return 'text-red-300 font-bold'
    return 'text-yellow-300 font-bold'
  }
  const resultLabel = (g) => {
    if (g.mode === 'ai') return g.result === 'win' ? 'Win' : g.result === 'loss' ? 'Loss' : 'Draw'
    return g.result === 'white' ? 'White won' : g.result === 'black' ? 'Black won' : 'Draw'
  }

  return (
    <div className="bg-white/10 rounded-3xl p-5 mb-5">
      <h2 className="text-white font-black text-sm mb-4 uppercase tracking-wider">Game History</h2>

      {/* Overall summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-black text-white">{aiGames.length}</div>
          <div className="text-white/50 text-xs mt-0.5">vs AI</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-black text-green-300">
            {overallWinRate !== null ? `${overallWinRate}%` : '—'}
          </div>
          <div className="text-white/50 text-xs mt-0.5">Win rate</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-black text-purple-300">{passGames.length}</div>
          <div className="text-white/50 text-xs mt-0.5">2-player</div>
        </div>
      </div>

      {/* Per-level breakdown */}
      {byLevel.length > 0 && (
        <div className="mb-5">
          <div className="grid grid-cols-[1fr_40px_40px_40px_40px_50px] text-white/40 text-xs font-bold mb-2 px-1 uppercase tracking-wider">
            <span>Level</span><span className="text-center">Played</span>
            <span className="text-center text-green-400">W</span>
            <span className="text-center text-red-400">L</span>
            <span className="text-center text-yellow-400">D</span>
            <span className="text-center">Win%</span>
          </div>
          {byLevel.map(r => (
            <div key={r.id} className="grid grid-cols-[1fr_40px_40px_40px_40px_50px] items-center py-2 border-t border-white/5 px-1">
              <span className="text-white/80 text-sm">{LEVEL_LABELS[r.id]}</span>
              <span className="text-white/60 text-sm text-center">{r.total}</span>
              <span className="text-green-300 text-sm text-center font-bold">{r.wins}</span>
              <span className="text-red-300 text-sm text-center font-bold">{r.losses}</span>
              <span className="text-yellow-300 text-sm text-center font-bold">{r.draws}</span>
              <span className={`text-sm text-center font-black ${r.pct >= 50 ? 'text-green-300' : 'text-red-300'}`}>
                {r.pct !== null ? `${r.pct}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent 10 games */}
      <div>
        <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 px-1">Recent Games</div>
        {recent.map((g, i) => (
          <div key={g.ts || i} className="flex items-center justify-between py-2 border-t border-white/5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs w-24">{g.date}</span>
              <span className="text-white/70 text-sm">
                {g.mode === 'ai' ? (LEVEL_LABELS[g.level] || g.level) : '👥 2-Player'}
              </span>
            </div>
            <span className={`text-sm ${resultStyle(g.result)}`}>{resultLabel(g)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Account detail ─────────────────────────────────────────────────────────────

function AccountDetail({ pin, password, onBack, onDeleted }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [label, setLabel] = useState('')
  const [labelEdit, setLabelEdit] = useState(false)
  const [labelInput, setLabelInput] = useState('')

  const [giftOpen, setGiftOpen] = useState(false)
  const [giftInput, setGiftInput] = useState('')

  const [confirm, setConfirm] = useState(null) // 'reset' | 'delete'
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErr(false)
    fetch(`/api/admin?action=account&pin=${pin}`, {
      headers: { Authorization: `Bearer ${password}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLabel(d.label || ''); setLoading(false) })
      .catch(() => { setErr(true); setLoading(false) })
  }, [pin, password, reloadKey])

  const reload = () => setReloadKey(k => k + 1)

  const callApi = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' } })

  const flash = (msg, ok = true) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleGift = async () => {
    const n = parseInt(giftInput, 10)
    if (!n || n < 1) return
    setBusy(true)
    const res = await callApi(`/api/admin?action=gift&pin=${pin}`, {
      method: 'POST', body: JSON.stringify({ stars: n }),
    })
    const d = await res.json()
    setBusy(false)
    setGiftOpen(false)
    setGiftInput('')
    if (d.ok) { flash(`✅ Gifted ${n} stars! Total now: ${d.stars}`); reload() }
    else flash('⚠️ Failed', false)
  }

  const handleReset = async () => {
    setBusy(true)
    const res = await callApi(`/api/admin?action=reset&pin=${pin}`, { method: 'POST' })
    const d = await res.json()
    setBusy(false)
    setConfirm(null)
    if (d.ok) { flash('✅ Account reset to zero'); reload() }
    else flash('⚠️ Failed', false)
  }

  const handleDelete = async () => {
    setBusy(true)
    await callApi(`/api/admin?action=delete&pin=${pin}`, { method: 'DELETE' })
    onDeleted()
  }

  const handleLabel = async () => {
    const trimmed = labelInput.trim()
    setBusy(true)
    const res = await callApi(`/api/admin?action=label&pin=${pin}`, {
      method: 'POST', body: JSON.stringify({ label: trimmed }),
    })
    const d = await res.json()
    setBusy(false)
    setLabelEdit(false)
    setLabel(d.label || '')
    flash(trimmed ? `✅ Labeled as "${trimmed}"` : '✅ Label removed')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/50 text-lg">Loading…</div>
    </div>
  )

  if (err || !data?.progress) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-red-400 mb-4">Failed to load account</div>
        <button onClick={onBack} className="text-white/60 hover:text-white">← Back</button>
      </div>
    </div>
  )

  const p = data.progress
  const mastered = (p.badges || []).filter(b => b.startsWith('piece-')).map(b => b.replace('piece-', ''))

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[640px] mx-auto">

        <button onClick={onBack} className="text-white/60 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← All Accounts
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="bg-indigo-500/30 rounded-2xl px-5 py-3 font-black text-white text-3xl tracking-widest flex-shrink-0">
            {pin}
          </div>
          <div className="flex-1 min-w-0">
            {labelEdit ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value.slice(0, 32))}
                  placeholder="Name (e.g. Austin)"
                  onKeyDown={e => e.key === 'Enter' && handleLabel()}
                  className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button onClick={handleLabel} disabled={busy} className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-2 rounded-xl text-sm font-bold disabled:opacity-50">Save</button>
                <button onClick={() => setLabelEdit(false)} className="text-white/40 hover:text-white/70 px-2 text-sm">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-xl">{label || `PIN ${pin}`}</span>
                <button
                  onClick={() => { setLabelInput(label); setLabelEdit(true) }}
                  className="text-white/30 hover:text-white/60 text-xs border border-white/20 hover:border-white/40 rounded px-2 py-0.5 transition-colors"
                >
                  {label ? '✏️ rename' : '+ label'}
                </button>
              </div>
            )}
            <div className="text-white/50 text-sm mt-1">Last active: {fmtDate(p.lastActiveDate)}</div>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-bold ${feedback.ok ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {feedback.msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Stars', value: `⭐ ${p.stars || 0}`, color: 'text-yellow-300' },
            { label: 'Streak', value: `🔥 ${p.streak || 0}d`, color: 'text-orange-300' },
            { label: 'Time', value: fmtTime(p.totalMinutes), color: 'text-blue-300' },
            { label: 'Pieces', value: `${mastered.length}/6`, color: 'text-purple-300' },
          ].map(({ label: l, value, color }) => (
            <div key={l} className="bg-white/10 rounded-2xl p-3 text-center">
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-white/50 text-xs mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Pieces */}
        <div className="bg-white/10 rounded-3xl p-5 mb-4">
          <h2 className="text-white font-black text-sm mb-4 uppercase tracking-wider">Piece Progress</h2>
          <div className="space-y-3">
            {PIECE_IDS.map(id => {
              const done = p.piecesLearned?.[id]?.completedChallenges || []
              const isMastered = mastered.includes(id)
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-white/60 text-sm w-14">{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isMastered ? 'bg-yellow-400' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min((done.length / 4) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs w-20 text-right">
                    {done.length} ch.{isMastered ? ' ✓' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Puzzles */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-orange-300">{(p.questsCompleted || []).length}</div>
            <div className="text-white/50 text-xs mt-1">Quests</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-300">{(p.checkmateSolved || []).length}/10</div>
            <div className="text-white/50 text-xs mt-1">Mate-in-1</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-300">{(p.checkmate2Solved || []).length}/10</div>
            <div className="text-white/50 text-xs mt-1">Mate-in-2</div>
          </div>
        </div>

        {/* Management actions */}
        <div className="space-y-3 mb-5">
          {/* Gift stars */}
          {giftOpen ? (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4">
              <p className="text-yellow-200 font-bold text-sm mb-3">🎁 Stars to gift?</p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 10"
                  value={giftInput}
                  onChange={e => setGiftInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={e => e.key === 'Enter' && handleGift()}
                  className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button onClick={handleGift} disabled={busy || !giftInput} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 rounded-xl text-sm disabled:opacity-50">Gift</button>
                <button onClick={() => { setGiftOpen(false); setGiftInput('') }} className="text-white/40 hover:text-white/70 px-2">✕</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setGiftOpen(true)}
              className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 rounded-2xl py-3 text-sm font-bold transition-colors"
            >
              🎁 Gift Stars
            </button>
          )}

          {/* Reset */}
          {confirm === 'reset' ? (
            <div className="bg-orange-500/15 border border-orange-500/40 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-3">Reset all of {label || `PIN ${pin}`}'s progress to zero?</p>
              <div className="flex gap-2">
                <button onClick={handleReset} disabled={busy} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-black py-2 rounded-xl text-sm disabled:opacity-50">{busy ? '…' : 'Yes, Reset'}</button>
                <button onClick={() => setConfirm(null)} className="flex-1 bg-white/10 text-white rounded-xl py-2 text-sm font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirm('reset')}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 rounded-2xl py-3 text-sm font-bold transition-colors"
            >
              ↺ Reset Account to Zero
            </button>
          )}
        </div>

        {/* Game history */}
        <GameStats gameLog={p.gameLog || []} />

        {/* Raw JSON */}
        <details className="bg-white/5 rounded-2xl p-4 mb-5">
          <summary className="text-white/40 text-sm cursor-pointer hover:text-white/60">Raw progress JSON</summary>
          <pre className="mt-3 text-white/60 text-xs overflow-auto max-h-64 leading-relaxed">
            {JSON.stringify(p, null, 2)}
          </pre>
        </details>

        {/* Danger zone */}
        <div className="border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-400/60 text-xs font-bold uppercase tracking-wider mb-3">Danger Zone</p>
          {confirm === 'delete' ? (
            <div>
              <p className="text-white font-bold text-sm mb-3">Permanently delete PIN {pin} and all its data? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={busy} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-2 rounded-xl text-sm disabled:opacity-50">{busy ? '…' : 'Delete Forever'}</button>
                <button onClick={() => setConfirm(null)} className="flex-1 bg-white/10 text-white rounded-xl py-2 text-sm font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirm('delete')}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-2.5 text-sm font-bold transition-colors"
            >
              🗑️ Delete Account
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Accounts table ─────────────────────────────────────────────────────────────

function AccountsTable({ accounts, onSelect, onLogout }) {
  const sorted = [...accounts].sort((a, b) => {
    if (!a.lastActiveDate) return 1
    if (!b.lastActiveDate) return -1
    return new Date(b.lastActiveDate) - new Date(a.lastActiveDate)
  })

  const totalMinutes = accounts.reduce((s, a) => s + (a.totalMinutes || 0), 0)
  const activeToday = accounts.filter(a => fmtDate(a.lastActiveDate) === 'Today').length

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[820px] mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">Chess Quest · All Accounts</p>
          </div>
          <button
            onClick={onLogout}
            className="text-white/40 hover:text-white/70 text-sm border border-white/20 hover:border-white/40 rounded-xl px-4 py-2 transition-colors"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-white">{accounts.length}</div>
            <div className="text-white/50 text-xs mt-1">Total accounts</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-green-300">{activeToday}</div>
            <div className="text-white/50 text-xs mt-1">Active today</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-blue-300">{fmtTime(totalMinutes)}</div>
            <div className="text-white/50 text-xs mt-1">Total play time</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-[140px_100px_60px_60px_70px_70px_70px_70px_70px_70px] text-white/40 text-xs font-bold px-4 py-3 border-b border-white/10 uppercase tracking-wider">
            <span>Account</span>
            <span>Last Active</span>
            <span>Stars</span>
            <span>Streak</span>
            <span>Pieces</span>
            <span>Quests</span>
            <span>M-in-1</span>
            <span>M-in-2</span>
            <span>Games</span>
            <span>Win%</span>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-10 text-white/30 text-center text-sm">No accounts yet</div>
          )}
          {sorted.map(a => (
            <button
              key={a.pin}
              onClick={() => onSelect(a.pin)}
              className="w-full grid grid-cols-[140px_100px_60px_60px_70px_70px_70px_70px_70px_70px] text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 transition-colors last:border-0"
            >
              <span className="flex flex-col">
                <span className="text-white font-black tracking-widest">{a.pin}</span>
                {a.label && <span className="text-indigo-300 text-xs font-semibold">{a.label}</span>}
              </span>
              <span className="text-white/70 text-sm self-center">{fmtDate(a.lastActiveDate)}</span>
              <span className="text-yellow-300 font-bold self-center">⭐ {a.stars}</span>
              <span className="text-orange-300 font-bold self-center">🔥 {a.streak}</span>
              <span className="text-purple-300 font-bold self-center">{a.piecesMastered}/6</span>
              <span className="text-orange-200 font-bold self-center">{a.questsDone}</span>
              <span className="text-green-300 font-bold self-center">{a.mate1Done}/10</span>
              <span className="text-emerald-300 font-bold self-center">{a.mate2Done}/10</span>
              <span className="text-white/70 font-bold self-center">{a.gamesPlayed || 0}</span>
              <span className={`font-bold self-center ${a.aiWinRate >= 50 ? 'text-green-300' : a.aiWinRate !== null ? 'text-red-300' : 'text-white/30'}`}>
                {a.aiWinRate !== null ? `${a.aiWinRate}%` : '—'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Admin root ──────────────────────────────────────────────────────────────────

const ADMIN_PW_KEY = 'chess-admin-pw'

export default function Admin() {
  const [password, setPassword] = useState(null)
  const [accounts, setAccounts] = useState(null) // null = not yet loaded
  const [selectedPin, setSelectedPin] = useState(null)
  const [autoLogging, setAutoLogging] = useState(!!sessionStorage.getItem(ADMIN_PW_KEY))

  // Auto-login from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PW_KEY)
    if (!saved) return
    fetch('/api/admin?action=accounts', { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setPassword(saved); setAccounts(data.accounts || []) })
      .catch(() => sessionStorage.removeItem(ADMIN_PW_KEY))
      .finally(() => setAutoLogging(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = (pw, initialAccounts) => {
    sessionStorage.setItem(ADMIN_PW_KEY, pw)
    setPassword(pw)
    setAccounts(initialAccounts)
  }

  const refreshAccounts = async (pw) => {
    const res = await fetch('/api/admin?action=accounts', {
      headers: { Authorization: `Bearer ${pw}` },
    })
    const data = await res.json()
    setAccounts(data.accounts || [])
  }

  const handleBack = () => {
    setSelectedPin(null)
    refreshAccounts(password)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PW_KEY)
    setPassword(null)
    setAccounts(null)
  }

  if (autoLogging) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/50 text-lg">Loading…</div>
    </div>
  )

  if (!password) return <Login onAuth={handleAuth} />

  if (selectedPin) return (
    <AccountDetail
      pin={selectedPin}
      password={password}
      onBack={handleBack}
      onDeleted={handleBack}
    />
  )

  return <AccountsTable accounts={accounts || []} onSelect={setSelectedPin} onLogout={handleLogout} />
}
