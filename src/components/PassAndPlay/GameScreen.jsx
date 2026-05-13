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

export default function GameScreen({ onBack }) {
  const boardSize = useBoardSize(24) // px-3 container → maximise board on phone
  const { position, status, lastMove, moveCount, currentTurn, onPieceDrop, resetGame } = useGameState()

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
          <div className="text-white/50 text-sm">Move {moveCount}</div>
        </div>

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

        {/* Board stays fixed; black pieces are rotated 180° to face the player on the other side */}
        <div className="mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ width: boardSize }}>
          <Chessboard
            options={{
              position,
              onPieceDrop,
              squareStyles,
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
