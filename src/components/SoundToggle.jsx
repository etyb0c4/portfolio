import { useEffect, useState } from 'react'
import sound from '../audio/sound'
import './SoundToggle.css'

export default function SoundToggle() {
  const [muted, setMuted] = useState(sound.isMuted())
  const [live, setLive] = useState(false)

  // the badge must tell the truth: audio can be muted from a previous visit (localStorage)
  // or still suspended by the browser's autoplay policy until a real gesture lands
  useEffect(() => {
    const i = setInterval(() => {
      setLive(sound.started() && sound.state() === 'running')
      setMuted(sound.isMuted())
    }, 400)
    return () => clearInterval(i)
  }, [])

  const click = () => {
    sound.init(); sound.resume()
    setMuted(sound.toggleMute())
  }

  const off = muted || !live
  return (
    <button className={`sndtog mono ${off ? 'is-off' : ''}`} data-cursor onClick={click}
            aria-label={muted ? 'unmute' : 'mute'} title={muted ? 'sound off — click to enable' : 'sound on'}>
      <span className="sndtog__bars" data-muted={off}><i/><i/><i/><i/></span>
      <span>{muted ? 'snd:off' : live ? 'snd:on' : 'snd:tap'}</span>
    </button>
  )
}
