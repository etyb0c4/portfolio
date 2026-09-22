import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import sound from '../../audio/sound'
import './rite.css'

/* The mark the visitor drew, lifted out of the abyss canvas and carried into the climb.
   It is mounted above the act switch and never unmounts between them, so the cut from
   the rite to the ascension is a continuous movement of one object rather than a hard swap.
   Geometry is kept in page pixels, so on the first frame it sits exactly over the wet ink. */
export default function MarkBeacon({ strokes }) {
  const wrap = useRef(null)
  const glow = useRef(null)

  const box = (() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const s of strokes) for (const p of s) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    }
    return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, h: maxY - minY }
  })()

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    // Drive ONE transform on the <svg> itself. Animating an inner <g> while CSS also set
    // `translate` on it left the two fighting and the move-to-home silently did nothing.
    gsap.set(el, { transformOrigin: `${box.cx}px ${box.cy}px` })

    // home: clear of the headline, high in the frame
    const homeX = innerWidth / 2 - box.cx
    const homeY = innerHeight * 0.17 - box.cy
    const scale = Math.min(1, (innerHeight * 0.20) / Math.max(box.h, 1))

    const settled = { done: false }
    const tl = gsap.timeline()
    // 1 — it catches fire where it was drawn
    tl.call(() => sound.ascend())
      .fromTo(glow.current, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.out' })
      .to(el, { scale: 1.06, duration: 0.45, ease: 'power2.out' }, 0)
    // 2 — it tears loose and climbs to its station
    tl.to(el, { x: homeX, y: homeY, scale, duration: 2.0, ease: 'power2.inOut' }, 0.55)
      .call(() => sound.whoosh(1.1), null, 0.6)
      .call(() => { settled.done = true })

    // 3 — from then on the climb carries it further up and away
    let raf
    const follow = () => {
      raf = requestAnimationFrame(follow)
      if (!settled.done) return
      const c = (window.__gl && window.__gl.climb) || 0
      gsap.set(el, { x: homeX, y: homeY - c * innerHeight * 0.34, scale, opacity: 1 - c * 0.4 })
    }
    follow()
    return () => { tl.kill(); cancelAnimationFrame(raf) }
  }, [])

  const d = strokes
    .filter(s => s.length > 1)
    .map(s => 'M' + s.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L'))
    .join(' ')

  return (
    <svg className="beacon" ref={wrap} viewBox={`0 0 ${innerWidth} ${innerHeight}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="beaconGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" result="b1" />
          <feGaussianBlur stdDeviation="22" result="b2" />
          <feMerge>
            <feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="beacon__wrap">
        <g ref={glow} className="beacon__glow" filter="url(#beaconGlow)">
          <path d={d} className="beacon__burn" />
        </g>
        <path d={d} className="beacon__core" />
      </g>
    </svg>
  )
}
