import * as THREE from 'three'
import { C, std, metal, glow, mesh, plate, gear, paint, MONO, LENS, lensify, shellMaterial, clamp01, ease, rng } from './kit.js'

export const H = 0.96 // distance from the centre of the box to the centre line of its rails and panels
const Z = new THREE.Vector3(0, 0, 1), UP = new THREE.Vector3(0, 1, 0)
const NORMALS = [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 1, 0], [0, -1, 0]] // front right back left top bottom

/* A box as a kit of parts: six panels held in a twelve-rail frame. Used for the black box and for every vitrine. */
export function createCase({ panelMat, frameMat, rail = 0.08, skip = [] }) {
  const group = new THREE.Group(), parts = []
  const span = 2 * H - rail
  const pGeo = plate(span - 0.02, span - 0.02, 0.05)
  const keep = (o, kind, extra = {}) => { group.add(o); const p = { o, kind, p0: o.position.clone(), q0: o.quaternion.clone(), ...extra }; parts.push(p); return p }

  const panels = NORMALS.map((n, i) => {
    if (skip.includes(i)) return null
    const v = new THREE.Vector3(...n), m = new THREE.Mesh(pGeo, panelMat)
    m.position.copy(v).multiplyScalar(H)
    m.quaternion.setFromUnitVectors(Z, v)
    m.renderOrder = 1
    return keep(m, 'panel', { n: v, i })
  })

  const rGeo = [new THREE.BoxGeometry(span, rail, rail), new THREE.BoxGeometry(rail, span, rail), new THREE.BoxGeometry(rail, rail, span)]
  for (let a = 0; a < 3; a++) for (const sb of [-1, 1]) for (const sc of [-1, 1]) {
    const m = new THREE.Mesh(rGeo[a], frameMat), b = (a + 1) % 3, c = (a + 2) % 3
    m.position.setComponent(b, sb * H); m.position.setComponent(c, sc * H)
    keep(m, 'rail', { axis: a })
  }
  const cGeo = new THREE.BoxGeometry(rail, rail, rail)
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) keep(mesh(cGeo, frameMat, x * H, y * H, z * H), 'corner')

  return { group, parts, panels }
}

/* ───── what is inside ───── */

function modWeb() {
  const g = new THREE.Group(), R = rng(11)
  g.add(mesh(new THREE.BoxGeometry(0.66, 0.28, 0.66), std(C.graphite, { roughness: 0.5 }), 0, 0.14, 0))
  g.add(mesh(new THREE.BoxGeometry(0.6, 0.02, 0.6), std('#15161a', { roughness: 0.3 }), 0, 0.29, 0))
  const sock = new THREE.InstancedMesh(new THREE.BoxGeometry(0.085, 0.018, 0.085), std('#040405', { roughness: 0.2 }), 16)
  const led = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.012, 0.022), glow('#ffffff'), 16)
  const M = new THREE.Matrix4(), col = new THREE.Color()
  const at = (i, j) => new THREE.Vector3((i - 1.5) * 0.14, 0.3, (j - 1.5) * 0.14)
  const lit = []
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const k = i * 4 + j, p = at(i, j)
    M.makeTranslation(p.x, 0.305, p.z); sock.setMatrixAt(k, M)
    M.makeTranslation(p.x + 0.052, 0.31, p.z - 0.052); led.setMatrixAt(k, M)
    lit[k] = R() > 0.5; led.setColorAt(k, col.set(lit[k] ? '#ffffff' : '#2b2d31'))
  }
  g.add(sock, led)
  for (const [i, j, k, l, c] of [[0, 0, 3, 2, C.orange], [1, 3, 2, 0, C.bone], [0, 2, 3, 3, C.bone]]) {
    const a = at(i, j), b = at(k, l), mid = a.clone().lerp(b, 0.5)
    const curve = new THREE.CatmullRomCurve3([a, a.clone().setY(0.42), mid.setY(0.56), b.clone().setY(0.42), b])
    const m = std(c, { roughness: 0.45 })
    g.add(mesh(new THREE.TubeGeometry(curve, 28, 0.013, 6), m))
    for (const p of [a, b]) g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10), m, p.x, 0.325, p.z))
  }
  let next = 0
  g.userData.tick = (t) => {
    if (t < next) return
    next = t + 0.09
    const k = Math.floor(R() * 16)
    lit[k] = !lit[k]
    led.setColorAt(k, col.set(lit[k] ? (R() > 0.8 ? C.orange : '#ffffff') : '#2b2d31'))
    led.instanceColor.needsUpdate = true
  }
  g.userData.top = 0.6
  return g
}

function modPwn() {
  const g = new THREE.Group()
  g.add(mesh(new THREE.BoxGeometry(0.66, 0.05, 0.66), std(C.graphite, { roughness: 0.5 }), 0, 0.025, 0))
  for (const x of [-0.3, 0.3]) g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.78, 8), metal(C.steel), x, 0.42, -0.3))
  const geo = new THREE.BoxGeometry(0.54, 0.05, 0.54)
  const bone = std(C.bone, { roughness: 0.55 }), hot = std(C.orange, { roughness: 0.45, emissive: C.orange, emissiveIntensity: 0.35 }), cap = std(C.graphite, { roughness: 0.4 })
  const slabs = []
  for (let i = 0; i < 10; i++) { const s = mesh(geo, i === 6 ? hot : i === 9 ? cap : bone, 0, 0.085 + i * 0.068, 0); g.add(s); slabs.push(s) }
  // one frame too wide for the stack: it pushes everything above it out of line
  g.userData.tick = (t) => {
    const push = 0.5 + 0.5 * Math.sin(t * 1.5)
    slabs[6].position.x = 0.1 + push * 0.07
    for (let i = 7; i < 10; i++) slabs[i].position.x = push * 0.022 * (i - 6)
  }
  g.userData.top = 0.8
  return g
}

function modRev() {
  const g = new THREE.Group()
  g.add(mesh(new THREE.BoxGeometry(0.66, 0.05, 0.4), std(C.graphite, { roughness: 0.5 }), 0, 0.025, 0))
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.68, 0.03), std(C.bone, { roughness: 0.55 }), 0, 0.39, -0.08))
  const brass = metal(C.brass, { roughness: 0.34 }), pin = metal(C.steel)
  const MOD = 0.015
  const spec = [{ n: 24, x: -0.1, y: 0.33 }, { n: 14, link: 0, ang: 0.61 }, { n: 10, link: 1, ang: 2.09 }]
  const gears = spec.map((s) => {
    if (s.link !== undefined) {
      const p = spec[s.link], d = ((p.n + s.n) * MOD) / 2
      s.x = p.x + Math.cos(s.ang) * d; s.y = p.y + Math.sin(s.ang) * d
    }
    const m = mesh(gear(s.n, MOD, 0.035, 0.016), brass, s.x, s.y, -0.035)
    g.add(m, mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 10).rotateX(Math.PI / 2), pin, s.x, s.y, -0.03))
    return m
  })
  g.userData.tick = (t) => {
    const a0 = t * 0.7
    gears[0].rotation.z = a0
    // each driven gear turns the other way, faster by the tooth ratio, with a gap facing its driver
    let prev = a0
    for (let i = 1; i < spec.length; i++) {
      const s = spec[i], p = spec[s.link]
      const a = s.ang + Math.PI - Math.PI / s.n - (p.n / s.n) * (prev - s.ang)
      gears[i].rotation.z = a
      prev = a
    }
  }
  g.userData.top = 0.78
  return g
}

function modForensics() {
  const g = new THREE.Group()
  g.add(mesh(new THREE.BoxGeometry(0.66, 0.06, 0.66), std(C.bone, { roughness: 0.55 }), 0, 0.03, 0))
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 16), metal(C.steel), -0.04, 0.24, -0.04))
  const disc = new THREE.CylinderGeometry(0.25, 0.25, 0.012, 56), mirror = metal('#d5d9dc', { roughness: 0.1 }), mark = std(C.graphite)
  const platters = [0.13, 0.23, 0.33].map((y) => {
    const p = mesh(disc, mirror, -0.04, y, -0.04)
    p.add(mesh(new THREE.BoxGeometry(0.09, 0.004, 0.02), mark, 0.18, 0.008, 0), mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 20), mark, 0, 0.002, 0))
    g.add(p); return p
  })
  const arm = new THREE.Group(); arm.position.set(0.25, 0, 0.25)
  arm.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 14), std(C.graphite, { roughness: 0.4 }), 0, 0.22, 0))
  for (const y of [0.148, 0.248, 0.348]) {
    arm.add(mesh(new THREE.BoxGeometry(0.3, 0.008, 0.035).translate(-0.15, 0, 0), metal(C.steel), 0, y, 0))
    arm.add(mesh(new THREE.BoxGeometry(0.03, 0.012, 0.03), std(C.orange, { emissive: C.orange, emissiveIntensity: 0.4 }), -0.29, y, 0))
  }
  g.add(arm)
  g.userData.tick = (t) => {
    platters.forEach((p, i) => { p.rotation.y = t * (5 + i * 0.8) })
    arm.rotation.y = -0.72 + Math.sin(t * 0.9) * 0.2
  }
  g.userData.top = 0.5
  return g
}

function pennant(color, w = 0.3, h = 0.17) {
  const geo = new THREE.PlaneGeometry(w, h, 10, 2), p = geo.attributes.position
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / w + 0.5; p.setXY(i, u * w, p.getY(i) * (1 - u * 0.94)) }
  const m = new THREE.Mesh(geo, glow(color, { side: THREE.DoubleSide }))
  const base = p.array.slice()
  m.userData.wave = (t) => {
    for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 22 - t * 6) * 0.05 * x * 3) }
    p.needsUpdate = true
  }
  return m
}
export { pennant }

/* ───── the black box ───── */

export function createHero() {
  const group = new THREE.Group(), body = new THREE.Group()
  body.position.y = 1.07
  group.add(body)

  const panelMat = shellMaterial({ lens: true })
  const INK = new THREE.Color('#101012'), ALU = new THREE.Color(C.alu)
  const frameMat = new THREE.MeshStandardMaterial({ color: INK.clone(), roughness: 0.38, metalness: 0.55 })
  const kase = createCase({ panelMat, frameMat })
  body.add(kase.group)
  for (const p of kase.parts) { p.o.castShadow = true; p.o.receiveShadow = p.kind !== 'panel' }
  const [front, right, , left, top, bottom] = kase.panels.map((p) => p.o)

  /* outside details. Everything here rides on a panel and steps aside for the lens. */
  const details = []
  const printMat = (map) => { const m = lensify(new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.9 })); details.push(m); return m }
  const decal = (panel, map, w, h, x, y, z = 0.027) => { const m = mesh(new THREE.PlaneGeometry(w, h), printMat(map), x, y, z); m.renderOrder = 2; panel.add(m); return m }
  const INKED = '#e9e7e2'

  decal(front, paint(1024, 400, (c, w) => {
    c.fillStyle = INKED
    c.font = `600 62px ${MONO}`; c.fillText('RS—01', 0, 70)
    c.font = `500 30px ${MONO}`; c.fillText('SEALED UNIT', 262, 66)
    c.fillRect(0, 104, w, 3)
    c.font = `500 37px ${MONO}`; c.fillText('NO USER-SERVICEABLE PARTS INSIDE', 0, 172)
    c.globalAlpha = 0.6
    c.font = `400 28px ${MONO}`; c.fillText('S/N 2029 · ASSEMBLED IN COTONOU', 0, 232)
  }), 0.86, 0.336, -0.37, -0.6)

  decal(left, paint(512, 200, (c) => {
    c.fillStyle = INKED
    c.font = `600 64px ${MONO}`; c.fillText('DO NOT OPEN', 0, 70)
    c.globalAlpha = 0.6
    c.font = `400 34px ${MONO}`; c.fillText('(seriously)', 0, 130)
  }), 0.5, 0.195, -0.52, 0.62)

  decal(right, paint(512, 512, (c, w) => {
    c.fillStyle = '#34363b'
    for (let i = -9; i <= 9; i++) for (let j = -9; j <= 9; j++) {
      const x = w / 2 + (i + (j & 1) * 0.5) * 24, y = w / 2 + j * 21
      if (Math.hypot(x - w / 2, y - w / 2) < 212) { c.beginPath(); c.arc(x, y, 6.2, 0, 7); c.fill() }
    }
  }), 1.1, 1.1, 0, 0.05)

  decal(top, paint(512, 256, (c, w) => {
    c.fillStyle = '#2e3034'
    for (let i = 0; i < 9; i++) { c.beginPath(); c.roundRect(0, 6 + i * 27, w, 12, 6); c.fill() }
  }), 0.62, 0.31, 0.5, 0.52)

  // the seal: one sticker folded over the top front edge, half on each panel, so it tears when they part
  const seal = paint(512, 448, (c, w, h) => {
    c.fillStyle = C.orange; c.fillRect(0, 0, w, h)
    c.strokeStyle = '#0c0c0d'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28)
    c.setLineDash([14, 10]); c.lineWidth = 3; c.beginPath(); c.moveTo(14, h / 2); c.lineTo(w - 14, h / 2); c.stroke()
    c.fillStyle = '#0c0c0d'; c.textAlign = 'center'
    c.font = `700 52px ${MONO}`; c.fillText('WARRANTY VOID', w / 2, 132)
    c.font = `600 36px ${MONO}`; c.fillText('IF SEAL IS BROKEN', w / 2, h / 2 + 96)
    c.font = `500 22px ${MONO}`; c.fillText('▲ ▲ ▲', w / 2, 190); c.fillText('RS—01 · QC PASSED', w / 2, h - 56)
  })
  const half = (panel, y, v0) => {
    const m = decal(panel, seal, 0.5, 0.22, -0.36, y, 0.0435)
    const uv = m.geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setY(i, v0 + uv.getY(i) * 0.5)
    return m
  }
  half(top, -0.89, 0.5); half(front, 0.89, 0)

  const hard = lensify(metal('#8f9397', { roughness: 0.3 })), cavity = lensify(std('#020203', { roughness: 0.15 })), bezel = lensify(std('#1c1d20', { roughness: 0.35 }))
  const sGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.012, 12).rotateX(Math.PI / 2)
  const hides = []
  for (const p of kase.panels) for (const x of [-0.8, 0.8]) for (const y of [-0.8, 0.8]) p.o.add(mesh(sGeo, hard, x, y, 0.028))
  const ports = [0.34, 0.55, 0.76].map((x, i) => {
    const g = new THREE.Group(); g.position.set(x, -0.66, 0.026)
    g.add(mesh(new THREE.BoxGeometry(0.15, 0.125, 0.016), bezel), mesh(new THREE.BoxGeometry(0.118, 0.092, 0.018), cavity, 0, 0, 0.001))
    g.add(mesh(new THREE.BoxGeometry(0.022, 0.014, 0.01), lensify(glow(i === 2 ? C.orange : '#f4f4f0')), -0.052, 0.088, 0))
    front.add(g); hides.push(g)
    const a = new THREE.Object3D(); a.position.set(x, -0.66, 0.05); front.add(a)
    return a
  })

  const feet = std('#1a1b1e', { roughness: 0.8 })
  for (const x of [-0.8, 0.8]) for (const z of [-0.8, 0.8]) bottom.add(mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.07, 18).rotateX(Math.PI / 2), feet, x, z, 0.06))

  // light leaking through the seams once the seal is broken
  const seam = mesh(new THREE.BoxGeometry(1.9, 1.9, 1.9), glow('#ff7a3d', { transparent: true, opacity: 0, depthWrite: false }))
  seam.renderOrder = 0; seam.visible = false
  body.add(seam)

  /* inside */
  const inside = new THREE.Group()
  body.add(inside)
  const FLOOR = -0.885
  const R = rng(5)
  const tray = mesh(new THREE.BoxGeometry(1.76, 0.03, 1.76), std('#ffffff', {
    roughness: 0.45, metalness: 0.2,
    map: paint(512, 512, (c, w) => {
      c.fillStyle = '#12151a'; c.fillRect(0, 0, w, w)
      c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round'
      for (let i = 0; i < 46; i++) {
        c.strokeStyle = c.fillStyle = R() > 0.82 ? '#ff4f1a' : '#3a4350'
        let x = Math.round(R() * 20) * 26, y = Math.round(R() * 20) * 26
        c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill()
        c.beginPath(); c.moveTo(x, y)
        for (let k = 0; k < 3; k++) { if (R() > 0.5) x += (Math.round(R() * 6) - 3) * 26; else y += (Math.round(R() * 6) - 3) * 26; c.lineTo(x, y) }
        c.stroke()
        c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill()
      }
    }),
  }), 0, FLOOR - 0.015, 0)
  inside.add(tray)

  const mods = [
    { id: 'web', g: modWeb(), x: -0.44, z: 0.44, away: [-0.78, 0.5, 0.78] },
    { id: 'pwn', g: modPwn(), x: 0.44, z: 0.44, away: [0.78, 0.75, 0.78] },
    { id: 'rev', g: modRev(), x: -0.44, z: -0.4, away: [-0.78, 1.0, -0.78] },
    { id: 'forensics', g: modForensics(), x: 0.44, z: -0.44, away: [0.78, 0.45, -0.78] },
  ]
  const anchors = {}
  for (const m of mods) {
    m.g.position.set(m.x, FLOOR, m.z)
    inside.add(m.g)
    const a = new THREE.Object3D(); a.position.set(0, m.g.userData.top + 0.04, 0); m.g.add(a)
    anchors[m.id] = a
  }
  ports.forEach((a, i) => { anchors['p' + i] = a })

  const mast = new THREE.Group(); mast.position.set(0, FLOOR, 0)
  mast.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.3, 8), metal(C.steel), 0, 0.65, 0))
  mast.add(mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.03, 20), std(C.graphite), 0, 0.015, 0))
  const flag = pennant(C.orange); flag.position.set(0.011, 1.2, 0)
  const flagLight = new THREE.PointLight(C.orange, 0.9, 1.5, 2); flagLight.position.set(0.14, 1.2, 0.05)
  mast.add(flag, flagLight)
  inside.add(mast)
  anchors.flag = new THREE.Object3D(); anchors.flag.position.set(0.12, 1.2, 0); mast.add(anchors.flag)

  const lamp = new THREE.PointLight('#ffe6cc', 3.2, 3.4, 2); lamp.position.set(0, 0.5, 0)
  inside.add(lamp)
  inside.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial) { o.castShadow = true; o.receiveShadow = true } })

  /* taking it apart: the lid lifts, the four walls fall open like a net, and what was inside rises out */
  const movers = []
  const out = (p) => new THREE.Vector3(p.x, 0, p.z).normalize()
  const lin = (o, w0, w1, d, tilt) => {
    const p0 = o.position.clone(), q0 = o.quaternion.clone(), dq = tilt ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...tilt)) : null, I = new THREE.Quaternion()
    movers.push({ w0, w1, set(k) { o.position.copy(p0).addScaledVector(d, k); if (dq) o.quaternion.copy(q0).multiply(I.identity().slerp(dq, k)) } })
  }
  for (const p of kase.parts) {
    const { o, p0 } = p
    if (p.kind === 'panel') {
      if (p.i === 4) lin(o, 0, 0.5, new THREE.Vector3(0, 2.15, 0), [0.1, 0, 0.06])
      else if (p.i === 5) lin(o, 0.3, 0.85, new THREE.Vector3(0, -0.5, 0))
      else {
        const n = p.n, axis = new THREE.Vector3().crossVectors(UP, n).normalize()
        const hinge = n.clone().multiplyScalar(H).setY(-H), arm = p0.clone().sub(hinge), q0 = p.q0.clone(), r = new THREE.Quaternion(), v = new THREE.Vector3()
        movers.push({ w0: 0.2 + p.i * 0.045, w1: 0.72 + p.i * 0.045, set(k) {
          r.setFromAxisAngle(axis, k * Math.PI / 2)
          o.position.copy(hinge).add(v.copy(arm).applyQuaternion(r)).addScaledVector(n, 0.26 * k); o.position.y -= 0.1 * k
          o.quaternion.copy(r).multiply(q0)
        } })
      }
    } else if (p.kind === 'rail') {
      if (p.axis === 1) lin(o, 0.25, 0.8, out(p0).multiplyScalar(1.3).setY(0.22))
      else if (p0.y > 0) lin(o, 0.02, 0.55, out(p0).multiplyScalar(0.3).setY(1.5))
      else lin(o, 0.3, 0.85, out(p0).multiplyScalar(0.5).setY(-0.32))
    } else if (p0.y > 0) lin(o, 0.02, 0.55, out(p0).multiplyScalar(0.55).setY(1.5))
    else lin(o, 0.3, 0.85, out(p0).multiplyScalar(0.9).setY(-0.32))
  }
  lin(tray, 0.3, 0.85, new THREE.Vector3(0, -0.24, 0))
  mods.forEach((m, i) => lin(m.g, 0.36 + i * 0.045, 0.86 + i * 0.045, new THREE.Vector3(...m.away)))
  lin(mast, 0.42, 1, new THREE.Vector3(0, 0.95, 0))

  const state = { explode: -1, pop: 0, glass: -1, detail: -1 }
  const api = {
    group, body, anchors, flag, lens: LENS,
    setExplode(e, pop = 0) {
      if (e === state.explode && pop === state.pop) return
      state.explode = e; state.pop = pop
      for (const m of movers) m.set(ease(clamp01((e - m.w0) / (m.w1 - m.w0))))
      if (pop) for (const p of kase.panels) p.o.position.addScaledVector(p.n, 0.055 * pop)
    },
    setGlass(g) {
      if (g === state.glass) return
      state.glass = g
      panelMat.userData.u.uGlass.value = g
      panelMat.depthWrite = g < 0.5
      for (const p of kase.panels) p.o.castShadow = g < 0.5
      frameMat.color.lerpColors(INK, ALU, g); frameMat.metalness = 0.55 + 0.35 * g; frameMat.roughness = 0.38 - 0.1 * g
    },
    setDetail(d) {
      if (d === state.detail) return
      state.detail = d
      for (const m of details) { m.opacity = d; m.visible = d > 0.01 }
      for (const h of hides) h.visible = d > 0.5
    },
    setSeam(s) { seam.material.opacity = s; seam.visible = s > 0.002; lamp.intensity = 3.2 + s * 5 },
    takeFlag() { flag.visible = false; flagLight.visible = false },
    update(time) {
      for (const m of mods) m.g.userData.tick(time)
      if (flag.visible) flag.userData.wave(time)
    },
  }
  api.setExplode(0); api.setGlass(0); api.setDetail(1)
  return api
}
