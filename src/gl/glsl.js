export const NOISE = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash22(vec2 p){ float n = hash21(p); return vec2(n, hash21(p + n + 17.13)); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(17.3, 9.1); a *= 0.5; } return s; }
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(17.3, 9.1); a *= 0.5; } return s; }
// x: distance to the nearest cell border, yz: vector to the nearest cell point
vec3 voro(vec2 x){
  vec2 n = floor(x), f = fract(x); vec2 mg = vec2(0.0), mr = vec2(0.0); float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j)); vec2 r = g + hash22(n + g) - f; float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  md = 8.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j)); vec2 r = g + hash22(n + g) - f;
    if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
  }
  return vec3(md, mr);
}
`

export const FULL_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const TRAIL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev; uniform vec2 uA, uB; uniform float uAspect, uSize, uFade, uSub, uOn;
void main(){
  float prev = texture2D(uPrev, vUv).r;
  vec2 p = vUv, a = uA, b = uB; p.x *= uAspect; a.x *= uAspect; b.x *= uAspect;
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float s = smoothstep(uSize, uSize * 0.15, length(pa - ba * h)) * uOn;
  gl_FragColor = vec4(max(max(prev * uFade - uSub, 0.0), s), 0.0, 0.0, 1.0);
}
`

export const BACK_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uIce, uSky, uSkyRich, uCurtain, uDeep, uWorld, uMelt, uRift, uDive, uDiveT;
uniform sampler2D uTrail;
uniform vec2 uPointer;
${NOISE}

vec3 sceneSeal(vec2 p, float tr){
  vec2 w = vec2(fbm3(p * 1.25 + 1.7), fbm3(p * 1.25 + 8.2)) - 0.5;
  vec2 q = p * 0.95 + w * 1.05;
  vec2 x1 = q * 1.05 + 3.7;
  vec3 v1 = voro(x1);
  float major = smoothstep(0.030, 0.0, v1.x);
  float halo = smoothstep(0.26, 0.0, v1.x);
  float tone = hash21(floor((x1 + v1.yz) * 6.0 + 0.5));
  vec3 v2 = voro(q * 2.6 + 9.1 + w * 0.7);
  float patchy = smoothstep(0.42, 0.72, fbm3(p * 1.7 + 4.0));
  float minor = smoothstep(0.016, 0.0, v2.x) * patchy;
  float frost = fbm(q * 3.4 + uTime * 0.01);
  float fine = fbm3(p * 21.0);
  float s1 = smoothstep(0.80, 1.0, vnoise(vec2(dot(p, vec2(0.82, 0.57)) * 2.6 + 3.0, dot(p, vec2(-0.57, 0.82)) * 120.0)));
  float s2 = smoothstep(0.84, 1.0, vnoise(vec2(dot(p, vec2(0.30, -0.95)) * 3.1, dot(p, vec2(0.95, 0.30)) * 150.0 + 9.0)));
  float scratch = (s1 * smoothstep(0.45, 0.8, fbm3(p * 1.1 + 12.0)) + s2 * smoothstep(0.5, 0.8, fbm3(p * 1.3 + 30.0))) * 0.5;
  float pool = smoothstep(1.7, 0.0, length(p - vec2(0.0, -0.45)));
  float g = 0.30 * frost + 0.08 * fine + tone * 0.10 + halo * 0.12 + minor * 0.2 + scratch * 0.3;
  // black lacquer, brushed; the crack web barely catches the light
  vec3 col = mix(vec3(0.040, 0.040, 0.045), vec3(0.105, 0.103, 0.11), clamp(g, 0.0, 1.0));
  col += vec3(0.16, 0.155, 0.15) * major * 0.5;
  col += vec3(0.30, 0.18, 0.12) * pool * 0.16;
  col *= 1.0 - 0.38 * smoothstep(0.7, 2.1, length(p * vec2(0.8, 1.0)));
  // the trace: heat in the cracks, then the lacquer gives on an ember bed
  float wob = fbm3(p * 9.0 + uTime * 0.35);
  float t = tr * (0.72 + 0.56 * wob);
  float open = smoothstep(0.34, 0.62, t);
  float rim = smoothstep(0.06, 0.34, t) * (1.0 - smoothstep(0.5, 0.9, t));
  vec3 under = mix(vec3(0.72, 0.16, 0.04), vec3(1.0, 0.46, 0.12), fbm3(p * 3.0 - uTime * 0.2));
  col += vec3(1.0, 0.31, 0.10) * (major + halo * 0.4) * smoothstep(0.02, 0.3, t) * 1.2;
  col = mix(col, under, open * 0.94);
  col += vec3(1.0, 0.7, 0.4) * rim * 1.1;
  col = mix(col, vec3(0.925, 0.92, 0.905), uMelt);
  return col;
}

vec3 sceneSky(vec2 p){
  // the paper studio: warm sweep, a pool of light, the faintest drift of dust
  vec3 base = mix(vec3(0.845, 0.84, 0.822), vec3(0.95, 0.946, 0.932), smoothstep(-1.15, 0.6, p.y - abs(p.x) * 0.12));
  vec2 q = p * 0.9 + vec2(uTime * 0.012, 0.0);
  float c = fbm(q * 1.6 + fbm3(q * 2.2 + 3.0) * 0.8);
  float pool = exp(-dot(p - vec2(0.0, -0.1), p - vec2(0.0, -0.1)) * 0.9);
  vec3 rich = base + vec3(0.05, 0.045, 0.036) * pool;
  rich += (c - 0.5) * 0.028;
  vec2 d = p - vec2(1.25, 1.05);
  float ang = atan(d.y, d.x);
  float rays = pow(vnoise(vec2(ang * 9.0, uTime * 0.06)), 2.0) * smoothstep(2.8, 0.2, length(d));
  rich += vec3(1.0, 0.9, 0.76) * rays * 0.22;
  rich *= 1.0 - 0.14 * smoothstep(0.8, 2.1, length(p * vec2(0.8, 1.0)));
  return mix(base, rich, uSkyRich);
}

vec3 sceneCurtain(vec2 p){
  float x = p.x * 2.6 + 0.22 * sin(p.y * 1.2 + uTime * 0.25) + fbm3(vec2(p.x * 1.6, p.y * 0.22 + uTime * 0.025)) * 1.5;
  float f = pow(sin(x * 3.1) * 0.5 + 0.5, 1.7);
  float f2 = sin(x * 7.7 + 1.7) * 0.5 + 0.5;
  float sh = 0.16 + 0.84 * f * (0.62 + 0.38 * f2);
  vec3 col = mix(vec3(0.055, 0.008, 0.004), vec3(0.52, 0.075, 0.025), sh);
  col += vec3(1.0, 0.33, 0.10) * pow(f, 9.0) * 0.38;
  col *= mix(0.42, 1.0, smoothstep(-1.2, 0.5, p.y));
  col *= 1.0 - 0.55 * smoothstep(0.5, 1.9, length(p * vec2(0.75, 1.0)));
  return col;
}

vec3 sceneDeep(vec2 p){
  vec2 q = p * 1.1 + vec2(0.0, uTime * 0.01);
  float f = fbm(q * 1.4 + fbm3(q * 2.0 - uTime * 0.02) * 0.9);
  vec3 col = vec3(0.014, 0.016, 0.028);
  col += vec3(0.10, 0.045, 0.02) * pow(f, 2.2) * 1.5 * smoothstep(-1.3, 1.1, p.y);
  col += vec3(0.10, 0.13, 0.30) * smoothstep(1.5, 0.0, length(p - vec2(0.15, 1.0))) * 0.5;
  vec2 g = p * 26.0; vec2 id = floor(g); float h = hash21(id);
  float tw = step(0.985, h) * (0.5 + 0.5 * sin(uTime * 2.0 + h * 80.0));
  col += mix(vec3(0.55, 0.65, 1.0), vec3(1.0, 0.55, 0.25), step(0.5, hash21(id + 7.0))) * tw * smoothstep(0.35, 0.0, length(fract(g) - 0.5)) * 0.5;
  return col;
}

// the way out: an infinite volumetric fold, flown through at speed
vec3 tunnel(vec2 p, float T){
  float ro = T * 0.1;
  mat2 R = mat2(cos(ro), -sin(ro), sin(ro), cos(ro));
  vec3 dir = normalize(vec3(p, 1.15));
  dir.xy = R * dir.xy;
  vec3 from = vec3(0.6 + T * 0.11, 0.42 + T * 0.07, T * 0.62);
  float s = 0.12, fade = 1.0;
  vec3 acc = vec3(0.0);
  for (int r = 0; r < 13; r++) {
    vec3 q = from + s * dir;
    q = abs(vec3(0.82) - mod(q, vec3(1.64)));
    float pa = 0.0, a = 0.0;
    for (int i = 0; i < 10; i++) { q = abs(q) / dot(q, q) - 0.60; a += abs(length(q) - pa); pa = length(q); }
    a *= a * a;
    acc += (vec3(s, s * s, s * s * s * s) * a * 0.0009 + 0.0005) * fade;
    fade *= 0.72;
    s += 0.11;
  }
  float A = dot(acc, vec3(0.42, 0.6, 0.25));
  float B = pow(clamp(1.0 - A * 0.46, 0.0, 1.0), 1.7) * 2.3;
  vec3 col = vec3(0.010, 0.012, 0.028);
  col += vec3(pow(B, 1.05) * 1.2, pow(B, 1.9) * 0.58, pow(B, 3.1) * 0.4);
  col += vec3(0.3, 0.42, 1.0) * pow(clamp(1.0 - A * 0.4, 0.0, 1.0), 7.0) * 0.5;
  col = 1.0 - exp(-col * 0.9);
  col *= 1.0 - 0.45 * smoothstep(0.8, 2.0, length(p));
  return col;
}

void main(){
  vec2 p = (vUv - 0.5) * 2.0; p.x *= uAspect;
  float tr = texture2D(uTrail, vUv).r;
  vec2 e = vec2(0.006, 0.0);
  vec2 grad = vec2(texture2D(uTrail, vUv + e.xy).r - texture2D(uTrail, vUv - e.xy).r, texture2D(uTrail, vUv + e.yx).r - texture2D(uTrail, vUv - e.yx).r);
  vec2 pr = p + grad * 0.16 * (1.0 - uIce);
  vec3 col = vec3(0.0);
  if (uIce > 0.001) col += sceneSeal(p, tr) * uIce;
  if (uSky > 0.001) col += sceneSky(pr) * uSky;
  if (uCurtain > 0.001) col += (sceneCurtain(pr) + vec3(1.0, 0.45, 0.18) * tr * 0.10) * uCurtain;
  if (uDeep > 0.001) col += (sceneDeep(pr) + vec3(1.0, 0.5, 0.2) * tr * 0.10) * uDeep;
  if (uWorld > 0.001) col += mix(vec3(0.03, 0.035, 0.055), vec3(0.085, 0.09, 0.12), smoothstep(-0.6, 1.0, p.y)) * uWorld;
  if (uRift > 0.001 && uDeep > 0.001) {
    float ex = (fbm3(vec2(p.y * 2.6 + 9.0, uTime * 0.5)) - 0.5) * 0.14;
    float h = 0.16 + 0.9 * uRift;
    float along = smoothstep(h, h * 0.35, abs(p.y));
    float w = (0.008 + 0.055 * uRift) * (0.4 + 0.6 * along);
    float d = abs(p.x - ex * clamp(1.0 - uRift * 0.5, 0.3, 1.0));
    float slit = smoothstep(w, 0.0, d) * along;
    float glow = smoothstep(w * 7.0, 0.0, d) * along;
    vec3 rc = mix(vec3(1.0, 0.38, 0.11), vec3(1.0, 0.93, 0.82), slit * slit);
    col += (rc * slit * 1.35 + vec3(1.0, 0.4, 0.12) * glow * 0.3) * uRift * (0.9 + 0.18 * sin(uTime * 6.0)) * uDeep;
  }
  if (uDive > 0.001) col = mix(col, tunnel(p, uDiveT), uDive);
  gl_FragColor = vec4(col, 1.0);
}
`

// Premultiplied output: drawn last, over everything.
export const OVER_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uCloud, uOpen, uBlack, uWhite, uGrain, uVig;
${NOISE}
void over(inout vec4 acc, vec3 c, float a){ acc = vec4(c * a + acc.rgb * (1.0 - a), a + acc.a * (1.0 - a)); }
// the way out: an infinite volumetric fold, flown through at speed
vec3 tunnel(vec2 p, float T){
  float ro = T * 0.1;
  mat2 R = mat2(cos(ro), -sin(ro), sin(ro), cos(ro));
  vec3 dir = normalize(vec3(p, 1.15));
  dir.xy = R * dir.xy;
  vec3 from = vec3(0.6 + T * 0.11, 0.42 + T * 0.07, T * 0.62);
  float s = 0.12, fade = 1.0;
  vec3 acc = vec3(0.0);
  for (int r = 0; r < 13; r++) {
    vec3 q = from + s * dir;
    q = abs(vec3(0.82) - mod(q, vec3(1.64)));
    float pa = 0.0, a = 0.0;
    for (int i = 0; i < 10; i++) { q = abs(q) / dot(q, q) - 0.60; a += abs(length(q) - pa); pa = length(q); }
    a *= a * a;
    acc += (vec3(s, s * s, s * s * s * s) * a * 0.0009 + 0.0005) * fade;
    fade *= 0.72;
    s += 0.11;
  }
  float A = dot(acc, vec3(0.42, 0.6, 0.25));
  float B = pow(clamp(1.0 - A * 0.46, 0.0, 1.0), 1.7) * 2.3;
  vec3 col = vec3(0.010, 0.012, 0.028);
  col += vec3(pow(B, 1.05) * 1.2, pow(B, 1.9) * 0.58, pow(B, 3.1) * 0.4);
  col += vec3(0.3, 0.42, 1.0) * pow(clamp(1.0 - A * 0.4, 0.0, 1.0), 7.0) * 0.5;
  col = 1.0 - exp(-col * 0.9);
  col *= 1.0 - 0.45 * smoothstep(0.8, 2.0, length(p));
  return col;
}

void main(){
  vec2 p = (vUv - 0.5) * 2.0; p.x *= uAspect;
  vec4 acc = vec4(0.0);
  if (uCloud > 0.001) {
    vec2 q = p * 1.15 + vec2(uTime * 0.018, uTime * 0.006);
    float w = fbm3(q * 1.7 + 4.0);
    float n = fbm(q * 1.35 + w * 1.1);
    float r = length(p * vec2(0.72, 1.0));
    float edge = (1.0 - uOpen) * 2.9 - 0.35;
    float cover = smoothstep(edge - 0.2, edge + 0.75, edge * 2.0 - r - (n - 0.5) * 1.5 + 0.2);
    cover = smoothstep(0.0, 1.0, cover) * smoothstep(1.0, 0.92, uOpen);
    cover = mix(cover, 1.0, 1.0 - smoothstep(0.0, 0.06, uOpen));
    vec3 cc = mix(vec3(0.88, 0.872, 0.85), vec3(0.965, 0.96, 0.945), smoothstep(0.25, 0.7, n));
    over(acc, cc, cover * uCloud);
  }
  float vg = uVig * smoothstep(0.75, 1.9, length(p * vec2(0.8, 1.0)));
  over(acc, vec3(0.0), vg);
  over(acc, vec3(1.0), uWhite);
  over(acc, vec3(0.0), uBlack);
  float g = (hash21(vUv * vec2(1387.0, 911.0) + fract(uTime * 7.3)) - 0.5) * uGrain;
  acc.rgb += max(g, 0.0);
  acc.a = min(1.0, acc.a + max(-g, 0.0));
  gl_FragColor = acc;
}
`
