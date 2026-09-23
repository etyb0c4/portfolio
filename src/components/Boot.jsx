import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import sound from '../audio/sound'
import { applyJourney } from '../lib/journey'
import './Boot.css'

// ambient daemon chatter looping behind the prompt — the machine is alive before you touch it
const AMBIENT = [
  'kern: watchdog: bpf_prog_load id=4471 ok',
  'sshd[2211]: refused connect from 10.0.0.77 port 51221',
  'audit: SELINUX avc denied { read } for pid=1904',
  'systemd: etyb0c4.core reached target multi-user',
  'kern: eth0: link up, 1000 Mbps, full duplex',
  'cron[881]: (root) CMD (/usr/lib/sysstat/sa1 1 1)',
  'sshd[2213]: refused connect from 10.0.0.77 port 51244',
  'kern: tpm_crb MSFT0101: device ready',
  'audit: integrity check passed — chain 0x9f2a',
  'systemd: rotating /var/log/etyb0c4.journal',
  'kern: intrusion sensor armed · perimeter nominal',
  'sshd[2219]: too many authentication failures',
]

/* The machine does not explode — it refuses, then panics, then loses signal.
   Every line lands on its own beat instead of everything firing at once. */
const DENIAL = [
  { at: 280,  t: '-bash: permission denied', kind: 'deny' },
  { at: 640,  t: 'audit: FAILED su for root on pts/0', kind: 'warn' },
  { at: 920,  t: 'kern: unauthorized syscall 0x3b from uid=1000', kind: 'warn' },
  { at: 1160, t: 'kern: BUG: unable to handle page fault at 00000000', kind: 'panic' },
  { at: 1300, t: 'kern: Oops: 0002 [#1] SMP PTI', kind: 'panic' },
  { at: 1420, t: 'kern: CPU: 3 PID: 1904 Comm: etyb0c4.core Tainted: G', kind: 'panic' },
  { at: 1530, t: 'kern: Kernel panic - not syncing: Fatal exception', kind: 'panic' },
  { at: 1640, t: 'kern: ---[ end trace 9f2ac41e ]---', kind: 'panic' },
]

export default function Boot({ onEnter }) {
  const [val, setVal] = useState('')
  const [history, setHistory] = useState([])
  const [ambient, setAmbient] = useState([])
  const [denied, setDenied] = useState(false)
  const [lines, setLines] = useState([])
  const [failing, setFailing] = useState(false)
  const seq = useRef(0)
  const inputRef = useRef(null)
  const innerRef = useRef(null)
  const screenRef = useRef(null)
  const collapseRef = useRef(null)
  const timers = useRef([])
  const rafs = useRef([])

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (denied) return
    const push = () => {
      const idx = seq.current++
      setAmbient(a => [...a.slice(-7), { id: idx, t: AMBIENT[idx % AMBIENT.length] }])
    }
    push()
    const iv = setInterval(push, 900)
    return () => clearInterval(iv)
  }, [denied])

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    rafs.current.forEach(cancelAnimationFrame)
  }, [])

  const run = () => {
    applyJourney('denied', 0)
    // 1 — the refusal and the panic: text only, no fireworks
    DENIAL.forEach(l => {
      timers.current.push(setTimeout(() => {
        setLines(v => [...v, l])
        if (l.kind === 'deny') sound.reject()
        else if (l.kind === 'panic') sound.key()
        else sound.snap()
      }, l.at))
    })

    // 2 — the display starts losing sync: tearing and colour draining, nothing more
    timers.current.push(setTimeout(() => {
      setFailing(true)
      sound.riser(1.5)
      const el = screenRef.current
      const t0 = performance.now()
      const tear = () => {
        const p = Math.min(1, (performance.now() - t0) / 1400)
        if (el) {
          el.style.setProperty('--tear', `${(Math.random() - 0.5) * p * 30}px`)
          el.style.setProperty('--shift', `${(Math.random() - 0.5) * p * 4}px`)
          el.style.filter = `saturate(${1 - p * 0.8}) contrast(${1 + p}) brightness(${1 + p * 0.3})`
        }
        if (p < 1) rafs.current.push(requestAnimationFrame(tear))
      }
      rafs.current.push(requestAnimationFrame(tear))
    }, 1800))

    // 3 — the tube gives up: collapse to a line, then to a point
    timers.current.push(setTimeout(() => {
      sound.glass()
      gsap.timeline({ onComplete: () => onEnter?.() })
        .to(innerRef.current, { scaleY: 0.005, duration: 0.3, ease: 'power3.in' })
        .set(collapseRef.current, { opacity: 1, scaleX: 1 })
        .set(innerRef.current, { opacity: 0 })
        .to(collapseRef.current, { scaleX: 0.015, duration: 0.3, ease: 'power2.in' }, '+=0.07')
        .to(collapseRef.current, { opacity: 0, duration: 0.16, ease: 'power2.in' })
        .call(() => sound.powerdown())
    }, 3300))
  }

  const submit = (e) => {
    e.preventDefault()
    if (denied) return
    sound.init()
    const cmd = val.trim() || 'help'
    setHistory(h => [...h, cmd])
    setVal('')
    setDenied(true)
    sound.key()
    run()
  }

  return (
    <div className="boot">
      <div className="boot__crt" />
      <div className={`boot__inner ${failing ? 'is-failing' : ''}`} ref={innerRef} onClick={() => inputRef.current?.focus()}>
        <div className="boot__titlebar mono"><i/><i/><i/><span>guest@node-0 — /bin/sh — 120×34</span></div>
        <div className="boot__screen" ref={screenRef}>
          <pre className="boot__ascii">{String.raw`
   ██▀███   ▄▄▄       ▓██   ██▓ ▄▄▄       ███▄    █
  ▓██ ▒ ██▒▒████▄      ▒██  ██▒▒████▄     ██ ▀█   █
  ▓██ ░▄█ ▒▒██  ▀█▄     ▒██ ██░▒██  ▀█▄  ▓██  ▀█ ██▒
  ▒██▀▀█▄  ░██▄▄▄▄██    ░ ▐██▓░░██▄▄▄▄██ ▓██▒  ▐▌██▒
  ░██▓ ▒██▒ ▓█   ▓██▒   ░ ██▒▓░ ▓█   ▓██▒▒██░   ▓██░
`}</pre>
          <div className="boot__ambient mono" aria-hidden="true">
            {ambient.map(a => <div className="boot__amb" key={a.id}>{a.t}</div>)}
          </div>
          <div className="boot__log mono">
            {history.map((h, i) => (
              <div className="boot__line" key={i}><span className="boot__prompt">guest@node-0:~$ </span><span>{h}</span></div>
            ))}
            {lines.map((l, i) => (
              <div className={`boot__line is-${l.kind}`} key={`d${i}`}><span>{l.t}</span></div>
            ))}
            {!denied && (
              <form className="boot__cmdline" onSubmit={submit}>
                <span className="boot__prompt">guest@node-0:~$ </span>
                <input ref={inputRef} className="boot__input" value={val}
                  onChange={e => { if (e.target.value.length !== val.length) sound.key(); setVal(e.target.value) }}
                  spellCheck={false} autoComplete="off" placeholder="type anything, or 'help'" />
                <i className="boot__caret" />
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="boot__collapse" ref={collapseRef} aria-hidden="true" />
    </div>
  )
}
