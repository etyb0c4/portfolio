/* Procedural audio — no assets. A living soundscape that escalates with privilege.
   Everything is gentle by default; a mute toggle is exposed. */

let ctx = null
let master = null
let drone = null          // { gain, filter, oscs[], lfo }
let started = false
let muted = false
let targetProgress = 0

function ensure() {
  if (ctx) return true
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 1
  master.connect(ctx.destination)
  return true
}

function buildDrone() {
  if (drone) return
  const g = ctx.createGain(); g.gain.value = 0.0001
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'
  filter.frequency.value = 180; filter.Q.value = 6
  g.connect(filter); filter.connect(master)

  const oscs = []
  const base = 55 // A1
  ;[base, base * 1.006, base * 0.5, base * 1.5].forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i === 2 ? 'sine' : 'sawtooth'
    o.frequency.value = f
    const og = ctx.createGain(); og.gain.value = i === 2 ? 0.6 : (i === 3 ? 0.12 : 0.3)
    o.connect(og); og.connect(g); o.start()
    oscs.push(o)
  })

  // breathing LFO on the drone gain
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.4
  lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start()

  // faint filtered noise "air"
  const noise = ctx.createBufferSource()
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5
  buf.__loop = true; noise.buffer = buf; noise.loop = true
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.7
  const ng = ctx.createGain(); ng.gain.value = 0.012
  noise.connect(nf); nf.connect(ng); ng.connect(master); noise.start()

  drone = { gain: g, filter, oscs, lfo }
}

function noiseBurst(dur, freq, q, gain, type = 'bandpass') {
  const src = ctx.createBufferSource()
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  src.buffer = buf
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q
  const g = ctx.createGain(); g.gain.value = gain
  src.connect(f); f.connect(g); g.connect(master)
  const t = ctx.currentTime
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(freq * 0.35, t + dur)
  src.start(t); src.stop(t + dur)
}

function tone(freq, dur, gain, type = 'sine', slideTo) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq
  const g = ctx.createGain(); g.gain.value = 0.0001
  o.connect(g); g.connect(master)
  const t = ctx.currentTime
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  o.start(t); o.stop(t + dur + 0.02)
}

const api = {
  /** call from a user gesture (pointerdown) to unlock + start the drone */
  init() {
    if (started) return
    if (!ensure()) return
    if (ctx.state === 'suspended') ctx.resume()
    buildDrone()
    started = true
    api.setProgress(targetProgress)
  },
  setProgress(p) {
    targetProgress = p
    if (!drone) return
    const t = ctx.currentTime
    const g = 0.02 + p * 0.07                 // drone loudness rises to root
    const cut = 180 + p * 900                 // opens up
    drone.gain.gain.setTargetAtTime(g, t, 0.6)
    drone.filter.frequency.setTargetAtTime(cut, t, 0.8)
  },
  tick() { if (started && !muted) tone(1200 + Math.random() * 300, 0.05, 0.02, 'square') },
  breach() {
    if (!started) return
    noiseBurst(0.7, 2200, 1.2, 0.22)          // whoosh
    tone(120, 0.6, 0.28, 'sine', 42)          // impact boom
    tone(880, 0.25, 0.06, 'sawtooth', 220)    // glitch zap
  },
  escalate() {
    if (!started) return
    ;[0, 90, 180].forEach((ms, i) => setTimeout(() => tone(330 * Math.pow(1.5, i), 0.18, 0.07, 'triangle'), ms))
    noiseBurst(0.25, 1600, 2, 0.06)
  },
  hover() { if (started && !muted) tone(2000, 0.03, 0.012, 'sine') },
  toggleMute() {
    muted = !muted
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05)
    try { localStorage.setItem('rs_muted', muted ? '1' : '0') } catch {}
    return muted
  },
  isMuted() { return muted },
}

try { muted = localStorage.getItem('rs_muted') === '1' } catch {}

export default api
