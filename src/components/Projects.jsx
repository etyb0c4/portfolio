import { useRef } from 'react'
import chessImg from '../assets/proj/chess3d.jpg'
import jarvisImg from '../assets/proj/jarvis-hud.jpg'
import b2rImg from '../assets/proj/b2r-kit.jpg'
import ctfImg from '../assets/proj/ctf.jpg'
const THUMBS = { 'chess3d': chessImg, 'jarvis-hud': jarvisImg, 'b2r-kit': b2rImg, 'ctf': ctfImg }
import { PROJECTS } from '../data/projects'
import Scramble from './Scramble'
import { flash } from '../lib/store'
import './Projects.css'

function Card({ p }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current, r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', (-y * 8) + 'deg')
    el.style.setProperty('--ry', (x * 10) + 'deg')
    el.style.setProperty('--mx', (x * 100 + 50) + '%')
    el.style.setProperty('--my', (y * 100 + 50) + '%')
  }
  const reset = () => { const el = ref.current; el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg') }
  return (
    <article className="pcard" ref={ref} onPointerMove={onMove} onPointerLeave={reset}
             onPointerEnter={() => flash(0.25)} style={{ '--accent': p.accent }} data-cursor>
      <div className="pcard__thumb" style={{ backgroundImage: `url(${THUMBS[p.id]})` }} />
      <div className="pcard__sheen" />
      <header className="pcard__head">
        <span className="pcard__idx mono">{p.index}</span>
        <span className="pcard__year mono">{p.year}</span>
      </header>
      <h3 className="pcard__name">{p.name}</h3>
      <p className="pcard__role mono">{p.role}</p>
      <p className="pcard__blurb">{p.blurb}</p>
      <ul className="pcard__stack">
        {p.stack.map(s => <li key={s} className="mono">{s}</li>)}
      </ul>
      <footer className="pcard__foot">
        <span className="pcard__metric mono">{p.metric}</span>
        <span className="pcard__go mono">rooted ↗</span>
      </footer>
    </article>
  )
}

export default function Projects() {
  return (
    <section className="section projects" id="projects">
      <div className="projects__head">
        <span className="kicker">// machines rooted</span>
        <Scramble as="h2" className="projects__title" text="Things I built" />
        <p className="projects__lede">Not coursework. Tools I actually run — offensive tooling, graphics engines, interfaces that feel alive.</p>
      </div>
      <div className="projects__grid">
        {PROJECTS.map(p => <Card key={p.id} p={p} />)}
      </div>
    </section>
  )
}
