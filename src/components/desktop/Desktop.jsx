import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../../data/projects'
import { NEOFETCH, ASCII, PROCS, SYSLOG } from '../../data/system'
import { flash } from '../../lib/store'
import sound from '../../audio/sound'
import CommandBar from './CommandBar'
import ProjectWindow from './ProjectWindow'
import './Desktop.css'

function Panel({ id, name, span, tall, children, onFocus, focused }) {
  return (
    <section className={`panel ${focused === id ? 'is-focus' : ''}`} data-span={span} data-tall={tall ? '1' : '0'}
             onMouseEnter={() => onFocus?.(id)}>
      <header className="panel__bar">
        <span className="panel__dots"><i/><i/><i/></span>
        <span className="panel__name mono">{name}</span>
        <span className="panel__x mono">▂ ◻ ✕</span>
      </header>
      <div className="panel__body">{children}</div>
    </section>
  )
}

function useNow() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i) }, [])
  return t
}

function TopBar() {
  const now = useNow()
  const [stat, setStat] = useState({ cpu: 34, ram: 41, net: 12, temp: 52 })
  useEffect(() => {
    const i = setInterval(() => setStat(s => ({
      cpu: Math.max(6, Math.min(99, s.cpu + (Math.random()-0.5)*18)),
      ram: Math.max(30, Math.min(88, s.ram + (Math.random()-0.5)*6)),
      net: Math.max(1, Math.min(120, s.net + (Math.random()-0.5)*40)),
      temp: Math.max(44, Math.min(78, s.temp + (Math.random()-0.5)*4)),
    })), 1400)
    return () => clearInterval(i)
  }, [])
  const ws = ['sys', 'proc', 'net', 'root']
  return (
    <div className="topbar mono">
      <div className="topbar__ws">
        {ws.map((w, i) => <span key={w} className={`ws ${i===3?'ws--root':''}`}>{i+1}:{w}</span>)}
      </div>
      <div className="topbar__center">root@etyb0c4.core</div>
      <div className="topbar__stats">
        <span>CPU <b>{stat.cpu.toFixed(0)}%</b></span>
        <span>MEM <b>{stat.ram.toFixed(0)}%</b></span>
        <span>NET <b>↓{stat.net.toFixed(0)}k</b></span>
        <span>{stat.temp.toFixed(0)}°C</span>
        <span className="topbar__clock">{now.toLocaleTimeString('en-GB')}</span>
      </div>
    </div>
  )
}

function IdCard() {
  return (
    <div className="idcard">
      <pre className="idcard__ascii">{ASCII}</pre>
      <div className="idcard__info mono">
        <div className="idcard__title">rayan<span>@</span>etyb0c4</div>
        <div className="idcard__rule" />
        {NEOFETCH.map(([k, v]) => (
          <div className="idcard__row" key={k}><span className="idcard__k">{k}</span><span className="idcard__v">{v}</span></div>
        ))}
        <div className="idcard__palette">{['#0a0708','#5f5651','#b4342b','#e5514a','#ff6a5a','#efe7e2'].map(c => <i key={c} style={{background:c}}/>)}</div>
      </div>
    </div>
  )
}

function SysLog() {
  const [n, setN] = useState(0)
  useEffect(() => { const i = setInterval(() => setN(x => Math.min(SYSLOG.length, x + 1)), 700); return () => clearInterval(i) }, [])
  return (
    <div className="syslog mono">
      {SYSLOG.slice(0, n).map((l, i) => (
        <div className="syslog__line" key={i}><span className={`syslog__tag tag--${l.tag}`}>[{l.tag}]</span> {l.t}</div>
      ))}
      <div className="syslog__caret">▊</div>
    </div>
  )
}

function Processes() {
  const [rows, setRows] = useState(PROCS)
  useEffect(() => {
    const i = setInterval(() => setRows(rs => rs.map(r => ({ ...r,
      cpu: Math.max(2, Math.min(99.9, r.cpu + (Math.random()-0.5)*8)) }))), 1200)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="htop mono">
      <div className="htop__head"><span>PID</span><span>USER</span><span>CPU%</span><span>MEM%</span><span>COMMAND</span></div>
      {rows.map(r => (
        <div className="htop__row" key={r.pid}>
          <span>{r.pid}</span><span>rayan</span>
          <span className="htop__cpu"><b style={{ width: r.cpu + '%' }} />{r.cpu.toFixed(1)}</span>
          <span>{r.mem.toFixed(1)}</span><span className="htop__cmd">{r.cmd}</span>
        </div>
      ))}
    </div>
  )
}

function NetGraph() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    const dpr = Math.min(devicePixelRatio, 2)
    const resize = () => { c.width = c.clientWidth*dpr; c.height = c.clientHeight*dpr }
    resize(); addEventListener('resize', resize)
    const pts = new Array(80).fill(0.5)
    let raf, k = 0
    const loop = () => {
      k++
      if (k % 3 === 0) { pts.push(Math.max(0.05, Math.min(0.95, pts[pts.length-1] + (Math.random()-0.5)*0.35))); pts.shift() }
      const w = c.width, h = c.height
      ctx.clearRect(0,0,w,h)
      // grid
      ctx.strokeStyle = 'rgba(239,231,226,0.06)'; ctx.lineWidth = 1
      for (let gy=0; gy<=4; gy++){ const y=h*gy/4; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
      // fill + line
      const grad = ctx.createLinearGradient(0,0,0,h)
      grad.addColorStop(0,'rgba(229,81,74,0.35)'); grad.addColorStop(1,'rgba(229,81,74,0)')
      ctx.beginPath()
      pts.forEach((p,i)=>{ const x=w*i/(pts.length-1), y=h-p*h*0.9-h*0.05; i?ctx.lineTo(x,y):ctx.moveTo(x,y) })
      ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fillStyle=grad; ctx.fill()
      ctx.beginPath()
      pts.forEach((p,i)=>{ const x=w*i/(pts.length-1), y=h-p*h*0.9-h*0.05; i?ctx.lineTo(x,y):ctx.moveTo(x,y) })
      ctx.strokeStyle='#ff6a5a'; ctx.lineWidth=1.5*dpr; ctx.shadowColor='#e5514a'; ctx.shadowBlur=8; ctx.stroke()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return <div className="netgraph"><canvas ref={cv} /><span className="netgraph__label mono">net_stat · rx/tx</span></div>
}

function ProjectsList({ onOpen }) {
  return (
    <div className="plist mono">
      {PROJECTS.map(p => {
        const exe = p.id !== 'ctf'
        return (
          <button key={p.id} className="plist__row" data-cursor onClick={() => { sound.hover(); onOpen(p) }} onMouseEnter={() => sound.hover()}>
            <span className="plist__perm">{exe ? '-rwxr-xr-x' : '-rw-r--r--'}</span>
            <span className="plist__own">rayan</span>
            <span className="plist__size">{['12K','8.4K','6.1K','2.1K'][PROJECTS.indexOf(p)] || '4K'}</span>
            <span className="plist__name">{p.id}{exe ? <b className="plist__exe">*</b> : ''}</span>
            <span className="plist__desc">{p.role}</span>
            <span className="plist__go">open ↵</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Desktop({ appeared }) {
  const [focus, setFocus] = useState('projects')
  const [open, setOpen] = useState(null) // project object
  const openProject = (p) => { flash(0.6); sound.breach && sound.escalate(); setOpen(p) }

  return (
    <div className={`desktop ${appeared ? 'desktop--in' : ''}`}>
      <TopBar />
      <div className="desktop__grid">
        <Panel id="id"    name="rayan@etyb0c4 — neofetch" span="5" onFocus={setFocus} focused={focus}><IdCard /></Panel>
        <Panel id="net"   name="net_stat" span="4" onFocus={setFocus} focused={focus}><NetGraph /></Panel>
        <Panel id="log"   name="sys_info.log" span="3" onFocus={setFocus} focused={focus}><SysLog /></Panel>
        <Panel id="proc"  name="htop — skills" span="7" onFocus={setFocus} focused={focus}><Processes /></Panel>
        <Panel id="projects" name="/bin/projects/" span="5" onFocus={setFocus} focused={focus}><ProjectsList onOpen={openProject} /></Panel>
      </div>
      <CommandBar onOpen={openProject} onContact={() => setFocus('net')} />
      {open && <ProjectWindow project={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
