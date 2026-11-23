// A small generative score: one pad that retunes per act, plus a handful of gesture sounds.
// 'good' and 'dark' are the two dimensions behind the fork: paper light vs ember night,
// both deliberately far from the 'world' base the fork floats in.
const CHORDS = {
  ice: [110, 164.81, 246.94, 277.18],
  sky: [146.83, 220, 329.63, 369.99],
  red: [65.41, 98, 155.56, 233.08],
  deep: [87.31, 130.81, 196, 207.65],
  world: [98, 146.83, 246.94, 369.99],
  good: [130.81, 196, 293.66, 493.88],
  dark: [55, 82.41, 130.81, 155.56],
}
const CUTOFF = { ice: 900, sky: 1500, red: 520, deep: 620, world: 1900, good: 2800, dark: 340 }
const WETMIX = { good: 0.78, dark: 0.3 }

export function createAudio() {
  let ctx = null, master, filt, wet, voices = [], scratch, riser, riserGain, act = 'ice'
  let glassBuf = null, glassUrl = null, lastSwish = 0
  let on = true
  try { on = localStorage.getItem('sound') !== '0' } catch { /* storage blocked */ }

  const noiseBuffer = (sec) => {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return b
  }

  const start = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain(); master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 1.2)

    const ir = ctx.createBuffer(2, ctx.sampleRate * 3.2, ctx.sampleRate)
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6) }
    const verb = ctx.createConvolver(); verb.buffer = ir
    wet = ctx.createGain(); wet.gain.value = 0.55
    wet.connect(verb); verb.connect(master)

    filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = CUTOFF.ice; filt.Q.value = 0.6
    filt.connect(master); filt.connect(wet)
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 180
    lfo.connect(lg); lg.connect(filt.frequency); lfo.start()

    voices = CHORDS.ice.map((f, i) => {
      const g = ctx.createGain(); g.gain.value = 0.055 / (1 + i * 0.25); g.connect(filt)
      return ['sawtooth', 'triangle'].map((type, k) => {
        const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = (k ? 7 : -7) + i * 2
        o.connect(g); o.start(); return o
      })
    })

    const sb = ctx.createBufferSource(); sb.buffer = noiseBuffer(2); sb.loop = true
    const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 3200; sf.Q.value = 0.8
    scratch = ctx.createGain(); scratch.gain.value = 0
    sb.connect(sf); sf.connect(scratch); scratch.connect(master); scratch.connect(wet); sb.start()

    riser = ctx.createOscillator(); riser.type = 'sine'; riser.frequency.value = 80
    riserGain = ctx.createGain(); riserGain.gain.value = 0
    riser.connect(riserGain); riserGain.connect(master); riserGain.connect(wet); riser.start()
    setAct(act)
    if (glassUrl) loadGlass(glassUrl)
  }

  const setAct = (name) => {
    act = name
    if (!ctx) return
    const t = ctx.currentTime
    CHORDS[name].forEach((f, i) => voices[i].forEach((o) => o.frequency.setTargetAtTime(f, t, 0.9)))
    filt.frequency.setTargetAtTime(CUTOFF[name], t, 1.2)
    wet.gain.setTargetAtTime(WETMIX[name] ?? 0.55, t, 1.4)
  }

  const ping = (freq, dur, gain, delay = 0, type = 'sine') => {
    const t = ctx.currentTime + delay
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g); g.connect(master); g.connect(wet); o.start(t); o.stop(t + dur + 0.05)
  }

  const burst = (dur, gain, freq) => {
    const t = ctx.currentTime
    const s = ctx.createBufferSource(); s.buffer = noiseBuffer(dur)
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = freq
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    s.connect(f); f.connect(g); g.connect(master); g.connect(wet); s.start(t)
  }

  // a real pane of glass, fetched once; decoded lazily when the night act nears
  const loadGlass = (url) => {
    glassUrl = url
    if (!ctx || glassBuf) return
    fetch(url).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((d) => { glassBuf = d }).catch(() => { /* synth fallback stays */ })
  }

  const hit = (kind) => {
    if (!ctx || !on) return
    if (kind === 'tick') ping(1400, 0.06, 0.03)
    else if (kind === 'open') { ping(659.25, 0.5, 0.06); ping(987.77, 0.7, 0.045, 0.07) }
    else if (kind === 'close') ping(440, 0.3, 0.04)
    else if (kind === 'crack') { burst(0.5, 0.22, 2200); ping(880, 0.9, 0.05); ping(1318.5, 1.2, 0.04, 0.08); ping(1760, 1.6, 0.03, 0.16) }
    else if (kind === 'stop') {
      // the time-stop: a reverse swell cut dead, then two heartbeats in the silence
      const t = ctx.currentTime
      const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(1.4)
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 2.2
      nf.frequency.setValueAtTime(380, t); nf.frequency.exponentialRampToValueAtTime(3400, t + 1.0)
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.42, t + 0.98); ng.gain.setValueAtTime(0.0001, t + 1.06)
      nb.connect(nf); nf.connect(ng); ng.connect(master); ng.connect(wet); nb.start(t)
      ;[1.28, 1.72].forEach((d) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'
        o.frequency.setValueAtTime(54, t + d); o.frequency.exponentialRampToValueAtTime(33, t + d + 0.2)
        g.gain.setValueAtTime(0.0001, t + d); g.gain.linearRampToValueAtTime(0.55, t + d + 0.018); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.32)
        o.connect(g); g.connect(master); o.start(t + d); o.stop(t + d + 0.4)
      })
    } else if (kind === 'tick') ping(640, 0.045, 0.05, 0, 'square')
    else if (kind === 'snap') { burst(0.09, 0.32, 1900); ping(2200 + Math.random() * 900, 0.2, 0.04) }
    else if (kind === 'glass') {
      const t = ctx.currentTime
      if (glassBuf) {
        // the real thing, with a sub thump underneath for weight
        const s = ctx.createBufferSource(); s.buffer = glassBuf
        const g = ctx.createGain(); g.gain.value = 0.85
        s.connect(g); g.connect(master); g.connect(wet); s.start(t)
        const o = ctx.createOscillator(), og = ctx.createGain()
        o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.8)
        og.gain.setValueAtTime(0.45, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 1.0)
        o.connect(og); og.connect(master); o.start(t); o.stop(t + 1.1)
      } else {
        burst(1.1, 0.45, 1300)
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.frequency.setValueAtTime(100, t); o.frequency.exponentialRampToValueAtTime(26, t + 1.0)
        g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.3)
        for (let i = 0; i < 8; i++) ping(1500 + Math.random() * 3200, 0.4 + Math.random() * 0.8, 0.028, Math.random() * 0.8, 'triangle')
      }
    } else if (kind === 'swish') {
      // a breath of air between two beats of the story; tuned to the act
      const t = ctx.currentTime
      if (t - lastSwish < 0.3) return
      lastSwish = t
      const s = ctx.createBufferSource(); s.buffer = noiseBuffer(0.55)
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9
      const base = (act === 'deep' || act === 'red' || act === 'dark' ? 300 : 640) * (0.85 + Math.random() * 0.4)
      f.frequency.setValueAtTime(base, t); f.frequency.exponentialRampToValueAtTime(base * 2.3, t + 0.16); f.frequency.exponentialRampToValueAtTime(base * 0.7, t + 0.44)
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.15, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.52)
      s.connect(f); f.connect(g); g.connect(master); g.connect(wet); s.start(t)
      ping(150 + Math.random() * 70, 0.3, 0.035, 0.02)
    } else if (kind === 'shatter') {
      burst(1.1, 0.4, 1400)
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.9)
      g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.2)
    } else if (kind === 'reveal') [392, 587.33, 739.99, 987.77, 1479.98].forEach((f, i) => ping(f, 3.2, 0.05, i * 0.13, 'triangle'))
  }

  return {
    start, setAct, hit, loadGlass,
    get on() { return on },
    toggle() {
      on = !on
      try { localStorage.setItem('sound', on ? '1' : '0') } catch { /* storage blocked */ }
      if (ctx) master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.25)
      return on
    },
    draw(speed) { if (ctx) scratch.gain.setTargetAtTime(Math.min(speed, 1) * 0.07, ctx.currentTime, 0.05) },
    freeze(f) { if (ctx && on) master.gain.setTargetAtTime(f ? 0.1 : 0.5, ctx.currentTime, f ? 0.06 : 0.3) },
    hold(p) {
      if (!ctx) return
      riser.frequency.setTargetAtTime(70 + p * p * 520, ctx.currentTime, 0.05)
      riserGain.gain.setTargetAtTime(p * 0.1, ctx.currentTime, 0.05)
    },
  }
}
