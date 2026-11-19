import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { FULL_VERT, BACK_FRAG, OVER_FRAG } from './glsl.js'

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
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  const flat = new THREE.Camera()

  // studio light without a single downloaded file: a small room baked into an environment map
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
  pmrem.dispose()

  const back = fullscreen(BACK_FRAG, {
    uTime: { value: 0 }, uAspect: { value: 1 }, uDark: { value: 0 }, uRage: { value: 0 }, uPool: { value: new THREE.Vector2(0.5, 0.55) },
  })
  const over = fullscreen(OVER_FRAG, {
    uTime: { value: 0 }, uAspect: { value: 1 }, uGrain: { value: 0.045 }, uVig: { value: 0.16 }, uFade: { value: 1 },
    uFadeCol: { value: new THREE.Color('#0c0c0d') }, uLens: { value: new THREE.Vector4(0, 0, 1, 0) },
  }, { transparent: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor })

  let aspect = 1, cap = 1.5
  const resize = (w, h) => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))
    renderer.setSize(w, h, false)
    aspect = w / h
    back.u.uAspect.value = over.u.uAspect.value = aspect
  }

  const render = (time, scene, camera) => {
    back.u.uTime.value = over.u.uTime.value = time
    renderer.clear()
    renderer.render(back.scene, flat)
    renderer.clearDepth()
    renderer.render(scene, camera)
    renderer.render(over.scene, flat)
  }

  // step the resolution down when frames run long; false once there is nothing left to give
  const lower = () => { if (cap <= 0.75) return false; cap = cap > 1 ? 1 : 0.75; return true }

  return { renderer, env, lower, back: back.u, over: over.u, resize, render, get aspect() { return aspect }, get dpr() { return renderer.getPixelRatio() } }
}
