import { useState } from 'react'
import GameScreen from './GameScreen'

const LEVELS = [
  {
    id: 'dragon',
    name: 'Sleepy Dragon',
    emoji: '🐉',
    bg: 'from-green-500 to-teal-500',
    badge: 'Very Easy',
    badgeColor: 'bg-green-300/20 text-green-200',
    description: 'Makes lots of mistakes — great for beginners!',
    zh: '最简单！经常犯错，专门为新手设计。',
  },
  {
    id: 'puppy',
    name: 'Smart Puppy',
    emoji: '🐶',
    bg: 'from-blue-500 to-cyan-500',
    badge: 'Easy',
    badgeColor: 'bg-blue-300/20 text-blue-200',
    description: 'Knows how to capture pieces — a bit trickier.',
    zh: '知道如何吃子，稍微难一些。',
  },
  {
    id: 'knight',
    name: 'Little Knight',
    emoji: '🏇',
    bg: 'from-purple-500 to-pink-500',
    badge: 'Medium',
    badgeColor: 'bg-purple-300/20 text-purple-200',
    description: 'Understands basic tactics — a real challenge!',
    zh: '懂一些基本战术，真正的挑战！',
  },
  {
    id: 'lion',
    name: 'Lion King',
    emoji: '🦁',
    bg: 'from-orange-500 to-red-500',
    badge: 'Hard',
    badgeColor: 'bg-orange-300/20 text-orange-200',
    description: 'Thinks 4 moves ahead — plays real chess!',
    zh: '能算4步棋——真正的象棋对手！',
  },
  {
    id: 'wizard',
    name: 'Chess Wizard',
    emoji: '🧙',
    bg: 'from-red-600 to-violet-700',
    badge: 'Expert',
    badgeColor: 'bg-red-300/20 text-red-200',
    description: 'Master-level tactics — only for the very brave!',
    zh: '大师级战术，只有最勇敢的人才能挑战！',
  },
]

export default function PlayWithBuddy({ onBack }) {
  const [level, setLevel] = useState(null)
  const [side, setSide] = useState(null)

  if (level && side) {
    return <GameScreen level={level} side={side} onBack={() => { setLevel(null); setSide(null) }} />
  }

  if (level && !side) {
    const lv = LEVELS.find(l => l.id === level)
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-[600px] mx-auto">
          <button onClick={() => setLevel(null)} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
            ← Back
          </button>
          <div className="text-center mb-10">
            <div className="text-7xl mb-4">{lv.emoji}</div>
            <h1 className="text-3xl font-black text-white">{lv.name}</h1>
            <p className="text-white/60 text-base mt-2">Choose your side</p>
            <p className="text-white/40 text-sm">👨 选择你的棋色</p>
          </div>
          <div className="flex flex-col gap-5">
            <button
              onClick={() => setSide('w')}
              className="bg-gradient-to-r from-gray-100 to-white rounded-3xl p-6 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-5">
                <span className="text-6xl">♙</span>
                <div>
                  <div className="font-black text-2xl text-gray-900">Play as White</div>
                  <p className="text-gray-500 text-base mt-1">You move first</p>
                  <p className="text-gray-400 text-sm">👨 执白棋，先走</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setSide('b')}
              className="bg-gradient-to-r from-gray-800 to-gray-900 border border-white/20 rounded-3xl p-6 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-5">
                <span className="text-6xl">♟</span>
                <div>
                  <div className="font-black text-2xl text-white">Play as Black</div>
                  <p className="text-white/60 text-base mt-1">Buddy moves first</p>
                  <p className="text-white/40 text-sm">👨 执黑棋，Buddy先走</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🤖</div>
          <h1 className="text-4xl font-black text-white">Play with Buddy</h1>
          <p className="text-white/60 text-base mt-3">Choose your opponent and start playing!</p>
        </div>

        <div className="flex flex-col gap-5">
          {LEVELS.map(lv => (
            <button
              key={lv.id}
              onClick={() => setLevel(lv.id)}
              className={`bg-gradient-to-r ${lv.bg} rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-left`}
            >
              <div className="flex items-center gap-5">
                <span className="text-6xl">{lv.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-2xl">{lv.name}</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${lv.badgeColor}`}>
                      {lv.badge}
                    </span>
                  </div>
                  <p className="text-white/80 text-base">{lv.description}</p>
                  <p className="text-white/60 text-sm mt-1">👨 {lv.zh}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white/10 rounded-3xl p-5 text-white/70 text-sm leading-relaxed">
          <p className="font-bold text-white mb-2">How to play:</p>
          <p>Choose a level, pick your side, then drag pieces to move.</p>
          <p className="mt-1 text-white/50">👨 选难度，选棋色，然后拖动棋子走棋。Buddy自动应棋。</p>
        </div>
      </div>
    </div>
  )
}
