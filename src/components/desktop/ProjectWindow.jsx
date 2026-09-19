import { useEffect, useState } from 'react'
import chessImg from '../../assets/proj/chess3d.jpg'
import jarvisImg from '../../assets/proj/jarvis-hud.jpg'
import b2rImg from '../../assets/proj/b2r-kit.jpg'
import ctfImg from '../../assets/proj/ctf.jpg'
import sound from '../../audio/sound'

const THUMBS = { 'chess3d': chessImg, 'jarvis-hud': jarvisImg, 'b2r-kit': b2rImg, 'ctf': ctfImg }
const REPO = { 'b2r-kit': 'https://github.com/etyb0c4', 'chess3d': 'https://github.com/etyb0c4', 'jarvis-hud': 'https://github.com/etyb0c4', 'ctf': 'https://github.com/etyb0c4' }

export default function ProjectWindow({ project: p, onClose }) {
  const [booted, setBooted] = useState(false)
  const [lines, setLines] = useState([])
  const boot = [
    `[ 0.000] mounting ${p.id}.pkg`,
    `[ 0.014] verifying signature … OK`,
    `[ 0.041] loading modules: ${p.stack.slice(0,3).join(', ')}`,
    `[ 0.088] allocating runtime`,
    `[ 0.132] starting ${p.id}.service`,
    `[ 0.170] ready.`,
  ]
  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      i++; setLines(boot.slice(0, i)); sound.tick()
      if (i >= boot.length) { clearInterval(iv); setTimeout(() => setBooted(true), 220) }
    }, 130)
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', esc)
    return () => { clearInterval(iv); removeEventListener('keydown', esc) }
  }, [])

  return (
    <div className="pwin" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pwin__win" style={{ '--accent': p.accent }}>
        <header className="pwin__bar mono">
          <span className="panel__dots"><i/><i/><i/></span>
          <span>root@etyb0c4 — ./{p.id} {p.id !== 'ctf' ? '--run' : ''}</span>
          <button className="pwin__x" onClick={onClose} data-cursor>esc</button>
        </header>

        {!booted ? (
          <div className="pwin__boot mono">
            {lines.map((l, i) => <div key={i} className={l.includes('OK')||l.includes('ready')?'is-ok':''}>{l}</div>)}
            <span className="pwin__caret">▊</span>
          </div>
        ) : (
          <div className="pwin__body">
            <div className="pwin__media" style={{ backgroundImage: `url(${THUMBS[p.id]})` }} />
            <div className="pwin__meta">
              <div className="pwin__idx mono">{p.index} · {p.year}</div>
              <h2 className="pwin__title">{p.name}</h2>
              <div className="pwin__role mono">{p.role}</div>
              <p className="pwin__blurb">{p.blurb}</p>
              <div className="pwin__tags">{p.stack.map(s => <span key={s} className="mono">{s}</span>)}</div>
              <div className="pwin__foot mono">
                <span className="pwin__metric">{p.metric}</span>
                <a href={REPO[p.id]} target="_blank" rel="noreferrer" className="pwin__repo" data-cursor>view source ↗</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
