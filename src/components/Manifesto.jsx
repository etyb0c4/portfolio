import { useEffect, useRef } from 'react'
import './Manifesto.css'

const LINES = [
  [{ t: 'I don’t ' }, { t: 'wait', em: true }, { t: ' for tools.' }],
  [{ t: 'When they slow me down,' }],
  [{ t: 'I ' }, { t: 'build my own', accent: true }, { t: '.' }],
]

export default function Manifesto() {
  const root = useRef(null)
  useEffect(() => {
    const words = root.current.querySelectorAll('.mf__word')
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) {
        const i = +e.target.dataset.i
        e.target.style.transitionDelay = (i * 45) + 'ms'
        e.target.classList.add('on')
      }})
    }, { threshold: 0.6 })
    words.forEach(w => io.observe(w))
    return () => io.disconnect()
  }, [])
  let k = 0
  return (
    <section className="section manifesto" id="manifesto" ref={root}>
      <span className="kicker mf__tag">// ethos</span>
      <div className="mf__lines serif">
        {LINES.map((line, li) => (
          <div className="mf__line" key={li}>
            {line.map((seg, si) => seg.t.split(' ').map((w, wi) => (
              <span className={`mf__word ${seg.em?'is-em':''} ${seg.accent?'is-accent':''}`} data-i={k++} key={si+'-'+wi}>
                {w}{' '}
              </span>
            )))}
          </div>
        ))}
      </div>
      <p className="mf__foot mono">Every tool in the arsenal below started as a problem that annoyed me enough to solve for good.</p>
    </section>
  )
}
