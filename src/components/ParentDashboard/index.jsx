import { useState } from 'react'
import { PIECES } from '../../data/pieces'
import { QUESTS } from '../../data/quests'
import { CHECKMATES } from '../../data/checkmates'
import { CHECKMATES2 } from '../../data/checkmates2'

const PIECE_EMOJIS = { pawn: '♟', rook: '♜', bishop: '♝', knight: '♞', queen: '♛', king: '♚' }

function CloudSync({ savePin, clearPin, getPin, forcePull, syncStatus }) {
  const [mode, setMode] = useState('view') // view | setup | restore | confirmClear
  const [pinInput, setPinInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const currentPin = getPin()

  const show = (msg, ok = true) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleSavePin = async () => {
    if (!/^\d{4,8}$/.test(pinInput)) { show('PIN must be 4–8 digits', false); return }
    setBusy(true)
    const restored = await savePin(pinInput)
    setBusy(false)
    setPinInput('')
    setMode('view')
    show(restored ? '✅ Progress restored from cloud!' : '✅ Progress saved to cloud!')
  }

  const handleRestore = async () => {
    if (!/^\d{4,8}$/.test(pinInput)) { show('PIN must be 4–8 digits', false); return }
    setBusy(true)
    const restored = await savePin(pinInput)
    setBusy(false)
    setPinInput('')
    setMode('view')
    show(restored ? '✅ Progress restored!' : '⚠️ No data found for that PIN.', !!restored)
  }

  const handleForcePull = async () => {
    setBusy(true)
    const ok = await forcePull()
    setBusy(false)
    show(ok ? '✅ Progress pulled from cloud!' : '⚠️ Could not reach cloud.', ok)
  }

  const syncDot = { idle: '', syncing: '🔄 ', ok: '☁️ ', error: '⚠️ ' }[syncStatus]

  // No PIN set → setup prompt
  if (!currentPin && mode === 'view') {
    return (
      <div className="bg-white/10 rounded-3xl p-5 mb-5">
        <h2 className="text-white font-black text-lg mb-1">☁️ Cloud Save</h2>
        <p className="text-white/60 text-sm mb-4">
          Set a PIN to save Austin's progress to the cloud — so it's never lost if the browser is cleared or you switch devices.
        </p>
        {feedback && (
          <div className={`mb-3 text-sm font-bold ${feedback.ok ? 'text-green-300' : 'text-red-300'}`}>{feedback.msg}</div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Choose a PIN (4–8 digits)"
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleSavePin}
            disabled={busy}
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {busy ? '…' : 'Save'}
          </button>
        </div>
        <button onClick={() => setMode('restore')} className="mt-3 text-white/40 hover:text-white/70 text-sm transition-colors">
          Restore from existing PIN →
        </button>
      </div>
    )
  }

  // Restore mode
  if (mode === 'restore') {
    return (
      <div className="bg-white/10 rounded-3xl p-5 mb-5">
        <h2 className="text-white font-black text-lg mb-1">☁️ Restore Progress</h2>
        <p className="text-white/60 text-sm mb-4">Enter your PIN to pull Austin's saved progress from the cloud.</p>
        {feedback && (
          <div className={`mb-3 text-sm font-bold ${feedback.ok ? 'text-green-300' : 'text-red-300'}`}>{feedback.msg}</div>
        )}
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Your PIN"
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleRestore}
            disabled={busy}
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {busy ? '…' : 'Restore'}
          </button>
        </div>
        <button onClick={() => setMode('view')} className="text-white/40 hover:text-white/70 text-sm transition-colors">
          ← Back
        </button>
      </div>
    )
  }

  // PIN is set → status view
  return (
    <div className="bg-white/10 rounded-3xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-black text-lg">☁️ Cloud Save</h2>
        <span className="text-white/50 text-sm">{syncDot}{syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'ok' ? 'Synced' : syncStatus === 'error' ? 'Offline' : ''}</span>
      </div>
      <div className="bg-white/5 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-white/50 text-xs mb-0.5">Your family PIN</div>
          <div className="text-white font-black text-2xl tracking-widest">{currentPin}</div>
        </div>
        <div className="text-white/30 text-sm text-right">
          <div>Use this PIN</div>
          <div>on any device</div>
        </div>
      </div>
      {feedback && (
        <div className={`mb-3 text-sm font-bold ${feedback.ok ? 'text-green-300' : 'text-red-300'}`}>{feedback.msg}</div>
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleForcePull}
          disabled={busy}
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {busy ? '…' : '↓ Pull latest from cloud'}
        </button>
        {mode === 'confirmClear' ? (
          <div className="flex gap-2">
            <button onClick={() => { clearPin(); setMode('view') }} className="flex-1 bg-red-500/30 text-red-300 rounded-xl py-2 text-sm font-bold">
              Yes, disconnect
            </button>
            <button onClick={() => setMode('view')} className="flex-1 bg-white/10 text-white rounded-xl py-2 text-sm font-bold">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setMode('confirmClear')} className="text-white/30 hover:text-white/50 text-sm transition-colors py-1">
            Disconnect cloud sync
          </button>
        )}
      </div>
    </div>
  )
}

export default function ParentDashboard({ progress, onBack, resetProgress, savePin, clearPin, getPin, forcePull, syncStatus }) {
  const [confirmReset, setConfirmReset] = useState(false)

  const totalPieces = PIECES.length
  const masteredPieces = progress.badges.filter(b => b.startsWith('piece-')).map(b => b.replace('piece-', ''))
  const questsDone = progress.questsCompleted.length
  const checkmateDone = (progress.checkmateSolved || []).length
  const checkmate2Done = (progress.checkmate2Solved || []).length

  const handleReset = () => {
    resetProgress()
    setConfirmReset(false)
    onBack()
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">👨</div>
          <h1 className="text-4xl font-black text-white">Dad's Dashboard</h1>
          <p className="text-white/50 text-base mt-2">Austin's learning progress</p>
          <p className="text-white/30 text-sm">奥斯汀的学习进度</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-yellow-300">⭐ {progress.stars}</div>
            <div className="text-white/50 text-xs mt-1">Total Stars</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-orange-300">🔥 {progress.streak || 0}</div>
            <div className="text-white/50 text-xs mt-1">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-purple-300">🏅 {masteredPieces.length}/{totalPieces}</div>
            <div className="text-white/50 text-xs mt-1">Pieces</div>
          </div>
        </div>

        {/* Piece progress */}
        <div className="bg-white/10 rounded-3xl p-5 mb-5">
          <h2 className="text-white font-black text-lg mb-4">Piece Learning</h2>
          <div className="space-y-3">
            {PIECES.map(piece => {
              const done = progress.piecesLearned[piece.id]?.completedChallenges || []
              const total = piece.challenges.length
              const mastered = masteredPieces.includes(piece.id)
              return (
                <div key={piece.id} className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{PIECE_EMOJIS[piece.id]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm font-bold">{piece.name}</span>
                      <span className="text-white/50 text-xs">{done.length}/{total} challenges</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${mastered ? 'bg-yellow-400' : 'bg-blue-400'}`}
                        style={{ width: `${(done.length / total) * 100}%` }}
                      />
                    </div>
                  </div>
                  {mastered && <span className="text-yellow-400 text-lg">✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quests & Checkmates */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white/10 rounded-3xl p-5">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-white font-black text-2xl">{questsDone} / {QUESTS.length}</div>
            <div className="text-white/50 text-sm mt-1">Quests completed</div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(questsDone / QUESTS.length) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white/10 rounded-3xl p-5">
            <div className="text-4xl mb-2">♟</div>
            <div className="text-white font-black text-2xl">{checkmateDone} / {CHECKMATES.length}</div>
            <div className="text-white/50 text-sm mt-1">Mate-in-1 solved</div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${(checkmateDone / CHECKMATES.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-3xl p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♟♟</span>
              <div>
                <div className="text-white font-black text-lg">{checkmate2Done} / {CHECKMATES2.length}</div>
                <div className="text-white/50 text-xs">Mate-in-2 solved</div>
              </div>
            </div>
            <div className="text-white/30 text-sm">Advanced puzzles</div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(checkmate2Done / CHECKMATES2.length) * 100}%` }} />
          </div>
        </div>

        {/* Badges */}
        {masteredPieces.length > 0 && (
          <div className="bg-white/10 rounded-3xl p-5 mb-5">
            <h2 className="text-white font-black text-lg mb-3">Badges Earned</h2>
            <div className="flex flex-wrap gap-2">
              {masteredPieces.map(id => (
                <div key={id} className="bg-yellow-400/20 border border-yellow-400/40 rounded-2xl px-4 py-2 text-yellow-200 font-bold text-sm">
                  {PIECE_EMOJIS[id]} {id.charAt(0).toUpperCase() + id.slice(1)} Master
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-3xl p-5 mb-5 text-white/70 text-sm leading-relaxed">
          <p className="font-bold text-white mb-1">💡 What to focus on next</p>
          {masteredPieces.length < totalPieces && (
            <p>• Austin hasn't mastered all 6 pieces yet — try <strong className="text-white">Learn a Piece</strong> together.</p>
          )}
          {questsDone < 5 && (
            <p className="mt-1">• Do a <strong className="text-white">Today's Quest</strong> puzzle each day to build the streak.</p>
          )}
          {checkmateDone < 3 && (
            <p className="mt-1">• Try the <strong className="text-white">Checkmate Trainer</strong> to learn the goal of chess.</p>
          )}
          {masteredPieces.length === totalPieces && questsDone >= 10 && (
            <p>🎉 Austin is making excellent progress! Try <strong className="text-white">Play with Buddy</strong> on Knight level.</p>
          )}
        </div>

        {/* Cloud sync */}
        <CloudSync
          savePin={savePin}
          clearPin={clearPin}
          getPin={getPin}
          forcePull={forcePull}
          syncStatus={syncStatus}
        />

        {/* Reset */}
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-2xl py-3 text-base font-semibold transition-colors"
          >
            Reset All Progress
          </button>
        ) : (
          <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-5 text-center">
            <p className="text-white font-bold mb-4">Are you sure? This will erase all of Austin's progress.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleReset} className="bg-red-500 text-white font-black py-3 px-6 rounded-xl hover:bg-red-600 transition-colors">
                Yes, Reset
              </button>
              <button onClick={() => setConfirmReset(false)} className="bg-white/20 text-white font-black py-3 px-6 rounded-xl hover:bg-white/30 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
