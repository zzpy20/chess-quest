import { useState } from 'react'
import GameScreen from './GameScreen'

export default function PassAndPlay({ onBack, logGame }) {
  const [started, setStarted] = useState(false)

  if (started) {
    return <GameScreen onBack={() => setStarted(false)} logGame={logGame} />
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        <div className="text-center mb-10">
          <div className="text-7xl mb-4">👥</div>
          <h1 className="text-4xl font-black text-white">2-Player Game</h1>
          <p className="text-white/60 text-base mt-3">Play against a friend on the same iPad!</p>
          <p className="text-white/40 text-sm mt-1">👨 两人对弈，共用同一台iPad！</p>
        </div>

        <div className="bg-white/10 rounded-3xl p-6 mb-8">
          <p className="text-white font-bold text-base mb-3">How it works:</p>
          <ul className="space-y-2 text-white/70 text-base">
            <li>📐 Place the iPad flat between two players</li>
            <li>♙ White sits on the side with the white pieces</li>
            <li>♟ Black sits on the opposite side</li>
            <li>🔄 Take turns — just like a real chess board!</li>
          </ul>
          <p className="text-white/40 text-sm mt-4">
            👨 把iPad平放在两人之间，白方坐白棋那侧，黑方坐对面——和真实棋盘完全一样！
          </p>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <span className="text-5xl block mb-3">🎮</span>
          <div className="font-black text-2xl">Start Game</div>
          <div className="text-white/70 text-sm mt-1">White goes first!</div>
        </button>

      </div>
    </div>
  )
}
