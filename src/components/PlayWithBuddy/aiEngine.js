import { Chess } from 'chess.js'

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

// Piece-square tables: row 0 = rank 8 (black's back rank), row 7 = rank 1 (white's back rank)
const PST = {
  p: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [ 50, 50, 50, 50, 50, 50, 50, 50],
    [ 10, 10, 20, 30, 30, 20, 10, 10],
    [  5,  5, 10, 25, 25, 10,  5,  5],
    [  0,  0,  0, 20, 20,  0,  0,  0],
    [  5, -5,-10,  0,  0,-10, -5,  5],
    [  5, 10, 10,-20,-20, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0],
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  r: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  0,  0,  0,  5,  5,  0,  0,  0],
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20],
  ],
  // King endgame PST (used when material is low)
  kEnd: [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50],
  ],
}

// Positive score = good for black. Uses endgame king table when total material is low.
function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'b' ? -30000 : 30000
  if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) return 0

  let score = 0
  let totalMaterial = 0
  const board = chess.board()

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = board[row][col]
      if (!sq || sq.type === 'k') continue
      totalMaterial += PIECE_VALUES[sq.type] || 0
    }
  }
  const isEndgame = totalMaterial < 1300 // roughly: both queens gone + some pieces

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = board[row][col]
      if (!sq) continue
      const mat = PIECE_VALUES[sq.type] || 0
      const pstRow = sq.color === 'b' ? row : 7 - row
      const table = sq.type === 'k' && isEndgame ? PST.kEnd : PST[sq.type]
      const pos = table?.[pstRow]?.[col] ?? 0
      score += sq.color === 'b' ? (mat + pos) : -(mat + pos)
    }
  }
  return score
}

// MVV-LVA: prefer capturing high-value pieces with low-value attackers
function moveScore(move) {
  if (!move.captured) return 0
  return (PIECE_VALUES[move.captured] || 0) * 10 - (PIECE_VALUES[move.piece] || 0)
}

function orderMoves(moves) {
  return moves.slice().sort((a, b) => moveScore(b) - moveScore(a))
}

// Quiescence search: keep searching captures at depth 0 to avoid horizon effect
function quiesce(chess, alpha, beta, maximising) {
  const standPat = evaluate(chess)
  if (maximising) {
    if (standPat >= beta) return beta
    if (standPat > alpha) alpha = standPat
    for (const move of orderMoves(chess.moves({ verbose: true }).filter(m => m.captured))) {
      chess.move(move)
      const score = quiesce(chess, alpha, beta, false)
      chess.undo()
      if (score > alpha) alpha = score
      if (alpha >= beta) return beta
    }
    return alpha
  } else {
    if (standPat <= alpha) return alpha
    if (standPat < beta) beta = standPat
    for (const move of orderMoves(chess.moves({ verbose: true }).filter(m => m.captured))) {
      chess.move(move)
      const score = quiesce(chess, alpha, beta, true)
      chess.undo()
      if (score < beta) beta = score
      if (alpha >= beta) return alpha
    }
    return beta
  }
}

function alphaBeta(chess, depth, alpha, beta, maximising, useQuiesce = false) {
  if (depth === 0) {
    return useQuiesce ? quiesce(chess, alpha, beta, maximising) : evaluate(chess)
  }
  if (chess.isGameOver()) return evaluate(chess)

  const moves = orderMoves(chess.moves({ verbose: true }))

  if (maximising) {
    let best = -Infinity
    for (const move of moves) {
      chess.move(move)
      best = Math.max(best, alphaBeta(chess, depth - 1, alpha, beta, false, useQuiesce))
      chess.undo()
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      chess.move(move)
      best = Math.min(best, alphaBeta(chess, depth - 1, alpha, beta, true, useQuiesce))
      chess.undo()
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

function bestMoveAtDepth(chess, depth, useQuiesce = false) {
  const moves = orderMoves(chess.moves({ verbose: true }))
  if (!moves.length) return null

  const aiIsBlack = chess.turn() === 'b'
  let bestMove = null
  let bestScore = aiIsBlack ? -Infinity : Infinity

  for (const move of moves) {
    chess.move(move)
    // After AI's move, the opponent gets to move. Black maximises, white minimises.
    const maximising = chess.turn() === 'b'
    const score = alphaBeta(chess, depth - 1, -Infinity, Infinity, maximising, useQuiesce)
    chess.undo()
    if (aiIsBlack ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  return bestMove
}

export function getAIMove(fen, level) {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (!moves.length) return null

  if (level === 'dragon') {
    if (Math.random() < 0.35) {
      const captures = moves.filter(m => m.captured)
      if (captures.length) return captures[Math.floor(Math.random() * captures.length)]
    }
    return moves[Math.floor(Math.random() * moves.length)]
  }

  if (level === 'puppy') {
    const captures = orderMoves(moves.filter(m => m.captured))
    if (captures.length) return captures[0]
    return moves[Math.floor(Math.random() * moves.length)]
  }

  if (level === 'knight') return bestMoveAtDepth(chess, 3)
  if (level === 'lion')   return bestMoveAtDepth(chess, 4)
  if (level === 'wizard') return bestMoveAtDepth(chess, 5, true) // 5-ply + quiescence

  return moves[Math.floor(Math.random() * moves.length)]
}
