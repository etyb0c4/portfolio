/* ============================================================
   The colour journey.

   The whole piece used to live in one brown/amber palette, so every act looked like the
   one before it. Each act now owns a distinct chromatic world, and the ascension — the
   emotional centre — travels a full sunrise: night, then the first violet, then a magenta
   dawn, then gold, then the pale thin blue of real altitude.

   Everything downstream reads the same CSS custom properties, so tinting one act tints its
   text, its glows, its particles and its clouds together.
   ============================================================ */

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const hex = (c) => '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
const norm = (c) => c.map(v => v / 255)

/** ramp: ordered stops [{ at, sky, deep, key, glow }] sampled at t (0..1) */
function sample(stops, t) {
  t = Math.max(0, Math.min(1, t))
  let i = 0
  while (i < stops.length - 1 && t > stops[i + 1].at) i++
  const s0 = stops[i], s1 = stops[Math.min(i + 1, stops.length - 1)]
  const f = s1.at > s0.at ? (t - s0.at) / (s1.at - s0.at) : 0
  return {
    sky:  mix(s0.sky,  s1.sky,  f),
    deep: mix(s0.deep, s1.deep, f),
    key:  mix(s0.key,  s1.key,  f),
    glow: mix(s0.glow, s1.glow, f),
  }
}

/* sky = upper field · deep = lower field · key = text/lines · glow = light sources */
const ACTS = {
  // a cold machine, indifferent — phosphor, not blood
  boot: [
    { at: 0, sky: [12, 26, 30], deep: [4, 8, 10],  key: [150, 236, 226], glow: [64, 214, 196] },
    { at: 1, sky: [12, 26, 30], deep: [4, 8, 10],  key: [150, 236, 226], glow: [64, 214, 196] },
  ],
  // refusal: the machine turns on you
  denied: [
    { at: 0, sky: [40, 10, 10], deep: [10, 3, 4],  key: [255, 120, 104], glow: [228, 54, 44] },
    { at: 1, sky: [40, 10, 10], deep: [10, 3, 4],  key: [255, 120, 104], glow: [228, 54, 44] },
  ],
  // the drop: heat builds the further you go
  falling: [
    { at: 0,   sky: [46, 12, 10], deep: [8, 3, 3],   key: [255, 150, 110], glow: [236, 78, 40] },
    { at: 0.6, sky: [86, 26, 10], deep: [16, 5, 3],  key: [255, 186, 130], glow: [255, 124, 48] },
    { at: 1,   sky: [190, 96, 30], deep: [60, 18, 6], key: [255, 240, 214], glow: [255, 206, 140] },
  ],
  // the floor of it — oppressive, close, nearly black
  abyss: [
    { at: 0, sky: [58, 12, 12], deep: [6, 3, 4],   key: [255, 214, 196], glow: [214, 62, 40] },
    { at: 1, sky: [96, 44, 16], deep: [18, 8, 5],  key: [255, 236, 212], glow: [255, 168, 92] },
  ],
  /* the climb — this is the journey. Night gives way to a real sunrise and then to
     the thin, pale blue you only get at altitude. */
  ascension: [
    { at: 0.00, sky: [22, 16, 48],   deep: [6, 4, 14],    key: [206, 200, 244], glow: [96, 74, 196] },  // night
    { at: 0.22, sky: [74, 30, 96],   deep: [18, 8, 30],   key: [232, 204, 248], glow: [168, 78, 214] },  // first violet
    { at: 0.44, sky: [190, 68, 116], deep: [52, 16, 50],  key: [255, 224, 236], glow: [244, 110, 148] }, // magenta dawn
    { at: 0.64, sky: [246, 138, 92], deep: [104, 34, 52], key: [255, 238, 220], glow: [255, 150, 96] },  // sunrise
    { at: 0.82, sky: [255, 202, 128], deep: [176, 88, 60], key: [255, 250, 240], glow: [255, 212, 150] },// gold
    { at: 1.00, sky: [186, 222, 255], deep: [244, 226, 214], key: [40, 54, 84], glow: [255, 255, 255] }, // altitude
  ],
  // arrival: warm earth, home ground
  world: [
    { at: 0, sky: [46, 26, 12], deep: [7, 4, 3],   key: [255, 226, 186], glow: [255, 176, 96] },
    { at: 1, sky: [46, 26, 12], deep: [7, 4, 3],   key: [255, 226, 186], glow: [255, 176, 96] },
  ],
}

let current = 'boot'

/** Write the palette for an act (and position within it) to the document. */
export function applyJourney(act, t = 0) {
  const stops = ACTS[act] || ACTS.boot
  current = act
  const c = sample(stops, t)
  const r = document.documentElement.style
  r.setProperty('--j-sky', hex(c.sky))
  r.setProperty('--j-deep', hex(c.deep))
  r.setProperty('--j-key', hex(c.key))
  r.setProperty('--j-glow', hex(c.glow))
  r.setProperty('--j-key-rgb', c.key.join(' '))
  r.setProperty('--j-glow-rgb', c.glow.join(' '))
  r.setProperty('--j-sky-rgb', c.sky.join(' '))
  // the particle field and the fullscreen shader follow the same journey
  if (window.__gl) {
    window.__gl.colA = norm(c.glow)
    window.__gl.colB = norm(c.key)
  }
  return c
}

export const currentAct = () => current
