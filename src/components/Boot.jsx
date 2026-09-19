import { useEffect, useRef, useState } from 'react'
import { flash } from '../lib/store'
import sound from '../audio/sound'
import './Boot.css'

const LINES = [
  { t: 'guest@node-0:~$ ', c: 'ssh root@etyb0c4.core', typed: true },
  { t: '', c: 'connecting to etyb0c4.core [10.0.0.1:22] …' },
  { t: '', c: 'ED25519 fingerprint SHA256:9f2a…c41e — trusted.' },
  { t: '', c: 'Establishing secure channel', dots: true },
  { t: '', c: '[  OK  ] channel secured · aes-256-gcm', ok: true },
  { t: '', c: '[ERROR] ACCESS DENIED: root privileges required for etyb0c4.core', deny: true },
]

export default function Boot({ onEnter }) {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const [ready, setReady] = useState(false)
  const [breaching, setBreaching] = useState(0)
  const [gone, setGone] = useState(false)
  const holdRef = useRef(null)

  // play the sequence
  useEffect(() => {
    if (step >= LINES.length) { setReady(true); return }
    const line = LINES[step]
    if (line.typed) {
      let i = 0
      const iv = setInterval(() => {
        i++; setTyped(line.c.slice(0, i)); sound.tick()
        if (i >= line.c.length) { clearInterval(iv); setTimeout(() => { setStep(s => s+1); setTyped('') }, 320) }
      }, 55)
      return () => clearInterval(iv)
    }
    const d = line.dots ? 700 : line.deny ? 500 : 260
    const to = setTimeout(() => setStep(s => s+1), d)
    return () => clearTimeout(to)
  }, [step])

  // hold to breach
  const startHold = () => {
    sound.init(); sound.breach(); flash(0.5)
    const t0 = performance.now()
    const loop = () => {
      const p = Math.min(1, (performance.now() - t0) / 1400)
      setBreaching(p)
      if (p < 1) holdRef.current = requestAnimationFrame(loop)
      else { flash(1.3); setTimeout(() => { setGone(true); onEnter?.() }, 260) }
    }
    holdRef.current = requestAnimationFrame(loop)
  }
  const endHold = () => { cancelAnimationFrame(holdRef.current); if (breaching < 1) setBreaching(0) }

  return (
    <div className={`boot ${gone ? 'boot--gone' : ''}`}>
      <div className="boot__crt" />
      <div className="boot__inner">
        <pre className="boot__ascii">{String.raw`
   ██▀███   ▄▄▄       ▓██   ██▓ ▄▄▄       ███▄    █
  ▓██ ▒ ██▒▒████▄      ▒██  ██▒▒████▄     ██ ▀█   █
  ▓██ ░▄█ ▒▒██  ▀█▄     ▒██ ██░▒██  ▀█▄  ▓██  ▀█ ██▒
  ▒██▀▀█▄  ░██▄▄▄▄██    ░ ▐██▓░░██▄▄▄▄██ ▓██▒  ▐▌██▒
  ░██▓ ▒██▒ ▓█   ▓██▒   ░ ██▒▓░ ▓█   ▓██▒▒██░   ▓██░
`}</pre>
        <div className="boot__log">
          {LINES.slice(0, step).map((l, i) => (
            <div key={i} className={`boot__line ${l.ok?'is-ok':''} ${l.deny?'is-deny':''}`}>
              {l.t && <span className="boot__prompt">{l.t}</span>}
              <span>{l.c}{l.dots ? '…' : ''}</span>
            </div>
          ))}
          {!ready && LINES[step]?.typed !== undefined && LINES[step]?.typed && (
            <div className="boot__line"><span className="boot__prompt">{LINES[step].t}</span><span>{typed}</span><i className="boot__caret"/></div>
          )}
        </div>

        {ready && (
          <button className="breach" onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} data-cursor>
            <span className="breach__bar" style={{ '--p': breaching }} />
            <span className="breach__label">{breaching > 0 ? 'OVERRIDING…' : 'HOLD TO OVERRIDE SECURITY PROTOCOLS'}</span>
            <span className="breach__hint mono">[ sudo override ]</span>
          </button>
        )}
      </div>
    </div>
  )
}
