import { useState, useEffect } from 'react'

// padding: total horizontal padding of the container (px-3 = 24, px-6 = 48)
export function useBoardSize(padding = 48) {
  const calc = () => {
    const w = window.innerWidth
    if (w >= 1024) return 560
    if (w >= 768)  return 500
    return w - padding
  }

  const [size, setSize] = useState(calc)

  useEffect(() => {
    const handler = () => setSize(calc())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return size
}
