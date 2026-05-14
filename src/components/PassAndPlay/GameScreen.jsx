import { useState, useRef, useEffect, useCallback } from 'react'
import { Chessboard, defaultPieces } from 'react-chessboard'
import { useBoardSize } from '../../hooks/useBoardSize'
import { useGameState } from './useGameState'
import Confetti from '../ui/Confetti'

// Black pieces rendered rotated 180° so they face the player sitting on the opposite side
const rotatedBlackPieces = Object.fromEntries(
  ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'].map(key => [
    key,
    (props) => (
      <div style={{ transform: 'rotate(180deg)', width: '100%', height: '100%' }}>
        {defaultPieces[key](props)}
      </div>
    ),
  ])
)

const pieces = { ...defaultPieces, ...rotatedBlackPieces }

const END_CONFIG = {
  'white-wins': { icon: '🏆', title: 'White wins!',  msg: 'Congratulations! White is the champion!' },
  'black-wins': { icon: '🏆', title: 'Black wins!',  msg: 'Congratulations! Black is the champion!' },
  'draw':       { icon: '🤝', title: "It's a draw!", msg: 'Both players played brilliantly!' },
}

const PIECE_SYM  = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
const PIECE_NAME = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' }

export default function GameScreen({ onBack, logGame }) {
  const boardSize = useBoardSize(24)
  const { position, status, lastMove, moveCount, currentTurn, onPieceDrop, resetGame } = useGameState()
  const hasLoggedRef = useRef(false)

  const [replayArrow, setReplayArrow] = useState(null)
  const replayTimer = useRef(null)

  useEffect(() => () => clearTimeout(replayTimer.current), [])

  useEffect(() => {
    if (status === 'playing') { hasLoggedRef.current = false; return }
    if (hasLoggedRef.current) return
    hasLoggedRef.current = true
    const result = status === 'white-wins' ? 'white' : status === 'black-wins' ? 'black' : 'draw'
    logGame('pass', null, result)
  }, [status, logGame])

  const showReplay = useCallback(() => {
    if (!lastMove) return
    setReplayArrow(lastMove)
    clearTimeout(replayTimer.current)
    replayTimer.current = setTimeout(() => setReplayArrow(null), 3000)
  }, [lastMove])

  const arrows = replayArrow
    ? [{ startSquare: replayArrow.from, endSquare: replayArrow.to, color: 'rgba(168, 85, 247, 0.85)' }]
    : []

  const squareStyles = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 215, 0, 0.35)' }
    squareStyles[lastMove.to]   = { backgroundColor: 'rgba(255, 215, 0, 0.55)' }
  }

  const endConfig = END_CONFIG[status]

  return (
    <div className="min-h-screen px-3 py-6">
      <Confetti active={status !== 'playing'} />
      <div className="max-w-[600px] mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white/70 hover:text-white flex items-center gap-2 text-base">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            {lastMove && moveCount > 0 && (
              <button
                onClick={showReplay}
                title="Replay last move"
                className="bg-purple-400/20 hover:bg-purple-400/35 border border-purple-400/40 text-purple-200 rounded-xl px-3 py-1.5 text-sm font-bold transition-all active:scale-95"
              >
                ↩ Last move
              </button>
            )}
            <div className="text-white/50 text-sm">Move {moveCount}</div>
          </div>
        </div>

        {/* Replay info banner */}
        {replayArrow && (
          <div className="bg-purple-500/15 border border-purple-400/30 rounded-2xl px-4 py-2 mb-4 text-purple-200 text-sm text-center">
            ↩ {PIECE_SYM[replayArrow.piece] || '?'} {replayArrow.from} → {replayArrow.to}
            {replayArrow.captured && ` · captured ${PIECE_SYM[replayArrow.captured]} ${PIECE_NAME[replayArrow.captured]}`}
          </div>
        )}

        {/* Turn indicator */}
        {status === 'playing' && (
          <div className={`rounded-3xl px-5 py-4 mb-5 text-center font-bold text-lg transition-colors ${
            currentTurn === 'w'
              ? 'bg-white/90 text-gray-900'
              : 'bg-gray-800/80 text-white border border-white/20'
          }`}>
            {currentTurn === 'w' ? '♙ White\'s turn' : '♟ Black\'s turn'}
          </div>
        )}

        {/* Board */}
        <div className="mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ width: boardSize }}>
          <Chessboard
            options={{
              position,
              onPieceDrop,
              squareStyles,
              arrows,
              pieces,
              allowDragging: status === 'playing',
              boardWidth: boardSize,
              boardStyle: { borderRadius: '16px' },
              darkSquareStyle:  { backgroundColor: '#4a6741' },
              lightSquareStyle: { backgroundColor: '#f0d9b5' },
            }}
          />
        </div>

        {/* Game over */}
        {status !== 'playing' && endConfig && (
          <div className="mt-6 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/50 rounded-3xl p-8 text-center animate-pop">
            <div className="text-6xl mb-3">{endConfig.icon}</div>
            <h3 className="text-white font-black text-3xl mb-2">{endConfig.title}</h3>
            <p className="text-white/80 text-lg mb-7">{endConfig.msg}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-white text-gray-900 font-black py-4 px-8 rounded-2xl text-xl hover:bg-gray-100 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="bg-white/20 text-white font-black py-4 px-8 rounded-2xl text-xl hover:bg-white/30 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        )}

        {status === 'playing' && moveCount > 0 && (
          <button
            onClick={resetGame}
            className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-2xl py-3 text-base font-semibold transition-colors"
          >
            ↺ Start New Game
          </button>
        )}
      </div>
    </div>
  )
}
