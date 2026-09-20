/* Color journey — the experience travels cool → warm → hot as you descend,
   landing on the signature crimson at root. Breaks the red/black monotony. */
const STOPS = [
  { at: 0.00, a: [0x27, 0x74, 0xff], b: [0x74, 0xd8, 0xff] }, // electric blue / cyan  — intrusion
  { at: 0.26, a: [0x6d, 0x4a, 0xff], b: [0xac, 0x8f, 0xff] }, // indigo / violet        — identity
  { at: 0.52, a: [0xc0, 0x2a, 0xd6], b: [0xf6, 0x76, 0xc0] }, // magenta / pink         — skills
  { at: 0.76, a: [0xf5, 0x9e, 0x0b], b: [0xff, 0xc8, 0x4a] }, // amber / gold           — projects
  { at: 1.00, a: [0xb4, 0x34, 0x2b], b: [0xff, 0x6a, 0x5a] }, // crimson / ember        — ROOT (brand)
]
const lerp = (x, y, t) => x + (y - x) * t
export function at(p) {
  p = Math.max(0, Math.min(1, p))
  let i = 0; while (i < STOPS.length - 1 && p > STOPS[i + 1].at) i++
  const s0 = STOPS[i], s1 = STOPS[Math.min(i + 1, STOPS.length - 1)]
  const t = s1.at > s0.at ? (p - s0.at) / (s1.at - s0.at) : 0
  const mix = (k) => [0, 1, 2].map(j => Math.round(lerp(s0[k][j], s1[k][j], t)))
  return { a: mix('a'), b: mix('b') }
}
export const hex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')
export const norm = (c) => c.map(v => v / 255)
export function applyCSS(p) {
  const c = at(p), r = document.documentElement.style
  r.setProperty('--blood', hex(c.a))
  r.setProperty('--ember', hex(c.b))
  r.setProperty('--blood-hi', hex(c.a.map((v, j) => Math.round((v + c.b[j]) / 2))))
  if (window.__gl) { window.__gl.colA = norm(c.a); window.__gl.colB = norm(c.b) }
}
