import { useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import { flash } from '../lib/store'
import './Contact.css'

const LINKS = [
  { label: 'GitHub',   handle: 'etyb0c4',                 href: 'https://github.com/etyb0c4' },
  { label: 'LinkedIn', handle: 'in/rayan-sama',           href: 'https://linkedin.com/in/rayan-sama' },
  { label: 'Email',    handle: 'ryansama.tech@gmail.com', href: 'mailto:ryansama.tech@gmail.com' },
]

export default function Contact() {
  const [ref, inView] = useInView({ threshold: 0.4, once: true })
  useEffect(() => { if (inView) flash(1.1) }, [inView])
  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="contact__top mono">
        <span className="contact__ps1">rayan@rayan.dev</span>:<span className="contact__path">~</span># whoami
      </div>

      {/* "ROOT" est rendu en particules 3D (Scene.jsx) au climax */}
      <div className="contact__spacer" aria-hidden="true" />

      <div className="contact__foot">
        <p className="contact__line serif">You have root. <em>Now what?</em></p>
        <p className="contact__sub">Open to internships, jobs, and things worth building. FR / EN.</p>
        <div className="contact__links">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="clink" data-cursor onPointerEnter={() => flash(0.3)}>
              <span className="clink__label mono">{l.label}</span>
              <span className="clink__handle">{l.handle}</span>
              <span className="clink__arrow">↗</span>
            </a>
          ))}
        </div>
      </div>

      <footer className="contact__footer mono">
        <span>RAYAN SAMA · {new Date().getFullYear()}</span>
        <span>built from scratch · three.js · gsap · no template</span>
        <span className="contact__hint">press <kbd>~</kbd> for a shell</span>
      </footer>
    </section>
  )
}
