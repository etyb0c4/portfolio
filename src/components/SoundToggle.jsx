import { useState } from 'react'
import sound from '../audio/sound'
import './SoundToggle.css'

export default function SoundToggle() {
  const [muted, setMuted] = useState(sound.isMuted())
  return (
    <button className="sndtog mono" data-cursor onClick={() => setMuted(sound.toggleMute())}
            aria-label={muted ? 'unmute' : 'mute'} title={muted ? 'sound off' : 'sound on'}>
      <span className="sndtog__bars" data-muted={muted}><i/><i/><i/><i/></span>
      <span>{muted ? 'snd:off' : 'snd:on'}</span>
    </button>
  )
}
