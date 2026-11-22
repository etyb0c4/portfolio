// A small generative score: one pad that retunes per act, plus a handful of gesture sounds.
const CHORDS = {
  ice: [110, 164.81, 246.94, 277.18],
  sky: [146.83, 220, 329.63, 369.99],
  red: [65.41, 98, 155.56, 233.08],
  deep: [87.31, 130.81, 196, 207.65],
  world: [98, 146.83, 246.94, 369.99],
}
const CUTOFF = { ice: 900, sky: 1500, red: 520, deep: 620, world: 1900 }

export function createAudio() {
  let ctx = null, master, filt, wet, voices = [], scratch, riser, riserGain, act = 'ice'
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
  }

  const setAct = (name) => {
    act = name
    if (!ctx) return
    const t = ctx.currentTime
    CHORDS[name].forEach((f, i) => voices[i].forEach((o) => o.frequency.setTargetAtTime(f, t, 0.9)))
    filt.frequency.setTargetAtTime(CUTOFF[name], t, 1.2)
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

  const hit = (kind) => {
    if (!ctx || !on) return
    if (kind === 'tick') ping(1400, 0.06, 0.03)
    else if (kind === 'open') { ping(659.25, 0.5, 0.06); ping(987.77, 0.7, 0.045, 0.07) }
    else if (kind === 'close') ping(440, 0.3, 0.04)
    else if (kind === 'crack') { burst(0.5, 0.22, 2200); ping(880, 0.9, 0.05); ping(1318.5, 1.2, 0.04, 0.08); ping(1760, 1.6, 0.03, 0.16) }
    else if (kind === 'dive') {
      const t = ctx.currentTime
      const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(5); nb.loop = false
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 1.1
      nf.frequency.setValueAtTime(260, t); nf.frequency.exponentialRampToValueAtTime(2800, t + 4.2)
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.004, t); ng.gain.exponentialRampToValueAtTime(0.5, t + 3.9); ng.gain.exponentialRampToValueAtTime(0.0001, t + 5.2)
      nb.connect(nf); nf.connect(ng); ng.connect(master); ng.connect(wet); nb.start(t)
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(28, t + 4.4)
      g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.7)
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 4.8)
      for (let i = 0; i < 3; i++) {
        const r = ctx.createOscillator(), rg = ctx.createGain(); r.type = 'sawtooth'
        r.frequency.setValueAtTime(70 * Math.pow(2, i), t); r.frequency.exponentialRampToValueAtTime(70 * Math.pow(2, i + 2.3), t + 4.3)
        rg.gain.setValueAtTime(0.0001, t); rg.gain.exponentialRampToValueAtTime(0.045, t + 2.6); rg.gain.exponentialRampToValueAtTime(0.0001, t + 4.6)
        r.connect(rg); rg.connect(filt); r.start(t); r.stop(t + 4.7)
      }
        } else if (kind === 'shatter') {
      burst(1.1, 0.4, 1400)
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.9)
      g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.2)
    } else if (kind === 'reveal') [392, 587.33, 739.99, 987.77, 1479.98].forEach((f, i) => ping(f, 3.2, 0.05, i * 0.13, 'triangle'))
  }

  return {
    start, setAct, hit,
    get on() { return on },
    toggle() {
      on = !on
      try { localStorage.setItem('sound', on ? '1' : '0') } catch { /* storage blocked */ }
      if (ctx) master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.25)
      return on
    },
    draw(speed) { if (ctx) scratch.gain.setTargetAtTime(Math.min(speed, 1) * 0.07, ctx.currentTime, 0.05) },
    hold(p) {
      if (!ctx) return
      riser.frequency.setTargetAtTime(70 + p * p * 520, ctx.currentTime, 0.05)
      riserGain.gain.setTargetAtTime(p * 0.1, ctx.currentTime, 0.05)
    },
  }
}
