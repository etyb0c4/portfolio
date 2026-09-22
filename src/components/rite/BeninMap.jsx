import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { BENIN_PATH, BENIN_VIEWBOX, RELICS } from '../../data/benin'
import { PROJECTS } from '../../data/projects'
import ProjectWindow from '../desktop/ProjectWindow'
import sound from '../../audio/sound'
import '../desktop/Desktop.css'
import './rite.css'

// abstract star/landmass field the camera falls out of before finding the country
// radii are in a 100-unit viewBox stretched across the viewport (~16x), so these stay small
const FIELD = Array.from({ length: 260 }, () => ({
  x: Math.random() * 100, y: Math.random() * 100, r: 0.04 + Math.random() * 0.14,
}))

export default function BeninMap() {
  const root = useRef(null)
  const pathRef = useRef(null)
  const [open, setOpen] = useState(null)
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    // gsap.context + revert() (not tl.kill()) so StrictMode's double-invoke can't leave
    // elements stuck at a .from() start state that the next timeline then reads as "natural".
    // Every tween below is fromTo for the same reason: the end state is declared, never inferred.
    const ctx = gsap.context(() => {
      const path = pathRef.current
      const len = path.getTotalLength()

      const tl = gsap.timeline({ onComplete: () => setArrived(true) })
      tl.fromTo('.beninmap__field', { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0)
        .call(() => sound.whoosh(1.2), null, 0.1)
        .fromTo('.beninmap__svg',
          { opacity: 0, scale: 0.25, rotate: -8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 1.5, ease: 'power3.out' }, 0.5)
        .to('.beninmap__field', { opacity: 0.22, scale: 0.85, duration: 1.4, ease: 'power2.inOut' }, 0.5)
        .call(() => sound.radarPing(), null, 1.0)
        .fromTo(path, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.9)
        .fromTo('.beninmap__title span', { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power4.out' }, 1.3)
        .fromTo('.relic', { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)',
            onStart: () => sound.radarPing() }, 2.0)
        .call(() => sound.chime(), null, 2.9)
    }, root)

    return () => ctx.revert()
  }, [])

  const openRelic = (p) => { sound.connect(); sound.whoosh(0.8); setOpen(p) }

  return (
    <div className="beninmap" ref={root}>
      <svg className="beninmap__field" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {FIELD.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} className="beninmap__star" />)}
      </svg>

      <div className="beninmap__stage">
        <h2 className="beninmap__title serif">
          {['Everything', 'started', 'here.'].map(w => <span key={w}>{w}&nbsp;</span>)}
        </h2>

        <svg className="beninmap__svg" viewBox={BENIN_VIEWBOX} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="beninFill" cx="50%" cy="58%" r="72%">
              <stop offset="0%" stopColor="#ffcf8a" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#ff8a5a" stopOpacity="0.03" />
            </radialGradient>
          </defs>
          <path d={BENIN_PATH} className="beninmap__glow" />
          <path ref={pathRef} d={BENIN_PATH} className="beninmap__outline" />

          {RELICS.map((r) => {
            const p = PROJECTS.find(x => x.id === r.id)
            if (!p) return null
            return (
              // placement lives on the outer <g> so GSAP's scale tween on .relic can't
              // overwrite the translate in the SVG transform attribute
              <g key={r.id} transform={`translate(${r.x} ${r.y})`}
                 onClick={() => openRelic(p)} onMouseEnter={() => sound.hover()} data-cursor>
                <g className="relic">
                  <circle r="16" className="relic__hit" />
                  <circle r="11" className="relic__pulse" />
                  <circle r="6" className="relic__ring" />
                  <circle r="2.6" className="relic__dot" />
                  <text y="-19" className="relic__name">{p.name}</text>
                  <text y="-11" className="relic__city">{r.city}</text>
                </g>
              </g>
            )
          })}
        </svg>

        <p className={`beninmap__caption mono ${arrived ? 'is-in' : ''}`}>
          N 6.37° · E 2.42° — four points. click one.
        </p>
      </div>

      {open && <ProjectWindow project={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
