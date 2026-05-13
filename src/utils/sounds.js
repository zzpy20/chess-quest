let audioCtx = null

function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function tone(freq, type, dur, vol = 0.28, delay = 0) {
  try {
    const ctx = ac()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = ctx.currentTime + delay
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t)
    osc.stop(t + dur)
  } catch {
    // silently ignore if audio not available
  }
}

export function playMove()    { tone(480, 'square',   0.07, 0.18) }
export function playCapture() { tone(220, 'triangle', 0.22, 0.40); tone(160, 'sawtooth', 0.15, 0.15, 0.05) }
export function playCheck()   { tone(900, 'sine',     0.28, 0.30) }
export function playCorrect() { tone(660, 'sine', 0.14, 0.25); tone(880, 'sine', 0.18, 0.25, 0.13) }
export function playWrong()   { tone(180, 'sawtooth', 0.18, 0.28) }

export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.22, 0.30, i * 0.14))
}

export function playLose() {
  tone(370, 'sawtooth', 0.22, 0.25)
  tone(260, 'sawtooth', 0.28, 0.22, 0.20)
}
