import { useState } from 'react'

export default function PieceCard({ piece, onBack, onStartChallenge, completed, isMastered }) {
  const [showChinese, setShowChinese] = useState(false)

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-1 text-sm">
          ← All Pieces
        </button>

        {/* Piece hero card */}
        <div className={`bg-gradient-to-br ${piece.bg} rounded-3xl p-6 text-white shadow-xl mb-4 relative overflow-hidden`}>
          <div className="text-7xl text-center mb-2" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
            {piece.emoji}
          </div>
          <h2 className="text-3xl font-black text-center">{piece.name}</h2>
          <p className="text-center text-white/90 font-bold mt-1">{piece.title}</p>
          {isMastered && <div className="text-center mt-2 text-2xl">⭐ Mastered!</div>}
        </div>

        {/* Description */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4 text-white">
          <p className="font-semibold text-lg leading-relaxed">
            "{piece.tagline}"
          </p>
          <p className="text-white/80 mt-2 text-sm leading-relaxed">
            {showChinese ? piece.zh_description : piece.description}
          </p>
        </div>

        {/* Dad view toggle */}
        <button
          onClick={() => setShowChinese(s => !s)}
          className="w-full mb-4 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl py-2 text-sm font-semibold transition-colors"
        >
          {showChinese ? '🇬🇧 English' : '👨 爸爸看 (Chinese)'}
        </button>

        {/* Challenges */}
        <h3 className="text-white font-black text-lg mb-3">Challenges</h3>
        <div className="flex flex-col gap-3">
          {piece.challenges.map((ch, i) => {
            const isDone = completed.includes(i)
            return (
              <button
                key={i}
                onClick={() => onStartChallenge(i)}
                className={`rounded-2xl p-4 text-left transition-all ${
                  isDone
                    ? 'bg-green-500/30 border-2 border-green-400'
                    : 'bg-white/10 hover:bg-white/20 border-2 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isDone ? '✅' : `${i + 1}️⃣`}</span>
                  <div>
                    <p className="text-white font-bold text-sm">Challenge {i + 1}</p>
                    <p className="text-white/70 text-xs mt-0.5">{ch.instruction}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
