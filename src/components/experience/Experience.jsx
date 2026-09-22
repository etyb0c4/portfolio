import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IdCard, SysLog, SectorLog, ProjectsList } from '../desktop/modules'
import ProjectWindow from '../desktop/ProjectWindow'
import CommandBar from '../desktop/CommandBar'
import PayloadForm from '../desktop/PayloadForm'
import { PROJECTS } from '../../data/projects'
import { setProgress, flash } from '../../lib/store'
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
  const ws = ['home', 'whoami', 'projects', 'proc', 'net']
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
  const glitch = useRef(null)
  const warp = useRef(null)
  const actCard = useRef(null)
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
      // split headings into chars for a cinematic reveal
      root.current.querySelectorAll('.xhead h2, h2.xhead').forEach((h) => {
        if (h.dataset.split) return; h.dataset.split = '1'
        const html = h.innerHTML
        h.innerHTML = html.replace(/<br\s*\/?>(?=.)/g, '<br/>').split(/(<[^>]+>)/).map(seg => {
          if (seg.startsWith('<')) return seg
          return seg.replace(/[^\s]/g, (c) => `<span class="xch">${c}</span>`)
        }).join('')
      })

      // each section plays as a directed shot on a fixed clock, not a scroll-scrubbed reveal —
      // the pacing is the same whether you scroll fast or slow, like a cut in a film, with sound tied to every beat
      gsap.utils.toArray('.xsection').forEach((sec, i) => {
        if (i === 0) return // hero has its own particle-driven entrance, nothing to "cut into" on load

        const win = sec.querySelector('.xwin')
        const head = sec.querySelector('.xhead')
        const chars = sec.querySelectorAll('.xch')
        const rows = win ? win.querySelectorAll('[data-stagger]') : []

        const tl = gsap.timeline({ paused: true })
        const actTitle = sec.dataset.act

        // a film needs chapter cards: black frame, the act announced, then a hard cut into the scene
        if (actTitle && actCard.current) {
          tl.call(() => { actCard.current.querySelector('.actcard__text').textContent = actTitle })
            .set(actCard.current, { display: 'flex', opacity: 0 })
            .call(() => sound.snap())
            .to(actCard.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
            .to({}, { duration: 0.55 })
            .addLabel('cut')
            .to(actCard.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 'cut')
            .set(actCard.current, { display: 'none' }, 'cut+=0.4')
        } else {
          tl.addLabel('cut', 0)
        }

        tl.add(() => {
          const el = glitch.current
          if (el) {
            gsap.killTweensOf(el)
            gsap.set(el, { opacity: 1, clipPath: 'inset(0% 0% 94% 0%)' })
            gsap.timeline()
              .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.08, ease: 'power4.out' })
              .to(el, { opacity: 0, duration: 0.34, ease: 'power2.out' }, 0.05)
          }
          flash(0.5); sound.whoosh(1)
        }, 'cut')

        if (chars.length) {
          tl.set(chars, { yPercent: 120, opacity: 0, rotateX: -70 })
            .to(chars, { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.018, duration: 0.55, ease: 'back.out(1.3)' }, 'cut+=0.06')
        } else if (head) {
          tl.set(head, { y: 60, opacity: 0, filter: 'blur(8px)' })
            .to(head, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'back.out(1.2)' }, 'cut+=0.06')
        }
        if (win) {
          tl.set(win, { clipPath: 'inset(48% 8% 48% 8%)', opacity: 0.2, y: 60, scale: 0.94, filter: 'blur(6px)' })
            .to(win, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out',
              onStart: () => sound.snap() }, 'cut+=0.26')
          if (rows.length) {
            tl.set(rows, { y: 16, opacity: 0 })
              .to(rows, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, 'cut+=0.55')
          }
        }
        tl.add(() => sound.chime())

        ScrollTrigger.create({ trigger: sec, start: 'top 78%', onEnter: () => tl.restart(), onEnterBack: () => tl.restart() })

        // depth: sections recede (scale + blur + fade) as they leave the top — ambient camera dolly, stays scroll-linked
        gsap.to(sec, { scale: 0.93, opacity: 0.12, filter: 'blur(6px)', ease: 'none', transformOrigin: '50% 15%',
          scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: 0.8 } })
      })
    }, root)

    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy() }
  }, [])

  // opening a project is a camera dock, not a click: the particle field rushes into a core, then the report opens
  const openProject = (p) => {
    if (!window.__gl) return
    gsap.timeline()
      .call(() => sound.whoosh(1.4))
      .to(warp.current, { opacity: 1, scale: 1.7, duration: 0.5, ease: 'power3.in' }, 0)
      .to(window.__gl, { dock: 1, duration: 0.6, ease: 'power3.in' }, 0)
      .call(() => sound.escalate(), null, 0.5)
      .to(warp.current, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.55)
      .call(() => setOpen(p), null, 0.6)
  }
  const closeProject = () => {
    if (window.__gl) gsap.to(window.__gl, { dock: 0, duration: 0.5, ease: 'power2.out' })
    setOpen(null)
  }

  return (
    <div className="xp" ref={root}>
      <div className="xglitch" ref={glitch} aria-hidden="true" />
      <div className="xwarp" ref={warp} aria-hidden="true" />
      <div className="actcard" ref={actCard} aria-hidden="true"><span className="actcard__text" /></div>
      <TopBar stage={stage} />

      {/* 1 — hero : nom en particules */}
      <section className="xsection xsection--hero">
        <div className="xhero__meta mono"><span>N 6.37° · E 2.42° · COTONOU</span><span>EPITECH · CLASS OF 2029</span></div>
        <div className="xhero__space" aria-hidden="true" />{/* particle name lives here */}
        <p className="xhero__tag serif">I build systems <em>before</em> I break them.</p>
        <a href="#whoami" className="xhero__scroll mono" data-cursor>scroll to descend ↓</a>
      </section>

      {/* 2 — whoami + manifesto : neofetch & sys_info.log side by side */}
      <section className="xsection xsection--duo" id="whoami">
        <div className="xhead"><span className="kicker">// whoami</span><h2 className="serif">I don’t <em>wait</em> for tools. I <span className="ac">build my own</span>.</h2></div>
        <div className="xduo">
          <Win name="rayan@etyb0c4 — neofetch"><IdCard /></Win>
          <Win name="sys_info.log"><SysLog /></Win>
        </div>
      </section>

      {/* 3 — ACT II : projects as unstable data cores, dock in to inspect */}
      <section className="xsection xsection--projects" data-act="ACT II — LE NOYAU GLITCHÉ">
        <div className="xhead"><span className="kicker">// /bin/projects</span><h2 className="serif">Things I built &amp; run</h2></div>
        <Win name="/bin/projects/" wide>
          <div className="plist-wrap">
            {PROJECTS.map((p, i) => <div data-stagger key={p.id} />)}
            <ProjectsList onOpen={openProject} />
          </div>
        </Win>
        <p className="xhint mono">click a binary to inspect · or type <kbd>open &lt;name&gt;</kbd> below</p>
      </section>

      {/* 4 — ACT III : parcours reframed as system incidents */}
      <section className="xsection" data-act="ACT III — LA TRAVERSÉE DES SECTEURS">
        <div className="xhead"><span className="kicker">// sector log</span><h2 className="serif">What I broke to get here</h2></div>
        <Win name="sector.log — incident history" wide tall><SectorLog /></Win>
      </section>

      {/* 5 — ACT IV : contact / net_stat radar / payload injection */}
      <section className="xsection xsection--contact" data-act="ACT IV — LE PROTOCOLE FINAL">
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
        <Win name="payload_inject.sh — real message" wide className="xpayload">
          <PayloadForm />
        </Win>
        <div className="xcmd"><CommandBar onOpen={openProject} onContact={() => {}} /></div>
        <footer className="xfooter mono"><span>RAYAN SAMA · {new Date().getFullYear()}</span><span>built from scratch · three.js · gsap · no template</span></footer>
      </section>

      {open && <ProjectWindow project={open} onClose={closeProject} />}
    </div>
  )
}
