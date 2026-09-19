import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { useScramble } from '../hooks/useScramble'
import './Hero.css'

export default function Hero({ entered }) {
  const [run, setRun] = useState(false)
  useEffect(() => { if (entered) { const t = setTimeout(() => setRun(true), 300); return () => clearTimeout(t) } }, [entered])
  const first = useScramble('RAYAN', run, { speed: 0.9 })
  const last  = useScramble('SAMA', run, { speed: 0.9, delay: 260 })
  const roleRef = useRef(null)
  const secRef = useRef(null)
  useEffect(() => {
    if (!entered) return
    const ctx = gsap.context(() => {
      gsap.to('.hero__name', { yPercent: -18, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 } })
      gsap.to('.hero__meta, .hero__tag', { yPercent: -40, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 } })
    }, secRef)
    return () => ctx.revert()
  }, [entered])

  return (
    <section className="section hero" id="top" ref={secRef}>
      <div className="hero__meta mono">
        <span>N 6.37° · E 2.42°</span>
        <span>COTONOU / BENIN</span>
        <span>EPITECH · CLASS OF 2029</span>
      </div>

      <h1 className="hero__name">
        <span className="hero__line">{run ? first : ''}</span>
        <span className="hero__line hero__line--last">{run ? last : ''}</span>
      </h1>

      <div className="hero__role" ref={roleRef}>
        <span className="kicker">full-stack developer</span>
        <span className="hero__amp">&</span>
        <span className="kicker">security researcher</span>
      </div>

      <p className="hero__tag serif">
        I build systems <em>before</em> I break them.
      </p>

      <a href="#manifesto" className="hero__scroll mono" data-cursor>
        <span>scroll to descend</span>
        <svg width="12" height="34" viewBox="0 0 12 34"><path d="M6 0v28M1 23l5 6 5-6" stroke="currentColor" fill="none"/></svg>
      </a>
    </section>
  )
}
