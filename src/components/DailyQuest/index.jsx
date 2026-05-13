import { useState } from 'react'
import { QUESTS } from '../../data/quests'
import ChallengeBoard from '../ui/ChallengeBoard'
import Confetti from '../ui/Confetti'
import StarBurst from '../ui/StarBurst'
import { playCorrect, playWrong, playWin } from '../../utils/sounds'

export default function DailyQuest({ progress, onBack, markQuestComplete, addStars }) {
  const questIndex = progress.questsCompleted.length % QUESTS.length
  const quest = QUESTS[questIndex]

  const [state, setState] = useState('playing')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showChinese, setShowChinese] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const handleCorrect = () => {
    setState('done')
    setConfetti(true)
    playWin()
    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
    addStars(stars)
    markQuestComplete(quest.id)
    setTimeout(() => setConfetti(false), 2500)
  }

  const handleWrong = () => {
    playWrong()
    setWrongCount(c => c + 1)
    if (wrongCount >= 1) setShowHint(true)
  }

  const handleNextQuest = () => {
    markQuestComplete(quest.id)
    onBack()
  }

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1

  return (
    <div className="min-h-screen px-6 py-8">
      <Confetti active={confetti} />
      <div className="max-w-[600px] mx-auto">

        <button onClick={onBack} className="text-white/70 hover:text-white mb-6 flex items-center gap-2 text-base">
          ← Home
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🗺️</div>
          <h1 className="text-4xl font-black text-white">{quest.title}</h1>
          <p className="text-white/50 text-base mt-2">Quest #{progress.questsCompleted.length + 1}</p>
        </div>

        {/* Instruction */}
        <div className="bg-white/15 rounded-3xl p-5 mb-4 text-white">
          <p className="font-bold text-lg leading-relaxed">
            {showChinese ? quest.zh_instruction : quest.instruction}
          </p>
        </div>

        {/* Dad toggle */}
        <button
          onClick={() => setShowChinese(s => !s)}
          className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white/80 rounded-2xl py-3 text-base font-bold transition-colors"
        >
          {showChinese ? '🇬🇧 Switch to English' : '👨 爸爸看 (Chinese)'}
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
          <div className="mt-5 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-4 text-yellow-200 text-base">
            💡 <strong>{showChinese ? '提示' : 'Hint'}:</strong>{' '}
            {showChinese ? quest.zh_hint : quest.hint}
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

        {/* Success */}
        {state === 'done' && (
          <div className="bg-gradient-to-br from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/50 rounded-3xl p-8 text-center animate-pop">
            <div className="text-6xl mb-3">🏆</div>
            <h3 className="text-white font-black text-3xl">Quest Complete!</h3>
            <StarBurst count={stars} />
            <p className="text-white/80 text-base mb-2">
              {stars === 3 ? 'Perfect! No mistakes!' : stars === 2 ? 'Great job! Almost perfect!' : 'Good effort! Keep practicing!'}
            </p>
            <p className="text-white/50 text-sm mb-6">+{stars} stars added to your collection</p>
            <button
              onClick={handleNextQuest}
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-4 px-10 rounded-2xl text-xl transition-colors"
            >
              Next Quest →
            </button>
          </div>
        )}

        {/* Progress footer */}
        <div className="mt-8 bg-white/5 rounded-2xl p-4 text-center">
          <p className="text-white/40 text-sm">
            Quests completed: <span className="text-white font-bold">{progress.questsCompleted.length}</span>
          </p>
          {progress.streak > 1 && (
            <p className="text-orange-300 text-sm mt-1">🔥 {progress.streak} day streak!</p>
          )}
        </div>
      </div>
    </div>
  )
}
