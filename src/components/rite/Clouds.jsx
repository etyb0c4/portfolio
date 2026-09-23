import { useEffect, useRef } from 'react'

/* Layered cloud banks drifting past as the climb rises through them. Each band is drawn
   from overlapping soft blobs on a canvas: near bands are large, fast and bright, far ones
   small, slow and pale, so the parallax alone sells the altitude. The whole stack sinks as
   you climb — you are passing through the weather, not watching it. */
const BANDS = [
  { y: 0.88, scale: 1.00, speed: 15, alpha: 0.30, blobs: 13, tint: [255, 228, 194] },
  { y: 0.72, scale: 0.74, speed: 11, alpha: 0.22, blobs: 14, tint: [255, 220, 182] },
  { y: 0.57, scale: 0.54, speed: 8,  alpha: 0.16, blobs: 15, tint: [255, 214, 176] },
  { y: 0.42, scale: 0.38, speed: 5.5, alpha: 0.12, blobs: 15, tint: [255, 228, 200] },
  { y: 0.28, scale: 0.26, speed: 3.5, alpha: 0.085, blobs: 14, tint: [255, 240, 218] },
]

// fixed per-band blob layout so the shapes stay stable frame to frame
const LAYOUT = BANDS.map((b, bi) =>
  Array.from({ length: b.blobs }, (_, i) => ({
    x: (i / b.blobs) + (Math.sin(bi * 12.9 + i * 4.7) * 0.5 + 0.5) * 0.12,
    dy: Math.sin(bi * 3.1 + i * 7.3) * 0.85,
    r: 0.34 + (Math.sin(bi * 5.5 + i * 2.2) * 0.5 + 0.5) * 0.95,
  }))
)

export default function Clouds() {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    let dpr = Math.min(devicePixelRatio, 1.4)

    const fit = () => {
      dpr = Math.min(devicePixelRatio, 1.4)
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

      BANDS.forEach((band, bi) => {
        // climbing pushes every band downward past the viewer, nearer ones faster
        const sink = climb * h * (0.55 + band.scale * 0.85)
        const cy = band.y * h + sink
        if (cy < -h * 0.4 || cy > h * 1.5) return

        const blobH = h * 0.22 * band.scale
        const drift = (t * band.speed) % (w * 1.6)
        const [r, g, bl] = band.tint

        LAYOUT[bi].forEach(p => {
          // two copies so the band wraps seamlessly as it drifts
          for (const off of [0, -w * 1.6]) {
            const x = (p.x * w * 1.6 + drift + off) % (w * 1.6) - w * 0.3
            if (x < -w * 0.5 || x > w * 1.5) continue
            const rad = blobH * p.r * 2.1
            const y = cy + p.dy * blobH * 0.5
            // Squash the canvas rather than clipping an ellipse: a radial gradient inside
            // ctx.ellipse() gets cut at the path edge and the blob reads as a hard lozenge.
            // Scaling a circle whose gradient already reaches zero leaves no edge at all.
            ctx.save()
            ctx.translate(x, y)
            ctx.scale(1, 0.34)
            const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
            grd.addColorStop(0, `rgba(${r},${g},${bl},${band.alpha})`)
            grd.addColorStop(0.30, `rgba(${r},${g},${bl},${band.alpha * 0.62})`)
            grd.addColorStop(0.62, `rgba(${r},${g},${bl},${band.alpha * 0.20})`)
            grd.addColorStop(1, `rgba(${r},${g},${bl},0)`)
            ctx.fillStyle = grd
            ctx.beginPath()
            ctx.arc(0, 0, rad, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
        })
      })
    }
    draw()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])

  return <canvas className="clouds" ref={ref} aria-hidden="true" />
}
