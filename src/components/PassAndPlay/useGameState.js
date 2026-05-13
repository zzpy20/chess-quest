import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import { playMove, playCapture, playCheck, playWin } from '../../utils/sounds'

export function useGameState() {
  const chessRef = useRef(new Chess())
  const [position, setPosition] = useState(() => chessRef.current.fen())
  const [status, setStatus] = useState('playing')
  const [lastMove, setLastMove] = useState(null)
  const [moveCount, setMoveCount] = useState(0)

  const chess = chessRef.current

  const resolveStatus = useCallback((c) => {
    if (c.isCheckmate()) return c.turn() === 'w' ? 'black-wins' : 'white-wins'
    if (c.isDraw() || c.isStalemate() || c.isInsufficientMaterial()) return 'draw'
    return 'playing'
  }, [])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (status !== 'playing') return false

    let move
    try {
      move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      return false
    }
    if (!move) return false

    setPosition(chess.fen())
    setLastMove({ from: sourceSquare, to: targetSquare })
    setMoveCount(c => c + 1)
    move.captured ? playCapture() : playMove()

    const newStatus = resolveStatus(chess)
    if (newStatus !== 'playing') {
      setStatus(newStatus)
      playWin()
      return true
    }

    if (chess.inCheck()) playCheck()
    return true
  }, [chess, status, resolveStatus])

  const resetGame = useCallback(() => {
    chess.reset()
    setPosition(chess.fen())
    setStatus('playing')
    setLastMove(null)
    setMoveCount(0)
  }, [chess])

  return { position, status, lastMove, moveCount, currentTurn: chess.turn(), onPieceDrop, resetGame }
}
