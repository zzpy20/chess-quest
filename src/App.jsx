import { useState } from 'react'
import Home from './components/Home'
import LearnPiece from './components/LearnPiece'
import DailyQuest from './components/DailyQuest'
import PiecesGuide from './components/PiecesGuide'
import PlayWithBuddy from './components/PlayWithBuddy'
import PassAndPlay from './components/PassAndPlay'
import CheckmatePuzzles from './components/CheckmatePuzzles'
import ParentDashboard from './components/ParentDashboard'
import Admin from './components/Admin'
import { useProgress } from './hooks/useProgress'

export default function App() {
  if (window.location.pathname === '/admin') return <Admin />
  const [screen, setScreen] = useState('home')
  const {
    progress,
    addStars,
    markChallengeComplete,
    markPieceMastered,
    markQuestComplete,
    markCheckmateSolved,
    markCheckmate2Solved,
    logGame,
    getPieceChallengesCompleted,
    resetProgress,
    savePin,
    clearPin,
    getPin,
    forcePull,
    syncStatus,
  } = useProgress()

  const enrichedProgress = { ...progress, getPieceChallengesCompleted }
  const nav = setScreen

  return (
    <div className="min-h-screen">
      {screen === 'home' && (
        <Home progress={enrichedProgress} onNavigate={nav} />
      )}
      {screen === 'learn' && (
        <LearnPiece
          progress={enrichedProgress}
          onBack={() => nav('home')}
          markChallengeComplete={markChallengeComplete}
          markPieceMastered={markPieceMastered}
          addStars={addStars}
        />
      )}
      {screen === 'quest' && (
        <DailyQuest
          progress={enrichedProgress}
          onBack={() => nav('home')}
          markQuestComplete={markQuestComplete}
          addStars={addStars}
        />
      )}
      {screen === 'guide' && (
        <PiecesGuide onBack={() => nav('home')} />
      )}
      {screen === 'play' && (
        <PlayWithBuddy onBack={() => nav('home')} logGame={logGame} />
      )}
      {screen === 'pass' && (
        <PassAndPlay onBack={() => nav('home')} logGame={logGame} />
      )}
      {screen === 'checkmate' && (
        <CheckmatePuzzles
          progress={enrichedProgress}
          onBack={() => nav('home')}
          markCheckmateSolved={markCheckmateSolved}
          markCheckmate2Solved={markCheckmate2Solved}
        />
      )}
      {screen === 'parent' && (
        <ParentDashboard
          progress={enrichedProgress}
          onBack={() => nav('home')}
          resetProgress={resetProgress}
          savePin={savePin}
          clearPin={clearPin}
          getPin={getPin}
          forcePull={forcePull}
          syncStatus={syncStatus}
        />
      )}
    </div>
  )
}
