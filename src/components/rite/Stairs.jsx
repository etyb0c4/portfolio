import { useEffect, useRef } from 'react'

/* Steps of light that materialise one by one as the climb progresses and recede into the
   glare above. Drawn on a canvas in perspective: each step is a quad whose width and
   spacing shrink with depth, so the flight reads as going *up and away* from the viewer. */
const STEPS = 26

export default function Stairs() {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    let dpr = Math.min(devicePixelRatio, 1.6)

    const fit = () => {
      dpr = Math.min(devicePixelRatio, 1.6)
      cv.width = cv.clientWidth * dpr
      cv.height = cv.clientHeight * dpr
    }
    fit(); addEventListener('resize', fit)

    let raf
    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (document.hidden) return
      const w = cv.width, h = cv.height
      ctx.clearRect(0, 0, w, h)

      const climb = (window.__gl && window.__gl.climb) || 0
      const t = performance.now() / 1000
      const cx = w / 2
      // vanishing point sits high; the whole flight drifts down as you climb past it
      const vy = h * (0.10 + climb * 0.08)
      const baseY = h * (1.22 - climb * 0.18)

      for (let i = STEPS - 1; i >= 0; i--) {
        // how far along the flight this step sits (0 = nearest, 1 = at the vanishing point)
        const f = i / STEPS
        // steps appear progressively: the higher ones only exist once you have climbed
        const born = Math.min(1, Math.max(0, (climb * 1.5 + 0.42 - f) * 3.2))
        if (born <= 0) continue

        const persp = Math.pow(1 - f, 1.75)          // perspective foreshortening
        const y = vy + (baseY - vy) * persp
        const nextPersp = Math.pow(1 - (i + 1) / STEPS, 1.75)
        const yUp = vy + (baseY - vy) * nextPersp    // where the next tread starts
        const halfW = (w * 0.34) * persp + w * 0.015
        const halfW2 = (w * 0.34) * nextPersp + w * 0.015

        const shimmer = 0.86 + Math.sin(t * 1.5 - i * 0.45) * 0.14
        const a = born * shimmer * (0.42 + 0.58 * persp)

        // the riser — the vertical face of the step, which is what makes it read as a stair
        const riser = ctx.createLinearGradient(0, y, 0, yUp)
        riser.addColorStop(0, `rgba(255,190,110,${a * 0.45})`)
        riser.addColorStop(1, `rgba(120,60,20,${a * 0.10})`)
        ctx.beginPath()
        ctx.moveTo(cx - halfW, y)
        ctx.lineTo(cx + halfW, y)
        ctx.lineTo(cx + halfW2, yUp)
        ctx.lineTo(cx - halfW2, yUp)
        ctx.closePath()
        ctx.fillStyle = riser
        ctx.fill()

        // the lit nose of the tread
        ctx.beginPath()
        ctx.moveTo(cx - halfW, y)
        ctx.lineTo(cx + halfW, y)
        ctx.lineWidth = Math.max(1.2, 3.4 * dpr * persp)
        const eg = ctx.createLinearGradient(cx - halfW, y, cx + halfW, y)
        eg.addColorStop(0, 'rgba(255,220,170,0)')
        eg.addColorStop(0.18, `rgba(255,236,200,${a * 0.85})`)
        eg.addColorStop(0.5, `rgba(255,252,238,${a})`)
        eg.addColorStop(0.82, `rgba(255,236,200,${a * 0.85})`)
        eg.addColorStop(1, 'rgba(255,220,170,0)')
        ctx.strokeStyle = eg
        ctx.shadowColor = 'rgba(255,186,104,0.95)'
        ctx.shadowBlur = 26 * dpr * persp
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    draw()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])

  return <canvas className="stairs" ref={ref} aria-hidden="true" />
}
