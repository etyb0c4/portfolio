import * as THREE from 'three'
import { NOISE } from './glsl.js'

export const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/* ───────── the core: a sphere wrapped in three protection rings ───────── */
export function createCore() {
  const group = new THREE.Group()
  const u = { uTime: { value: 0 }, uDark: { value: 0 }, uCrack: { value: 0 }, uPress: { value: new THREE.Vector3(0, 0, 1) }, uGlow: { value: 0 } }
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */ `
      varying vec3 vN, vV, vP;
      void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vN, vV, vP;
      uniform float uTime, uDark, uCrack, uGlow; uniform vec3 uPress;
      ${NOISE}
      void main(){
        vec3 n = normalize(vN), v = normalize(vV);
        float ndv = clamp(dot(n, v), 0.0, 1.0), fr = pow(1.0 - ndv, 2.4);
        // matte black lacquer with a heat inside; in the dark act, a cold blue rim instead
        float heat = 0.5 + 0.5 * sin(uTime * 0.9);
        vec3 light = mix(vec3(0.085, 0.084, 0.09), vec3(0.42, 0.42, 0.45), pow(fr, 1.6));
        light += vec3(1.0, 0.42, 0.14) * pow(ndv, 7.0) * (0.14 + 0.08 * heat);
        light += vec3(1.0) * pow(max(dot(n, normalize(vec3(0.5, 0.8, 0.6))), 0.0), 26.0) * 0.35;
        vec3 dark = mix(vec3(0.016, 0.017, 0.026), vec3(0.42, 0.52, 0.95), pow(fr, 1.4));
        dark += vec3(1.0, 0.5, 0.18) * pow(ndv, 9.0) * uGlow;
        vec3 col = mix(light, dark, uDark);
        vec3 vr = voro(vP.xy * 3.2 + vP.z * 1.3);
        float reach = uCrack * 3.0 - distance(vP, uPress);
        float line = smoothstep(0.055, 0.0, vr.x) * smoothstep(0.0, 0.35, reach);
        vec3 cc = mix(vec3(1.0, 0.31, 0.10), vec3(1.0, 0.85, 0.6), smoothstep(0.72, 1.0, uCrack));
        col = mix(col, cc, line * 0.95);
        col = mix(col, vec3(1.0, 0.93, 0.85), smoothstep(0.85, 1.0, uCrack) * 0.6);
        gl_FragColor = vec4(col, 1.0);
      }`,
  }))
  group.add(sphere)

  const ru = { uTime: u.uTime, uDark: u.uDark, uOpacity: { value: 1 } }
  const ringMat = new THREE.ShaderMaterial({
    uniforms: ru, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      precision highp float; varying vec2 vUv; uniform float uTime, uDark, uOpacity;
      void main(){
        float s = 0.5 + 0.5 * sin(vUv.x * 6.2831 * 1.5 + uTime * 0.8);
        vec3 a = mix(vec3(0.24, 0.235, 0.23), vec3(0.30, 0.38, 0.85), uDark);
        vec3 b = mix(vec3(0.76, 0.75, 0.73), vec3(0.85, 0.9, 1.0), uDark);
        gl_FragColor = vec4(mix(a, b, s * s), uOpacity);
      }`,
  })
  const rings = [[1.42, 3, 0.022], [1.78, 4, 0.018], [2.16, 5, 0.014]].map(([r, n, tube], k) => {
    const pivot = new THREE.Group()
    const seg = (Math.PI * 2) / n
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 72, seg * 0.8), ringMat)
      m.rotation.z = i * seg
      pivot.add(m)
    }
    pivot.rotation.set(0.9 + k * 0.7, k * 1.1, 0)
    group.add(pivot)
    return pivot
  })

  let spin = 0
  const update = (time, dt, hold) => {
    u.uTime.value = time
    spin += dt * (0.22 + hold * 3.4)
    rings.forEach((p, k) => {
      p.rotation.x = 0.9 + k * 0.7 + spin * (0.6 + k * 0.23) * (k % 2 ? -1 : 1)
      p.rotation.y = k * 1.1 + spin * (0.4 + k * 0.17)
      p.scale.setScalar(1 - hold * (0.12 + k * 0.07))
    })
    const j = hold * hold * 0.018
    sphere.position.set((Math.random() - 0.5) * j, (Math.random() - 0.5) * j, 0)
  }
  return { group, u, ru, update }
}

/* ───────── shards: what is left once the sphere gives ───────── */

function labelTexture(l) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 640
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const draw = () => {
    const g = c.getContext('2d')
    g.clearRect(0, 0, c.width, c.height)
    g.fillStyle = '#fff'; g.textBaseline = 'alphabetic'
    g.font = "800 condensed 215px 'Archivo Variable'"
    const head = (l.sw + l.a).toUpperCase()
    g.fillText(head, 26, 250)
    if (l.b) { g.font = "italic 600 condensed 150px 'Archivo Variable'"; g.fillText(l.b.toUpperCase(), 30, 408) }
    g.fillStyle = '#ff7a42'
    g.fillRect(30, l.b ? 448 : 300, 46, 8)
    g.fillStyle = '#fff'
    g.font = "500 34px 'Geist Mono Variable'"; g.globalAlpha = 0.9
    g.fillText(l.c.toUpperCase(), 96, l.b ? 486 : 338)
    g.globalAlpha = 1
    tex.needsUpdate = true
  }
  draw()
  return { tex, draw }
}

export function createShards(labels) {
  const group = new THREE.Group()
  const rnd = rng(11)
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uVis: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN, vV; varying vec2 vS; varying float vD;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vD = length(mv.xyz); vS = position.xy; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      precision highp float; varying vec3 vN, vV; varying vec2 vS; varying float vD; uniform float uVis;
      void main(){
        vec3 n = normalize(vN); float f = pow(1.0 - abs(dot(n, normalize(vV))), 1.8);
        float streak = pow(max(0.0, sin(vS.x * 3.0 + vS.y * 5.0 + n.x * 6.0)), 14.0);
        vec3 ember = mix(vec3(1.0, 0.33, 0.10), vec3(1.0, 0.72, 0.38), f);
        vec3 col = vec3(0.10, 0.098, 0.105) * 0.8 + vec3(0.9, 0.88, 0.86) * f * 0.8 + ember * pow(f, 2.0) * 0.9 + vec3(1.0, 0.8, 0.6) * streak * 0.45;
        float a = (0.15 + f * 0.75 + streak * 0.4) * smoothstep(30.0, 15.0, vD) * smoothstep(0.7, 2.6, vD) * uVis;
        gl_FragColor = vec4(col, a);
      }`,
  })
  const items = []
  const redraw = []
  const N = 78
  for (let i = 0; i < N; i++) {
    const hero = i < labels.length
    const rad = hero ? 1.5 : 0.22 + rnd() * 0.8
    const k = 4 + Math.floor(rnd() * 3)
    const shape = new THREE.Shape()
    for (let j = 0; j < k; j++) {
      const a = ((j + rnd() * 0.6) / k) * Math.PI * 2
      const r = rad * (hero ? 0.8 + rnd() * 0.3 : 0.5 + rnd() * 0.6)
      const x = Math.cos(a) * r * (hero ? 1.25 : 1), y = Math.sin(a) * r * (hero ? 0.82 : 1)
      j ? shape.lineTo(x, y) : shape.moveTo(x, y)
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false })
    geo.translate(0, 0, -0.025)
    const mesh = new THREE.Mesh(geo, mat)
    let home
    if (hero) {
      const side = i % 2 ? 1 : -1
      home = new THREE.Vector3(side * 1.6, i % 2 ? 0.25 : 0.75, -10 - i * (23 / Math.max(1, labels.length - 1)))
      mesh.rotation.set(0.04, -side * 0.34, side * 0.07)
      const { tex, draw } = labelTexture(labels[i])
      redraw.push(draw)
      const lm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.44), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }))
      lm.position.z = 0.06
      mesh.add(lm)
      mesh.userData.label = lm
    } else {
      const a = rnd() * Math.PI * 2, r = 2.0 + rnd() * 5.6
      home = new THREE.Vector3(Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.8, 5.5 - rnd() * 50)
      mesh.rotation.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3)
    }
    mesh.renderOrder = hero ? 2 : 1
    group.add(mesh)
    items.push({ mesh, home, hero, burst: !hero && home.z > -7, sx: (rnd() - 0.5) * 0.5, sy: (rnd() - 0.5) * 0.5, ph: rnd() * 6.3 })
  }
  document.fonts?.ready.then(() => redraw.forEach((d) => d()))

  const update = (time, dt, explode, vis, camZ) => {
    mat.uniforms.uVis.value = vis
    group.visible = vis > 0.002
    if (!group.visible) return
    const e = 1 - Math.pow(1 - explode, 3)
    for (const it of items) {
      const m = it.mesh
      if (it.burst) m.position.copy(it.home).multiplyScalar(e)
      else m.position.copy(it.home)
      m.position.y += Math.sin(time * 0.5 + it.ph) * 0.12
      if (it.hero) {
        m.rotation.x = 0.04 + Math.sin(time * 0.4 + it.ph) * 0.05
        const d = camZ - m.position.z
        m.userData.label.material.opacity = vis * THREE.MathUtils.smoothstep(d, 1.6, 4.0) * (1 - THREE.MathUtils.smoothstep(d, 15, 24))
      } else { m.rotation.x += it.sx * dt; m.rotation.y += it.sy * dt }
    }
  }
  return { group, update }
}

/* ───────── the depths: embers and torn strips of source ───────── */
const SNIPPETS = [
  ['#!/usr/bin/env bash', '# b2r-kit: one command, full recon', 'b2r new "$BOX" "$TARGET"', 'nmap -sCV -p- --min-rate 5000 "$TARGET"', 'ffuf -u "http://$TARGET/FUZZ" -w raft.txt', 'netexec smb "$TARGET" -u "" -p ""', 'state::write NOTES.md', '# agent reads NOTES.md: 0 round-trips'],
  ['from pwn import *', 'elf = context.binary = ELF("./chall")', 'rop = ROP(elf)', 'rop.raw(rop.ret.address)', 'rop.call(elf.sym.win)', 'io = remote(host, port)', 'io.sendlineafter(b"> ", flat({72: rop.chain()}))', 'io.interactive()'],
  ['int minimax(board_t *b, int depth, int a, int be)', '{', '    if (depth == 0) return evaluate(b);', '    for (move_t *m = moves(b); m; m = m->next) {', '        int s = -minimax(play(b, m), depth - 1, -be, -a);', '        if (s >= be) return be;', '        if (s > a) a = s;', '    }', '    return a;', '}'],
]

function stripTexture(lines) {
  const c = document.createElement('canvas'); c.width = 1536; c.height = 256
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const draw = () => {
    const g = c.getContext('2d')
    g.fillStyle = '#ecebe7'; g.fillRect(0, 0, c.width, c.height)
    g.fillStyle = '#26282c'; g.font = "500 22px 'Geist Mono Variable'"; g.textBaseline = 'top'
    lines.forEach((l, i) => g.fillText(l, 28 + (i % 2) * 0, 14 + i * 26))
    g.globalAlpha = 0.25; g.fillRect(0, 248, c.width, 2); g.globalAlpha = 1
    tex.needsUpdate = true
  }
  draw()
  return { tex, draw }
}

export function createDepths() {
  const group = new THREE.Group()
  const rnd = rng(5)
  const N = 2600
  const pos = new Float32Array(N * 3), seed = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const a = rnd() * Math.PI * 2, r = 0.6 + Math.pow(rnd(), 0.7) * 9
    pos[i * 3] = Math.cos(a) * r * 1.3; pos[i * 3 + 1] = Math.sin(a) * r * 0.85; pos[i * 3 + 2] = -24 - rnd() * 62
    seed[i] = rnd()
  }
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const pu = { uTime: { value: 0 }, uVis: { value: 0 }, uPx: { value: 1 } }
  const points = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: pu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime, uPx; varying float vA; varying float vS;
      void main(){
        vec3 p = position + vec3(sin(uTime * 0.21 + aSeed * 40.0), cos(uTime * 0.17 + aSeed * 71.0), 0.0) * 0.45;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float d = -mv.z;
        vA = smoothstep(34.0, 14.0, d) * smoothstep(0.5, 3.0, d) * (0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 30.0));
        vS = aSeed;
        gl_PointSize = (2.0 + aSeed * 7.0) * uPx * 9.0 / d;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float; varying float vA; varying float vS; uniform float uVis;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d); a *= a;
        vec3 col = mix(vec3(1.0, 0.62, 0.22), vec3(0.55, 0.65, 1.0), step(0.62, vS));
        gl_FragColor = vec4(col * a * vA * uVis, 1.0);
      }`,
  }))
  points.frustumCulled = false
  group.add(points)

  const texs = SNIPPETS.map(stripTexture)
  document.fonts?.ready.then(() => texs.forEach((t) => t.draw()))
  const su = { uTime: pu.uTime, uVis: pu.uVis }
  const strips = []
  for (let i = 0; i < 30; i++) {
    const geo = new THREE.PlaneGeometry(2.9, 0.46, 20, 1)
    const ph = new Float32Array(geo.attributes.position.count).fill(rnd() * 6.3)
    geo.setAttribute('aPh', new THREE.BufferAttribute(ph, 1))
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { ...su, uMap: { value: texs[i % 3].tex } }, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute float aPh; uniform float uTime; varying vec2 vUv; varying float vD; varying float vL;
        void main(){
          vUv = uv; vec3 p = position;
          float w = sin(p.x * 1.7 + uTime * 0.7 + aPh);
          p.z += w * 0.28; p.y += sin(p.x * 0.9 + aPh + uTime * 0.4) * 0.12;
          vL = 0.55 + 0.45 * w;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); vD = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float; uniform sampler2D uMap; uniform float uVis; varying vec2 vUv; varying float vD; varying float vL;
        void main(){
          vec3 c = texture2D(uMap, vUv).rgb * vec3(0.78, 0.72, 0.62) * vL;
          float a = smoothstep(30.0, 16.0, vD) * smoothstep(1.0, 3.5, vD) * uVis;
          gl_FragColor = vec4(c * (0.35 + 0.65 * smoothstep(22.0, 6.0, vD)), a);
        }`,
    }))
    const a = rnd() * Math.PI * 2, r = 1.7 + rnd() * 4.2
    m.position.set(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.8, -40 - rnd() * 34)
    m.rotation.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3)
    m.userData.s = [(rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3]
    group.add(m)
    strips.push(m)
  }

  const update = (time, dt, vis, px) => {
    group.visible = vis > 0.002
    pu.uTime.value = time; pu.uVis.value = vis; pu.uPx.value = px
    if (!group.visible) return
    for (const s of strips) { s.rotation.x += s.userData.s[0] * dt; s.rotation.z += s.userData.s[1] * dt }
  }
  return { group, update }
}
