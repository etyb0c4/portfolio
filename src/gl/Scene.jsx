import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// 20k points were updated in JS on every frame; at the sizes used here 8k reads the same
// and leaves the main thread free enough for input to stay responsive
const N = 8000

/* ---- formation builders: each returns Float32Array(N*3) ---- */
function sampleText(lines, size = 190, spread = 2.2, scale = 1, yOff = 0) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512
  const c = cv.getContext('2d')
  c.fillStyle = '#000'; c.fillRect(0, 0, 1024, 512)
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'
  c.font = `700 ${size}px Fraunces, Georgia, serif`
  const n = lines.length
  lines.forEach((ln, i) => c.fillText(ln, 512, 256 + (i - (n - 1) / 2) * size * 1.02))
  const d = c.getImageData(0, 0, 1024, 512).data
  const on = []
  for (let y = 0; y < 512; y += 2) for (let x = 0; x < 1024; x += 2) if (d[(y * 1024 + x) * 4] > 128) on.push(x, y)
  const out = new Float32Array(N * 3)
  const m = on.length / 2
  for (let i = 0; i < N; i++) {
    const j = (Math.random() * m | 0) * 2
    out[i * 3]     = (on[j] / 1024 - 0.5) * 48 * scale
    out[i * 3 + 1] = (-(on[j + 1] / 512 - 0.5) * 24) * scale + yOff
    out[i * 3 + 2] = (Math.random() - 0.5) * spread
  }
  return out
}
function core() {
  // a tight, dense, unstable cluster — what the camera "docks" into when opening a project
  const a = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random()
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1), r = Math.pow(Math.random(), 2.2) * 3.2
    a[i*3] = r*Math.sin(ph)*Math.cos(th); a[i*3+1] = r*Math.sin(ph)*Math.sin(th); a[i*3+2] = r*Math.cos(ph) - 4
  }
  return a
}
// Depth of one tunnel repeat. Points store z in [0, TUNNEL_SPAN) and are wrapped around the
// camera at runtime, so the shaft is endless — the dive can last as long as it likes without
// ever flying out the far end into empty space.
const TUNNEL_SPAN = 520

function tunnel() {
  const a = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const th = Math.random() * 6.283
    const z = Math.random() * TUNNEL_SPAN
    const r = 8.5 + Math.sin(z * 0.075) * 2.2 + Math.random() * 3.4   // ribbed, so passing rings read as speed
    a[i*3] = Math.cos(th) * r
    a[i*3+1] = Math.sin(th) * r
    a[i*3+2] = z
  }
  return a
}
function sphere() {
  const a = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random()
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1), r = 9.5 + (Math.random() - 0.5) * 1.2
    a[i*3] = r*Math.sin(ph)*Math.cos(th); a[i*3+1] = r*Math.sin(ph)*Math.sin(th); a[i*3+2] = r*Math.cos(ph)
  }
  return a
}
function grid() {
  const a = new Float32Array(N * 3); const cols = 60, rows = Math.ceil(N / cols)
  for (let i = 0; i < N; i++) {
    const gx = i % cols, gy = (i / cols | 0)
    a[i*3] = (gx/cols - 0.5) * 30
    a[i*3+1] = (gy/rows - 0.5) * 18
    a[i*3+2] = Math.sin(gx*0.5)*Math.cos(gy*0.5) * 2.5
  }
  return a
}
function wave() {
  const a = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const x = (Math.random()-0.5)*34, z = (Math.random()-0.5)*20
    a[i*3] = x; a[i*3+1] = Math.sin(x*0.35)*2.4 + Math.cos(z*0.4)*1.8; a[i*3+2] = z
  }
  return a
}

const VERT = /* glsl */`
  attribute float aRand;
  uniform float uSize;
  varying float vR;
  void main(){
    vR = aRand;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mv.z) * (0.5 + aRand);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uBlood; uniform vec3 uEmber; uniform float uHeat;
  varying float vR;
  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uBlood, uEmber, clamp(vR * (0.4 + uHeat), 0.0, 1.0));
    col += uEmber * pow(1.0 - d*2.0, 3.0) * 0.5 * uHeat;
    gl_FragColor = vec4(col, a * (0.08 + 0.24*uHeat));
  }
`

export default function Scene() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25))
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400)
    cam.position.set(0, 0, 48)

    let forms = []
    const geo = new THREE.BufferGeometry()
    const cur = new Float32Array(N * 3)
    const rand = new Float32Array(N)
    for (let i = 0; i < N; i++) rand[i] = Math.random()

    const uniforms = {
      uSize:  { value: 0.78 },
      uHeat:  { value: 0 },
      uBlood: { value: new THREE.Color('#b4342b') },
      uEmber: { value: new THREE.Color('#ff6a5a') },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    let points

    // composer + bloom
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, cam))
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.32, 0.0)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    let coreShape, tunnelShape
    const buildForms = () => {
      forms = [
        sampleText(['RAYAN', 'SAMA'], 175, 0.8, 0.82, 1.5), // 0 hero
        wave(),                                   // 1 manifesto
        grid(),                                   // 2 projects
        sphere(),                                 // 3 arsenal
        sampleText(['ROOT'], 300, 1.0, 0.62, 7.5),   // 4 root
      ]
      coreShape = core()
      tunnelShape = tunnel()
      // scatter start (from boot): explode outward
      const scatter = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) {
        const r = 60 + Math.random() * 60, th = Math.random() * 6.28, ph = Math.acos(2*Math.random()-1)
        scatter[i*3] = r*Math.sin(ph)*Math.cos(th); scatter[i*3+1] = r*Math.sin(ph)*Math.sin(th); scatter[i*3+2] = r*Math.cos(ph)
      }
      cur.set(scatter)
      geo.setAttribute('position', new THREE.BufferAttribute(cur, 3))
      geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200)
      if (!points) { points = new THREE.Points(geo, mat); scene.add(points) }
    }

    const resize = () => {
      const w = innerWidth, h = innerHeight
      renderer.setSize(w, h); composer.setSize(w, h)
      cam.aspect = w / h; cam.updateProjectionMatrix()
      bloom.resolution.set(w, h)
    }

    buildForms(); resize()
    // upgrade text shape once Fraunces is ready
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { forms[0] = sampleText(['RAYAN','SAMA'],175,0.8,0.82,1.5); forms[4] = sampleText(['ROOT'],300,1.0,0.62,7.5) })
    addEventListener('resize', resize)

    const target = new THREE.Vector2(0, 0), mouse = new THREE.Vector2(0, 0)
    const onMove = e => target.set((e.clientX/innerWidth)*2-1, (e.clientY/innerHeight)*2-1)
    addEventListener('pointermove', onMove)

    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf) }
    const onRestored = () => { resize(); tick() }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    let raf, t0 = performance.now()
    const look = new THREE.Vector3()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || (window.__gl && window.__gl.render === false)) return
      const now = performance.now(), time = (now - t0) / 1000
      const p = (window.__gl && window.__gl.progress) || 0
      const extraHeat = (window.__gl && window.__gl.heat) || 0
      const entered = window.__gl && window.__gl.entered
      const dock = (window.__gl && window.__gl.dock) || 0
      const fall = (window.__gl && window.__gl.fall) || 0
      const fallDepth = (window.__gl && window.__gl.fallDepth) || 0
      uniforms.uHeat.value += ((Math.min(1, p * 0.8 + extraHeat) + (entered?0.15:0) + dock*0.7 + fall*0.9) - uniforms.uHeat.value) * 0.07
      if (window.__gl) window.__gl.heat *= 0.94

      if (forms.length && points) {
        // pick formation blend from progress (or scatter->form0 on entry)
        const seg = p * (forms.length - 1)
        const i0 = Math.min(forms.length - 1, Math.floor(seg))
        const i1 = Math.min(forms.length - 1, i0 + 1)
        const f = seg - i0
        const A = forms[i0], B = forms[i1]
        const k = ((typeof location!=='undefined' && location.search.includes('snap')) ? 1 : (entered ? 0.09 : 0.02)) + dock * 0.35 + fall * 0.4
        const pos = geo.attributes.position.array
        // update a subset each frame for perf? full is fine at 24k
        for (let i = 0; i < N; i++) {
          const ix = i*3
          const bx = A[ix]   + (B[ix]   - A[ix])   * f
          const by = A[ix+1] + (B[ix+1] - A[ix+1]) * f
          const bz = A[ix+2] + (B[ix+2] - A[ix+2]) * f
          // docking into a project pulls the field into a tight unstable core; falling pulls it
          // into the shaft, whose depth wraps so the walls stream past forever
          let tunZ = tunnelShape[ix+2]
          if (fall > 0) {
            const u = (((tunnelShape[ix+2] - fallDepth) % TUNNEL_SPAN) + TUNNEL_SPAN) % TUNNEL_SPAN
            tunZ = 60 - u
          }
          const tx = bx + (coreShape[ix]   - bx) * dock + (tunnelShape[ix]   - bx) * fall
          const ty = by + (coreShape[ix+1] - by) * dock + (tunnelShape[ix+1] - by) * fall
          const tz = bz + (coreShape[ix+2] - bz) * dock + (tunZ - bz) * fall
          // gentle breathing
          const br = 1 + Math.sin(time*0.6 + rand[i]*6.28) * 0.02
          pos[ix]   += (tx*br - pos[ix])   * k
          pos[ix+1] += (ty*br - pos[ix+1]) * k
          // a wrapped point must jump, not glide, or it streaks across the whole shaft
          const dz = tz*br - pos[ix+2]
          pos[ix+2] = Math.abs(dz) > TUNNEL_SPAN * 0.5 ? tz*br : pos[ix+2] + dz * k
        }
        geo.attributes.position.needsUpdate = true
        points.rotation.y = mouse.x * 0.16 * (1 - fall)
        points.rotation.x = mouse.y * 0.08 * (1 - fall)
        points.rotation.z = fall * time * 0.22
      }

      if (window.__gl && window.__gl.colA) { uniforms.uBlood.value.setRGB(window.__gl.colA[0], window.__gl.colA[1], window.__gl.colA[2]); uniforms.uEmber.value.setRGB(window.__gl.colB[0], window.__gl.colB[1], window.__gl.colB[2]) }
      mouse.lerp(target, 0.05)
      // camera: push in with progress + mouse parallax, rushes forward hard while docking into a project or falling through the shaft
      const camZ = 48 - p * 12 - dock * 34
      cam.position.x += (mouse.x * 6 - cam.position.x) * 0.04
      cam.position.y += (-mouse.y * 4 - cam.position.y) * 0.04
      // during the fall the camera dives past the origin; snap to the target instead of
      // easing so the dive actually reads as speed rather than a slow drift
      cam.position.z += (camZ - cam.position.z) * 0.04
      // look straight down the shaft while falling
      if (fall > 0.01) { look.set(0, 0, cam.position.z - 30); cam.lookAt(look) }
      else cam.lookAt(0, 0, 0)

      composer.render()
    }
    tick()

    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      renderer.dispose(); geo.dispose(); mat.dispose(); composer.dispose() }
  }, [])
  return <canvas id="fg-canvas" ref={ref} />
}
