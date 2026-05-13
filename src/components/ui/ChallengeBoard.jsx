import { useState, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useBoardSize } from '../../hooks/useBoardSize'

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
  const boardSize = useBoardSize()

  const [selected, setSelected] = useState([])
  const [wrong, setWrong] = useState([])
  const [done, setDone] = useState(false)

  // Handle drag-and-drop (for checkmate/find-capture puzzles)
  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (done || type === 'tap-moves') return false
    if (sourceSquare !== pieceSquare) return false
    if (answer.includes(targetSquare)) {
      setSelected([targetSquare])
      setDone(true)
      onCorrect?.()
    } else {
      setWrong([targetSquare])
      onWrong?.()
      setTimeout(() => setWrong([]), 600)
    }
    return false
  }, [done, type, pieceSquare, answer, onCorrect, onWrong])

  // v5: onSquareClick receives { piece, square } not just the square string
  const handleSquareClick = useCallback(({ square }) => {
    if (done) return
    if (square === pieceSquare) return

    if (type === 'tap-moves' && partial) {
      if (!legalSquares.includes(square)) {
        setWrong(w => [...w, square])
        onWrong?.()
        setTimeout(() => setWrong([]), 600)
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
        setTimeout(() => setWrong([]), 600)
        return
      }
      const next = selected.includes(square) ? selected : [...selected, square]
      setSelected(next)
      if (answer.every(sq => next.includes(sq))) {
        setDone(true)
        onCorrect?.()
      }
      return
    }

    // find-capture / save-king / tap-square
    if (answer.includes(square)) {
      setSelected([square])
      setDone(true)
      onCorrect?.()
    } else {
      setWrong([square])
      onWrong?.()
      setTimeout(() => setWrong([]), 600)
    }
  }, [done, selected, answer, legalSquares, pieceSquare, type, partial, onCorrect, onWrong])

  const squareStyles = {
    [pieceSquare]: { backgroundColor: 'rgba(255, 215, 0, 0.6)' },
  }
  selected.forEach(sq => {
    squareStyles[sq] = { backgroundColor: 'rgba(107, 203, 119, 0.75)' }
  })
  wrong.forEach(sq => {
    squareStyles[sq] = { backgroundColor: 'rgba(255, 80, 80, 0.75)' }
  })

  return (
    <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ width: boardSize }}>
      <Chessboard
        options={{
          position: fen,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          canDragPiece: ({ square }) => !done && square === pieceSquare,
          squareStyles,
          allowDragging: !done,
          boardWidth: boardSize,
          boardStyle: { borderRadius: '12px' },
          darkSquareStyle: { backgroundColor: '#4a6741' },
          lightSquareStyle: { backgroundColor: '#f0d9b5' },
        }}
      />
    </div>
  )
}
