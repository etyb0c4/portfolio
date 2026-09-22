import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* Fullscreen domain-warped fbm — the living "ink" field.
   Intensity + heat rise with uProgress (0 = cold boot, 1 = root). */

const VERT = /* glsl */`
  precision highp float;
  attribute vec2 position;
  varying vec2 vUv;
  void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform vec2  uRes;
  uniform float uTime;
  uniform float uProgress;
  uniform float uHeat;
  uniform vec2  uMouse;
  uniform vec3  uColA;
  uniform vec3  uColB;

  float hash(vec2 p){ p=fract(p*vec2(233.34,851.73)); p+=dot(p,p+23.45); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
  }
  // ridged multifractal -> filaments (3 octaves: this renders at low res and is upscaled,
  // so extra octaves cost a lot and show almost nothing)
  float ridged(vec2 p){
    float v=0., a=0.55, tot=0.; mat2 m=mat2(1.7,1.1,-1.1,1.7);
    for(int i=0;i<3;i++){
      float n=noise(p); n=1.0-abs(n*2.0-1.0); n=n*n;
      v+=a*n; tot+=a; p=m*p*1.02; a*=0.5;
    }
    return v/tot;
  }
  float fbm(vec2 p){ float v=0.,a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
    for(int i=0;i<3;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }

  void main(){
    vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;
    float t=uTime*0.05;

    // slow drifting domain warp
    vec2 w=vec2(fbm(uv*1.2+t*0.8), fbm(uv*1.2-t*0.7+5.2));
    vec2 p=uv*1.35 + 0.9*w;

    // flowing filaments
    float fil=ridged(p*1.6 + vec2(0.0, t*1.4));
    fil=pow(fil, 2.2);

    // large soft nebula for depth
    float neb=fbm(uv*0.9 - t*0.4);

    // mouse ember well
    float md=length(uv-uMouse*0.62);
    float well=exp(-md*3.2);

    float heat=clamp(uProgress*0.75 + uHeat, 0.0, 1.5);

    // palette
    vec3 cVoid =vec3(0.031,0.021,0.025);
    vec3 cInk  =uColA*0.10;
    vec3 cBlood=uColA;
    vec3 cEmber=uColB;

    vec3 col=cVoid;
    col=mix(col,cInk, smoothstep(0.2,0.9,neb)*0.9);
    // filaments glow, brighter with heat
    float glow=fil*(0.22+1.05*heat);
    col=mix(col,cBlood, clamp(glow,0.0,1.0));
    col+=cEmber*pow(fil,2.4)*(0.35+heat)*1.0;
    // mouse well ignites nearby filaments
    col+=cEmber*well*fil*1.4;
    col+=cBlood*well*0.15;

    // drifting sparks
    float sp=pow(noise(uv*7.0+vec2(t*0.6,-t*5.0)),24.0);
    col+=cEmber*sp*(0.5+heat);

    // vignette + faint grain
    float vig=smoothstep(1.35,0.2,length(uv*vec2(0.82,1.0)));
    col*=vig;
    col+=(hash(gl_FragCoord.xy+uTime)-0.5)*0.02;

    float expo=mix(0.28,0.62,clamp(heat,0.0,1.0));
  col*=expo;
  // scrim gauche pour lisibilite du texte
  float readX=smoothstep(-0.15,0.6,uv.x);
  col*=mix(0.42,1.0,readX);
  gl_FragColor=vec4(max(col,0.0),1.0);
  }
`

export default function Background(){
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:false, powerPreference:'high-performance' })
    // it's a soft out-of-focus nebula — rendering it at half resolution and letting the
    // browser upscale is visually indistinguishable and ~4x cheaper
    renderer.setPixelRatio(0.5)
    const scene = new THREE.Scene()
    const cam = new THREE.Camera()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1, 3,-1, -1,3]), 2))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 10)
    const uniforms = {
      uRes:      { value: new THREE.Vector2() },
      uTime:     { value: 0 },
      uProgress: { value: 0 },
      uHeat:     { value: 0 },
      uMouse:    { value: new THREE.Vector2(0,0) },
      uColA:     { value: new THREE.Vector3(0.706,0.204,0.169) },
      uColB:     { value: new THREE.Vector3(1.0,0.42,0.35) },
    }
    const mat = new THREE.RawShaderMaterial({ vertexShader:VERT, fragmentShader:FRAG, uniforms })
    scene.add(new THREE.Mesh(geo, mat))

    const resize = () => {
      const w = innerWidth, h = innerHeight
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio())
    }
    resize(); addEventListener('resize', resize)

    const mouse = new THREE.Vector2(0,0), target = new THREE.Vector2(0,0)
    const onMove = e => { target.set((e.clientX/innerWidth)*2-1, -((e.clientY/innerHeight)*2-1)) }
    addEventListener('pointermove', onMove)

    // a lost context paints the page black and never recovers on its own
    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf) }
    const onRestored = () => { resize(); tick() }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    let raf, start = performance.now()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || (window.__gl && window.__gl.render === false)) return
      const now = performance.now()
      uniforms.uTime.value = (now - start) / 1000
      // progress + heat come from globals set by scroll/events
      const p = (window.__gl && window.__gl.progress) || 0
      const h = (window.__gl && window.__gl.heat) || 0
      uniforms.uProgress.value += (p - uniforms.uProgress.value) * 0.05
      uniforms.uHeat.value     += (h - uniforms.uHeat.value) * 0.08
      if (window.__gl) window.__gl.heat *= 0.94
      if (window.__gl && window.__gl.colA) { uniforms.uColA.value.set(window.__gl.colA[0],window.__gl.colA[1],window.__gl.colA[2]); uniforms.uColB.value.set(window.__gl.colB[0],window.__gl.colB[1],window.__gl.colB[2]) }
      mouse.lerp(target, 0.06); uniforms.uMouse.value.copy(mouse)
      renderer.render(scene, cam)
    }
    tick()

    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      renderer.dispose(); geo.dispose(); mat.dispose() }
  }, [])
  return <canvas id="bg-canvas" ref={ref} />
}
