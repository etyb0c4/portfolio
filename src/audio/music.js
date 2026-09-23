/* ============================================================
   Procedural score.

   The previous "music" picked random notes from a scale on a timer, which is why it read as
   one noise looping forever: no melody, no harmony, nowhere to go. This is an actual
   arrangement — a chord progression underneath, composed melodic phrases on top, an
   ostinato that drives, and percussion that enters as the intensity rises.

   The emotional reference points are the two the brief asked for: the slow, mournful,
   sustained-string world of "Call of Silence", and the driving ostinato + rising brass
   sequence of "You Say Run". Nothing is sampled — every voice is synthesised here, and the
   phrases below are written for this piece.
   ============================================================ */

// A natural minor, as semitone offsets from the tonic
const SCALE = [0, 2, 3, 5, 7, 8, 10]
const deg = (d) => {
  const oct = Math.floor(d / 7)
  return SCALE[((d % 7) + 7) % 7] + oct * 12
}

/* Chord progressions as [scale-degree root, quality]. i–VI–III–VII is the backbone of this
   kind of scoring: minor enough to ache, major enough to lift. */
const PROG = {
  lament:   [[0, 'min'], [4, 'min'], [5, 'maj'], [2, 'min']],   // i v VI iv
  heroic:   [[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']],   // i VI III VII
  falling:  [[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'min']],
  resolve:  [[5, 'maj'], [2, 'maj'], [0, 'min'], [6, 'maj']],
}
const QUAL = { min: [0, 3, 7], maj: [0, 4, 7] }

/* Melodic phrases: [scale degree, beats]. Written as arcs — a rise, a hang, a fall — so
   they sound intended rather than wandered into. */
const PHRASES = {
  lament: [
    [[7, 2], [6, 1], [7, 1], [9, 4]],
    [[9, 2], [8, 1], [7, 1], [6, 2], [7, 2]],
    [[7, 1.5], [9, 0.5], [11, 2], [10, 2], [9, 2]],
    [[11, 3], [9, 1], [7, 2], [6, 2]],
  ],
  // the "You Say Run" move: one motif, restated a step higher each time
  heroic: [
    [[7, 1], [9, 1], [11, 2], [9, 1], [7, 1], [9, 2]],
    [[9, 1], [11, 1], [12, 2], [11, 1], [9, 1], [11, 2]],
    [[11, 1], [12, 1], [14, 2], [12, 1], [11, 1], [9, 2]],
    [[12, 0.5], [11, 0.5], [12, 1], [14, 2], [16, 4]],
  ],
  hymn: [
    [[7, 2], [9, 2], [11, 3], [9, 1]],
    [[11, 2], [12, 2], [11, 2], [9, 2]],
    [[9, 1], [11, 1], [12, 2], [14, 4]],
    [[12, 2], [11, 2], [9, 3], [7, 1]],
  ],
}

/* Per act: tempo, key, progression, phrase bank and which layers may play.
   Layers only switch on once the intensity passes their threshold, so a scene can start
   bare and fill out as it goes. */
const ACTS = {
  boot:      { bpm: 62,  root: 110.00, prog: 'lament',  phrase: 'lament', pad: 0,    melody: 0.25, arp: 9,    bass: 0.5,  perc: 9,    bright: 380,  melodyVoice: 'pluck' },
  denied:    { bpm: 96,  root: 103.83, prog: 'falling', phrase: 'lament', pad: 0,    melody: 9,    arp: 0.1,  bass: 0,    perc: 0.2,  bright: 900,  melodyVoice: 'brass' },
  falling:   { bpm: 148, root: 98.00,  prog: 'falling', phrase: 'heroic', pad: 0,    melody: 0.55, arp: 0,    bass: 0,    perc: 0,    bright: 1500, melodyVoice: 'brass' },
  abyss:     { bpm: 54,  root: 98.00,  prog: 'lament',  phrase: 'lament', pad: 0,    melody: 0.15, arp: 9,    bass: 0.2,  perc: 9,    bright: 300,  melodyVoice: 'pluck' },
  ascension: { bpm: 132, root: 130.81, prog: 'heroic',  phrase: 'heroic', pad: 0,    melody: 0.18, arp: 0.05, bass: 0.1,  perc: 0.42, bright: 2200, melodyVoice: 'brass' },
  world:     { bpm: 84,  root: 146.83, prog: 'resolve', phrase: 'hymn',   pad: 0,    melody: 0.2,  arp: 0.35, bass: 0.15, perc: 9,    bright: 1700, melodyVoice: 'pluck' },
}

let ctx = null, bus = null
let act = ACTS.boot, actName = 'boot'
let intensity = 0.35
let timer = null
let nextTime = 0, bar = 0, beat = 0, phraseIdx = 0, noteIdx = 0, noteBeat = 0
const LOOKAHEAD = 0.12

const now = () => ctx.currentTime

/* ---------- voices ---------- */

function pad(freqs, t, dur, gain) {
  const g = ctx.createGain(); g.gain.value = 0
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'
  f.frequency.setValueAtTime(act.bright * 0.5, t)
  f.frequency.linearRampToValueAtTime(act.bright, t + dur * 0.5)
  f.Q.value = 0.6
  g.connect(f); f.connect(bus)
  freqs.forEach((fr, i) => {
    ;[0, 1].forEach(d => {                       // two slightly detuned saws per note: warmth
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = fr * (d ? 1.004 : 0.997)
      const og = ctx.createGain(); og.gain.value = (i === 0 ? 0.5 : 0.34) / freqs.length
      o.connect(og); og.connect(g)
      o.start(t); o.stop(t + dur + 0.4)
    })
  })
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.35)   // slow swell, never a stab
  g.gain.setValueAtTime(gain, t + dur * 0.72)
  g.gain.linearRampToValueAtTime(0, t + dur + 0.3)
}

function pluck(freq, t, dur, gain) {
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.004
  const g = ctx.createGain(); g.gain.value = 0
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'
  f.frequency.setValueAtTime(act.bright * 2.4, t)
  f.frequency.exponentialRampToValueAtTime(Math.max(220, act.bright * 0.5), t + dur)
  o.connect(g); o2.connect(g); g.connect(f); f.connect(bus)
  g.gain.linearRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05)
}

function brass(freq, t, dur, gain) {
  const g = ctx.createGain(); g.gain.value = 0
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'
  f.frequency.setValueAtTime(600, t)
  f.frequency.linearRampToValueAtTime(act.bright * 1.6, t + Math.min(0.16, dur * 0.4))
  f.frequency.linearRampToValueAtTime(act.bright * 0.7, t + dur)
  f.Q.value = 1.4
  g.connect(f); f.connect(bus)
  ;[1, 2, 0.5].forEach((m, i) => {
    const o = ctx.createOscillator()
    o.type = i === 2 ? 'triangle' : 'sawtooth'
    o.frequency.value = freq * m * (i === 1 ? 1.003 : 1)
    const og = ctx.createGain(); og.gain.value = [0.6, 0.26, 0.3][i]
    o.connect(og); og.connect(g)
    o.start(t); o.stop(t + dur + 0.1)
  })
  g.gain.linearRampToValueAtTime(gain, t + 0.05)        // the push that makes it read as brass
  g.gain.setValueAtTime(gain, t + dur * 0.8)
  g.gain.linearRampToValueAtTime(0, t + dur + 0.06)
}

function bass(freq, t, dur, gain) {
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq
  const s = ctx.createOscillator(); s.type = 'sine'; s.frequency.value = freq * 0.5
  const g = ctx.createGain(); g.gain.value = 0
  o.connect(g); s.connect(g); g.connect(bus)
  g.gain.linearRampToValueAtTime(gain, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.start(t); s.start(t); o.stop(t + dur + 0.05); s.stop(t + dur + 0.05)
}

let noiseBuf = null
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource(); s.buffer = noiseBuf
  return s
}

function kick(t, gain) {
  const o = ctx.createOscillator(); o.type = 'sine'
  const g = ctx.createGain(); g.gain.value = 0
  o.connect(g); g.connect(bus)
  o.frequency.setValueAtTime(115, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
  g.gain.linearRampToValueAtTime(gain, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
  o.start(t); o.stop(t + 0.3)
}

function snare(t, gain) {
  const s = noise()
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500
  const g = ctx.createGain(); g.gain.value = gain
  s.connect(f); f.connect(g); g.connect(bus)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15)
  s.start(t); s.stop(t + 0.16)
}

/* ---------- the sequencer ---------- */

const beatDur = () => 60 / act.bpm
const on = (layer) => intensity >= act[layer]

function scheduleBeat(t) {
  const prog = PROG[act.prog]
  const chord = prog[bar % prog.length]
  const [rootDeg, quality] = chord
  const chordRoot = act.root * Math.pow(2, deg(rootDeg) / 12)
  const bd = beatDur()

  // chords land on the downbeat and hold the whole bar
  if (beat === 0 && on('pad')) {
    const freqs = QUAL[quality].map(iv => chordRoot * Math.pow(2, iv / 12))
    pad(freqs, t, bd * 4, 0.016 + intensity * 0.02)
    if (on('bass')) bass(chordRoot * 0.5, t, bd * 3.4, 0.05 + intensity * 0.04)
  }

  // ostinato: the steady eighth-note engine underneath
  if (on('arp')) {
    const ivs = QUAL[quality]
    const pat = [0, 1, 2, 1]
    const f = chordRoot * 2 * Math.pow(2, ivs[pat[beat % pat.length]] / 12)
    pluck(f, t, bd * 0.55, 0.016 + intensity * 0.014)
    pluck(f * 2, t + bd * 0.5, bd * 0.4, 0.008 + intensity * 0.008)
  }

  // percussion enters late and drives
  if (on('perc')) {
    if (beat === 0 || beat === 2) kick(t, 0.10 + intensity * 0.10)
    if (beat === 1 || beat === 3) snare(t, 0.020 + intensity * 0.030)
    if (intensity > 0.75 && beat === 3) snare(t + bd * 0.5, 0.018)
  }

  // the melody, advanced by its own note lengths rather than one note per beat
  if (on('melody')) {
    const bank = PHRASES[act.phrase]
    const phrase = bank[phraseIdx % bank.length]
    if (noteBeat <= 0.001) {
      const [d, len] = phrase[noteIdx]
      const f = act.root * 2 * Math.pow(2, deg(d) / 12)
      const voice = act.melodyVoice === 'brass' ? brass : pluck
      voice(f, t, bd * len * 0.92, (act.melodyVoice === 'brass' ? 0.028 : 0.034) + intensity * 0.03)
      noteBeat = len
      noteIdx++
      if (noteIdx >= phrase.length) {
        noteIdx = 0
        // step through the bank so phrases develop instead of repeating
        phraseIdx = intensity > 0.6 ? phraseIdx + 1 : (phraseIdx + 1) % 2
      }
    }
    noteBeat -= 1
  }

  beat++
  if (beat >= 4) { beat = 0; bar++ }
}

function tick() {
  if (!ctx) return
  while (nextTime < now() + LOOKAHEAD) {
    if (nextTime < now()) nextTime = now() + 0.02
    scheduleBeat(nextTime)
    nextTime += beatDur()
  }
}

/* ---------- public ---------- */

export function initMusic(audioCtx, destination) {
  if (ctx) return
  ctx = audioCtx
  bus = ctx.createGain()
  bus.gain.value = 0.85
  bus.connect(destination)
  nextTime = now() + 0.1
  timer = setInterval(tick, 25)
}

export function setAct(name) {
  if (!ACTS[name] || actName === name) return
  actName = name
  act = ACTS[name]
  // start the new section cleanly on its own first bar
  bar = 0; beat = 0; noteIdx = 0; noteBeat = 0; phraseIdx = 0
}

/** 0..1 — how full the arrangement is. Drives which layers play and how hard. */
export function setIntensity(v) {
  intensity = Math.max(0, Math.min(1, v))
}

export function musicGain(v) { if (bus) bus.gain.setTargetAtTime(v, now(), 0.3) }
export function stopMusic() { clearInterval(timer); timer = null }
