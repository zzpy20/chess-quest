import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { CHECKMATES } from '../../data/checkmates'
import { CHECKMATES2 } from '../../data/checkmates2'
import ChallengeBoard from '../ui/ChallengeBoard'
import Confetti from '../ui/Confetti'
import { useBoardSize } from '../../hooks/useBoardSize'
import { playWin, playWrong, playMove } from '../../utils/sounds'

// ─── Mate-in-2 interactive board ────────────────────────────────────────────

function Puzzle2Board({ puzzle, onSolved, onWrong: reportWrong }) {
  const boardSize = useBoardSize()

  // step: 'move1' | 'ai-thinking' | 'move2' | 'done'
  const [step, setStep] = useState('move1')
  const [fen, setFen] = useState(puzzle.fen)
  const [wrongSquares, setWrongSquares] = useState([])
  const [aiHighlight, setAiHighlight] = useState(null) // { from, to }
  const aiTimer = useRef(null)

  // Reset if puzzle changes
  useEffect(() => {
    setStep('move1')
    setFen(puzzle.fen)
    setWrongSquares([])
    setAiHighlight(null)
    clearTimeout(aiTimer.current)
  }, [puzzle.id])

  useEffect(() => () => clearTimeout(aiTimer.current), [])

  const flashWrong = useCallback((sq) => {
    setWrongSquares([sq])
    reportWrong?.()
    setTimeout(() => setWrongSquares([]), 600)
  }, [reportWrong])

  const applyMove1 = useCallback((targetSquare) => {
    if (!puzzle.answer1.includes(targetSquare)) {
      flashWrong(targetSquare)
      return
    }
    const chess = new Chess(fen)
    chess.move({ from: puzzle.pieceSquare, to: targetSquare, promotion: 'q' })
    const fenAfterMove1 = chess.fen()
    setFen(fenAfterMove1)
    setStep('ai-thinking')

    // Show AI move highlight briefly, then commit
    setAiHighlight(puzzle.aiMove)
    playMove()
    aiTimer.current = setTimeout(() => {
      chess.move({ from: puzzle.aiMove.from, to: puzzle.aiMove.to, promotion: 'q' })
      playMove()
      setFen(chess.fen())
      setAiHighlight(null)
      setStep('move2')
    }, 900)
  }, [fen, puzzle, flashWrong])

  const applyMove2 = useCallback((targetSquare) => {
    const chess = new Chess(fen)
    // piece2Square is the current square of the piece to move for checkmate
    const from = puzzle.piece2Square
    let result
    try {
      result = chess.move({ from, to: targetSquare, promotion: 'q' })
    } catch { result = null }
    if (!result) { flashWrong(targetSquare); return }
    if (chess.isCheckmate()) {
      setFen(chess.fen())
      setStep('done')
      onSolved?.()
    } else {
      chess.undo()
      flashWrong(targetSquare)
    }
  }, [fen, puzzle, flashWrong, onSolved])

  const handlePieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (step === 'move1' && sourceSquare === puzzle.pieceSquare) {
      applyMove1(targetSquare)
    } else if (step === 'move2' && sourceSquare === puzzle.piece2Square) {
      applyMove2(targetSquare)
    }
    return false
  }, [step, puzzle, applyMove1, applyMove2])

  const handleSquareClick = useCallback(({ square }) => {
    if (step === 'move1') {
      if (square === puzzle.pieceSquare) return
      applyMove1(square)
    } else if (step === 'move2') {
      if (square === puzzle.piece2Square) return
      applyMove2(square)
    }
  }, [step, puzzle, applyMove1, applyMove2])

  // Build square styles
  const squareStyles = {}
  if (step === 'move1') {
    squareStyles[puzzle.pieceSquare] = { backgroundColor: 'rgba(255, 215, 0, 0.6)' }
  } else if (step === 'ai-thinking' && aiHighlight) {
    squareStyles[aiHighlight.from] = { backgroundColor: 'rgba(255, 140, 0, 0.45)' }
    squareStyles[aiHighlight.to]   = { backgroundColor: 'rgba(255, 140, 0, 0.65)' }
  } else if (step === 'move2') {
    squareStyles[puzzle.piece2Square] = { backgroundColor: 'rgba(255, 215, 0, 0.6)' }
  } else if (step === 'done') {
    squareStyles[puzzle.piece2Square] = { backgroundColor: 'rgba(107, 203, 119, 0.75)' }
  }
  wrongSquares.forEach(sq => {
    squareStyles[sq] = { backgroundColor: 'rgba(255, 80, 80, 0.75)' }
  })

  const isDraggable = step === 'move1' || step === 'move2'

  const stepLabel = step === 'move1'
    ? '🎯 Step 1 of 2 — Make your first move!'
    : step === 'ai-thinking'
    ? '⚡ Good! Enemy responds...'
    : step === 'move2'
    ? '♟ Step 2 of 2 — Deliver CHECKMATE!'
    : null

  return (
    <div>
      {stepLabel && (
        <div className={`rounded-xl px-4 py-2 text-sm font-bold text-center mb-3 ${
          step === 'move1' ? 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-200'
          : step === 'ai-thinking' ? 'bg-blue-500/20 border border-blue-400/40 text-blue-200'
          : 'bg-green-500/20 border border-green-400/40 text-green-200'
        }`}>
          {stepLabel}
        </div>
      )}
      <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ width: boardSize }}>
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            canDragPiece: ({ square }) => {
              if (step === 'move1') return square === puzzle.pieceSquare
              if (step === 'move2') return square === puzzle.piece2Square
              return false
            },
            squareStyles,
            allowDragging: isDraggable,
            boardWidth: boardSize,
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#4a6741' },
            lightSquareStyle: { backgroundColor: '#f0d9b5' },
          }}
        />
      </div>
    </div>
  )
}


// ─── Mate-in-2 puzzle screen ─────────────────────────────────────────────────

function Puzzle2Screen({ puzzle, idx, totalPuzzles, solved, onSolved, onGo, onBack }) {
  const [step, setStep] = useState('move1')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [boardKey, setBoardKey] = useState(0)

  const alreadyDone = solved.includes(puzzle.id)

  const handleSolved = () => {
    setStep('done')
    setConfetti(true)
    playWin()
    if (!alreadyDone) onSolved(puzzle.id)
    setTimeout(() => setConfetti(false), 2500)
  }

  const handleWrong = () => {
    playWrong()
    setWrongCount(c => c + 1)
    if (wrongCount >= 1) setShowHint(true)
  }

  const retry = () => {
    setStep('move1')
    setWrongCount(0)
    setShowHint(false)
    setConfetti(false)
    setBoardKey(k => k + 1)
  }

  return (
    <div>
      <Confetti active={confetti} />

      {/* Instruction */}
      <div className="bg-white/15 rounded-3xl p-5 mb-4 text-white">
        <p className="font-bold text-lg leading-relaxed">
          {showChinese ? puzzle.zh_instruction : puzzle.instruction}
        </p>
        {!showChinese && (
          <p className="text-white/50 text-sm mt-2">Drag or tap the highlighted piece to move it.</p>
        )}
      </div>

      <button
        onClick={() => setShowChinese(s => !s)}
        className="w-full mb-4 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl py-3 text-base font-bold transition-colors"
      >
        {showChinese ? '🇬🇧 Switch to English' : '👨 爸爸看 (Chinese)'}
      </button>

      <Puzzle2Board
        key={boardKey}
        puzzle={puzzle}
        onSolved={handleSolved}
        onWrong={handleWrong}
      />

      {/* Hint */}
      {showHint && step !== 'done' && (
        <div className="mt-5 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-4 text-yellow-200 text-base">
          💡 <strong>{showChinese ? '提示' : 'Hint'}:</strong>{' '}
          {showChinese ? puzzle.zh_hint : puzzle.hint}
        </div>
      )}
      {!showHint && step !== 'done' && (
        <button
          onClick={() => setShowHint(true)}
          className="mt-5 w-full text-white/40 hover:text-white/60 text-base py-3 transition-colors"
        >
          {showChinese ? '需要提示？💡' : 'Need a hint? 💡'}
        </button>
      )}

      {/* Success */}
      {step === 'done' && (
        <div className="mt-6 bg-gradient-to-br from-green-400/30 to-emerald-400/30 border-2 border-green-400/50 rounded-3xl p-8 text-center animate-pop">
          <div className="text-6xl mb-3">♟</div>
          <h3 className="text-white font-black text-3xl mb-2">Checkmate in 2!</h3>
          <p className="text-white/80 text-lg mb-7">
            {alreadyDone ? 'You already solved this one!' : wrongCount === 0 ? 'Perfect! Found it first try!' : 'Well done! You found the 2-move mate!'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {idx < totalPuzzles - 1 && (
              <button
                onClick={() => onGo(idx + 1)}
                className="bg-white text-gray-900 font-black py-4 px-8 rounded-2xl text-xl hover:bg-gray-100 transition-colors"
              >
                Next →
              </button>
            )}
            <button
              onClick={retry}
              className="bg-white/20 text-white font-black py-4 px-8 rounded-2xl text-xl hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main CheckmatePuzzles component ─────────────────────────────────────────

export default function CheckmatePuzzles({ progress, onBack, markCheckmateSolved, markCheckmate2Solved }) {
  const [tab, setTab] = useState('1move')          // '1move' | '2move'
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState('playing')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const puzzles1 = CHECKMATES
  const puzzles2 = CHECKMATES2
  const currentList = tab === '1move' ? puzzles1 : puzzles2
  const puzzle = currentList[idx]

  const solved1 = progress.checkmateSolved || []
  const solved2 = progress.checkmate2Solved || []
  const currentSolved = tab === '1move' ? solved1 : solved2

  const switchTab = (t) => {
    setTab(t)
    setIdx(0)
    setState('playing')
    setWrongCount(0)
    setShowHint(false)
  }

  const goTo = (newIdx) => {
    setIdx(newIdx)
    setState('playing')
    setWrongCount(0)
    setShowHint(false)
  }

  // ─── 1-move puzzle handlers ────────────────────────────────────────────────

  const handleCorrect1 = () => {
    setState('solved')
    setConfetti(true)
    playWin()
    markCheckmateSolved(puzzle.id)
    setTimeout(() => setConfetti(false), 2500)
  }

  const handleWrong1 = () => {
    playWrong()
    setWrongCount(c => c + 1)
    if (wrongCount >= 1) setShowHint(true)
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <Confetti active={confetti} />
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-6xl mb-3">♟</div>
          <h1 className="text-4xl font-black text-white">Checkmate Trainer</h1>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-5 bg-white/10 rounded-2xl p-1">
          <button
            onClick={() => switchTab('1move')}
            className={`flex-1 py-3 rounded-xl font-black text-base transition-all ${
              tab === '1move' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
            }`}
          >
            ♟ Mate in 1
            <span className="ml-2 text-sm font-normal opacity-70">({solved1.length}/{puzzles1.length})</span>
          </button>
          <button
            onClick={() => switchTab('2move')}
            className={`flex-1 py-3 rounded-xl font-black text-base transition-all ${
              tab === '2move' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
            }`}
          >
            ♟♟ Mate in 2
            <span className="ml-2 text-sm font-normal opacity-70">({solved2.length}/{puzzles2.length})</span>
          </button>
        </div>

        {/* Explainer */}
        <div className="bg-white/10 rounded-2xl px-5 py-3 mb-5 text-white/70 text-sm leading-relaxed">
          {tab === '1move' ? (
            <>
              <span className="text-white font-bold">Checkmate in 1: </span>
              Find the one move that traps the King — no escape!
              <span className="text-white/40"> 👨 一步将死</span>
            </>
          ) : (
            <>
              <span className="text-white font-bold">Checkmate in 2: </span>
              Make two moves to force checkmate — even after the enemy responds!
              <span className="text-white/40"> 👨 两步将死——即使对方应对也逃不掉</span>
            </>
          )}
        </div>

        {/* Puzzle nav bar */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {currentList.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              className={`w-10 h-10 rounded-xl font-black text-base transition-all ${
                i === idx
                  ? 'bg-yellow-400 text-yellow-900 scale-110'
                  : currentSolved.includes(p.id)
                  ? 'bg-green-500/70 text-white'
                  : 'bg-white/15 text-white/60 hover:bg-white/25'
              }`}
            >
              {currentSolved.includes(p.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>

        {/* Puzzle title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-2xl">{puzzle.title}</h2>
          <span className="text-white/40 text-sm">#{idx + 1} of {currentList.length}</span>
        </div>

        {/* ─── Mate-in-1 board ─── */}
        {tab === '1move' && (
          <>
            <div className="bg-white/15 rounded-3xl p-5 mb-4 text-white">
              <p className="font-bold text-lg leading-relaxed">
                {showChinese ? puzzle.zh_instruction : puzzle.instruction}
              </p>
            </div>

            <button
              onClick={() => setShowChinese(s => !s)}
              className="w-full mb-5 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl py-3 text-base font-bold transition-colors"
            >
              {showChinese ? '🇬🇧 Switch to English' : '👨 爸爸看 (Chinese)'}
            </button>

            {state === 'playing' && (
              <ChallengeBoard
                key={idx}
                challenge={puzzle}
                onCorrect={handleCorrect1}
                onWrong={handleWrong1}
              />
            )}

            {showHint && state === 'playing' && (
              <div className="mt-5 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-4 text-yellow-200 text-base">
                💡 <strong>{showChinese ? '提示' : 'Hint'}:</strong>{' '}
                {showChinese ? puzzle.zh_hint : puzzle.hint}
              </div>
            )}
            {!showHint && state === 'playing' && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-5 w-full text-white/40 hover:text-white/60 text-base py-3 transition-colors"
              >
                {showChinese ? '需要提示？💡' : 'Need a hint? 💡'}
              </button>
            )}

            {state === 'solved' && (
              <div className="mt-6 bg-gradient-to-br from-green-400/30 to-emerald-400/30 border-2 border-green-400/50 rounded-3xl p-8 text-center animate-pop">
                <div className="text-6xl mb-3">♟</div>
                <h3 className="text-white font-black text-3xl mb-2">Checkmate!</h3>
                <p className="text-white/80 text-lg mb-7">
                  {wrongCount === 0 ? 'Perfect — you spotted it first try!' : 'Well done! You found the checkmate!'}
                </p>
                <div className="flex gap-4 justify-center">
                  {idx < puzzles1.length - 1 && (
                    <button
                      onClick={() => goTo(idx + 1)}
                      className="bg-white text-gray-900 font-black py-4 px-8 rounded-2xl text-xl hover:bg-gray-100 transition-colors"
                    >
                      Next →
                    </button>
                  )}
                  <button
                    onClick={() => goTo(idx)}
                    className="bg-white/20 text-white font-black py-4 px-8 rounded-2xl text-xl hover:bg-white/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
                {idx === puzzles1.length - 1 && solved1.length >= puzzles1.length && (
                  <p className="text-yellow-300 font-black text-xl mt-6">🏆 All {puzzles1.length} checkmates solved!</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── Mate-in-2 board ─── */}
        {tab === '2move' && (
          <Puzzle2Screen
            key={`2-${idx}`}
            puzzle={puzzle}
            idx={idx}
            totalPuzzles={puzzles2.length}
            solved={solved2}
            onSolved={markCheckmate2Solved}
            onGo={goTo}
            onBack={onBack}
          />
        )}

      </div>
    </div>
  )
}
