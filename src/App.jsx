import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Background from './gl/Background'
import Scene from './gl/Scene'
import Cursor from './components/Cursor'
import HUD from './components/HUD'
import Boot from './components/Boot'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Projects from './components/Projects'
import Arsenal from './components/Arsenal'
import Contact from './components/Contact'
import Terminal from './components/Terminal'
import { setProgress } from './lib/store'

export default function App() {
  const [entered, setEntered] = useState(typeof location!=='undefined' && location.search.includes('enter'))
  const lenisRef = useRef(null)

  const STILL = typeof location!=='undefined' && location.search.includes('still')
  useEffect(() => {
    if (STILL) { const on=()=>{const m=document.documentElement.scrollHeight-innerHeight; setProgress(m>0?scrollY/m:0)}; addEventListener('scroll',on,{passive:true}); on(); return ()=>removeEventListener('scroll',on) }
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    lenisRef.current = lenis
    if (typeof window!=='undefined') window.__lenis = lenis
    let raf
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      setProgress(max > 0 ? scrollY / max : 0)
    }
    lenis.on('scroll', onScroll); onScroll()
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  // lock scroll until breached
  useEffect(() => {
    const l = lenisRef.current; if (!l) return
    if (entered) { l.start(); document.documentElement.classList.remove('lenis-stopped') }
    else { l.stop() }
  }, [entered])

  useEffect(() => { if (typeof window!=='undefined'){ if(!window.__gl) window.__gl={progress:0,heat:0}; window.__gl.entered = entered } }, [entered])

  return (
    <>
      <Background />
      <Scene />
      <Cursor />
      <div className="fx-scanlines" />
      <div className="fx-vignette" />
      <HUD active={entered} />
      {!entered && <Boot onEnter={() => setEntered(true)} />}
      <main id="app" style={{ opacity: entered ? 1 : 0, transition: 'opacity 1s ease 0.2s' }}>
        <Hero entered={entered} />
        <Manifesto />
        <Projects />
        <Arsenal />
        <Contact />
      </main>
      <Terminal />
    </>
  )
}
