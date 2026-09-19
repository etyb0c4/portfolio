import { useEffect, useRef } from 'react'
import './Cursor.css'

export default function Cursor() {
  const dot = useRef(null), ring = useRef(null)
  useEffect(() => {
    if (matchMedia('(max-width: 1024px)').matches) return
    const p = { x: innerWidth/2, y: innerHeight/2 }
    const r = { ...p }
    const move = e => { p.x = e.clientX; p.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${p.x}px,${p.y}px)` }
    addEventListener('pointermove', move)
    const over = e => {
      const hit = e.target.closest('a,button,[data-cursor]')
      ring.current?.classList.toggle('is-hot', !!hit)
    }
    addEventListener('pointerover', over)
    let raf
    const loop = () => { r.x += (p.x-r.x)*0.18; r.y += (p.y-r.y)*0.18
      if (ring.current) ring.current.style.transform = `translate(${r.x}px,${r.y}px)`
      raf = requestAnimationFrame(loop) }
    loop()
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerover', over); cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
      <div className="cursor-ring" ref={ring}><span/><span/><span/><span/></div>
      <div className="cursor-dot" ref={dot} />
    </>
  )
}
