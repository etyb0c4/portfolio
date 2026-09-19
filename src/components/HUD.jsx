import { useEffect, useRef, useState } from 'react'
import { STAGES, flash } from '../lib/store'
import './HUD.css'

export default function HUD({ active }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      setP(max > 0 ? scrollY / max : 0)
    }
    onScroll(); addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  let stage = STAGES[0], idx = 0
  STAGES.forEach((s, i) => { if (p >= s.at) { stage = s; idx = i } })
  const prev = useRef(0)
  useEffect(() => {
    if (idx > prev.current) {
      flash(1.0)
      document.body.classList.add('glitch')
      const t = setTimeout(() => document.body.classList.remove('glitch'), 620)
      prev.current = idx
      return () => clearTimeout(t)
    }
    prev.current = idx
  }, [idx])

  if (!active) return null
  return (
    <div className="hud">
      <div className="hud__id mono">
        <span className="hud__dot" style={{ background: stage.color, boxShadow: `0 0 10px ${stage.color}` }} />
        uid=<b style={{ color: stage.color }}>{stage.uid}</b>@{stage.host}
      </div>
      <div className="hud__esc">
        {STAGES.map((s, i) => (
          <span key={s.uid} className={`hud__pip ${i <= idx ? 'on' : ''}`} title={s.uid}>{s.uid}</span>
        ))}
      </div>
      <div className="hud__bar"><span style={{ transform: `scaleX(${p})` }} /></div>
      <div className="hud__pct mono">{String(Math.round(p*100)).padStart(3,'0')}%</div>
    </div>
  )
}
