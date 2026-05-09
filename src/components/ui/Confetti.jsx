import { useEffect, useState } from 'react'

const COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B', '#C77DFF', '#F4845F']

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) return
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }))
    setPieces(newPieces)
    const t = setTimeout(() => setPieces([]), 2500)
    return () => clearTimeout(t)
  }, [active])

  if (!pieces.length) return null

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  )
}
