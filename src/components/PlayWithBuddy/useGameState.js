import { useState, useCallback, useRef, useEffect } from 'react'
import { Chess } from 'chess.js'
import { getAIMove } from './aiEngine'
import { playMove, playCapture, playCheck, playWin, playLose } from '../../utils/sounds'

const PLAYER_MSGS = [
  "Your turn! Make a move! ♟",
  "Think carefully — what's your plan? 🤔",
  "Your move! Make it count! ⭐",
  "Show Buddy what you've got! 💪",
]

function triggerAI(chess, level, setPosition, setLastMove, setMoveCount, setIsThinking, setMessage, setStatus, resolveStatus, aiColor) {
  setIsThinking(true)
  const thinkMsg = level === 'wizard' ? '🧙 Wizard is calculating deeply...'
    : level === 'lion' ? '🦁 Lion is plotting tactics...'
    : '🤔 Buddy is thinking...'
  setMessage(thinkMsg)
  setTimeout(() => {
    const aiMove = getAIMove(chess.fen(), level)
    if (aiMove) {
      const result = chess.move(aiMove)
      setPosition(chess.fen())
      setLastMove({ from: aiMove.from, to: aiMove.to, piece: result.piece, captured: result.captured || null })
      setMoveCount(c => c + 1)
      result.captured ? playCapture() : playMove()

      const s = resolveStatus(chess, aiColor)
      if (s !== 'playing') {
        setStatus(s)
        s === 'won' ? playWin() : playLose()
        setIsThinking(false)
        return
      }
      if (chess.inCheck()) {
        setMessage("Watch out! Your King is in check! 👑")
        playCheck()
      } else {
        setMessage(PLAYER_MSGS[Math.floor(Math.random() * PLAYER_MSGS.length)])
      }
    }
    setIsThinking(false)
  }, 700)
}

export function useGameState(level, side = 'w') {
  const chessRef = useRef(new Chess())
  const [position, setPosition] = useState(() => chessRef.current.fen())
  const [status, setStatus] = useState('playing')
  const [message, setMessage] = useState(
    side === 'b' ? "🤔 Buddy is thinking..." : "Your turn! Drag a piece to move it."
  )
  const [isThinking, setIsThinking] = useState(side === 'b')
  const [lastMove, setLastMove] = useState(null)
  const [moveCount, setMoveCount] = useState(0)
  const [history, setHistory] = useState([])

  const chess = chessRef.current
  const aiColor = side === 'w' ? 'b' : 'w'

  const resolveStatus = useCallback((c, aiSide) => {
    if (c.isCheckmate()) return c.turn() === aiSide ? 'won' : 'lost'
    if (c.isDraw() || c.isStalemate() || c.isInsufficientMaterial()) return 'draw'
    return 'playing'
  }, [])

  // If playing as black, Buddy moves first
  useEffect(() => {
    if (side !== 'b') return
    setTimeout(() => {
      const aiMove = getAIMove(chess.fen(), level)
      if (aiMove) {
        const result = chess.move(aiMove)
        setPosition(chess.fen())
        setLastMove({ from: aiMove.from, to: aiMove.to, piece: result.piece, captured: result.captured || null })
        setMoveCount(1)
        setHistory(chess.history())
        result.captured ? playCapture() : playMove()
      }
      setIsThinking(false)
      setMessage("Your turn! Drag a piece to move it.")
    }, 700)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (isThinking || status !== 'playing') return false
    if (chess.turn() !== side) return false

    let move
    try {
      move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      return false
    }
    if (!move) return false

    setPosition(chess.fen())
    setLastMove({ from: sourceSquare, to: targetSquare, piece: move.piece, captured: move.captured || null })
    setMoveCount(c => c + 1)
    setHistory(chess.history())
    move.captured ? playCapture() : playMove()

    const newStatus = resolveStatus(chess, aiColor)
    if (newStatus !== 'playing') {
      setStatus(newStatus)
      newStatus === 'won' ? playWin() : playLose()
      return true
    }

    if (chess.inCheck()) {
      setMessage("Nice! Buddy is in check! ⚔️")
      playCheck()
    }

    triggerAI(chess, level, setPosition, setLastMove, setMoveCount, setIsThinking, setMessage, setStatus,
      (c) => resolveStatus(c, aiColor), aiColor)

    // Update history after AI move (inside setTimeout above — we do it here too for the player's move)
    return true
  }, [chess, isThinking, status, level, side, aiColor, resolveStatus])

  const resetGame = useCallback(() => {
    chess.reset()
    setPosition(chess.fen())
    setStatus('playing')
    setLastMove(null)
    setMoveCount(0)
    setHistory([])

    if (side === 'b') {
      setIsThinking(true)
      setMessage("🤔 Buddy is thinking...")
      setTimeout(() => {
        const aiMove = getAIMove(chess.fen(), level)
        if (aiMove) {
          chess.move(aiMove)
          setPosition(chess.fen())
          setLastMove({ from: aiMove.from, to: aiMove.to })
          setMoveCount(1)
          setHistory(chess.history())
          aiMove.captured ? playCapture() : playMove()
        }
        setIsThinking(false)
        setMessage("Your turn! Drag a piece to move it.")
      }, 700)
    } else {
      setIsThinking(false)
      setMessage("Your turn! Drag a piece to move it.")
    }
  }, [chess, side, level])

  return { position, status, message, isThinking, lastMove, moveCount, history, side, onPieceDrop, resetGame }
}
