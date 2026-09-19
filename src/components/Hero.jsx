import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import './Hero.css'

export default function Hero({ entered }) {
  const secRef = useRef(null)
  useEffect(() => {
    if (!entered) return
    const ctx = gsap.context(() => {
      gsap.to('.hero__meta, .hero__foot', {
        yPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
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

      {/* le nom est rendu en particules 3D (Scene.jsx) — ceci est la légende */}
      <div className="hero__wordmark" aria-hidden="true">RAYAN SAMA</div>

      <div className="hero__foot">
        <div className="hero__role">
          <span className="kicker">full-stack developer</span>
          <span className="hero__amp">&</span>
          <span className="kicker">security researcher</span>
        </div>
        <p className="hero__tag serif">I build systems <em>before</em> I break them.</p>
        <a href="#manifesto" className="hero__scroll mono" data-cursor>
          <span>scroll to descend</span>
          <svg width="12" height="34" viewBox="0 0 12 34"><path d="M6 0v28M1 23l5 6 5-6" stroke="currentColor" fill="none"/></svg>
        </a>
      </div>

      <h1 className="sr-only">Rayan Sama — full-stack developer and security researcher</h1>
    </section>
  )
}
