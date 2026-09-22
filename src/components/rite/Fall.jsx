import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import sound from '../../audio/sound'
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
        onUpdate: () => { if (window.__gl) window.__gl.fallDepth = obj.depth } }, 0.05)
      // a couple of gusts on the way down so the descent has texture
      .call(() => sound.whoosh(1.1), null, 1.5)
      .call(() => sound.whoosh(1.3), null, 3.0)
      // impact: everything slams shut
      .call(() => sound.impact(1.5), null, 4.5)
      .to([warpRef.current, rainRef.current], { opacity: 0, duration: 0.3, ease: 'power3.out' }, 4.55)
      .fromTo(rootRef.current, { filter: 'blur(0px)' }, { filter: 'blur(16px)', duration: 0.35, ease: 'power2.in' }, 4.55)
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
      <div className="fall__vignette" aria-hidden="true" />
      <div className="fall__label mono">falling</div>
    </div>
  )
}
