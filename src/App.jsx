import { useState } from 'react'
import Home from './components/Home'
import LearnPiece from './components/LearnPiece'
import DailyQuest from './components/DailyQuest'
import { useProgress } from './hooks/useProgress'

export default function App() {
  const [screen, setScreen] = useState('home')
  const {
    progress,
    addStars,
    markChallengeComplete,
    markPieceMastered,
    markQuestComplete,
    getPieceChallengesCompleted,
  } = useProgress()

  const enrichedProgress = { ...progress, getPieceChallengesCompleted }

  return (
    <div className="min-h-screen">
      {screen === 'home' && (
        <Home progress={enrichedProgress} onNavigate={setScreen} />
      )}
      {screen === 'learn' && (
        <LearnPiece
          progress={enrichedProgress}
          onBack={() => setScreen('home')}
          markChallengeComplete={markChallengeComplete}
          markPieceMastered={markPieceMastered}
          addStars={addStars}
        />
      )}
      {screen === 'quest' && (
        <DailyQuest
          progress={enrichedProgress}
          onBack={() => setScreen('home')}
          markQuestComplete={markQuestComplete}
          addStars={addStars}
        />
      )}
    </div>
  )
}
