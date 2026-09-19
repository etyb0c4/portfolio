import { useEffect, useRef, useState } from 'react'
export function useInView(opts = { threshold: 0.35, once: true }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (opts.once) io.disconnect() }
      else if (!opts.once) setInView(false)
    }, { threshold: opts.threshold })
    io.observe(el); return () => io.disconnect()
  }, [])
  return [ref, inView]
}
