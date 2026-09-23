import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { BENIN_PATH, CONTEXT_VIEWBOX, NEIGHBOURS, GULF_LABEL, RELICS } from '../../data/benin'
import { PROJECTS } from '../../data/projects'
import ProjectWindow from '../desktop/ProjectWindow'
import Contact from './Contact'
import sound from '../../audio/sound'
import '../desktop/Desktop.css'
import './rite.css'

gsap.registerPlugin(ScrollTrigger)

const FIELD = Array.from({ length: 260 }, () => ({
  x: Math.random() * 100, y: Math.random() * 100, r: 0.04 + Math.random() * 0.14,
}))

export default function BeninMap() {
  const root = useRef(null)
  const stage = useRef(null)
  const pathRef = useRef(null)
  const [open, setOpen] = useState(null)
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    scrollTo(0, 0)
    const lenis = new Lenis({ duration: 1.2, wheelMultiplier: 0.9 })
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', () => ScrollTrigger.update())

    const ctx = gsap.context(() => {
      const path = pathRef.current
      const len = path.getTotalLength()

      // arrival is directed, not scrubbed — the camera finds Benin, the viewer watches
      const tl = gsap.timeline({ onComplete: () => setArrived(true) })
      tl.fromTo('.beninmap__field', { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0)
        .call(() => sound.whoosh(1.2), null, 0.1)
        .fromTo('.beninmap__svg', { opacity: 0, scale: 0.3, rotate: -6 },
          { opacity: 1, scale: 1, rotate: 0, duration: 1.5, ease: 'power3.out' }, 0.5)
        .to('.beninmap__field', { opacity: 0.22, scale: 0.85, duration: 1.4, ease: 'power2.inOut' }, 0.5)
        .call(() => sound.radarPing(), null, 1.0)
        .fromTo(path, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.9)
        .fromTo('.beninmap__context', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 1.4)
        .fromTo('.beninmap__title span', { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power4.out' }, 1.5)
        .fromTo('.relic', { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)',
            onStart: () => sound.radarPing() }, 2.1)
        .call(() => sound.chime(), null, 3.0)

      // Scrolling on drives the camera *into* the country until it swallows the frame and
      // the contact act is behind it. Scrubbed, so scrolling back pulls the map out again.
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=140%',
          pin: stage.current, scrub: 0.6, anticipatePin: 1,
        },
      })
        // steadier than power2, which crammed most of the zoom into the last moment
        .to('.beninmap__svg', { scale: 14, ease: 'power1.in' }, 0)
        .to('.beninmap__svg', { opacity: 0, ease: 'power2.in' }, 0.42)
        .to('.beninmap__title, .beninmap__caption', { opacity: 0, ease: 'none' }, 0)
        .to('.beninmap__field', { opacity: 0, scale: 2.4, ease: 'power1.in' }, 0)
        // the ground opens onto the act underneath instead of going black
        .to('.beninmap__veil', { opacity: 0, ease: 'power2.in' }, 0.35)
    }, root)

    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy() }
  }, [])

  const openRelic = (p) => { sound.connect(); sound.whoosh(0.8); setOpen(p) }

  return (
    <div className="world" ref={root}>
      <div className="beninmap__pin" ref={stage}>
        <div className="beninmap__veil" aria-hidden="true" />
        <svg className="beninmap__field" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {FIELD.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} className="beninmap__star" />)}
        </svg>

        <div className="beninmap__stage">
          <h2 className="beninmap__title serif">
            {['Everything', 'started', 'here.'].map(w => <span key={w}>{w}&nbsp;</span>)}
          </h2>

          <svg className="beninmap__svg" viewBox={CONTEXT_VIEWBOX} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="beninFill" cx="50%" cy="58%" r="72%">
                <stop offset="0%" stopColor="#ffcf8a" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#ff8a5a" stopOpacity="0.03" />
              </radialGradient>
            </defs>

            {/* the region around it — this is what tells you *where* Benin is */}
            <g className="beninmap__context">
              {NEIGHBOURS.map(n => (
                <g key={n.id}>
                  <path d={n.d} className="beninmap__neighbour" />
                  <text x={n.at[0]} y={n.at[1]} className="beninmap__nlabel">{n.name}</text>
                </g>
              ))}
              <text x={GULF_LABEL.at[0]} y={GULF_LABEL.at[1]} className="beninmap__sea">{GULF_LABEL.name}</text>
            </g>

            <path d={BENIN_PATH} className="beninmap__glow" />
            <path ref={pathRef} d={BENIN_PATH} className="beninmap__outline" />

            {/* named outright, so it never depends on recognising the silhouette */}
            <g className="beninmap__context">
              <text x="100" y="-32" className="beninmap__name">BÉNIN</text>
              <text x="100" y="-12" className="beninmap__sub">AFRIQUE DE L&apos;OUEST · N 6.37° E 2.42°</text>
            </g>

            {RELICS.map((r) => {
              const p = PROJECTS.find(x => x.id === r.id)
              if (!p) return null
              return (
                <g key={r.id} transform={`translate(${r.x} ${r.y})`}
                   onClick={() => openRelic(p)} onMouseEnter={() => sound.hover()} data-cursor>
                  <g className="relic">
                    <circle r="16" className="relic__hit" />
                    <circle r="11" className="relic__pulse" />
                    <circle r="6" className="relic__ring" />
                    <circle r="2.6" className="relic__dot" />
                    <text y="-19" className="relic__name">{p.name}</text>
                  </g>
                </g>
              )
            })}
          </svg>

          <p className={`beninmap__caption mono ${arrived ? 'is-in' : ''}`}>
            quatre points · cliquez-en un · puis continuez à descendre
          </p>
        </div>
      </div>

      <Contact />

      {open && <ProjectWindow project={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
