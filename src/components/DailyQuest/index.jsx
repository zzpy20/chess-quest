import { useState } from 'react'
import { QUESTS } from '../../data/quests'
import ChallengeBoard from '../ui/ChallengeBoard'
import Confetti from '../ui/Confetti'
import StarBurst from '../ui/StarBurst'

export default function DailyQuest({ progress, onBack, markQuestComplete, addStars }) {
  // Cycle through quests based on how many have been done
  const questIndex = progress.questsCompleted.length % QUESTS.length
  const quest = QUESTS[questIndex]
  const alreadyDone = progress.isQuestDone ? false : false // always show next quest

  const [state, setState] = useState('playing')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const handleCorrect = () => {
    setState('done')
    setConfetti(true)
    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
    addStars(stars)
    markQuestComplete(quest.id)
    setTimeout(() => setConfetti(false), 2500)
  }

  const handleWrong = () => {
    setWrongCount(c => c + 1)
    if (wrongCount >= 1) setShowHint(true)
  }

  const handleNextQuest = () => {
    setState('playing')
    setWrongCount(0)
    setShowHint(false)
    setConfetti(false)
    markQuestComplete(quest.id)
    // Parent will re-render with next quest index
    onBack()
  }

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1

  return (
    <div className="min-h-screen px-4 py-6">
      <Confetti active={confetti} />
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-1 text-sm">
          ← Home
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🗺️</div>
          <h1 className="text-3xl font-black text-white">{quest.title}</h1>
          <p className="text-white/60 text-sm mt-1">Quest #{progress.questsCompleted.length + 1}</p>
        </div>

        {/* Instruction */}
        <div className="bg-white/15 rounded-2xl p-4 mb-5 text-white">
          <p className="font-bold text-base leading-relaxed">
            {showChinese ? quest.zh_instruction : quest.instruction}
          </p>
        </div>

        {/* Dad toggle */}
        <button
          onClick={() => setShowChinese(s => !s)}
          className="w-full mb-5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl py-2 text-sm font-semibold transition-colors"
        >
          {showChinese ? '🇬🇧 English' : '👨 爸爸看 (Chinese)'}
        </button>

        {/* Board */}
        {state === 'playing' && (
          <ChallengeBoard
            challenge={quest}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        )}

        {/* Hint */}
        {showHint && state === 'playing' && (
          <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-3 text-yellow-200 text-sm">
            💡 <strong>Hint:</strong> {showChinese ? quest.zh_hint : quest.hint}
          </div>
        )}
        {!showHint && state === 'playing' && (
          <button
            onClick={() => setShowHint(true)}
            className="mt-4 w-full text-white/40 hover:text-white/70 text-xs py-2 transition-colors"
          >
            Need a hint? 💡
          </button>
        )}

        {/* Success */}
        {state === 'done' && (
          <div className="bg-gradient-to-br from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/50 rounded-3xl p-6 text-center animate-pop">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-white font-black text-2xl">Quest Complete!</h3>
            <StarBurst count={stars} />
            <p className="text-white/80 text-sm mb-2">
              {stars === 3 ? 'Perfect! No mistakes!' : stars === 2 ? 'Great job! Almost perfect!' : 'Good effort! Keep practicing!'}
            </p>
            <p className="text-white/60 text-xs mb-5">+{stars} stars added to your collection</p>
            <button
              onClick={handleNextQuest}
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-3 px-8 rounded-xl text-lg transition-colors"
            >
              Next Quest →
            </button>
          </div>
        )}

        {/* Progress */}
        <div className="mt-6 bg-white/5 rounded-2xl p-4 text-center">
          <p className="text-white/50 text-xs">Quests completed: <span className="text-white font-bold">{progress.questsCompleted.length}</span></p>
          {progress.streak > 1 && (
            <p className="text-orange-300 text-xs mt-1">🔥 {progress.streak} day streak!</p>
          )}
        </div>
      </div>
    </div>
  )
}
