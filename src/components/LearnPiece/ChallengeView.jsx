import { useState } from 'react'
import ChallengeBoard from '../ui/ChallengeBoard'
import Confetti from '../ui/Confetti'
import StarBurst from '../ui/StarBurst'

export default function ChallengeView({ piece, challengeIdx, totalChallenges, onComplete, onBack, completed }) {
  const challenge = piece.challenges[challengeIdx]
  const alreadyDone = completed.includes(challengeIdx)

  const [state, setState] = useState(alreadyDone ? 'done' : 'playing')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const handleCorrect = () => {
    setState('done')
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2500)
  }

  const handleWrong = () => {
    setWrongCount(c => c + 1)
    if (wrongCount >= 1) setShowHint(true)
  }

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1

  return (
    <div className="min-h-screen px-4 py-6">
      <Confetti active={confetti} />
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-1 text-sm">
          ← {piece.name}
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{piece.emoji}</span>
          <div>
            <h2 className="text-white font-black text-xl">{piece.name} — Challenge {challengeIdx + 1}</h2>
            <p className="text-white/60 text-xs">{challengeIdx + 1} of {totalChallenges}</p>
          </div>
        </div>

        {/* Instruction bubble */}
        <div className="bg-white/15 rounded-2xl p-4 mb-5 text-white">
          <p className="font-bold text-base leading-relaxed">{challenge.instruction}</p>
          {challenge.type === 'tap-moves' && !challenge.partial && (
            <p className="text-white/60 text-xs mt-1">Tap every green square!</p>
          )}
          {challenge.type === 'tap-moves' && challenge.partial && (
            <p className="text-white/60 text-xs mt-1">Tap 5 or more valid squares!</p>
          )}
        </div>

        {/* Board */}
        <ChallengeBoard
          key={challengeIdx}
          challenge={challenge}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />

        {/* Hint */}
        {showHint && state !== 'done' && (
          <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-3 text-yellow-200 text-sm">
            💡 <strong>Hint:</strong> {challenge.hint || 'Think carefully about how this piece moves!'}
          </div>
        )}
        {!showHint && state !== 'done' && wrongCount === 0 && (
          <button
            onClick={() => setShowHint(true)}
            className="mt-4 w-full text-white/40 hover:text-white/70 text-xs py-2 transition-colors"
          >
            Need a hint? 💡
          </button>
        )}

        {/* Success state */}
        {state === 'done' && (
          <div className="mt-5 bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-5 text-center animate-pop">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-white font-black text-xl">
              {alreadyDone ? 'Already Mastered!' : 'Amazing job!'}
            </h3>
            <StarBurst count={alreadyDone ? 3 : stars} />
            <p className="text-white/70 text-sm mb-4">
              {alreadyDone ? 'You already completed this one!' : `+${stars} star${stars > 1 ? 's' : ''} earned!`}
            </p>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-400 text-white font-black py-3 px-8 rounded-xl text-lg transition-colors"
            >
              {challengeIdx + 1 < totalChallenges ? 'Next Challenge →' : '✅ All Done!'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
