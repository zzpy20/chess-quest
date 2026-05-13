import { useState, useCallback, useRef, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { useBoardSize } from '../../hooks/useBoardSize'
import { useGameState } from './useGameState'
import { getAIMove } from './aiEngine'
import Confetti from '../ui/Confetti'

const STATUS_CONFIG = {
  won:  { bg: 'from-green-400/40 to-emerald-400/40', border: 'border-green-400', icon: '🏆', title: "You won!", msg: "Amazing! You beat Buddy! You're a chess star! 🌟" },
  lost: { bg: 'from-red-400/20 to-pink-400/20',      border: 'border-red-400',   icon: '💪', title: "Buddy won this one", msg: "Good game! Keep practicing — you'll beat Buddy next time!" },
  draw: { bg: 'from-yellow-400/20 to-orange-400/20', border: 'border-yellow-400', icon: '🤝', title: "It's a draw!", msg: "Both sides played well — a fair game!" },
}

export default function GameScreen({ level, side, onBack }) {
  const boardSize = useBoardSize(24)
  const { position, status, message, isThinking, lastMove, moveCount, onPieceDrop, resetGame } = useGameState(level, side)

  const [hintMove, setHintMove] = useState(null)
  const [hintCount, setHintCount] = useState(0)
  const hintTimer = useRef(null)

  useEffect(() => () => clearTimeout(hintTimer.current), [])

  const showHint = useCallback(() => {
    if (isThinking || status !== 'playing') return
    const move = getAIMove(position, 'knight')
    if (!move) return
    setHintMove({ from: move.from, to: move.to })
    setHintCount(c => c + 1)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHintMove(null), 3000)
  }, [isThinking, status, position])

  // Clear hint when the board changes (player made their move)
  useEffect(() => {
    setHintMove(null)
  }, [position])

  const squareStyles = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 215, 0, 0.35)' }
    squareStyles[lastMove.to]   = { backgroundColor: 'rgba(255, 215, 0, 0.55)' }
  }
  if (hintMove) {
    squareStyles[hintMove.from] = { backgroundColor: 'rgba(100, 149, 237, 0.55)' }
    squareStyles[hintMove.to]   = { backgroundColor: 'rgba(100, 149, 237, 0.75)', boxShadow: 'inset 0 0 0 3px rgba(100,149,237,0.9)' }
  }

  const endConfig = STATUS_CONFIG[status]

  return (
    <div className="min-h-screen px-3 py-6">
      <Confetti active={status === 'won'} />
      <div className="max-w-[600px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button onClick={onBack} className="text-white/70 hover:text-white flex items-center gap-2 text-base">
            ← Back
          </button>
          <div className="text-white/50 text-sm flex items-center gap-3">
            <span>{side === 'w' ? '♙ You are White' : '♟ You are Black'}</span>
            <span>· Move {moveCount}</span>
          </div>
        </div>

        {/* Message + hint row */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex-1 rounded-3xl px-5 py-3 text-center font-bold text-base transition-all ${
            isThinking ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 text-white'
          }`}>
            {message}
          </div>
          {status === 'playing' && !isThinking && (
            <button
              onClick={showHint}
              title="Show a hint"
              className="flex-shrink-0 bg-yellow-400/20 hover:bg-yellow-400/35 border border-yellow-400/40 text-yellow-200 rounded-2xl px-4 py-3 font-bold text-base transition-all active:scale-95"
            >
              💡
            </button>
          )}
        </div>

        {hintMove && (
          <div className="bg-blue-500/15 border border-blue-400/30 rounded-2xl px-4 py-2 mb-3 text-blue-200 text-sm text-center">
            💡 Try moving the highlighted piece to the blue square!
          </div>
        )}

        {/* Board */}
        <div className="mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ width: boardSize }}>
          <Chessboard
            options={{
              position,
              onPieceDrop,
              squareStyles,
              allowDragging: status === 'playing' && !isThinking,
              canDragPiece: ({ piece }) => piece.pieceType?.startsWith(side),
              boardOrientation: side === 'w' ? 'white' : 'black',
              boardWidth: boardSize,
              boardStyle: { borderRadius: '16px' },
              darkSquareStyle:  { backgroundColor: '#4a6741' },
              lightSquareStyle: { backgroundColor: '#f0d9b5' },
            }}
          />
        </div>

        {/* Game over overlay */}
        {status !== 'playing' && endConfig && (
          <div className={`mt-5 bg-gradient-to-br ${endConfig.bg} border-2 ${endConfig.border} rounded-3xl p-8 text-center animate-pop`}>
            <div className="text-6xl mb-3">{endConfig.icon}</div>
            <h3 className="text-white font-black text-3xl mb-2">{endConfig.title}</h3>
            <p className="text-white/80 text-lg mb-7">{endConfig.msg}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={resetGame} className="bg-white text-gray-900 font-black py-4 px-8 rounded-2xl text-xl hover:bg-gray-100 transition-colors">
                Play Again
              </button>
              <button onClick={onBack} className="bg-white/20 text-white font-black py-4 px-8 rounded-2xl text-xl hover:bg-white/30 transition-colors">
                Change Level
              </button>
            </div>
          </div>
        )}

        {status === 'playing' && moveCount > 0 && (
          <button
            onClick={resetGame}
            className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-2xl py-3 text-base font-semibold transition-colors"
          >
            ↺ Start New Game
          </button>
        )}
      </div>
    </div>
  )
}
