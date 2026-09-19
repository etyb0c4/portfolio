import { useEffect, useState } from 'react'
import Background from './gl/Background'
import Scene from './gl/Scene'
import Cursor from './components/Cursor'
import Boot from './components/Boot'
import Desktop from './components/desktop/Desktop'
import SoundToggle from './components/SoundToggle'
import sound from './audio/sound'
import './components/desktop/portal.css'

export default function App() {
  // phases: boot -> portal -> desktop
  const initial = typeof location !== 'undefined' && location.search.includes('desktop') ? 'desktop' : 'boot'
  const [phase, setPhase] = useState(initial)
  const [deskIn, setDeskIn] = useState(initial === 'desktop')

  useEffect(() => {
    if (phase === 'desktop') {
      if (window.__gl) window.__gl.progress = 0.4          // ambient particle heat
      sound.setProgress(0.4)
      const t = setTimeout(() => setDeskIn(true), 60)
      return () => clearTimeout(t)
    }
  }, [phase])

  const onBreached = () => {
    setPhase('portal')
    setTimeout(() => setPhase('desktop'), 1150) // portal reveal duration
  }

  return (
    <>
      <Background />
      <Scene />
      <Cursor />
      <div className="fx-scanlines" />
      <div className="fx-vignette" />

      {phase === 'boot' && <Boot onEnter={onBreached} />}
      {phase === 'portal' && (
        <div className="portal">
          <div className="portal__line" />
          <div className="portal__flash" />
          <div className="portal__code mono">
            <span>reassembling filesystem…</span>
            <span>spawning window manager…</span>
            <span>mounting /home/rayan…</span>
          </div>
        </div>
      )}
      {phase === 'desktop' && <Desktop appeared={deskIn} />}

      {phase === 'desktop' && <SoundToggle />}
    </>
  )
}
