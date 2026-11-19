import * as THREE from 'three'
import { createHero, H } from './box.js'
import { createAir } from './air.js'
import { createShards } from './shards.js'
import { FLOOR_VERT, FLOOR_FRAG } from './glsl.js'

const CENTRE = 1.07 // height of the middle of the box when it stands on the bench
const FOV = 30

export function createScene(stage) {
  const scene = new THREE.Scene()
  scene.environment = stage.env

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120)
  const hero = createHero()
  scene.add(hero.group)
  const air = createAir()
  scene.add(air.group)
  const shards = createShards()
  shards.group.position.z = H + 0.04
  hero.body.add(shards.group)
  const FOG_DAY = new THREE.Color('#dad8d2'), FOG_NIGHT = new THREE.Color('#05060a'), FOG_RAGE = new THREE.Color('#170503')
  scene.fog = new THREE.FogExp2(FOG_DAY.clone(), 0.016)

  const key = new THREE.DirectionalLight('#ffffff', 2.3)
  key.position.set(4.5, 8, 5.5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 24 })
  const fill = new THREE.HemisphereLight('#ffffff', '#8a8780', 0.55)
  scene.add(key, fill)

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.24 }))
  catcher.receiveShadow = true
  const floorU = { uDark: { value: 0 }, uHub: { value: 0 }, uRage: { value: 0 }, uHomes: { value: Array.from({ length: 5 }, () => new THREE.Vector3()) } }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, uniforms: floorU, transparent: true, depthWrite: false,
  }))
  floor.position.y = 0.002
  floor.renderOrder = -1
  scene.add(catcher, floor)

  const dir = new THREE.Vector3(), right = new THREE.Vector3(), c = new THREE.Vector3(), v = new THREE.Vector3()
  const UP = new THREE.Vector3(0, 1, 0)
  const lens = { x: 0, y: 0, k: 0 }
  let size = { w: 1, h: 1 }

  return {
    scene, camera, hero,
    resize(w, h) { size = { w, h }; camera.aspect = w / h; camera.updateProjectionMatrix() },

    /* G is the picture at this point of the page; pointer is in CSS pixels (or null when there is none) */
    update(G, time, dt, pointer) {
      hero.group.position.y = G.explode * 0.95 + (G.drop || 0)
      hero.setExplode(G.explode, G.burst * 2.4 * (1 - G.explode))
      hero.setGlass(G.glass)
      hero.setDetail(G.detail)
      hero.setSeam(G.seam)
      hero.update(time)

      const az = G.az + G.turn, el = G.el
      dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
      right.crossVectors(UP, dir).normalize()
      c.set(0, CENTRE + hero.group.position.y * 0.8 - G.rise, 0).addScaledVector(right, -G.shift)
      camera.position.copy(c).addScaledVector(dir, G.dist)
      camera.lookAt(c)
      if (G.shake > 0.001) {
        camera.position.x += Math.sin(time * 61) * 0.045 * G.shake
        camera.position.y += Math.cos(time * 47) * 0.035 * G.shake
        camera.rotation.z += Math.sin(time * 71) * 0.006 * G.shake
      }
      camera.updateMatrixWorld()

      key.intensity = 2.3 - 1.5 * G.dark
      fill.intensity = 0.55 - 0.3 * G.dark
      scene.environmentIntensity = 1 - 0.45 * G.dark
      catcher.material.opacity = 0.24 * (1 - G.dark)
      floorU.uDark.value = G.dark
      stage.back.uDark.value = G.dark
      scene.fog.color.lerpColors(FOG_DAY, FOG_NIGHT, G.dark).lerp(FOG_RAGE, G.rage)
      scene.fog.density = 0.016 + 0.012 * G.dark + 0.012 * G.rage
      stage.back.uRage.value = G.rage
      stage.over.uGrain.value = 0.045 + 0.075 * G.rage
      floorU.uRage.value = G.rage
      key.intensity -= 1.9 * G.rage * (1 - G.dark)
      scene.environmentIntensity -= 0.5 * G.rage
      air.setDpr(stage.dpr)
      air.update(time, G)
      shards.set(G.burst, time)
      stage.over.uVig.value = 0.14 + 0.3 * G.dark + 0.3 * G.rage
      stage.over.uFade.value = Math.max(G.fade, G.dim)

      // where the box sits on screen, to place the pool of light and to know when the pointer is on it
      v.set(0, CENTRE + hero.group.position.y, 0).project(camera)
      const bx = (v.x * 0.5 + 0.5) * size.w, by = (-v.y * 0.5 + 0.5) * size.h
      stage.back.uPool.value.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5)
      const radius = (H * 1.25 / (G.dist * Math.tan(THREE.MathUtils.degToRad(FOV / 2)))) * size.h * 0.5

      // the lens: follows the pointer over the box; without a pointer it wanders across the box by itself
      let tx, ty, want
      if (pointer) {
        tx = pointer.x; ty = pointer.y
        want = Math.hypot(tx - bx, ty - by) < radius * 1.5 ? 1 : 0
      } else {
        tx = bx + Math.cos(time * 0.55) * radius * 0.42; ty = by + Math.sin(time * 0.8) * radius * 0.34
        want = 1
      }
      const f = 1 - Math.exp(-dt * 12)
      lens.x += (tx - lens.x) * f; lens.y += (ty - lens.y) * f
      lens.k += (want * G.lens - lens.k) * (1 - Math.exp(-dt * 7))
      const dpr = stage.dpr
      stage.over.uLens.value.set(lens.x * dpr, (size.h - lens.y) * dpr, radius * 0.62 * dpr, lens.k)
      // the shared lens uniform is the same object the shell materials read
      const L = hero.lens
      L.uLens.value.copy(stage.over.uLens.value)
      L.uLensDepth.value = G.dist

      return { bx, by, radius, lens: lens.k }
    },

    /* screen position of a named point on the box, for the callouts */
    locate(id, out) {
      const a = hero.anchors[id]
      if (!a) return null
      a.getWorldPosition(v).project(camera)
      out.x = (v.x * 0.5 + 0.5) * size.w; out.y = (-v.y * 0.5 + 0.5) * size.h
      return out
    },
  }
}
