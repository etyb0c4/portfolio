import * as THREE from 'three'
import { rng } from './kit.js'

/* The air of the workshop: dust in the light, a shaft from the skylight,
   and the small hardware that floats free once the box is open. */

export function createAir() {
  const group = new THREE.Group()
  const R = rng(23)

  /* ── dust motes drifting through the pool of light ── */
  const N = 260
  const pos = new Float32Array(N * 3), seed = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (R() - 0.5) * 11
    pos[i * 3 + 1] = R() * 5.6
    pos[i * 3 + 2] = (R() - 0.5) * 11
    seed[i] = R() * 100
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const dustU = { uTime: { value: 0 }, uDark: { value: 0 }, uRage: { value: 0 }, uSize: { value: 1 } }
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    uniforms: dustU,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uSize;
      varying float vA;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.055 + fract(aSeed * 0.13) * 0.06), 5.6);
        p.x += sin(uTime * 0.21 + aSeed) * 0.35;
        p.z += cos(uTime * 0.17 + aSeed * 1.7) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float d = -mv.z;
        vA = smoothstep(0.4, 1.6, d) * smoothstep(26.0, 9.0, d) * (0.4 + 0.6 * fract(aSeed * 0.37));
        gl_PointSize = (2.4 + fract(aSeed * 0.71) * 3.2) * uSize * (6.5 / d);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uDark, uRage;
      varying float vA;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.08, r) * vA;
        vec3 day = vec3(0.55, 0.53, 0.49);
        vec3 night = vec3(0.45, 0.55, 0.95);
        vec3 col = mix(mix(day, night, uDark), vec3(1.0, 0.42, 0.12), uRage);
        gl_FragColor = vec4(col, a * (mix(0.16, 0.30, uDark) + 0.26 * uRage));
      }`,
  }))
  dust.frustumCulled = false
  group.add(dust)

  /* ── the shaft of light from the skylight, down onto the bench ── */
  const shaftU = { uShaft: { value: 0 }, uDark: { value: 0 } }
  const shaftGeo = new THREE.CylinderGeometry(1.15, 2.7, 7.2, 40, 1, true)
  const shaft = new THREE.Mesh(shaftGeo, new THREE.ShaderMaterial({
    uniforms: shaftU,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vY = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uShaft, uDark;
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
        float a = edge * smoothstep(0.02, 0.5, vY) * (0.5 + 0.5 * vY) * uShaft;
        vec3 day = vec3(1.0, 0.97, 0.9);
        vec3 night = vec3(0.5, 0.62, 1.0);
        gl_FragColor = vec4(mix(day, night, uDark), a * 0.16);
      }`,
  }))
  shaft.position.y = 3.6
  shaft.renderOrder = 3
  group.add(shaft)

  /* ── loose hardware, free of gravity once the box is open ── */
  const M = 44
  const bits = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.05, 6),
    new THREE.MeshStandardMaterial({ color: '#3a3c40', roughness: 0.35, metalness: 0.9 }),
    M,
  )
  const home = [], mat4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), vs = new THREE.Vector3()
  for (let i = 0; i < M; i++) {
    const a = R() * Math.PI * 2, rad = 1.7 + R() * 1.8
    home.push({ x: Math.cos(a) * rad, y: 0.6 + R() * 2.4, z: Math.sin(a) * rad, s: R() * 100, r: 0.2 + R() * 0.6 })
  }
  bits.count = 0
  group.add(bits)

  let dpr = 1
  return {
    group,
    setDpr(v) { dpr = v },
    update(time, { dark, explode, rage = 0 }) {
      dustU.uTime.value = time
      dustU.uDark.value = dark
      dustU.uRage.value = rage
      dustU.uSize.value = dpr
      shaftU.uDark.value = dark
      // the shaft belongs to the open box: swells while it is apart, almost gone otherwise
      shaftU.uShaft.value = (0.22 + 0.78 * explode) * (1 - dark * 0.55)
      const k = Math.max(0, (explode - 0.45) / 0.55)
      bits.count = Math.round(M * Math.min(1, k * 1.4))
      if (bits.count) {
        for (let i = 0; i < bits.count; i++) {
          const h = home[i]
          vs.set(h.x, h.y + Math.sin(time * h.r + h.s) * 0.14, h.z)
          e.set(time * h.r * 0.7 + h.s, time * h.r * 0.5, h.s)
          q.setFromEuler(e)
          const s = Math.min(1, k * 2 - i / M)
          mat4.compose(vs, q, new THREE.Vector3(s, s, s))
          bits.setMatrixAt(i, mat4)
        }
        bits.instanceMatrix.needsUpdate = true
      }
    },
  }
}
