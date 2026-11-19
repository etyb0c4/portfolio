export const NOISE = /* glsl */ `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}`

export const FULL_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`

// The studio: a paper sweep with a soft pool of light behind the subject. uDark is the lights going out.
export const BACK_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uDark, uRage;
uniform vec2 uPool;
${NOISE}
void main() {
  vec2 q = (vUv - uPool) * vec2(uAspect, 1.0);
  float pool = exp(-dot(q, q) * 1.5);
  vec3 paper = mix(vec3(0.872, 0.868, 0.850), vec3(0.940, 0.936, 0.920), smoothstep(0.0, 0.85, vUv.y));
  paper += pool * 0.038;
  vec3 night = mix(vec3(0.026, 0.028, 0.034), vec3(0.046, 0.050, 0.064), smoothstep(0.0, 1.0, vUv.y));
  night += pool * vec3(0.016, 0.026, 0.060);
  vec3 col = mix(paper, night, uDark);
  vec3 rage = mix(vec3(0.050, 0.010, 0.007), vec3(0.165, 0.030, 0.013), smoothstep(0.0, 0.9, vUv.y));
  rage += pool * vec3(0.24, 0.055, 0.02);
  rage *= 0.93 + 0.07 * sin(uTime * 2.3);
  col = mix(col, rage, uRage);
  col += (vnoise(vUv * vec2(uAspect, 1.0) * 3.0 + uTime * 0.02) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`

// Everything that sits on top of the picture: the inside of the lens, vignette, grain, and the fade.
export const OVER_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uGrain, uVig, uFade;
uniform vec3 uFadeCol;
uniform vec4 uLens;
${NOISE}
vec4 over(vec4 under, vec3 c, float a) { return vec4(c * a, a) + under * (1.0 - a); }
void main() {
  vec4 acc = vec4(0.0);
  float d = distance(gl_FragCoord.xy, uLens.xy);
  float inside = uLens.w * (1.0 - smoothstep(uLens.z * 0.9, uLens.z, d));
  float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 1.9 + uTime * 5.0);
  acc = over(acc, vec3(0.62, 0.80, 1.0), inside * (0.035 + 0.028 * scan));
  acc = over(acc, vec3(0.0), inside * smoothstep(uLens.z * 0.55, uLens.z, d) * 0.22);
  vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
  acc = over(acc, vec3(0.0), uVig * smoothstep(0.45, 1.25, length(q)));
  float n = hash(gl_FragCoord.xy + fract(uTime) * 91.7);
  acc = over(acc, vec3(n), uGrain);
  acc = over(acc, uFadeCol, uFade);
  gl_FragColor = acc;
}`

// The bench: a measuring grid that fades out before any horizon, plus the hub's turntable marks.
export const FLOOR_VERT = /* glsl */ `
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`

export const FLOOR_FRAG = /* glsl */ `
precision highp float;
varying vec3 vW;
uniform float uDark, uHub, uRage;
uniform vec3 uHomes[5];
float grid(vec2 p, float s) { vec2 c = p / s; vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c); return 1.0 - min(min(g.x, g.y), 1.0); }
float line(float v) { return 1.0 - smoothstep(0.0, 1.5, abs(v) / fwidth(v)); }
void main() {
  vec2 p = vW.xz;
  float r = length(p);
  float fade = smoothstep(19.0, 2.5, r);
  float a = (grid(p, 0.5) * 0.045 + grid(p, 2.0) * 0.075) * fade;
  float marks = line(r - 7.4) * 0.5 + line(r - 7.62) * 0.22;
  for (int i = 0; i < 5; i++) {
    vec2 q = abs(p - uHomes[i].xz);
    marks += line(max(q.x, q.y) - 1.22) * 0.4 * uHomes[i].y;
  }
  a += marks * 0.24 * uHub;
  vec3 col = mix(mix(vec3(0.04), vec3(0.30, 0.46, 1.0), uDark), vec3(1.0, 0.30, 0.10), uRage);
  gl_FragColor = vec4(col, a * mix(1.0, 2.6, max(uDark, uRage * 0.8)));
}`
