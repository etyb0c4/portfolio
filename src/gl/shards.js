import * as THREE from 'three'
import { rng } from './kit.js'

/* The front shell giving way: a sheet of triangular fragments that bursts toward the
   camera, scrubbed by uBurst (0 intact → 1 blown through). Lives on the front face. */

export function createShards() {
  const R = rng(41)
  const COUNT = 96
  const EPI = new THREE.Vector2(-0.22, 0.12) // where the pressure landed

  const pos = [], center = [], rand = [], dir = []
  for (let i = 0; i < COUNT; i++) {
    const cx = (R() - 0.5) * 1.86, cy = (R() - 0.5) * 1.86
    const r = R()
    const away = new THREE.Vector2(cx - EPI.x, cy - EPI.y)
    const d = Math.max(0.2, away.length())
    away.normalize()
    const dx = away.x * (0.7 + R() * 1.2), dy = away.y * (0.7 + R() * 1.2)
    const dz = (0.9 + R() * 1.7) / (0.6 + d) // nearer the impact, the harder it flies out
    const s = 0.065 + R() * 0.16
    const a0 = R() * Math.PI * 2
    for (let k = 0; k < 3; k++) {
      const a = a0 + (k / 3) * Math.PI * 2 + (R() - 0.5) * 0.9
      pos.push(cx + Math.cos(a) * s * (0.6 + R() * 0.8), cy + Math.sin(a) * s * (0.6 + R() * 0.8), 0)
      center.push(cx, cy)
      rand.push(r)
      dir.push(dx, dy, dz)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('aCenter', new THREE.Float32BufferAttribute(center, 2))
  geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rand, 1))
  geo.setAttribute('aDir', new THREE.Float32BufferAttribute(dir, 3))

  const u = { uBurst: { value: 0 }, uTime: { value: 0 } }
  const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: u,
    side: THREE.DoubleSide, transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec2 aCenter; attribute float aRand; attribute vec3 aDir;
      uniform float uBurst, uTime;
      varying float vR; varying float vA;
      void main() {
        vR = aRand;
        float b = uBurst;
        vec2 off = position.xy - aCenter;
        float ang = b * (2.0 + aRand * 9.0) * (aRand > 0.5 ? 1.0 : -1.0);
        float c = cos(ang), s = sin(ang);
        off = mat2(c, -s, s, c) * off;
        vec3 p = vec3(aCenter + off * (1.0 - 0.3 * b), 0.0);
        p += aDir * b * 1.55;
        p.y -= b * b * 0.4 * aRand;           // the heavier bits start to drop
        p.z += sin(uTime * (1.0 + aRand) + aRand * 40.0) * 0.04 * b;
        vA = (1.0 - smoothstep(0.58, 0.96, b)) * step(0.003, b);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uBurst;
      varying float vR; varying float vA;
      void main() {
        if (vA < 0.004) discard;
        vec3 ink = vec3(0.10, 0.098, 0.105) * (0.6 + vR * 1.5);
        vec3 ember = vec3(1.0, 0.33, 0.1);
        float hot = step(0.78, vR) + smoothstep(0.3, 0.0, abs(uBurst - 0.22)) * 0.7;
        gl_FragColor = vec4(mix(ink, ember, clamp(hot, 0.0, 1.0)), vA);
      }`,
  }))
  mesh.frustumCulled = false
  mesh.renderOrder = 4

  // the light that gets out in the instant of rupture
  const flare = new THREE.PointLight('#ff5a1f', 0, 7, 2)
  flare.position.set(-0.2, 0.1, 1.6)

  const group = new THREE.Group()
  group.add(mesh, flare)
  return {
    group, u,
    set(burst, time) {
      u.uBurst.value = burst
      u.uTime.value = time
      flare.intensity = Math.sin(Math.min(1, burst * 1.3) * Math.PI) * 11
    },
  }
}
