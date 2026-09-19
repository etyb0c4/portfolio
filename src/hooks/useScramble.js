import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01__'

/* Decrypts text from noise. Trigger by `run` boolean (e.g. when in view). */
export function useScramble(finalText, run, { speed = 1, delay = 0 } = {}) {
  const [out, setOut] = useState('')
  const frame = useRef(0)
  const raf = useRef(0)
  const started = useRef(false)

  useEffect(() => {
    if (!run || started.current) return
    started.current = true
    const chars = finalText.split('')
    const start = performance.now() + delay
    const per = 26 / speed // frames to settle each char, staggered

    const tick = (now) => {
      const t = Math.max(0, now - start)
      const f = t / 16.67
      let done = true
      const s = chars.map((c, i) => {
        if (c === ' ') return ' '
        const reveal = i * 2.2
        if (f > reveal + per) return c
        if (f < reveal) { done = false; return f > reveal - 6 ? GLYPHS[(Math.random()*GLYPHS.length)|0] : '' }
        done = false
        return GLYPHS[(Math.random()*GLYPHS.length)|0]
      }).join('')
      setOut(s)
      if (!done) raf.current = requestAnimationFrame(tick)
      else setOut(finalText)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [run, finalText, speed, delay])

  return run ? out : ''
}
