import { useEffect, useRef, useState } from 'react'
import './Hud.css'

/* A quiet instrument panel that runs the whole way through: corner ticks, the act you are
   in, a live clock and a progress read-out. It exists to make the frame feel like a device
   you are looking through rather than a page — so it stays small, dim and never moves. */
export default function Hud({ phase }) {
  const [clock, setClock] = useState('')
  const [pct, setPct] = useState(0)
  const barRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setClock(d.toLocaleTimeString('fr-FR', { hour12: false }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const max = document.documentElement.scrollHeight - innerHeight
      const s = max > 4 ? Math.min(1, scrollY / max) : 0
      const climb = (window.__gl && window.__gl.climb) || 0
      const v = Math.round((max > 4 ? s : climb) * 100)
      setPct(prev => (prev === v ? prev : v))
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 4 ? s : climb})`
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [phase])

  return (
    <div className="hud mono" aria-hidden="true">
      <span className="hud__tick hud__tick--tl" />
      <span className="hud__tick hud__tick--tr" />
      <span className="hud__tick hud__tick--bl" />
      <span className="hud__tick hud__tick--br" />

      <div className="hud__tl">
        <span className="hud__dot" />
      </div>

      <div className="hud__tr">
        <span className="hud__dim">N 6.37° E 2.42°</span>
        <span>{clock}</span>
      </div>

      <div className="hud__bl">
        <span className="hud__dim">RAYAN SAMA</span>
        <span className="hud__dim">ETYB0C4</span>
      </div>

      <div className="hud__progress">
        <span className="hud__bar"><i ref={barRef} /></span>
        <span className="hud__dim">{String(pct).padStart(2, '0')}%</span>
      </div>
    </div>
  )
}
