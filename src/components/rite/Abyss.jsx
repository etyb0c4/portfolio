import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { flash } from '../../lib/store'
import { applyJourney } from '../../lib/journey'
import { matchR } from '../../lib/glyph'
import sound from '../../audio/sound'
import './rite.css'

const LINES = [
  'Accès refusé. Tu as chuté.',
  "Le seul moyen d'ascendre, c'est de tracer ton empreinte.",
]

const EMBERS = Array.from({ length: 26 }, (_, i) => ({
  left: Math.random() * 100,
  delay: (i / 26) * 9,
  dur: 7 + Math.random() * 6,
  size: 1 + Math.random() * 2.5,
}))

export default function Abyss({ onDone }) {
  const [typed, setTyped] = useState(['', ''])
  const [ready, setReady] = useState(false)
  const [validated, setValidated] = useState(false)
  const [rejected, setRejected] = useState(false)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawingRef = useRef(false)
  const strokesRef = useRef([])        // array of strokes; an R is usually drawn in 2
  const guideRef = useRef(null)
  const doneRef = useRef(false)
  const settleRef = useRef(null)

  useEffect(() => {
    sound.beginTension()
    let li = 0, ci = 0
    const iv = setInterval(() => {
      const line = LINES[li]
      if (!line) { clearInterval(iv); return }
      ci++
      const at = li, text = line.slice(0, ci)
      setTyped(t => { const n = [...t]; n[at] = text; return n })
      if (ci % 3 === 0) sound.tick()
      if (ci >= line.length) {
        li++; ci = 0
        if (li >= LINES.length) { clearInterval(iv); setTimeout(() => { setReady(true); sound.whoosh(0.5) }, 450) }
      }
    }, 26)
    return () => { clearInterval(iv); sound.endTension(true); clearTimeout(settleRef.current) }
  }, [])

  useEffect(() => {
    if (!ready) return
    const c = canvasRef.current
    const fit = () => {
      c.width = c.clientWidth * devicePixelRatio
      c.height = c.clientHeight * devicePixelRatio
      const ctx = c.getContext('2d')
      ctx.strokeStyle = '#ffd0a0'
      ctx.lineWidth = 5 * devicePixelRatio
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.shadowColor = '#ff8a5a'; ctx.shadowBlur = 22
      ctxRef.current = ctx
    }
    fit(); addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [ready])

  const posFrom = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) * devicePixelRatio, y: (e.clientY - r.top) * devicePixelRatio }
  }

  const clearInk = () => {
    const c = canvasRef.current, ctx = ctxRef.current
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height)
    strokesRef.current = []
  }

  const start = (e) => {
    if (validated || !ctxRef.current) return
    clearTimeout(settleRef.current)
    if (rejected) { setRejected(false); clearInk() }
    canvasRef.current.setPointerCapture?.(e.pointerId)
    drawingRef.current = true
    if (guideRef.current) gsap.to(guideRef.current, { opacity: 0, duration: 0.4 })
    const p = posFrom(e)
    strokesRef.current.push([p])
    ctxRef.current.beginPath(); ctxRef.current.moveTo(p.x, p.y)
    sound.penDown()
  }

  const move = (e) => {
    if (!drawingRef.current || validated) return
    const p = posFrom(e)
    const s = strokesRef.current[strokesRef.current.length - 1]
    s.push(p)
    ctxRef.current.lineTo(p.x, p.y); ctxRef.current.stroke()
    if (s.length % 9 === 0) sound.penScratch()
  }

  // judge on lift, and allow a short pause for the second stroke of the R
  const end = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    clearTimeout(settleRef.current)
    const verdict = matchR(strokesRef.current)
    if (verdict.ok) { validate(); return }
    settleRef.current = setTimeout(() => reject(verdict), 900)
  }

  const reject = () => {
    if (doneRef.current) return
    setRejected(true)
    sound.reject()
    const c = canvasRef.current
    if (c) gsap.fromTo(c, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.35)' })
    // fade the failed attempt away so the next try starts clean
    gsap.to({ v: 1 }, { v: 0, duration: 0.5, delay: 0.35, onComplete: () => { if (!doneRef.current) clearInk() } })
    if (guideRef.current) gsap.to(guideRef.current, { opacity: 1, duration: 0.5 })
  }

  const validate = () => {
    doneRef.current = true
    setValidated(true)
    flash(1.2)
    gsap.to({ v: 0 }, { v: 1, duration: 1.6, ease: 'power2.inOut',
      onUpdate() { applyJourney('abyss', this.targets()[0].v) } })
    // the mark burns away where it was drawn — it does not follow into the climb
    const c = canvasRef.current
    gsap.timeline()
      .to(c, { filter: 'brightness(2.6)', duration: 0.35, ease: 'power2.out' }, 0)
      .to(c, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35)
      .to('.abyss__copy, .abyss__hint', { opacity: 0, y: -18, duration: 0.8, ease: 'power2.in' }, 0.3)
      .to('.abyss', { opacity: 0, duration: 1.0, ease: 'power2.inOut' }, 1.5)
      .call(() => onDone?.())
  }

  return (
    <div className={`abyss ${validated ? 'abyss--accepted' : ''}`}>
      {/* the fall hands over on full white; this is the other half of that dissolve */}
      <div className="abyss__flash" aria-hidden="true" />
      <div className="abyss__embers" aria-hidden="true">
        {EMBERS.map((e, i) => (
          <i key={i} style={{ left: `${e.left}%`, animationDelay: `-${e.delay}s`, animationDuration: `${e.dur}s`, width: e.size, height: e.size }} />
        ))}
      </div>

      <div className="abyss__copy">
        <p className="abyss__text serif">{typed[0]}</p>
        <p className="abyss__text abyss__text--dim serif">{typed[1]}<i className="abyss__caret" /></p>
      </div>

      {ready && !validated && (
        <>
          <div className={`abyss__hint mono ${rejected ? 'is-bad' : ''}`}>
            {rejected ? 'that is not the mark — trace an R' : <>trace the mark — draw <b>R</b></>}
          </div>
          <canvas
            ref={canvasRef} className="abyss__canvas"
            onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
          />
          <svg className="abyss__guide" ref={guideRef} viewBox="0 0 100 140" aria-hidden="true">
            <path d="M28,124 L28,16 L60,16 Q80,16 80,44 Q80,68 58,68 L28,68 M58,68 L82,124"
              fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}

      {validated && <div className="abyss__accepted mono">mark accepted</div>}
    </div>
  )
}
