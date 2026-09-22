import { useRef, useState } from 'react'
import gsap from 'gsap'
import sound from '../../audio/sound'

export default function PayloadForm() {
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [msg, setMsg] = useState('')
  const [phase, setPhase] = useState('idle') // idle | transferring | success
  const [pct, setPct] = useState(0)
  const panelRef = useRef(null)

  const inject = (e) => {
    e.preventDefault()
    if (!name || !msg || phase !== 'idle') return
    setPhase('transferring')
    const meter = { p: 0 }
    gsap.timeline()
      .call(() => sound.whoosh(1))
      .to(meter, { p: 100, duration: 1.2, ease: 'power1.inOut', onUpdate: () => setPct(Math.round(meter.p)) })
      .call(() => { sound.chime(); setPhase('success') })
      .call(() => {
        const subject = encodeURIComponent(`payload from ${name}${org ? ' · ' + org : ''}`)
        const body = encodeURIComponent(msg)
        window.open(`mailto:ryansama.tech@gmail.com?subject=${subject}&body=${body}`, '_blank', 'noopener')
      }, null, '+=0.35')
      .call(() => sound.powerdown(), null, '+=0.45')
      .to(panelRef.current, { scaleY: 0.015, duration: 0.4, ease: 'power4.in', transformOrigin: '50% 50%' }, '+=0.05')
      .to(panelRef.current, { scaleX: 0, duration: 0.16, ease: 'power4.in' })
  }

  return (
    <div className="payload" ref={panelRef}>
      {phase !== 'success' ? (
        <form className="payload__form mono" onSubmit={inject}>
          <div className="payload__row">
            <span className="payload__flag">--name=</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder='"your name"' disabled={phase !== 'idle'} required />
          </div>
          <div className="payload__row">
            <span className="payload__flag">--org=</span>
            <input value={org} onChange={e => setOrg(e.target.value)} placeholder='"optional"' disabled={phase !== 'idle'} />
          </div>
          <div className="payload__row payload__row--area">
            <span className="payload__flag">--msg=</span>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder='"what you want to say"' rows={3} disabled={phase !== 'idle'} required />
          </div>
          <button type="submit" className="payload__submit" disabled={phase !== 'idle' || !name || !msg} data-cursor onMouseEnter={() => sound.hover()}>
            {phase === 'idle' ? 'INJECT PAYLOAD' : `TRANSFERRING TOP-SECRET DATA… ${pct}%`}
          </button>
          {phase === 'transferring' && <div className="payload__bar"><i style={{ width: pct + '%' }} /></div>}
        </form>
      ) : (
        <div className="payload__success mono">
          <div>[SUCCESS] PAYLOAD DELIVERED TO ETYB0C4.</div>
          <div>CONNECTION TERMINATED.</div>
        </div>
      )}
    </div>
  )
}
