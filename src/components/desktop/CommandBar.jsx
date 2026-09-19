import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../../data/projects'
import sound from '../../audio/sound'

const HELP = `commands:
  help            show this
  whoami          identity
  ls / projects   list projects
  open <name>     inspect a project        (e.g. open b2r-kit)
  skills          the stack
  sysinfo         about / manifesto
  contact         reach me
  hire            why you should
  cv              print résumé
  clear           wipe scrollback`

export default function CommandBar({ onOpen, onContact }) {
  const [log, setLog] = useState([{ out: "etyb0c4.core shell — type 'help' or 'open <project>'." }])
  const [val, setVal] = useState('')
  const [hist, setHist] = useState([]); const hi = useRef(-1)
  const body = useRef(null), input = useRef(null)
  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight }, [log])
  useEffect(() => { const f = () => input.current?.focus(); addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [])

  const run = (raw) => {
    const cmd = raw.trim(); if (cmd) setHist(h => [cmd, ...h].slice(0, 40)); hi.current = -1
    const [c, ...a] = cmd.split(/\s+/); let out = ''
    switch (c) {
      case '': break
      case 'help': out = HELP; break
      case 'whoami': out = 'rayan sama — full-stack developer & security researcher @ Epitech Benin.\ni build systems before i break them.'; break
      case 'ls': case 'projects': out = PROJECTS.map(p => `  ${p.id.padEnd(12)} ${p.role}`).join('\n') + "\n\ntype 'open <name>' to inspect."; break
      case 'open': {
        const p = PROJECTS.find(x => x.id === (a[0]||'').toLowerCase() || x.name.toLowerCase() === (a[0]||'').toLowerCase())
        if (p) { sound.escalate(); onOpen(p); out = `booting ${p.id}.pkg …` } else out = `open: ${a[0]||''}: no such project — try 'ls'`
        break }
      case 'skills': out = 'lang:  C · Python · JavaScript · Rust\nweb:   React · Vite · Three.js · Tailwind\nsec:   nmap ffuf ghidra pwntools burp sqlmap hashcat volatility\nops:   Arch · Hyprland · Docker · nvim · git'; break
      case 'sysinfo': out = 'MISSION  build systems before breaking them.\nETHOS    i build my own tools when existing ones slow me down.\nNOW      Rust · binary exploitation · Docker\nCTF      HackTheBox · Root-Me — web/pwn/rev/forensics'; break
      case 'contact': onContact?.(); out = 'github.com/etyb0c4\nlinkedin.com/in/rayan-sama\nryansama.tech@gmail.com'; break
      case 'hire': out = 'reasons:\n  • ships real tools, not toy demos\n  • builds + breaks — sees the whole system\n  • fast, autonomous, relentless\n→ ryansama.tech@gmail.com'; break
      case 'cv': out = 'RAYAN SAMA — full-stack & security\nEpitech Benin (class of 2029)\nprojects: b2r-kit · chess3d · jarvis-hud · CTF\nstack: C/Python/Rust/React/Three.js/Docker\nsecurity: HackTheBox · Root-Me\ncontact: ryansama.tech@gmail.com\n(full PDF on request)'; break
      case 'sudo': out = a.join(' ') === 'su' ? 'root@etyb0c4.core:~# you already made it this far. respect. now hire me.' : 'sudo: permission is earned, not typed.'; break
      case 'neofetch': out = "run the panel, it's right there ↖"; break
      case 'clear': setLog([]); sound.tick(); return
      default: out = `${c}: command not found — type 'help'`
    }
    sound.tick()
    setLog(l => [...l, { in: cmd }, ...(out ? [{ out }] : [])])
  }
  const onKey = (e) => {
    if (e.key === 'Enter') { run(val); setVal('') }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hist.length) { hi.current = Math.min(hist.length-1, hi.current+1); setVal(hist[hi.current] || '') } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi.current = Math.max(-1, hi.current-1); setVal(hi.current<0 ? '' : hist[hi.current]) }
  }
  return (
    <div className="cmdbar">
      <div className="cmdbar__log mono" ref={body}>
        {log.map((l, i) => l.in !== undefined
          ? <div key={i} className="cmdbar__in"><span className="cmdbar__ps">rayan@etyb0c4</span>:<span className="cmdbar__path">~</span>$ {l.in}</div>
          : <pre key={i} className="cmdbar__out">{l.out}</pre>)}
      </div>
      <div className="cmdbar__prompt mono">
        <span className="cmdbar__ps">rayan@etyb0c4</span>:<span className="cmdbar__path">~</span>$
        <input ref={input} value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKey}
               spellCheck={false} autoComplete="off" autoFocus placeholder="type a command… (help)" />
      </div>
    </div>
  )
}
