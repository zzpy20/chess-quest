import { useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'

// Returns all legal destination squares for a piece on a given square
function getLegalSquares(fen, square) {
  try {
    const chess = new Chess(fen)
    const moves = chess.moves({ square, verbose: true })
    return moves.map(m => m.to)
  } catch {
    return []
  }
}

export default function ChallengeBoard({ challenge, onCorrect, onWrong }) {
  const { fen, pieceSquare, answer, type, partial } = challenge
  const legalSquares = getLegalSquares(fen, pieceSquare)

  const [selected, setSelected] = useState([])
  const [wrong, setWrong] = useState([])
  const [done, setDone] = useState(false)

  const handleSquareClick = useCallback((square) => {
    if (done) return
    if (square === pieceSquare) return

    if (type === 'tap-moves' && partial) {
      // partial mode: just need to tap 5+ valid squares
      if (!legalSquares.includes(square)) {
        setWrong(w => [...w, square])
        onWrong?.()
        return
      }
      const next = selected.includes(square) ? selected : [...selected, square]
      setSelected(next)
      if (next.length >= 5) {
        setDone(true)
        onCorrect?.()
      }
      return
    }

    if (type === 'tap-moves') {
      if (!legalSquares.includes(square)) {
        setWrong(w => [...w, square])
        onWrong?.()
        return
      }
      const next = selected.includes(square) ? selected : [...selected, square]
      setSelected(next)
      const allFound = answer.every(sq => next.includes(sq))
      if (allFound) {
        setDone(true)
        onCorrect?.()
      }
      return
    }

    // find-capture / save-king / tap-square — single correct answer
    if (answer.includes(square)) {
      setSelected([square])
      setDone(true)
      onCorrect?.()
    } else {
      setWrong([square])
      onWrong?.()
      setTimeout(() => setWrong([]), 600)
    }
  }, [done, selected, wrong, answer, legalSquares, pieceSquare, type, partial, onCorrect, onWrong])

  // Build square styles for highlights
  const squareStyles = {}

  // Highlight the piece square
  squareStyles[pieceSquare] = {
    background: 'radial-gradient(circle, rgba(255,215,0,0.7) 60%, transparent 70%)',
  }

  // Show tapped correct squares
  selected.forEach(sq => {
    squareStyles[sq] = { background: 'rgba(107, 203, 119, 0.75)', borderRadius: '6px' }
  })

  // Show wrong squares briefly
  wrong.forEach(sq => {
    squareStyles[sq] = { background: 'rgba(255, 80, 80, 0.75)', borderRadius: '6px' }
  })

  return (
    <div className="w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
      <Chessboard
        position={fen}
        onSquareClick={handleSquareClick}
        customSquareStyles={squareStyles}
        arePiecesDraggable={false}
        boardWidth={340}
        customBoardStyle={{ borderRadius: '12px' }}
        customDarkSquareStyle={{ backgroundColor: '#4a6741' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
      />
    </div>
  )
}
