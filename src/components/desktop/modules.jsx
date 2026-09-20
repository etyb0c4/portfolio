import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../../data/projects'
import { NEOFETCH, ASCII, PROCS, SYSLOG } from '../../data/system'
import sound from '../../audio/sound'

export function IdCard() {
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

export function SysLog({ run = true }) {
  const [n, setN] = useState(0)
  useEffect(() => { if (!run) return; const i = setInterval(() => setN(x => Math.min(SYSLOG.length, x + 1)), 620); return () => clearInterval(i) }, [run])
  return (
    <div className="syslog mono">
      {SYSLOG.slice(0, n).map((l, i) => (
        <div className="syslog__line" key={i}><span className={`syslog__tag tag--${l.tag}`}>[{l.tag}]</span> {l.t}</div>
      ))}
      <div className="syslog__caret">▊</div>
    </div>
  )
}

export function Processes() {
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

export function NetGraph() {
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
      ctx.strokeStyle = 'rgba(239,231,226,0.06)'; ctx.lineWidth = 1
      for (let gy=0; gy<=4; gy++){ const y=h*gy/4; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
      const grad = ctx.createLinearGradient(0,0,0,h)
      grad.addColorStop(0,'rgba(229,81,74,0.35)'); grad.addColorStop(1,'rgba(229,81,74,0)')
      ctx.beginPath(); pts.forEach((p,i)=>{ const x=w*i/(pts.length-1), y=h-p*h*0.9-h*0.05; i?ctx.lineTo(x,y):ctx.moveTo(x,y) })
      ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fillStyle=grad; ctx.fill()
      ctx.beginPath(); pts.forEach((p,i)=>{ const x=w*i/(pts.length-1), y=h-p*h*0.9-h*0.05; i?ctx.lineTo(x,y):ctx.moveTo(x,y) })
      ctx.strokeStyle='#ff6a5a'; ctx.lineWidth=1.5*dpr; ctx.shadowColor='#e5514a'; ctx.shadowBlur=8; ctx.stroke()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return <div className="netgraph"><canvas ref={cv} /><span className="netgraph__label mono">net_stat · rx/tx</span></div>
}

export function ProjectsList({ onOpen }) {
  return (
    <div className="plist mono">
      {PROJECTS.map((p, idx) => {
        const exe = p.id !== 'ctf'
        return (
          <button key={p.id} className="plist__row" data-cursor onClick={() => { sound.hover(); onOpen(p) }} onMouseEnter={() => sound.hover()}>
            <span className="plist__perm">{exe ? '-rwxr-xr-x' : '-rw-r--r--'}</span>
            <span className="plist__own">rayan</span>
            <span className="plist__size">{['12K','8.4K','6.1K','2.1K'][idx] || '4K'}</span>
            <span className="plist__name">{p.id}{exe ? <b className="plist__exe">*</b> : ''}</span>
            <span className="plist__desc">{p.role}</span>
            <span className="plist__go">open ↵</span>
          </button>
        )
      })}
    </div>
  )
}
