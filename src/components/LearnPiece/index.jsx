import { useState } from 'react'
import { PIECES } from '../../data/pieces'
import PieceCard from './PieceCard'
import ChallengeView from './ChallengeView'

export default function LearnPiece({ progress, onBack, markChallengeComplete, markPieceMastered, addStars }) {
  const [selected, setSelected] = useState(null)
  const [challengeIdx, setChallengeIdx] = useState(null)

  const handleChallengeComplete = () => {
    markChallengeComplete(selected.id, challengeIdx)
    addStars(1)
    const completed = progress.piecesLearned[selected.id]?.completedChallenges || []
    const allDone = selected.challenges.every((_, i) => completed.includes(i) || i === challengeIdx)
    if (allDone) markPieceMastered(selected.id)
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
        onStartChallenge={(idx) => setChallengeIdx(idx)}
        completed={progress.piecesLearned[selected.id]?.completedChallenges || []}
        isMastered={progress.badges.includes(`piece-${selected.id}`)}
      />
    )
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-[680px] mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Back
        </button>
        <h1 className="text-4xl font-black text-white text-center mb-2">Learn a Piece</h1>
        <p className="text-white/60 text-center mb-8 text-base">Pick a chess piece to learn about!</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {PIECES.map(piece => {
            const completedCount = progress.piecesLearned[piece.id]?.completedChallenges?.length || 0
            const isMastered = progress.badges.includes(`piece-${piece.id}`)
            return (
              <button
                key={piece.id}
                onClick={() => setSelected(piece)}
                className={`bg-gradient-to-br ${piece.bg} rounded-3xl p-5 md:p-6 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform relative overflow-hidden`}
              >
                {isMastered && (
                  <div className="absolute top-3 right-3 text-2xl">⭐</div>
                )}
                <div className="text-6xl mb-3">{piece.emoji}</div>
                <div className="font-black text-xl">{piece.name}</div>
                <div className="text-white/80 text-sm mt-1">{piece.title}</div>
                {completedCount > 0 && (
                  <div className="mt-3 text-sm bg-white/20 rounded-full px-3 py-1">
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
