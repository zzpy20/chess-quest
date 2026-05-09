import { useState, useEffect } from 'react'

const KEY = 'chess-quest-progress'

const defaultProgress = {
  stars: 0,
  badges: [],
  piecesLearned: {},
  questsCompleted: [],
  streak: 0,
  lastActiveDate: null,
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress
    } catch {
      return defaultProgress
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(progress))
  }, [progress])

  const addStars = (count) => {
    setProgress(p => ({ ...p, stars: p.stars + count }))
  }

  const markChallengeComplete = (pieceId, challengeIdx) => {
    setProgress(p => {
      const pieceData = p.piecesLearned[pieceId] || { completedChallenges: [] }
      if (pieceData.completedChallenges.includes(challengeIdx)) return p
      const updated = {
        ...p,
        piecesLearned: {
          ...p.piecesLearned,
          [pieceId]: {
            ...pieceData,
            completedChallenges: [...pieceData.completedChallenges, challengeIdx],
          },
        },
      }
      return updated
    })
  }

  const markPieceMastered = (pieceId) => {
    setProgress(p => {
      const already = p.badges.includes(`piece-${pieceId}`)
      if (already) return p
      return {
        ...p,
        badges: [...p.badges, `piece-${pieceId}`],
      }
    })
  }

  const markQuestComplete = (questId) => {
    setProgress(p => {
      if (p.questsCompleted.includes(questId)) return p
      const today = new Date().toDateString()
      const wasYesterday = (() => {
        if (!p.lastActiveDate) return false
        const last = new Date(p.lastActiveDate)
        const diff = new Date(today) - last
        return diff === 86400000
      })()
      return {
        ...p,
        questsCompleted: [...p.questsCompleted, questId],
        streak: wasYesterday ? p.streak + 1 : 1,
        lastActiveDate: today,
      }
    })
  }

  const getPieceChallengesCompleted = (pieceId) => {
    return progress.piecesLearned[pieceId]?.completedChallenges || []
  }

  const isQuestDone = (questId) => progress.questsCompleted.includes(questId)

  const resetProgress = () => {
    setProgress(defaultProgress)
    localStorage.removeItem(KEY)
  }

  return {
    progress,
    addStars,
    markChallengeComplete,
    markPieceMastered,
    markQuestComplete,
    getPieceChallengesCompleted,
    isQuestDone,
    resetProgress,
  }
}
