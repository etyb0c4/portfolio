import * as THREE from 'three'

export const C = {
  ink: '#0c0c0d', paper: '#ecebe7', orange: '#ff4f1a', blue: '#2f5bff',
  bone: '#e9e7e2', graphite: '#26282c', steel: '#b9bcc0', brass: '#c9a24b', alu: '#d3d5d6',
}

export const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...o })
export const metal = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 1, ...o })
export const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o })

export const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m }
export const shadows = (root, cast = true, receive = true) => {
  root.traverse((o) => { if (o.isMesh && !o.material.transparent && o.material.colorWrite !== false) { o.castShadow = cast; o.receiveShadow = receive } })
  return root
}

// a chamfered plate lying in XY, centred, t thick along Z
export function plate(w, h, t, r = 0.04, b = 0.008) {
  const x = w / 2 - b, y = h / 2 - b, s = new THREE.Shape()
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r)
  s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y)
  s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y)
  const g = new THREE.ExtrudeGeometry(s, { depth: t - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 5 })
  g.translate(0, 0, -(t - 2 * b) / 2)
  return g
}

// spur gear in XY; pitch radius = module * teeth / 2
export function gear(teeth, mod, depth, hole = 0.02) {
  const rp = (mod * teeth) / 2, ro = rp + mod * 0.9, rr = rp - mod * 1.1, s = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts = [[rr, -0.25], [ro, -0.13], [ro, 0.13], [rr, 0.25]]
    pts.forEach(([r, k], j) => {
      const x = Math.cos(a + k * step) * r, y = Math.sin(a + k * step) * r
      i === 0 && j === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
    })
  }
  s.closePath()
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h)
  for (let i = 0; i < 5 && rr > 0.09; i++) {
    const a = (i / 5) * Math.PI * 2, p = new THREE.Path()
    p.absarc(Math.cos(a) * rr * 0.56, Math.sin(a) * rr * 0.56, rr * 0.2, 0, Math.PI * 2, true)
    s.holes.push(p)
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 1, curveSegments: 10 })
  g.translate(0, 0, -depth / 2)
  return g
}

// text and marks are painted to a canvas, then laid on a surface as a decal
export function paint(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}

export const MONO = '"Geist Mono Variable", "Geist Mono", ui-monospace, Menlo, monospace'

/* ───── the lens ─────
   One set of uniforms shared by everything on the outside of the black box. Inside the lens
   circle, fragments on the near half of the box step aside so the inside can be seen. */
export const LENS = { uLens: { value: new THREE.Vector4(0, 0, 1, 0) }, uLensDepth: { value: 0 } }

const LENS_VERT = (sh) => {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying float vLensZ;')
    .replace('#include <project_vertex>', '#include <project_vertex>\nvLensZ = -mvPosition.z;')
}
const LENS_FRAG = `#include <common>
uniform vec4 uLens; uniform float uLensDepth; varying float vLensZ;
float lensCut() {
  float d = distance(gl_FragCoord.xy, uLens.xy);
  return uLens.w * step(vLensZ, uLensDepth) * (1.0 - smoothstep(uLens.z * 0.9, uLens.z, d));
}`

// small outside details (screws, print, ports): simply absent inside the lens
export function lensify(mat) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, LENS)
    LENS_VERT(sh)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', LENS_FRAG)
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (lensCut() > 0.5) discard;')
  }
  mat.customProgramCacheKey = () => 'lens-cut'
  return mat
}

/* ───── the shell ─────
   One material for every panel: matte black when uGlass is 0, glass when it is 1. As glass it is
   mostly reflection, so alpha follows fresnel and the specular term instead of a flat opacity. */
export function shellMaterial({ lens = false, glass = 0 } = {}) {
  const u = { uGlass: { value: glass }, uOpacity: { value: 1 }, uTint: { value: new THREE.Color('#a9c2d0') } }
  const m = new THREE.MeshPhysicalMaterial({ color: C.ink, roughness: 0.46, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.5, transparent: true })
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u, lens ? LENS : {})
    if (lens) LENS_VERT(sh)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', (lens ? LENS_FRAG : '#include <common>\nfloat lensCut() { return 0.0; }') + '\nuniform float uGlass; uniform float uOpacity; uniform vec3 uTint;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uTint, uGlass);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.035, uGlass);')
      .replace('#include <opaque_fragment>', `
        float fres = pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 2.4);
        float glassA = clamp(0.05 + fres * 0.5 + dot(totalSpecular, vec3(0.3333)) * 0.85, 0.0, 0.96);
        float aOut = mix(1.0, glassA, uGlass) * uOpacity * (1.0 - lensCut());
        if (aOut < 0.004) discard;
        gl_FragColor = vec4(outgoingLight, aOut);`)
  }
  m.customProgramCacheKey = () => 'shell' + (lens ? '-lens' : '')
  m.userData.u = u
  return m
}
