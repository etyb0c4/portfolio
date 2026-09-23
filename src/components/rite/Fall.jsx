import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import sound from '../../audio/sound'
import { applyJourney } from '../../lib/journey'
import './rite.css'

// vertical code-rain columns that rip upward past the viewer as they drop
const GLYPHS = '01<>/\\{}[]#$%&*+=~^ABCDEF'
const COLUMNS = Array.from({ length: 34 }, () => ({
  left: Math.random() * 100,
  delay: Math.random() * 0.5,
  dur: 0.5 + Math.random() * 0.6,
  text: Array.from({ length: 26 }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join(''),
  dim: Math.random() * 0.5 + 0.25,
}))

export default function Fall({ onDone }) {
  const warpRef = useRef(null)
  const rainRef = useRef(null)
  const rootRef = useRef(null)
  const glowRef = useRef(null)
  const blindRef = useRef(null)

  useEffect(() => {
    if (!window.__gl) { onDone?.(); return }
    window.__gl.fall = 0; window.__gl.fallDepth = 0
    sound.beginWind('deep'); sound.whoosh(1.5)

    const obj = { depth: 0 }
    const tl = gsap.timeline({ onComplete: () => { sound.endWind(); onDone?.() } })

    // a long drop: it should feel like falling a very long way, not a quick cut
    tl.to(window.__gl, { fall: 1, duration: 0.5, ease: 'power2.in' }, 0)
      .fromTo(warpRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1.7, duration: 4.4, ease: 'power1.in' }, 0)
      .fromTo(rainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      // the dive itself — slow build, then terminal velocity
      .to(obj, { depth: 780, duration: 4.6, ease: 'power2.in',
        onUpdate: () => {
          if (window.__gl) window.__gl.fallDepth = obj.depth
          applyJourney('falling', obj.depth / 780)
          sound.setProgress(obj.depth / 780)
        } }, 0.05)
      // a couple of gusts on the way down so the descent has texture
      .call(() => sound.whoosh(1.1), null, 1.5)
      .call(() => sound.whoosh(1.3), null, 3.0)
      // A light far down the shaft. Opacity rises almost linearly so it is genuinely
      // *growing* the whole way down (a power3 curve left it invisible until the last
      // half second, which read as a pop rather than an approach); the scale is what
      // accelerates, so it feels like closing distance.
      .fromTo(glowRef.current,
        { opacity: 0, scale: 0.06 },
        { opacity: 1, duration: 3.9, ease: 'power1.in' }, 0.3)
      .fromTo(glowRef.current,
        { scale: 0.06 },
        { scale: 1.25, duration: 4.3, ease: 'power2.in' }, 0.3)
      .call(() => sound.riser(2.4), null, 2.6)
      // the blinding: it goes white before the impact, not after
      .fromTo(blindRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power3.in' }, 4.15)
      .call(() => sound.impact(1.6), null, 4.6)
      .to([warpRef.current, rainRef.current, glowRef.current], { opacity: 0, duration: 0.25, ease: 'power3.out' }, 4.62)
      // hold on full white and hand over *through* it — the abyss fades up out of the same
      // white, so the act change happens behind a frame the viewer cannot see past
      .to({}, { duration: 0.45 })
      .call(() => { if (window.__gl) { window.__gl.fall = 0; window.__gl.fallDepth = 0 } })

    return () => { tl.kill(); sound.endWind(true); if (window.__gl) { window.__gl.fall = 0; window.__gl.fallDepth = 0 } }
  }, [])

  return (
    <div className="fall" ref={rootRef}>
      <div className="fall__warp" ref={warpRef} aria-hidden="true" />
      <div className="fall__rain mono" ref={rainRef} aria-hidden="true">
        {COLUMNS.map((c, i) => (
          <span key={i} style={{ left: `${c.left}%`, animationDelay: `-${c.delay}s`, animationDuration: `${c.dur}s`, opacity: c.dim }}>{c.text}</span>
        ))}
      </div>
      <div className="fall__glow" ref={glowRef} aria-hidden="true" />
      <div className="fall__vignette" aria-hidden="true" />
      <div className="fall__label mono">falling</div>
      <div className="fall__blind" ref={blindRef} aria-hidden="true" />
    </div>
  )
}
