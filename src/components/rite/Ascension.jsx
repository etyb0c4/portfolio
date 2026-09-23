import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Stairs from './Stairs'
import { BEATS } from '../../data/ascent'
import { flash } from '../../lib/store'
import sound from '../../audio/sound'
import './rite.css'

gsap.registerPlugin(ScrollTrigger)

export default function Ascension({ onDone }) {
  const root = useRef(null)
  const firedRef = useRef(false)
  const blowoutRef = useRef(null)

  useEffect(() => {
    scrollTo(0, 0)
    if (window.__gl) window.__gl.climb = 0
    sound.beginWind('air')
    const lenis = new Lenis({ duration: 1.35, wheelMultiplier: 0.9, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', () => ScrollTrigger.update())

    const ctx = gsap.context(() => {
      // publish climb progress; the mark beacon rides on it
      ScrollTrigger.create({
        trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => { if (window.__gl) window.__gl.climb = self.progress },
      })
      // the sky brightens the higher you get
      gsap.to('.ascension__sky--high', { opacity: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 } })

      gsap.utils.toArray('.beat').forEach((el) => {
        const words = el.querySelectorAll('.beat__word')
        const meta = el.querySelectorAll('.beat__kicker, .beat__sub, .beat__fact')
        const tl = gsap.timeline({ paused: true })
          .from(words, { yPercent: 110, opacity: 0, duration: 0.85, stagger: 0.07, ease: 'power4.out',
            onStart: () => { sound.chime(); sound.riser(0.9) } })
          .from(meta, { y: 18, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' }, 0.25)
        ScrollTrigger.create({ trigger: el, start: 'top 76%', onEnter: () => tl.restart(), onEnterBack: () => tl.restart() })
      })

      ScrollTrigger.create({
        trigger: '.ascension__summit', start: 'top 60%',
        onEnter: () => {
          if (firedRef.current) return
          firedRef.current = true
          sound.endWind(true); sound.ascend(); sound.whoosh(1.6); sound.impact(0.8); flash(1.4)
          const white = document.createElement('div')
          white.className = 'ascension__blowout'
          document.body.appendChild(white)
          blowoutRef.current = white
          gsap.fromTo(white, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.in',
            onComplete: () => setTimeout(() => { white.remove(); blowoutRef.current = null; onDone?.() }, 220) })
        },
      })
    }, root)

    return () => {
      ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); sound.endWind(true)
      if (window.__gl) window.__gl.climb = 0
      // the blowout lives on document.body, outside the gsap context — don't leave it covering the page
      blowoutRef.current?.remove(); blowoutRef.current = null
    }
  }, [])

  return (
    <div className="ascension" ref={root}>
      <div className="ascension__sky" aria-hidden="true" />
      <div className="ascension__sky ascension__sky--high" aria-hidden="true" />
      <Stairs />

      <div className="ascension__track">
        <section className="beat beat--open">
          <h2 className="beat__line">
            {'The mark is accepted.'.split(' ').map((w, i) => (
              <span className="beat__wordwrap" key={i}><span className="beat__word">{w}</span></span>
            ))}
          </h2>
          <p className="beat__sub">Climb.</p>
        </section>

        {BEATS.map(b => (
          <section className="beat" key={b.id}>
            <span className="beat__kicker mono">{b.kicker}</span>
            <h2 className="beat__line">
              {b.line.split(' ').map((w, i) => (
                <span className="beat__wordwrap" key={i}><span className="beat__word">{w}</span></span>
              ))}
            </h2>
            <p className="beat__sub">{b.sub}</p>
            <div className="beat__facts">
              {b.facts.map(f => <span className="beat__fact mono" key={f}>{f}</span>)}
            </div>
          </section>
        ))}

        <div className="ascension__summit">
          <p className="beat__sub beat__sub--summit">The light is close now.</p>
        </div>
      </div>
    </div>
  )
}
