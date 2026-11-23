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
  let ctx = null, master, filt, wet, padBus, voices = [], scratch, riser, riserGain, act = 'ice'
  let glassBuf = null, glassUrl = null, zwBuf = null, zwUrl = null, gireiBuf = null, gireiUrl = null, lastSwish = 0
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
    padBus = ctx.createGain(); padBus.gain.value = 1
    filt.connect(padBus); padBus.connect(master); padBus.connect(wet)
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
    if (zwUrl) loadZW(zwUrl)
    if (gireiUrl) loadGirei(gireiUrl)
  }

  /* ── the two dimensions get real instruments of their own, not a retuned pad ── */
  const pluck = (f, g) => {
    const t = ctx.currentTime
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.4
    const e = ctx.createGain()
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + 0.006); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 + Math.random() * 0.5)
    o.connect(lp); lp.connect(e); e.connect(master); e.connect(wet)
    o.start(t); o.stop(t + 1.6)
  }
  const bell = (f, g) => {
    const t = ctx.currentTime
    ;[1, 2.756].forEach((r, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r
      const e = ctx.createGain()
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g / (1 + i * 1.8), t + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
      o.connect(e); e.connect(wet); e.connect(master)
      o.start(t); o.stop(t + 2.8)
    })
  }
  const thump = (f, g) => {
    const t = ctx.currentTime
    const o = ctx.createOscillator(); o.type = 'sine'
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.58, t + 0.28)
    const e = ctx.createGain()
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + 0.012); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    o.connect(e); e.connect(master)
    o.start(t); o.stop(t + 0.7)
  }
  const clink = () => {
    const t = ctx.currentTime
    const f = 420 + Math.random() * 760
    const c = ctx.createOscillator(); c.type = 'sine'; c.frequency.value = f
    const m = ctx.createOscillator(); m.type = 'sine'; m.frequency.value = f * 3.73
    const mg = ctx.createGain(); mg.gain.value = f * 2.2
    m.connect(mg); mg.connect(c.frequency)
    const e = ctx.createGain()
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(0.045, t + 0.004); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 + Math.random() * 0.6)
    c.connect(e); e.connect(wet); e.connect(master)
    c.start(t); m.start(t); c.stop(t + 1.2); m.stop(t + 1.2)
  }

  const breath = (f, g) => {
    const t = ctx.currentTime
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f
    const e = ctx.createGain()
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + 0.9); e.gain.exponentialRampToValueAtTime(0.0001, t + 2.3)
    o.connect(e); e.connect(master); e.connect(wet)
    o.start(t); o.stop(t + 2.5)
  }

  // every mood plays its own instruments; the pad underneath is only the glue
  let layer = null
  const stopLayer = () => { if (layer) { layer(); layer = null } }
  const startLayer = (which) => {
    stopLayer()
    if (!ctx) return
    const timers = [], nodes = []
    const noiseBed = (type, freq, q, gain, attack = 2) => {
      const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(3); nb.loop = true
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(gain, ctx.currentTime, attack)
      nb.connect(f); f.connect(g); g.connect(master); g.connect(wet); nb.start()
      nodes.push(nb, g)
      return g
    }
    if (which === 'ice') {
      // frozen lacquer: thin cold air, crystalline partials far away
      noiseBed('bandpass', 4200, 1.2, 0.011)
      timers.push(setInterval(() => { if (on && Math.random() < 0.7) bell(1567.98 * [0.5, 0.75, 1, 1.25][(Math.random() * 4) | 0], 0.026) }, 2900))
    } else if (which === 'sky') {
      // the paper studio: warm air, slow soft plucks like someone thinking
      noiseBed('bandpass', 900, 0.7, 0.013)
      const scale = [349.23, 392, 440, 523.25, 587.33]
      timers.push(setInterval(() => { if (on && Math.random() < 0.55) pluck(scale[(Math.random() * scale.length) | 0], 0.03) }, 2200))
    } else if (which === 'red') {
      // the rupture: a grinding detuned floor that swells, muffled impacts underneath
      const d1 = ctx.createOscillator(); d1.type = 'sawtooth'; d1.frequency.value = 58
      const d2 = ctx.createOscillator(); d2.type = 'sawtooth'; d2.frequency.value = 58.9
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 1.1
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.065, ctx.currentTime, 1.4)
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13
      const lg = ctx.createGain(); lg.gain.value = 0.03
      lfo.connect(lg); lg.connect(g.gain)
      d1.connect(lp); d2.connect(lp); lp.connect(g); g.connect(master)
      d1.start(); d2.start(); lfo.start()
      nodes.push(d1, d2, lfo, g)
      timers.push(setInterval(() => { if (on && Math.random() < 0.5) thump(49, 0.2) }, 1400))
    } else if (which === 'deep') {
      // the ink night: hollow wind that wanders, deep far bells, stars that ping
      const wind = noiseBed('bandpass', 260, 2.2, 0.028)
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06
      const lg = ctx.createGain(); lg.gain.value = 0.016
      lfo.connect(lg); lg.connect(wind.gain); lfo.start(); nodes.push(lfo)
      timers.push(setInterval(() => { if (on && Math.random() < 0.5) bell([146.83, 196][(Math.random() * 2) | 0], 0.042) }, 3800))
      timers.push(setInterval(() => { if (on && Math.random() < 0.28) ping(1800 + Math.random() * 1600, 0.3, 0.013) }, 1100))
    } else if (which === 'world') {
      // the fork: a held breath, pulsing softly while the choice waits
      timers.push(setInterval(() => { if (on) breath(98, 0.04) }, 2600))
    } else if (which === 'good') {
      // a music box in paper light: generative major plucks and far bells
      const scale = [261.63, 293.66, 329.63, 392, 440, 493.88, 523.25, 659.25]
      timers.push(setInterval(() => {
        if (!on || Math.random() > 0.6) return
        pluck(scale[(Math.random() * scale.length) | 0] * (Math.random() < 0.14 ? 2 : 1), 0.045 + Math.random() * 0.04)
      }, 290))
      timers.push(setInterval(() => { if (on && Math.random() < 0.7) bell([523.25, 659.25, 783.99][(Math.random() * 3) | 0], 0.05) }, 4600))
    } else if (which === 'dark' && gireiBuf) {
      // Pain's rain: the chant itself loops under the night, and the pad steps aside
      const t0 = ctx.currentTime
      padBus.gain.setTargetAtTime(0.18, t0, 1.1)
      const s = ctx.createBufferSource(); s.buffer = gireiBuf; s.loop = true
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.62, t0, 1.6)
      const w = ctx.createGain(); w.gain.value = 0.18
      s.connect(g); g.connect(master); g.connect(w); w.connect(wet)
      s.start()
      nodes.push({
        stop() {
          const t = ctx.currentTime
          g.gain.setTargetAtTime(0, t, 0.3)
          padBus.gain.setTargetAtTime(1, t, 0.9)
          setTimeout(() => { try { s.stop() } catch { /* already stopped */ } }, 1600)
        },
        disconnect() { /* delayed with the fade */ },
      })
      timers.push(setInterval(() => { if (on) thump(42, 0.2) }, 1750))
    } else if (which === 'dark') {
      // the ember night: a slow double heartbeat, a floor of rumble, metal cooling somewhere
      const rg = noiseBed('lowpass', 130, 0.5, 0.09, 1.6)
      void rg
      timers.push(setInterval(() => {
        if (!on) return
        thump(42, 0.5)
        setTimeout(() => { if (layer) thump(39, 0.3) }, 300 + Math.random() * 120)
      }, 1750))
      timers.push(setInterval(() => { if (on && Math.random() < 0.55) clink() }, 3400))
    }
    layer = () => {
      timers.forEach(clearInterval)
      nodes.forEach((n) => { try { n.stop?.() } catch { /* already stopped */ } try { n.disconnect() } catch { /* fine */ } })
    }
  }

  const setAct = (name) => {
    act = name
    if (!ctx) return
    const t = ctx.currentTime
    CHORDS[name].forEach((f, i) => voices[i].forEach((o) => o.frequency.setTargetAtTime(f, t, 0.9)))
    filt.frequency.setTargetAtTime(CUTOFF[name], t, 1.2)
    wet.gain.setTargetAtTime(WETMIX[name] ?? 0.55, t, 1.4)
    startLayer(name)
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

  // the cry itself, lifted from the scene; the freeze duck cuts its tail dead
  const loadZW = (url) => {
    zwUrl = url
    if (!ctx || zwBuf) return
    fetch(url).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((d) => { zwBuf = d }).catch(() => { /* synth fallback stays */ })
  }

  // Pain's theme, four phrases of the chant cut rain-to-rain so the loop breathes
  const loadGirei = (url) => {
    gireiUrl = url
    if (!ctx || gireiBuf) return
    fetch(url).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((d) => {
      gireiBuf = d
      if (act === 'dark') startLayer('dark') // already in the dark when it lands: swap the layer live
    }).catch(() => { /* generative fallback stays */ })
  }

  const hit = (kind) => {
    if (!ctx || !on) return
    if (kind === 'tick') ping(1400, 0.06, 0.03)
    else if (kind === 'open') { ping(659.25, 0.5, 0.06); ping(987.77, 0.7, 0.045, 0.07) }
    else if (kind === 'close') ping(440, 0.3, 0.04)
    else if (kind === 'crack') { burst(0.5, 0.22, 2200); ping(880, 0.9, 0.05); ping(1318.5, 1.2, 0.04, 0.08); ping(1760, 1.6, 0.03, 0.16) }
    else if (kind === 'stop') {
      const t = ctx.currentTime
      if (zwBuf) {
        // the real cry: the shout, the warp, the dying whir — the freeze duck guillotines the rest
        const s = ctx.createBufferSource(); s.buffer = zwBuf
        const g = ctx.createGain(); g.gain.value = 0.9
        s.connect(g); g.connect(master)
        const w = ctx.createGain(); w.gain.value = 0.25; g.connect(w); w.connect(wet)
        s.start(t)
        ;[2.5, 3.05].forEach((d) => {
          const o = ctx.createOscillator(), hg = ctx.createGain(); o.type = 'sine'
          o.frequency.setValueAtTime(54, t + d); o.frequency.exponentialRampToValueAtTime(33, t + d + 0.2)
          hg.gain.setValueAtTime(0.0001, t + d); hg.gain.linearRampToValueAtTime(0.5, t + d + 0.018); hg.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.32)
          o.connect(hg); hg.connect(master); o.start(t + d); o.stop(t + d + 0.4)
        })
        return
      }
      // fallback: a reverse swell cut dead, then two heartbeats in the silence
      const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(2.6)
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 2.2
      nf.frequency.setValueAtTime(380, t); nf.frequency.exponentialRampToValueAtTime(3400, t + 2.3)
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.42, t + 2.3); ng.gain.setValueAtTime(0.0001, t + 2.4)
      nb.connect(nf); nf.connect(ng); ng.connect(master); ng.connect(wet); nb.start(t)
      ;[2.7, 3.15].forEach((d) => {
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
    start, setAct, hit, loadGlass, loadZW, loadGirei,
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
