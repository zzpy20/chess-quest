import { useState } from 'react'
import { PIECES } from '../../data/pieces'
import PieceCard from './PieceCard'
import ChallengeView from './ChallengeView'

export default function LearnPiece({ progress, onBack, markChallengeComplete, markPieceMastered, addStars }) {
  const [selected, setSelected] = useState(null)
  const [challengeIdx, setChallengeIdx] = useState(null)

  const handleSelectPiece = (piece) => {
    setSelected(piece)
    setChallengeIdx(null)
  }

  const handleStartChallenge = (idx) => {
    setChallengeIdx(idx)
  }

  const handleChallengeComplete = () => {
    markChallengeComplete(selected.id, challengeIdx)
    addStars(1)
    const completed = progress.piecesLearned[selected.id]?.completedChallenges || []
    const allDone = selected.challenges.every((_, i) => completed.includes(i) || i === challengeIdx)
    if (allDone) {
      markPieceMastered(selected.id)
    }
    setChallengeIdx(null)
  }

  if (challengeIdx !== null && selected) {
    return (
      <ChallengeView
        piece={selected}
        challengeIdx={challengeIdx}
        totalChallenges={selected.challenges.length}
        onComplete={handleChallengeComplete}
        onBack={() => setChallengeIdx(null)}
        completed={progress.piecesLearned[selected.id]?.completedChallenges || []}
      />
    )
  }

  if (selected) {
    return (
      <PieceCard
        piece={selected}
        onBack={() => setSelected(null)}
        onStartChallenge={handleStartChallenge}
        completed={progress.piecesLearned[selected.id]?.completedChallenges || []}
        isMastered={progress.badges.includes(`piece-${selected.id}`)}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-1 text-sm">
          ← Back
        </button>
        <h1 className="text-3xl font-black text-white text-center mb-2">Learn a Piece</h1>
        <p className="text-white/70 text-center mb-6 text-sm">Pick a chess piece to learn about!</p>

        <div className="grid grid-cols-2 gap-4">
          {PIECES.map(piece => {
            const completedCount = progress.piecesLearned[piece.id]?.completedChallenges?.length || 0
            const isMastered = progress.badges.includes(`piece-${piece.id}`)
            return (
              <button
                key={piece.id}
                onClick={() => handleSelectPiece(piece)}
                className={`bg-gradient-to-br ${piece.bg} rounded-2xl p-4 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform relative overflow-hidden`}
              >
                {isMastered && (
                  <div className="absolute top-2 right-2 text-lg">⭐</div>
                )}
                <div className="text-5xl mb-2">{piece.emoji}</div>
                <div className="font-black text-lg">{piece.name}</div>
                <div className="text-white/80 text-xs mt-1">{piece.title}</div>
                {completedCount > 0 && (
                  <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                    {completedCount}/{piece.challenges.length} done
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
