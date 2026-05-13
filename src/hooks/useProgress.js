import { useState, useEffect, useRef } from 'react'

const KEY = 'chess-quest-progress'
const PIN_KEY = 'chess-quest-pin'
const SYNC_URL = '/api/sync'

const defaultProgress = {
  stars: 0,
  badges: [],
  piecesLearned: {},
  questsCompleted: [],
  checkmateSolved: [],
  checkmate2Solved: [],
  streak: 0,
  lastActiveDate: null,
  totalMinutes: 0,
}

function mergeProgress(local, cloud) {
  const mergePiecesLearned = (a, b) => {
    const result = { ...a }
    for (const [id, data] of Object.entries(b || {})) {
      if (!result[id]) { result[id] = data; continue }
      result[id] = {
        completedChallenges: [...new Set([
          ...(result[id].completedChallenges || []),
          ...(data.completedChallenges || []),
        ])],
      }
    }
    return result
  }
  return {
    stars: Math.max(local.stars || 0, cloud.stars || 0),
    streak: Math.max(local.streak || 0, cloud.streak || 0),
    lastActiveDate: local.lastActiveDate || cloud.lastActiveDate,
    badges: [...new Set([...(local.badges || []), ...(cloud.badges || [])])],
    questsCompleted: [...new Set([...(local.questsCompleted || []), ...(cloud.questsCompleted || [])])],
    checkmateSolved: [...new Set([...(local.checkmateSolved || []), ...(cloud.checkmateSolved || [])])],
    checkmate2Solved: [...new Set([...(local.checkmate2Solved || []), ...(cloud.checkmate2Solved || [])])],
    piecesLearned: mergePiecesLearned(local.piecesLearned || {}, cloud.piecesLearned || {}),
    totalMinutes: Math.max(local.totalMinutes || 0, cloud.totalMinutes || 0),
  }
}

async function cloudGet(pin) {
  try {
    const res = await fetch(`${SYNC_URL}?pin=${pin}`)
    const { progress } = await res.json()
    return progress || null
  } catch { return null }
}

async function cloudPut(pin, progress) {
  try {
    await fetch(`${SYNC_URL}?pin=${pin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    })
  } catch { /* offline — silent */ }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress
    } catch { return defaultProgress }
  })

  const pin = useRef(localStorage.getItem(PIN_KEY))
  const syncTimer = useRef(null)
  const sessionStart = useRef(Date.now())
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | ok | error

  // Persist locally + push to cloud (debounced 2s)
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(progress))
    if (!pin.current) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      setSyncStatus('syncing')
      try {
        await cloudPut(pin.current, progress)
        setSyncStatus('ok')
      } catch { setSyncStatus('error') }
    }, 2000)
    return () => clearTimeout(syncTimer.current)
  }, [progress])

  // Session time tracking — accumulate on tab hide, reset timer on tab restore
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        const elapsed = Math.round((Date.now() - sessionStart.current) / 60000)
        if (elapsed > 0) setProgress(p => ({ ...p, totalMinutes: (p.totalMinutes || 0) + elapsed }))
      } else {
        sessionStart.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // On mount: pull from cloud if PIN saved
  useEffect(() => {
    if (!pin.current) return
    setSyncStatus('syncing')
    cloudGet(pin.current).then(cloud => {
      if (cloud) {
        setProgress(local => mergeProgress(local, cloud))
        setSyncStatus('ok')
      } else {
        setSyncStatus('ok')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Progress mutators ---

  const addStars = (count) => setProgress(p => ({ ...p, stars: p.stars + count }))

  const markChallengeComplete = (pieceId, challengeIdx) => {
    setProgress(p => {
      const pieceData = p.piecesLearned[pieceId] || { completedChallenges: [] }
      if (pieceData.completedChallenges.includes(challengeIdx)) return p
      return {
        ...p,
        piecesLearned: {
          ...p.piecesLearned,
          [pieceId]: { ...pieceData, completedChallenges: [...pieceData.completedChallenges, challengeIdx] },
        },
      }
    })
  }

  const markPieceMastered = (pieceId) => {
    setProgress(p => {
      if (p.badges.includes(`piece-${pieceId}`)) return p
      return { ...p, badges: [...p.badges, `piece-${pieceId}`] }
    })
  }

  const markQuestComplete = (questId) => {
    setProgress(p => {
      if (p.questsCompleted.includes(questId)) return p
      const today = new Date().toDateString()
      const wasYesterday = (() => {
        if (!p.lastActiveDate) return false
        return new Date(today) - new Date(p.lastActiveDate) === 86400000
      })()
      return {
        ...p,
        questsCompleted: [...p.questsCompleted, questId],
        streak: wasYesterday ? p.streak + 1 : 1,
        lastActiveDate: today,
      }
    })
  }

  const markCheckmateSolved = (id) => {
    setProgress(p => {
      if (p.checkmateSolved.includes(id)) return p
      return { ...p, checkmateSolved: [...p.checkmateSolved, id] }
    })
  }

  const markCheckmate2Solved = (id) => {
    setProgress(p => {
      if ((p.checkmate2Solved || []).includes(id)) return p
      return { ...p, checkmate2Solved: [...(p.checkmate2Solved || []), id] }
    })
  }

  const getPieceChallengesCompleted = (pieceId) =>
    progress.piecesLearned[pieceId]?.completedChallenges || []

  const isQuestDone = (questId) => progress.questsCompleted.includes(questId)

  const resetProgress = () => {
    setProgress(defaultProgress)
    localStorage.removeItem(KEY)
    if (pin.current) cloudPut(pin.current, defaultProgress)
  }

  // --- Cloud sync management ---

  const savePin = async (newPin) => {
    localStorage.setItem(PIN_KEY, newPin)
    pin.current = newPin
    setSyncStatus('syncing')
    const cloud = await cloudGet(newPin)
    if (cloud) {
      setProgress(local => mergeProgress(local, cloud))
    } else {
      // Capture latest progress from localStorage (not stale closure)
      const snapshot = (() => {
        try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
      })()
      await cloudPut(newPin, snapshot || progress)
    }
    setSyncStatus('ok')
    return !!cloud
  }

  const clearPin = () => {
    localStorage.removeItem(PIN_KEY)
    pin.current = null
    setSyncStatus('idle')
  }

  const getPin = () => pin.current

  const forcePull = async () => {
    if (!pin.current) return false
    setSyncStatus('syncing')
    const cloud = await cloudGet(pin.current)
    if (cloud) {
      setProgress(local => mergeProgress(local, cloud))
      setSyncStatus('ok')
      return true
    }
    setSyncStatus('ok')
    return false
  }

  return {
    progress,
    addStars,
    markChallengeComplete,
    markPieceMastered,
    markQuestComplete,
    markCheckmateSolved,
    markCheckmate2Solved,
    getPieceChallengesCompleted,
    isQuestDone,
    resetProgress,
    // cloud sync
    savePin,
    clearPin,
    getPin,
    forcePull,
    syncStatus,
  }
}
