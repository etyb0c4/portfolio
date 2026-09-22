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
  startMusic()
}

let musicTimer = null
const SCALE = [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63] // A minor pentatonic-ish
function note(freq, dur = 2.4, gain = 0.05) {
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2
  const g = ctx.createGain(); g.gain.value = 0.0001
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400
  o.connect(g); o2.connect(g); g.connect(f); f.connect(master)
  const t = ctx.currentTime
  g.gain.linearRampToValueAtTime(gain, t + 0.25)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1)
}
function startMusic() {
  if (musicTimer) return
  let i = 0
  musicTimer = setInterval(() => {
    if (muted) return
    const p = targetProgress
    // plus on descend vers root, plus c'est dense/grave-brillant
    const n = SCALE[(i * 2 + (Math.random() * 2 | 0)) % SCALE.length]
    note(n * (0.5 + p * 0.5), 2.6 + Math.random() * 1.4, 0.035 + p * 0.03)
    if (Math.random() < 0.3 + p * 0.3) note(SCALE[(i + 3) % SCALE.length], 3.2, 0.025)
    i++
  }, 2100)
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

let tension = null // { osc, gain } — a standalone sub-bass hum for cold-open dread, independent of the main drone
function buildTension() {
  if (tension) return
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 41
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08
  const lfoG = ctx.createGain(); lfoG.gain.value = 3
  lfo.connect(lfoG); lfoG.connect(o.frequency)
  const g = ctx.createGain(); g.gain.value = 0.0001
  o.connect(g); g.connect(master); o.start(); lfo.start()
  tension = { osc: o, gain: g }
}

let wind = null // { noise, filter, gain } — a continuous filtered-noise wind, reused for the fall and the ascension
function buildWind() {
  if (wind) return
  const src = ctx.createBufferSource()
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  src.buffer = buf; src.loop = true
  const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 300; filter.Q.value = 0.8
  const g = ctx.createGain(); g.gain.value = 0.0001
  src.connect(filter); filter.connect(g); g.connect(master); src.start()
  wind = { src, filter, gain: g }
}

let probeNode = null

const api = {
  /** debug: RMS of everything leaving the master bus (0 = silence) */
  level() {
    if (!ctx || !master) return -1
    if (!probeNode) { probeNode = ctx.createAnalyser(); probeNode.fftSize = 2048; master.connect(probeNode) }
    const buf = new Float32Array(probeNode.fftSize)
    probeNode.getFloatTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    return Math.sqrt(sum / buf.length)
  },
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
    const g = 0.06 + p * 0.12                 // drone loudness rises to root
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
  /** scene-cut whoosh — a scene entering, camera push, or transition beat */
  whoosh(intensity = 1) {
    if (!started || muted) return
    noiseBurst(0.35 * intensity, 1800, 1.4, 0.09 * intensity)
    tone(200, 0.22, 0.05 * intensity, 'sine', 60)
  },
  /** short mechanical thunk — an element locking/snapping into place */
  snap() { if (started && !muted) tone(140, 0.09, 0.09, 'square', 70) },
  /** bright ascending confirmation — a beat resolving cleanly */
  chime() {
    if (!started || muted) return
    ;[660, 990].forEach((f, i) => setTimeout(() => tone(f, 0.22, 0.045, 'triangle'), i * 70))
  },
  /** old-CRT power-off — descending tone + collapsing noise */
  powerdown() {
    if (!started || muted) return
    tone(900, 0.5, 0.09, 'sine', 40)
    noiseBurst(0.4, 500, 3, 0.05)
  },
  /** urgency tick for countdowns — pitch rises as danger closes in */
  alertBeep(urgency = 0) { if (started && !muted) tone(700 + urgency * 500, 0.06, 0.03, 'square') },
  /** cold-open dread — a rising sub-bass hum, independent of the main desktop drone */
  beginTension() {
    if (!ensure()) return
    if (ctx.state === 'suspended') ctx.resume()
    buildTension()
    if (muted) return
    tension.gain.gain.cancelScheduledValues(ctx.currentTime)
    tension.gain.gain.setTargetAtTime(0.11, ctx.currentTime, 1.4)
  },
  endTension(fast = false) {
    if (!tension) return
    tension.gain.gain.cancelScheduledValues(ctx.currentTime)
    tension.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, fast ? 0.05 : 0.6)
  },
  /** klaxon-style alternating siren — access denied */
  siren() {
    if (!started || muted) return
    ;[0, 180, 360, 540].forEach((ms, i) => setTimeout(() => tone(i % 2 ? 520 : 780, 0.18, 0.08, 'square'), ms))
  },
  /** continuous filtered-noise wind, reused for the fall and the ascension — pass a tone to color it */
  beginWind(tone_ = 'deep') {
    if (!ensure()) return
    if (ctx.state === 'suspended') ctx.resume()
    buildWind()
    wind.filter.frequency.setTargetAtTime(tone_ === 'deep' ? 260 : 1400, ctx.currentTime, 1)
    wind.filter.Q.value = tone_ === 'deep' ? 0.7 : 1.4
    if (muted) return
    wind.gain.gain.cancelScheduledValues(ctx.currentTime)
    wind.gain.gain.setTargetAtTime(tone_ === 'deep' ? 0.1 : 0.05, ctx.currentTime, 0.8)
  },
  endWind(fast = false) {
    if (!wind) return
    wind.gain.gain.cancelScheduledValues(ctx.currentTime)
    wind.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, fast ? 0.1 : 1)
  },
  /** rising celestial chord — the mark is accepted */
  ascend() {
    if (!started || muted) return
    ;[261.6, 329.6, 392, 523.2].forEach((f, i) => setTimeout(() => tone(f, 1.1, 0.05, 'triangle'), i * 110))
  },
  /** pen contact — a soft low tick as the stroke begins */
  penDown() { if (started && !muted) tone(220, 0.07, 0.05, 'sine', 150) },
  /** granular scratch while drawing */
  penScratch() { if (started && !muted) noiseBurst(0.05, 2600 + Math.random() * 900, 3, 0.022) },
  /** the mark was refused — a flat, dissonant buzz */
  reject() {
    if (!started || muted) return
    noiseBurst(0.22, 320, 2.2, 0.07)
    ;[0, 120].forEach(ms => setTimeout(() => tone(150, 0.16, 0.07, 'square', 105), ms))
  },
  /** heavy impact — landing, a shard hitting, a hard cut */
  impact(power = 1) {
    if (!started || muted) return
    tone(90, 0.55 * power, 0.26 * power, 'sine', 36)
    noiseBurst(0.3 * power, 900, 1.1, 0.12 * power)
  },
  /** airy riser used under a section arriving */
  riser(dur = 1.2) {
    if (!started || muted) return
    tone(180, dur, 0.05, 'sawtooth', 900)
    noiseBurst(dur * 0.8, 700, 0.9, 0.035)
  },
  /** keystroke — drier and lower than the generic tick */
  key() { if (started && !muted) tone(760 + Math.random() * 260, 0.035, 0.028, 'square') },
  /** brief high radar ping */
  radarPing() { if (started && !muted) tone(2400, 0.09, 0.03, 'sine', 1800) },
  /** double futuristic beep — a connection to a relic is established */
  connect() {
    if (!started || muted) return
    ;[0, 130].forEach(ms => setTimeout(() => tone(1400, 0.07, 0.04, 'square'), ms))
  },
  toggleMute() {
    muted = !muted
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05)
    try {
      localStorage.setItem('rs_muted', muted ? '1' : '0')
      localStorage.setItem('rs_muted_at', String(Date.now()))
    } catch {}
    return muted
  },
  isMuted() { return muted },
  resume() { if (ctx && ctx.state === 'suspended') ctx.resume() },
  state() { return ctx ? ctx.state : 'none' },
  started() { return started },
}

// A mute saved in a previous visit used to persist forever while the toggle was hidden
// during the opening acts — the whole piece played silently with no way to recover.
// Honour the preference only for the rest of the day.
try {
  const raw = localStorage.getItem('rs_muted')
  if (raw === '1') {
    const at = Number(localStorage.getItem('rs_muted_at') || 0)
    if (Date.now() - at < 12 * 3600 * 1000) muted = true
    else { localStorage.removeItem('rs_muted'); localStorage.removeItem('rs_muted_at') }
  }
} catch {}
if (typeof window !== 'undefined') window.__sound = api

export default api
