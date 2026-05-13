import { useState, useEffect, useMemo } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { useBoardSize } from '../../hooks/useBoardSize'

// ─── Animated demo board ─────────────────────────────────────────────────────

function AnimatedBoard({ piece }) {
  const boardSize = useBoardSize()
  const demo = piece.challenges[0]
  const { fen, pieceSquare } = demo

  const moves = useMemo(() => {
    try {
      return new Chess(fen).moves({ square: pieceSquare, verbose: true })
    } catch { return [] }
  }, [fen, pieceSquare])

  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || moves.length === 0) return
    const id = setInterval(() => setIdx(i => (i + 1) % moves.length), 650)
    return () => clearInterval(id)
  }, [playing, moves.length])

  const squareStyles = {
    [pieceSquare]: { backgroundColor: 'rgba(255, 215, 0, 0.55)' },
  }
  const target = moves[idx]?.to
  if (target) {
    squareStyles[target] = {
      backgroundColor: 'rgba(107, 203, 119, 0.70)',
      boxShadow: 'inset 0 0 0 3px rgba(107, 203, 119, 0.95)',
    }
  }

  if (moves.length === 0) return null

  return (
    <div className="mb-6">
      <p className="text-white/60 text-sm text-center mb-3">
        ✨ Watch how the <strong className="text-white">{piece.name}</strong> moves — green squares show where it can go!
      </p>
      <div className="mx-auto rounded-2xl overflow-hidden shadow-xl" style={{ width: boardSize }}>
        <Chessboard
          options={{
            position: fen,
            squareStyles,
            allowDragging: false,
            boardWidth: boardSize,
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#4a6741' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          onClick={() => setPlaying(p => !p)}
          className="text-white/50 hover:text-white text-sm transition-colors"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <span className="text-white/30 text-xs">
          {idx + 1} / {moves.length} moves
        </span>
      </div>
    </div>
  )
}

// ─── PieceCard ───────────────────────────────────────────────────────────────

export default function PieceCard({ piece, onBack, onStartChallenge, completed, isMastered }) {
  const [showChinese, setShowChinese] = useState(false)

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[600px] mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← All Pieces
        </button>

        {/* Hero card */}
        <div className={`bg-gradient-to-br ${piece.bg} rounded-3xl p-8 text-white shadow-xl mb-5`}>
          <div className="text-8xl text-center mb-3" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            {piece.emoji}
          </div>
          <h2 className="text-4xl font-black text-center">{piece.name}</h2>
          <p className="text-center text-white/90 font-bold mt-2 text-lg">{piece.title}</p>
          {isMastered && <div className="text-center mt-3 text-3xl">⭐ Mastered!</div>}
        </div>

        {/* Description */}
        <div className="bg-white/10 rounded-3xl p-5 mb-4 text-white">
          <p className="font-bold text-xl leading-relaxed">
            "{piece.tagline}"
          </p>
          <p className="text-white/80 mt-3 text-base leading-relaxed">
            {showChinese ? piece.zh_description : piece.description}
          </p>
        </div>

        {/* Dad toggle */}
        <button
          onClick={() => setShowChinese(s => !s)}
          className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl py-3 text-base font-bold transition-colors"
        >
          {showChinese ? '🇬🇧 Switch to English' : '👨 爸爸看 (Chinese)'}
        </button>

        {/* Animated demo */}
        <AnimatedBoard piece={piece} />

        {/* Challenges */}
        <h3 className="text-white font-black text-xl mb-4">Challenges</h3>
        <div className="flex flex-col gap-4">
          {piece.challenges.map((ch, i) => {
            const isDone = completed.includes(i)
            return (
              <button
                key={i}
                onClick={() => onStartChallenge(i)}
                className={`rounded-3xl p-5 text-left transition-all ${
                  isDone
                    ? 'bg-green-500/30 border-2 border-green-400'
                    : 'bg-white/10 hover:bg-white/20 border-2 border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{isDone ? '✅' : `${i + 1}️⃣`}</span>
                  <div>
                    <p className="text-white font-bold text-base">Challenge {i + 1}</p>
                    <p className="text-white/70 text-sm mt-1">{ch.instruction}</p>
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
