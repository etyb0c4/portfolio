import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data/projects'
import { flash } from '../lib/store'
import './Terminal.css'

const HELP = `available commands:
  help            this
  whoami          who am i
  ls projects     list what i built
  cat <project>   read a project
  skills          the stack
  contact         reach me
  sudo su         try your luck
  clear           wipe
  exit            close shell`

export default function Terminal() {
  const [open, setOpen] = useState(false)
  const [hist, setHist] = useState([{ out: "rayan-shell v1.0 — type 'help'. (~ or esc to close)" }])
  const [val, setVal] = useState('')
  const inputRef = useRef(null), bodyRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '~' && !open && !/input|textarea/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); setOpen(true); flash(0.4) }
      else if (e.key === 'Escape' && open) setOpen(false)
    }
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 60) }, [open])
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, [hist, open])

  const run = (raw) => {
    const cmd = raw.trim(); const [c, ...a] = cmd.split(/\s+/)
    let out = ''
    switch (c) {
      case '': break
      case 'help': out = HELP; break
      case 'whoami': out = 'rayan sama — full-stack dev & security researcher @ epitech benin.'; break
      case 'ls': out = a[0] === 'projects' ? PROJECTS.map(p => `${p.index}  ${p.name.padEnd(12)} ${p.role}`).join('\n') : 'usage: ls projects'; break
      case 'cat': { const p = PROJECTS.find(x => x.id === a[0] || x.name.toLowerCase() === (a[0]||'').toLowerCase())
        out = p ? `# ${p.name} (${p.year})\n${p.blurb}\nstack: ${p.stack.join(', ')}` : `cat: ${a[0]||''}: no such project — try 'ls projects'`; break }
      case 'skills': out = 'C · Python · JavaScript · Rust · React · Three.js · Docker · Linux\nsec: nmap ffuf ghidra pwntools burp sqlmap hashcat volatility'; break
      case 'contact': out = 'github.com/etyb0c4 · linkedin.com/in/rayan-sama · ryansama.tech@gmail.com'; break
      case 'sudo': out = a[0] === 'su' ? 'root@rayan.dev:~# you already made it this far. respect. now hire me.' : 'sudo: permission is earned, not typed.'; break
      case 'clear': setHist([]); flash(0.3); return
      case 'exit': setOpen(false); return
      default: out = `${c}: command not found — type 'help'`
    }
    setHist(h => [...h, { in: cmd }, ...(out ? [{ out }] : [])]); flash(0.15)
  }
  const submit = (e) => { e.preventDefault(); run(val); setVal('') }
  if (!open) return null
  return (
    <div className="term" onPointerDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="term__win">
        <div className="term__bar">
          <span className="term__dots"><i/><i/><i/></span>
          <span className="term__title mono">rayan@rayan.dev — /bin/rsh</span>
          <button className="term__x mono" onClick={() => setOpen(false)} data-cursor>esc</button>
        </div>
        <div className="term__body mono" ref={bodyRef}>
          {hist.map((h, i) => h.in !== undefined
            ? <div key={i} className="term__in"><span className="term__ps">$</span> {h.in}</div>
            : <pre key={i} className="term__out">{h.out}</pre>)}
          <form onSubmit={submit} className="term__form">
            <span className="term__ps">$</span>
            <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)} spellCheck={false} autoComplete="off" />
          </form>
        </div>
      </div>
    </div>
  )
}
