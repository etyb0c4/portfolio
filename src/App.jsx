import { useEffect, useState } from 'react'
import gsap from 'gsap'
import Background from './gl/Background'
import Scene from './gl/Scene'
import Guard from './components/Guard'
import Hud from './components/Hud'
import Boot from './components/Boot'
import Fall from './components/rite/Fall'
import Abyss from './components/rite/Abyss'
import Ascension from './components/rite/Ascension'
import BeninMap from './components/rite/BeninMap'
import SoundToggle from './components/SoundToggle'
import sound from './audio/sound'

const PHASES = ['boot', 'falling', 'abyss', 'ascension', 'world']

export default function App() {
  // phases: boot -> falling -> abyss -> ascension -> world
  const skipTo = typeof location !== 'undefined' && new URLSearchParams(location.search).get('phase')
  const initial = PHASES.includes(skipTo) ? skipTo : 'boot'
  const [phase, setPhase] = useState(initial)

  useEffect(() => {
    sound.setScene(phase)
    if (window.__gl) {
      window.__gl.progress = 0
      // the fall is the only act that shows the WebGL layers; the rest paint over them,
      // so keeping both contexts rendering there just burned frames and stalled input
      window.__gl.render = phase === 'falling'
    }
    // every act but the climb is a fixed full-screen frame — drop any scroll the climb left behind
    scrollTo(0, 0)
  }, [phase])

  // Timed sequences must run in real seconds. GSAP's default lag smoothing pretends only
  // 33ms elapsed whenever a frame takes over 500ms, so on a slow machine the fall and the
  // terminal collapse stretched to several times their intended length instead of dropping
  // frames. Cinematics are on a clock, not a frame count.
  useEffect(() => { gsap.ticker.lagSmoothing(0) }, [])

  useEffect(() => {
    const kick = () => { sound.init(); sound.resume() }
    addEventListener('pointerdown', kick, { passive: true })
    addEventListener('keydown', kick)
    addEventListener('wheel', kick, { passive: true })
    const vis = () => { if (document.visibilityState === 'visible') sound.resume() }
    document.addEventListener('visibilitychange', vis)
    return () => { removeEventListener('pointerdown', kick); removeEventListener('keydown', kick); removeEventListener('wheel', kick); document.removeEventListener('visibilitychange', vis) }
  }, [])

  return (
    <>
      <Background />
      <Scene />
      <div className="fx-overlay" />
      <div className="fx-scanlines" />
      <div className="fx-vignette" />
      <div className="fx-letterbox fx-letterbox--top" />
      <div className="fx-letterbox fx-letterbox--bottom" />

      <Guard>
        {phase === 'boot' && <Boot onEnter={() => setPhase('falling')} />}
        {phase === 'falling' && <Fall onDone={() => setPhase('abyss')} />}
        {phase === 'abyss' && <Abyss onDone={() => setPhase('ascension')} />}
        {phase === 'ascension' && <Ascension onDone={() => setPhase('world')} />}
        {phase === 'world' && <BeninMap />}
      </Guard>

      <Hud phase={phase} />
      <SoundToggle />
    </>
  )
}
