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
  const [showChinese, setShowChinese] = useState(false)
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
    <div className="min-h-screen px-6 py-8">
      <Confetti active={confetti} />
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← {piece.name}
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{piece.emoji}</span>
          <div>
            <h2 className="text-white font-black text-2xl">{piece.name} — Challenge {challengeIdx + 1}</h2>
            <p className="text-white/50 text-sm">{challengeIdx + 1} of {totalChallenges}</p>
          </div>
        </div>

        {/* Instruction */}
        <div className="bg-white/15 rounded-3xl p-5 mb-4 text-white">
          <p className="font-bold text-lg leading-relaxed">
            {showChinese && challenge.zh_instruction ? challenge.zh_instruction : challenge.instruction}
          </p>
          {!showChinese && challenge.type === 'tap-moves' && !challenge.partial && (
            <p className="text-white/50 text-sm mt-2">Tap every valid square to complete!</p>
          )}
          {!showChinese && challenge.type === 'tap-moves' && challenge.partial && (
            <p className="text-white/50 text-sm mt-2">Tap 5 or more valid squares!</p>
          )}
        </div>

        {/* Dad toggle */}
        <button
          onClick={() => setShowChinese(s => !s)}
          className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl py-3 text-base font-bold transition-colors"
        >
          {showChinese ? '🇬🇧 Switch to English' : '👨 爸爸看 (Chinese)'}
        </button>

        {/* Board */}
        <ChallengeBoard
          key={challengeIdx}
          challenge={challenge}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />

        {/* Hint */}
        {showHint && state !== 'done' && (
          <div className="mt-5 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-4 text-yellow-200 text-base">
            💡 <strong>{showChinese ? '提示' : 'Hint'}:</strong>{' '}
            {showChinese
              ? (challenge.zh_hint || challenge.hint || '仔细想想这个棋子是怎么走的！')
              : (challenge.hint || 'Think carefully about how this piece moves!')}
          </div>
        )}
        {!showHint && state !== 'done' && (
          <button
            onClick={() => setShowHint(true)}
            className="mt-5 w-full text-white/40 hover:text-white/60 text-base py-3 transition-colors"
          >
            {showChinese ? '需要提示？💡' : 'Need a hint? 💡'}
          </button>
        )}

        {/* Success */}
        {state === 'done' && (
          <div className="mt-6 bg-green-500/20 border-2 border-green-400/50 rounded-3xl p-8 text-center animate-pop">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-white font-black text-2xl">
              {alreadyDone ? 'Already Mastered!' : 'Amazing job!'}
            </h3>
            <StarBurst count={alreadyDone ? 3 : stars} />
            <p className="text-white/70 text-base mb-6">
              {alreadyDone ? 'You already completed this one!' : `+${stars} star${stars > 1 ? 's' : ''} earned!`}
            </p>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-400 text-white font-black py-4 px-10 rounded-2xl text-xl transition-colors"
            >
              {challengeIdx + 1 < totalChallenges ? 'Next Challenge →' : '✅ All Done!'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
