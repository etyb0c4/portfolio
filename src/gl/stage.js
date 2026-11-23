import * as THREE from 'three'
import { FULL_VERT, TRAIL_FRAG, BACK_FRAG, OVER_FRAG } from './glsl.js'

const tri = () => {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
  return g
}

const fullscreen = (fragmentShader, uniforms, extra = {}) => {
  const m = new THREE.Mesh(tri(), new THREE.ShaderMaterial({ vertexShader: FULL_VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false, ...extra }))
  m.frustumCulled = false
  const s = new THREE.Scene()
  s.add(m)
  return { scene: s, u: uniforms }
}

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.autoClear = false
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.NoToneMapping
  const flat = new THREE.Camera()

  const mkTarget = () => new THREE.WebGLRenderTarget(256, 256, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })
  let ta = mkTarget(), tb = mkTarget()
  const trail = fullscreen(TRAIL_FRAG, {
    uPrev: { value: null }, uA: { value: new THREE.Vector2(0.5, 0.5) }, uB: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 }, uSize: { value: 0.05 }, uFade: { value: 0.96 }, uSub: { value: 0.003 }, uOn: { value: 0 },
  })

  const back = fullscreen(BACK_FRAG, {
    uTime: { value: 0 }, uAspect: { value: 1 }, uTrail: { value: null }, uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uIce: { value: 1 }, uSky: { value: 0 }, uSkyRich: { value: 0 }, uCurtain: { value: 0 }, uDeep: { value: 0 }, uWorld: { value: 0 }, uMelt: { value: 0 },
    uTS: { value: 0 }, uSun: { value: 0 }, uMoon: { value: 0 }, uDark: { value: 0 }, uBurst: { value: 0 }, uRed: { value: 0 }, uBlue: { value: 0 }, uMix: { value: 0 }, uPurple: { value: 0 }, uCenter: { value: new THREE.Vector2(0, 0) },
  })

  const over = fullscreen(OVER_FRAG, {
    uTime: { value: 0 }, uAspect: { value: 1 }, uCloud: { value: 0 }, uOpen: { value: 0 },
    uBlack: { value: 0 }, uWhite: { value: 0 }, uGrain: { value: 0.05 }, uVig: { value: 0.25 },
  }, { transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor })

  let aspect = 1, cap = 1.5
  const resize = (w, h) => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))
    renderer.setSize(w, h, false)
    aspect = w / h
    trail.u.uAspect.value = back.u.uAspect.value = over.u.uAspect.value = aspect
  }

  // a/b are the previous and current pointer positions in 0..1, y up
  const stamp = (a, b, on, opts) => {
    trail.u.uPrev.value = ta.texture
    trail.u.uA.value.set(a.x, a.y); trail.u.uB.value.set(b.x, b.y)
    trail.u.uOn.value = on
    trail.u.uSize.value = opts.size; trail.u.uFade.value = opts.fade; trail.u.uSub.value = opts.sub
    renderer.setRenderTarget(tb)
    renderer.render(trail.scene, flat)
    renderer.setRenderTarget(null)
    ;[ta, tb] = [tb, ta]
    back.u.uTrail.value = ta.texture
  }

  const render = (time, scene, camera) => {
    back.u.uTime.value = over.u.uTime.value = time
    renderer.clear()
    renderer.render(back.scene, flat)
    if (scene) { renderer.clearDepth(); renderer.render(scene, camera) }
    renderer.render(over.scene, flat)
  }

  // step the resolution down when frames run long; false once there is nothing left to give
  const lower = () => { if (cap <= 0.75) return false; cap = cap > 1 ? 1 : 0.75; return true }

  return { renderer, lower, back: back.u, over: over.u, resize, stamp, render, get aspect() { return aspect } }
}
