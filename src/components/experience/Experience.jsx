import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IdCard, SysLog, Processes, NetGraph, ProjectsList } from '../desktop/modules'
import ProjectWindow from '../desktop/ProjectWindow'
import CommandBar from '../desktop/CommandBar'
import { PROJECTS } from '../../data/projects'
import { setProgress } from '../../lib/store'
import { applyCSS } from '../../lib/palette'
import sound from '../../audio/sound'
import '../desktop/Desktop.css'
import './experience.css'

gsap.registerPlugin(ScrollTrigger)

function Win({ name, accent, wide, tall, children, className = '' }) {
  return (
    <div className={`xwin ${wide ? 'xwin--wide' : ''} ${tall ? 'xwin--tall' : ''} ${className}`} style={accent ? { '--accent': accent } : undefined}>
      <div className="xwin__bar mono"><span className="panel__dots"><i/><i/><i/></span><span className="xwin__name">{name}</span><span className="xwin__ctl">▂ ◻ ✕</span></div>
      <div className="xwin__body">{children}</div>
    </div>
  )
}

function TopBar({ stage }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i) }, [])
  const ws = ['whoami', 'ethos', 'proc', 'projects', 'net']
  return (
    <div className="xbar mono">
      <div className="xbar__ws">{ws.map((w, i) => <span key={w} className={`ws ${i === stage ? 'ws--on' : ''}`}>{i + 1}:{w}</span>)}</div>
      <div className="xbar__center">root@etyb0c4.core</div>
      <div className="xbar__right"><span>{['guest', 'user', 'sudo', 'www-data', 'root'][stage]}</span><span className="topbar__clock">{now.toLocaleTimeString('en-GB')}</span></div>
    </div>
  )
}

function Radar() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d'); const dpr = Math.min(devicePixelRatio, 2)
    const size = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr }
    size(); addEventListener('resize', size)
    let raf, a = 0
    const blips = Array.from({ length: 5 }, () => ({ r: 0.3 + Math.random() * 0.6, th: Math.random() * 6.28 }))
    const loop = () => {
      a += 0.02; const w = c.width, h = c.height, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(229,81,74,0.18)'; ctx.lineWidth = 1
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, R * i / 3, 0, 6.2832); ctx.stroke() }
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke()
      // sweep
      const g = ctx.createConicGradient ? ctx.createConicGradient(a, cx, cy) : null
      if (g) { g.addColorStop(0, 'rgba(229,81,74,0.35)'); g.addColorStop(0.08, 'rgba(229,81,74,0)'); g.addColorStop(1, 'rgba(229,81,74,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a, a + 0.5); ctx.closePath(); ctx.fill() }
      ctx.strokeStyle = '#ff6a5a'; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke()
      blips.forEach(b => { const x = cx + Math.cos(b.th) * R * b.r, y = cy + Math.sin(b.th) * R * b.r
        const near = Math.abs(((a % 6.2832) - (b.th % 6.2832) + 6.2832) % 6.2832) < 0.3
        ctx.fillStyle = near ? '#ffb0a5' : 'rgba(229,81,74,0.5)'; ctx.beginPath(); ctx.arc(x, y, (near ? 4 : 2) * dpr, 0, 6.28); ctx.fill() })
      raf = requestAnimationFrame(loop)
    }
    loop(); return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [])
  return <canvas className="radar" ref={cv} />
}

const LINKS = [
  { label: 'GitHub', handle: 'etyb0c4', href: 'https://github.com/etyb0c4' },
  { label: 'LinkedIn', handle: 'in/rayan-sama', href: 'https://linkedin.com/in/rayan-sama' },
  { label: 'Email', handle: 'ryansama.tech@gmail.com', href: 'mailto:ryansama.tech@gmail.com' },
]

export default function Experience() {
  const root = useRef(null)
  const [stage, setStage] = useState(0)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, wheelMultiplier: 0.95, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    if (typeof window !== 'undefined') window.__lenis = lenis
    setProgress(0); sound.setProgress(0); applyCSS(0)
    lenis.on('scroll', ({ scroll }) => {
      const max = document.documentElement.scrollHeight - innerHeight
      const p = max > 0 ? scroll / max : 0
      setProgress(p); sound.setProgress(p); applyCSS(p); setStage(Math.round(p * 4))
      ScrollTrigger.update()
    })
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      // window "opens" as each section enters — scrubbed clip + stagger
      gsap.utils.toArray('.xsection').forEach((sec) => {
        const win = sec.querySelector('.xwin')
        const head = sec.querySelector('.xhead')
        if (head) gsap.from(head, { y: 60, opacity: 0, filter: 'blur(8px)', ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 45%', scrub: 0.6 } })
        if (win) {
          gsap.fromTo(win, { clipPath: 'inset(48% 8% 48% 8%)', opacity: 0.2, y: 50, scale: 0.96 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, scale: 1, ease: 'none',
              scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 40%', scrub: 0.7 } })
          const rows = win.querySelectorAll('[data-stagger]')
          if (rows.length) gsap.from(rows, { y: 16, opacity: 0, stagger: 0.05, ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top 65%', end: 'top 30%', scrub: 0.6 } })
        }
      })
    }, root)

    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy() }
  }, [])

  const openProject = (p) => { sound.escalate(); setOpen(p) }

  return (
    <div className="xp" ref={root}>
      <TopBar stage={stage} />

      {/* 1 — hero : nom en particules */}
      <section className="xsection xsection--hero">
        <div className="xhero__meta mono"><span>N 6.37° · E 2.42° · COTONOU</span><span>EPITECH · CLASS OF 2029</span></div>
        <div className="xhero__space" aria-hidden="true" />{/* particle name lives here */}
        <p className="xhero__tag serif">I build systems <em>before</em> I break them.</p>
        <a href="#whoami" className="xhero__scroll mono" data-cursor>scroll to descend ↓</a>
      </section>

      {/* 2 — whoami : neofetch */}
      <section className="xsection" id="whoami">
        <div className="xhead"><span className="kicker">// whoami</span></div>
        <Win name="rayan@etyb0c4 — neofetch" wide><IdCard /></Win>
      </section>

      {/* 2 — manifesto / sys_info.log */}
      <section className="xsection" id="ethos">
        <h2 className="xhead serif">I don’t <em>wait</em> for tools.<br/>I <span className="ac">build my own</span>.</h2>
        <Win name="sys_info.log" wide><SysLog /></Win>
      </section>

      {/* 3 — skills / htop */}
      <section className="xsection">
        <div className="xhead"><span className="kicker">// live processes</span><h2 className="serif">What runs on my machine</h2></div>
        <Win name="htop — skills" wide tall><Processes /></Win>
      </section>

      {/* 4 — projects */}
      <section className="xsection xsection--projects">
        <div className="xhead"><span className="kicker">// /bin/projects</span><h2 className="serif">Things I built &amp; run</h2></div>
        <Win name="/bin/projects/" wide>
          <div className="plist-wrap">
            {PROJECTS.map((p, i) => <div data-stagger key={p.id} />)}
            <ProjectsList onOpen={openProject} />
          </div>
        </Win>
        <p className="xhint mono">click a binary to inspect · or type <kbd>open &lt;name&gt;</kbd> below</p>
      </section>

      {/* 5 — contact / net_stat radar */}
      <section className="xsection xsection--contact">
        <div className="xhead"><span className="kicker">// establish connection</span><h2 className="serif">You have root. <em>Now what?</em></h2></div>
        <Win name="net_stat — socket" wide className="xcontact">
          <div className="xcontact__grid">
            <div className="xcontact__radar"><Radar /><span className="xcontact__status mono">● socket open · awaiting handshake</span></div>
            <div className="xcontact__links">
              {LINKS.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="clink" data-cursor onMouseEnter={() => sound.hover()}>
                  <span className="clink__label mono">{l.label}</span><span className="clink__handle">{l.handle}</span><span className="clink__arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </Win>
        <div className="xcmd"><CommandBar onOpen={openProject} onContact={() => {}} /></div>
        <footer className="xfooter mono"><span>RAYAN SAMA · {new Date().getFullYear()}</span><span>built from scratch · three.js · gsap · no template</span></footer>
      </section>

      {open && <ProjectWindow project={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
