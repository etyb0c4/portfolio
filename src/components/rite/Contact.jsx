import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import handsGold from '../../assets/rite/hands-gold.webp'
import handsSwarm from '../../assets/rite/hands-swarm.webp'
import sound from '../../audio/sound'
import './rite.css'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { id: 'cv',   label: 'CV',       sub: 'PDF',                      href: '/portfolio/cv.pdf' },
  { id: 'li',   label: 'LinkedIn', sub: 'in/rayan-sama',            href: 'https://linkedin.com/in/rayan-sama' },
  { id: 'mail', label: 'Mail',     sub: 'ryansama.tech@gmail.com',  href: 'mailto:ryansama.tech@gmail.com' },
]

/* Simple monochrome marks. Each is paired with its name underneath, so recognition never
   depends on my glyph being a pixel-accurate trademark reproduction. */
const SUITORS = [
  // hx/hy are fractions of the artwork box, placed on the forearm of a specific hand so
  // each logo reads as *belonging* to that arm rather than floating in a row
  { id: 'apple',  name: 'Apple',     hx: 0.470, hy: 0.325, delay: 0.0,
    glyph: <path d="M12.7 6.9c-.8 0-2 -.9-3.2-.9-1.6 0-3.1 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.7 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.5-3.8 0-2.4 1.9-3.5 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.9-3.5.9zM14.9 4.3c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/> },
  { id: 'google', name: 'Google',    hx: 0.735, hy: 0.560, delay: 0.25,
    glyph: <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.3-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.7 19.8 8.1 22 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3.1 7.4l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z"/> },
  { id: 'meta',   name: 'Meta',      hx: 0.360, hy: 0.630, delay: 0.5,
    glyph: <path d="M3 14.4c0-3.6 1.8-7.4 4.4-7.4 1.4 0 2.5 .8 4.2 3.2 -1.6 2.5-2.6 4-2.6 4C7.6 16.7 7 17.3 6.1 17.3 5.2 17.3 4.6 16.5 4.6 15.1M19 5.3c-2 0-3.6 1.5-5 3.6C12.6 6.5 11.2 5.3 9.4 5.3 5.9 5.3 3 9.5 3 14.5c0 2.9 1.4 4.6 3.6 4.6 1.7 0 2.9-.8 5-4.5 0 0 .9-1.5 1.5-2.6 .2.3.4.7.6 1.1l.9 1.6c1.8 3 2.8 4.4 4.6 4.4 2.2 0 3.4-1.7 3.4-4.7 0-5.2-2.9-9.1-3.6-9.1zm-.6 12c-1 0-1.5-.7-2.6-2.6 -.6-1-.9-1.6-1.6-2.8 1.2-1.9 2.2-2.8 3.4-2.8 1.7 0 2.5 2.3 2.5 4.9 0 2-.5 3.3-1.7 3.3z"/> },
  { id: 'ms',     name: 'Microsoft', hx: 0.195, hy: 0.760, delay: 0.75,
    glyph: <><rect x="3" y="3" width="8.3" height="8.3"/><rect x="12.7" y="3" width="8.3" height="8.3"/><rect x="3" y="12.7" width="8.3" height="8.3"/><rect x="12.7" y="12.7" width="8.3" height="8.3"/></> },
  { id: 'nvidia', name: 'Nvidia',    hx: 0.415, hy: 0.885, delay: 0.62,
    glyph: <path d="M9.1 9.2V7.8c.14-.01.28-.02.42-.02 3.9-.12 6.46 3.35 6.46 3.35s-2.76 3.84-5.72 3.84c-.4 0-.79-.06-1.16-.19V10.6c1.52.18 1.82.85 2.73 2.37l2.03-1.71s-1.48-1.94-3.98-1.94c-.27 0-.53.02-.78.05zm0-4.7v2.1l.42-.03c5.42-.18 8.95 4.45 8.95 4.45s-4.06 4.93-8.28 4.93c-.38 0-.76-.03-1.09-.1v1.3c.29.04.59.06.89.06 3.93 0 6.77-2.01 9.52-4.38.46.36 2.32 1.25 2.7 1.64-2.61 2.19-8.7 3.95-12.16 3.95-.33 0-.65-.02-.96-.05v1.83H22.9V4.5H9.1zm0 10.25v1.11c-3.63-.65-4.64-4.43-4.64-4.43s1.74-1.93 4.64-2.24v1.22h-.01c-1.52-.18-2.71 1.24-2.71 1.24s.67 2.39 2.72 3.1zM2.9 11.28s2.15-3.17 6.2-3.48V6.71C4.61 7.07.75 10.87.75 10.87s2.19 6.32 8.35 6.9v-1.16c-4.52-.57-6.2-5.33-6.2-5.33z"/> },
  { id: 'amazon', name: 'Amazon',    hx: 0.660, hy: 0.840, delay: 0.35,
    glyph: <path d="M3.2 16.3c3.8 2.4 8.3 3.3 12.6 2.5 1.6-.3 3.3-.9 4.7-1.8.4-.3.1-.8-.3-.7-2.1.6-4.3 1-6.5 1-3.6 0-7.1-.9-10.2-2.6-.3-.2-.6.2-.3.6zm18.1-.4c-.3-.4-1.9-.2-2.6-.1-.2 0-.3-.2-.1-.3 1.3-.9 3.4-.6 3.6-.3.2.3-.1 2.4-1.3 3.4-.2.2-.4.1-.3-.1.3-.8.9-2.2.7-2.6zM13.8 12.6c-.6.5-1.3.9-2.1.9-1.1 0-1.8-.8-1.8-2 0-2.4 2.1-2.8 4-2.8v-.4c0-.7.1-1.5-.4-2-.4-.4-1.2-.6-1.7-.6-1.1 0-2.1.4-2.4 1.6 0 .3-.2.5-.4.5l-2.3-.2c-.2 0-.4-.2-.3-.5C6.9 3.8 9.2 3 11.3 3c1.1 0 2.5.3 3.4 1.1 1.1 1 1 2.4 1 3.9v3.5c0 1 .5 1.5.9 2.1.1.2.2.4 0 .5-.5.4-1.4 1.2-1.9 1.6-.2.1-.4.1-.6 0-.5-.5-.6-.7-1-1.2zm0-3.9v-.5c-1.6 0-3.2.3-3.2 2.1 0 .9.5 1.5 1.3 1.5.6 0 1.2-.4 1.5-1 .4-.7.4-1.4.4-2.1z"/> },
]

export default function Contact() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // the crowd rises toward the light as you come down into the act
      // xPercent must ride along: GSAP writes one transform, so animating yPercent alone
      // wipes the CSS translateX(-50%) that centres the artwork
      gsap.fromTo('.contact__crowd',
        { xPercent: -50, yPercent: 10, scale: 1.06 },
        { xPercent: -50, yPercent: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } })
      gsap.fromTo('.contact__swarm',
        { xPercent: -50, yPercent: 16 },
        { xPercent: -50, yPercent: 2, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: 1.1 } })

      const tl = gsap.timeline({ paused: true })
        .from('.contact__kicker', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
        .from('.contact__link', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          onStart: () => { sound.chime(); sound.riser(1.1) } }, 0.15)
        .from('.suitor', { y: 26, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power2.out' }, 0.5)
      ScrollTrigger.create({ trigger: '.contact__links', start: 'top 82%', onEnter: () => tl.restart() })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="contact" ref={root}>
      <div className="contact__rays" aria-hidden="true" />
      <div className="contact__haze" aria-hidden="true" />

      <div className="contact__head">
        <span className="contact__kicker mono">tout le monde veut mettre la main dessus</span>
        <div className="contact__links">
          {LINKS.map(l => (
            <a key={l.id} className="contact__link" href={l.href}
               target={l.id === 'mail' ? undefined : '_blank'} rel="noreferrer"
               onMouseEnter={() => sound.hover()} onClick={() => sound.connect()}>
              <span className="contact__sheen" aria-hidden="true" />
              <span className="contact__row">
                <span className="contact__label serif">{l.label}</span>
                <span className="contact__arrow" aria-hidden="true">↗</span>
              </span>
              <span className="contact__sub mono">{l.sub}</span>
              <span className="contact__rule" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <img className="contact__swarm" src={handsSwarm} alt="" aria-hidden="true" />

      {/* the crowd, with every company pinned to the arm it owns */}
      <div className="contact__crowd">
        <img className="contact__hands" src={handsGold} alt="" aria-hidden="true" />
        {SUITORS.map(s => (
          <div key={s.id} className="suitor" style={{ left: `${s.hx * 100}%`, top: `${s.hy * 100}%`, animationDelay: `-${s.delay}s` }}>
            <span className="suitor__cuff">
              <svg viewBox="0 0 24 24" className="suitor__glyph">{s.glyph}</svg>
            </span>
            <span className="suitor__name mono">{s.name}</span>
          </div>
        ))}
      </div>

      <footer className="contact__foot mono">
        <span>RAYAN SAMA · {new Date().getFullYear()}</span>
        <span>Cotonou, Bénin</span>
      </footer>
    </section>
  )
}
