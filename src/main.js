import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/archivo/wdth-italic.css'
import '@fontsource-variable/geist-mono'
import './style.css'
import gsap from 'gsap'
import { createStage } from './gl/stage.js'
import { createScene } from './gl/scene.js'
import { createAudio } from './audio.js'
import { IDENTITY, LINKS, RECORD, PROJECTS, PARTS, PORTS, STACK, NOTES, FLAGS } from './data.js'

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const BASE = import.meta.env.BASE_URL
const asset = (p) => (/^(https?:)?\/\//.test(p) ? p : BASE + p.replace(/^\//, ''))
const ext = (url) => (url && !url.startsWith('mailto:') ? ' target="_blank" rel="noopener"' : '')
const when = (d) => { const [y, m] = String(d).split('-'); return m ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${y}` : y }
const chips = (list) => list.map((s) => `<span>${s}</span>`).join('')

/* ───────── content, laid out from data.js ───────── */
const best = RECORD[0]
$('#hero-k').innerHTML = `<b>${IDENTITY.unit}</b> ${IDENTITY.base}`
$('#hero-name').innerHTML = IDENTITY.name.split(' ').map((w) => `<span>${w}</span>`).join(' ')
$('#hero-aka').innerHTML = `also known as ${IDENTITY.aliases.map((a) => `<b>${a}</b>`).join(' <i>or</i> ')}`
$('#hero-line').textContent = `${IDENTITY.role}. ${IDENTITY.line}`
$('#hero-chips').innerHTML = (best ? `<span class="chip hot">${best.result} · ${best.event}</span>` : '') + `<span class="chip">${IDENTITY.status}</span>`
$('#name-k').innerHTML = `<b>${IDENTITY.unit}</b> introducing`
$('#name-big').innerHTML = IDENTITY.name.split(' ').map((w) => `<span>${w}</span>`).join(' ')
$('#name-aka').innerHTML = IDENTITY.aliases.map((a) => `<b>${a}</b>`).join(' <i>/</i> ')
$('#name-chips').innerHTML = (best ? `<span class="chip hot">${best.result} · ${best.event}</span>` : '') + `<span class="chip">${IDENTITY.role}</span>`

$('#ports').innerHTML = PORTS.map((p) => `<li><b>${p.title}</b><span>${p.note}</span></li>`).join('')
$('#parts').innerHTML = PARTS.map((p) => `<li><b>${p.key}</b><div><strong>${p.title}</strong><span>${p.tools.join(' · ')}</span></div></li>`).join('')
$('#sr-work').innerHTML = PROJECTS.map((p) => `<li><strong>${p.name}</strong>, ${p.role} (${p.year}). ${p.blurb}</li>`).join('')

const card = (p, i) => `
  <article class="card">
    <div class="shot"><img src="${asset(p.img)}" alt="${p.name}" loading="lazy" /><span class="side ${p.side}">${p.side}</span></div>
    <p class="meta"><b>${String(i + 1).padStart(2, '0')}</b>${p.role}<i>${p.year}</i></p>
    <h3>${p.url ? `<a href="${p.url}"${ext(p.url)}>${p.name} ↗</a>` : p.name}</h3>
    <p class="blurb">${p.blurb}</p>
    <p class="metric">${p.metric}</p>
    <div class="tagsline">${chips(p.stack)}</div>
  </article>`
$('#work-list').innerHTML = PROJECTS.filter((p) => p.side === 'build').map(card).join('')
$('#ops-list').innerHTML = PROJECTS.filter((p) => p.side === 'break').map(card).join('')
$('#stack-list').innerHTML = chips(STACK)

$('#record-list').innerHTML = RECORD.map((r) => {
  const body = `
    <span class="rank">${r.rank}</span>
    <div class="what"><strong>${r.event}</strong><span>${[r.result, r.scope].filter(Boolean).join(' · ')}</span><div class="tagsline">${chips(r.tags || [])}</div></div>
    <dl><div><dt>type</dt><dd>${r.kind}</dd></div><div><dt>date</dt><dd>${when(r.date)}</dd></div>${r.as ? `<div><dt>as</dt><dd>${r.as}</dd></div>` : ''}</dl>`
  return `<li>${r.url ? `<a class="row" href="${r.url}"${ext(r.url)}>${body}</a>` : `<div class="row">${body}</div>`}</li>`
}).join('')

$('#arsenal-list').innerHTML = PARTS.map((p) => `<div class="kit"><p><b>${p.key}</b>${p.title}</p><div class="tagsline">${chips(p.tools)}</div></div>`).join('')

if (NOTES.length) {
  $('#notes').hidden = false
  $('#notes-list').innerHTML = NOTES.map((n) => `
    <li><a class="row" href="${n.url || '#'}"${ext(n.url)}>
      <span class="cat">${n.category}</span>
      <div class="what"><strong>${n.title}</strong><span>${n.summary || ''}</span><div class="tagsline">${chips(n.tags || [])}</div></div>
      <dl><div><dt>date</dt><dd>${when(n.date)}</dd></div></dl>
    </a></li>`).join('')
}

const initials = IDENTITY.name.split(' ').map((w) => w[0]).join('')
$$('.id-card').forEach((el) => {
  el.innerHTML = `
  <div class="avatar"><img src="${asset(IDENTITY.avatar)}" alt="${IDENTITY.name}" /><span>${initials}</span></div>
  <div class="who">
    <h2>${IDENTITY.name}</h2>
    <p class="aka">${IDENTITY.aliases.map((a) => `<b>${a}</b>`).join(' <i>/</i> ')}</p>
    <dl class="facts">
      <div><dt>role</dt><dd>${IDENTITY.role}</dd></div>
      <div><dt>based in</dt><dd>${IDENTITY.base}</dd></div>
      <div><dt>school</dt><dd>${IDENTITY.school}</dd></div>
      <div><dt>status</dt><dd>${IDENTITY.status}</dd></div>
    </dl>
    <div class="links">${LINKS.map((l) => `<a href="${l.url}"${ext(l.url)}><i>${l.label}</i>${l.text}<b>↗</b></a>`).join('')}</div>
  </div>`
  const av = el.querySelector('.avatar img')
  av.addEventListener('error', () => av.parentElement.classList.add('none'))
})
$$('.foot').forEach((el) => { el.innerHTML = `<span>${IDENTITY.unit} · © ${new Date().getFullYear()} ${IDENTITY.name}</span><span>no trackers, no templates</span>` })

/* callouts pinned to the 3D box */
const tagEls = {}
const addTag = (id, html, cls, i = 0) => {
  const d = document.createElement('div'); d.className = 'tag ' + cls; d.innerHTML = html; d.style.setProperty('--i', i)
  $('#tags').append(d); tagEls[id] = { el: d, group: cls }
}
PORTS.forEach((p, i) => addTag(p.id, `<b>${p.title}</b><span>${p.note}</span>`, 'ports', i))
PARTS.forEach((p) => addTag(p.id, `<b>${p.key}</b><span>${p.title}</span>`, 'parts'))
addTag('flag', `<b>flag</b><span>${FLAGS.box}</span>`, 'flag')
console.log(`%c${IDENTITY.unit}%c you opened the box the right way. ${FLAGS.console}`, 'background:#ff4f1a;color:#0c0c0d;padding:2px 6px;font-weight:700', 'color:inherit')

/* ───────── the picture ───────── */
const END = 7
const GATE = { at: 2.0, to: 3.18, solved: false }
const G = { az: 0.62, el: 0.3, dist: 9.2, shift: 1.55, rise: 0, turn: 0, explode: 0, glass: 0, detail: 1, dark: 0, seam: 0, lens: 1, ports: 0, parts: 0, flag: 0, spin: 0, dim: 0, fade: 1, drop: 2.6, shake: 0, rage: 0, burst: 0 }
const FX = { seam: 0, shake: 0, dim: 0 }
const S = { t: 0, target: 0, time: 0, narrow: false, slow: 0, alive: true, entered: false, auto: false, hold: 0, holding: false, idle: 0 }
const still = matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = matchMedia('(hover: none)').matches

let tl
function build(narrow) {
  tl?.kill()
  const side = narrow ? 0 : 1, far = narrow ? 1.5 : 1
  Object.assign(G, { az: 0.62, el: 0.3, dist: 9.2 * far, shift: 1.55 * side, rise: narrow ? 1.5 : 0, explode: 0, glass: 0, detail: 1, dark: 0, seam: 0, lens: 1, ports: 0, parts: 0, flag: 0, spin: 0, dim: 0, rage: 0, burst: 0 })
  tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } })
  const T = (vars, from, to, ease) => tl.to(G, { ...vars, duration: to - from, ...(ease ? { ease } : {}) }, from)

  // 01 way in
  T({ az: 0.2, el: 0.1, dist: 6.4 * far, shift: 1.2 * side, rise: narrow ? 1.25 : 0.42 }, 0.1, 1)
  T({ ports: 1 }, 1.1, 1.3)
  T({ ports: 0 }, 1.78, 1.95)
  T({ lens: 0 }, 1.6, 1.85)
  // 02 rupture: hard cut close, red, the shell lets go
  tl.set(G, { az: 0.06, el: 0.13 }, 1.98)
  T({ dist: 4.7 * far, shift: 0.85 * side, rise: narrow ? 1.15 : 0.42 }, 1.98, 2.24, 'power2.out')
  T({ rage: 1, seam: 1 }, 2.0, 2.44)
  T({ burst: 1 }, 2.12, 2.98, 'none')
  T({ dist: 7.0 * far, el: 0.21, rise: narrow ? 1.3 : 0.25 }, 2.28, 2.95, 'power2.out')
  T({ rage: 0, seam: 0 }, 2.88, 3.34)
  T({ az: 0.78, el: 0.42, dist: 12.6 * far, shift: 2.3 * side, rise: narrow ? 2.2 : 0.2 }, 2.82, 4.0)
  // 03 teardown
  T({ explode: 1 }, 3.1, 4.1, 'none')
  T({ parts: 1, flag: 1 }, 3.9, 4.1)
  T({ parts: 0, flag: 0 }, 4.4, 4.54)
  // 04 rebuild in glass, lights out
  T({ dark: 1 }, 4.44, 4.84)
  T({ detail: 0 }, 4.44, 4.56)
  T({ glass: 1 }, 4.52, 4.8)
  T({ explode: 0 }, 4.64, 5.06)
  T({ az: 0.7, el: 0.24, dist: 10.6 * far, shift: 2.5 * side, rise: 0, spin: 1, dim: narrow ? 0.7 : 0 }, 4.56, 5.06)
  // 05 the name, centre stage
  T({ shift: 0, dist: 11.8 * far, el: 0.3, dim: 0.55 }, 5.8, 6.4)
  // 06 the fork: pull back, hold the night
  T({ dist: 13.5 * far, el: 0.38, dim: narrow ? 0.75 : 0.6 }, 6.6, 7)
  tl.to({}, { duration: 0.01 }, END)

  for (const st of $$('.story .st')) {
    const a = +st.dataset.in, b = +st.dataset.out, d = b - a
    const blocks = st.querySelectorAll('.b')
    tl.set(st, { autoAlpha: 1 }, a)
    blocks.forEach((blk, i) => {
      const at = a + i * d * 0.22
      tl.fromTo(blk, { autoAlpha: 0, y: 26, filter: 'blur(12px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: d * 0.34, ease: 'power3.out' }, at)
      tl.fromTo(blk.querySelectorAll('.x, .s'), { yPercent: 36, opacity: 0 }, { yPercent: 0, opacity: 1, duration: d * 0.3, ease: 'power3.out', stagger: d * 0.07 }, at)
    })
    tl.to(blocks, { autoAlpha: 0, y: -20, filter: 'blur(9px)', duration: d * 0.26, ease: 'power2.in', stagger: d * 0.04 }, b - d * 0.28)
    tl.set(st, { autoAlpha: 0 }, b)
  }
  for (const act of $$('#acts .act')) {
    const a = +act.dataset.in, b = +act.dataset.out, d = b - a
    const bits = act.querySelectorAll('.k, h1, h2, .aka, .lead, .chips, .ports li, .parts li')
    tl.set(act, { autoAlpha: 1 }, a)
    tl.fromTo(bits, { opacity: 0, y: 26, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: Math.min(0.5, d * 0.4), ease: 'power3.out', stagger: Math.min(0.055, d * 0.05) }, a)
    tl.to(bits, { opacity: 0, y: -18, filter: 'blur(7px)', duration: d * 0.22, ease: 'power2.in', stagger: 0.015 }, b - d * 0.24)
    tl.set(act, { autoAlpha: 0 }, b)
  }
}

const stage = createStage($('#gl'))
const audio = createAudio()
let world

const snd = $('#snd')
const sndLabel = () => { snd.textContent = 'snd · ' + (audio.on ? 'on' : 'off'); snd.classList.toggle('off', !audio.on) }
sndLabel()
snd.addEventListener('click', () => { audio.start(); audio.toggle(); sndLabel() })
for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(ev, () => audio.start(), { once: true, passive: true })

/* ───────── scramble + chapter ───────── */
const GLYPHS = '#@%&$01<>/\\*+=?'
let scrambling = null
function scramble(el, to) {
  clearInterval(scrambling)
  let n = 0
  scrambling = setInterval(() => {
    n++
    el.textContent = [...to].map((c, i) => (c === ' ' || i < n ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('')
    if (n >= to.length) clearInterval(scrambling)
  }, 26)
}
const CHAPTERS = [
  { until: 1.0, name: 'sealed unit', act: 'paper' },
  { until: 2.0, name: 'way in', act: 'paper' },
  { until: 3.2, name: 'rupture', act: 'tear' },
  { until: 4.44, name: 'teardown', act: 'tear' },
  { until: 5.9, name: 'rebuild', act: 'night' },
  { until: 6.75, name: 'introducing', act: 'night' },
  { until: Infinity, name: 'the fork', act: 'end' },
]
let chapterName = ''
function chapter() {
  const c = PATH ? { name: PATH === 'good' ? 'dimension a' : 'dimension b', act: PATH === 'good' ? 'paper' : 'night' } : CHAPTERS.find((c) => S.t < c.until)
  if (c.name === chapterName) return
  chapterName = c.name
  scramble($('#chapter'), c.name)
  audio.setAct(c.act)
}

/* ───────── gate 0: trace the S ───────── */
const ink = $('#ink'), ictx = ink.getContext('2d')
let stroke = []
function sizeInk() { ink.width = innerWidth * devicePixelRatio; ink.height = innerHeight * devicePixelRatio; ictx.scale(devicePixelRatio, devicePixelRatio); ictx.lineCap = ictx.lineJoin = 'round' }
function isS() {
  if (stroke.length < 12) return false
  const ys = stroke.map((p) => p.y), xs = stroke.map((p) => p.x)
  const h = Math.max(...ys) - Math.min(...ys), w = Math.max(...xs) - Math.min(...xs)
  if (h < innerHeight * 0.14 || w < innerWidth * 0.03) return false
  if (stroke.at(-1).y - stroke[0].y < h * 0.5) return false // an S travels downward
  let flips = 0, dir = 0
  for (let i = 2; i < stroke.length; i++) {
    const dx = stroke[i].x - stroke[i - 2].x
    if (Math.abs(dx) < 3) continue
    const d = Math.sign(dx)
    if (dir !== 0 && d !== dir) flips++
    dir = d
  }
  return flips >= 2 && flips <= 6
}
function enter() {
  if (S.entered) return
  S.entered = true
  document.body.classList.add('in')
  audio.hit('crack')
  gsap.fromTo(FX, { seam: 0.9, shake: 1 }, { seam: 0, shake: 0, duration: 1.2, ease: 'power2.out' })
  gsap.to('#trace', { autoAlpha: 0, duration: 0.6 })
  gsap.to(G, { fade: 0, duration: 1.2, ease: 'power2.out', delay: 0.1 })
  if (!still) gsap.to(G, { drop: 0, duration: 1.25, ease: 'bounce.out', delay: 0.5, onComplete: () => { audio.hit('thud'); gsap.fromTo(FX, { shake: 0.9 }, { shake: 0, duration: 0.7, ease: 'power2.out' }) } })
  else G.drop = 0
  chapter()
}
$('#skip').addEventListener('click', () => { audio.start(); enter() })

/* ───────── gate 1: hold to break the seal ───────── */
const hg = $('#holdgate'), hgFg = $('#hg-fg')
const atGate = () => S.entered && !S.auto && !GATE.solved && S.t > GATE.at - 0.06
function solveGate() {
  GATE.solved = true
  S.auto = true; S.holding = false
  audio.hold(0)
  gsap.to(S, { hold: 0, duration: 0.4, delay: 0.2 })
  gsap.to(S, { t: GATE.to, duration: 2.6, ease: 'none', onUpdate: () => { S.target = S.t }, onComplete: () => { S.target = S.t; S.auto = false } })
}

/* ───────── the fork and the dimensions ───────── */
let PATH = null
const cross = $('#cross')
const forkEl = $('#fork')
function choose(path) {
  audio.start()
  const was = PATH
  PATH = path
  document.body.classList.remove('path-good', 'path-dark')
  document.body.classList.add('path-' + path, 'dim-open', 'jumping')
  setTimeout(() => document.body.classList.remove('jumping'), 600)
  $('#dim-good').hidden = path !== 'good'
  $('#dim-dark').hidden = path !== 'dark'
  const dim = $(path === 'good' ? '#dim-good' : '#dim-dark')
  dim.scrollTop = 0
  gsap.fromTo(dim.querySelector('.dim-in'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 })
  cross.hidden = false
  cross.querySelector('span').textContent = path === 'good' ? 'cross to the dark path' : 'cross to the good path'
  if (was !== path) { audio.hit(path === 'dark' ? 'shatter' : 'open'); gsap.fromTo(FX, { shake: 0.7 }, { shake: 0, duration: 0.8, ease: 'power2.out' }) }
  gsap.to(FX, { dim: 1, duration: 0.8 })
  chapterName = ''; chapter()
}
function leaveDim() {
  if (!PATH) return
  PATH = null
  document.body.classList.remove('path-good', 'path-dark', 'dim-open')
  $('#dim-good').hidden = true
  $('#dim-dark').hidden = true
  cross.hidden = true
  gsap.to(FX, { dim: 0, duration: 0.8 })
  audio.hit('close')
  chapterName = ''; chapter()
}
$$('[data-choose]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.choose)))
$$('.dim-x').forEach((b) => b.addEventListener('click', leaveDim))
cross.addEventListener('click', () => choose(PATH === 'good' ? 'dark' : 'good'))

/* ───────── input ───────── */
const nudge = (d) => { if (S.entered && !S.auto && !PATH) { S.target = clamp(S.target + d, 0, GATE.solved ? END : GATE.at); S.idle = 0 } }
addEventListener('wheel', (e) => {
  if (e.target.closest?.('.dim')) return
  e.preventDefault()
  if (PATH) return
  const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY
  nudge(dy * 0.0024)
}, { passive: false })

let pointer = null, lastY = 0, down = false
addEventListener('pointerdown', (e) => {
  down = true; lastY = e.clientY
  if (!S.entered) { stroke = [{ x: e.clientX, y: e.clientY }]; return }
  if (atGate() && !e.target.closest('button, a, .dim')) S.holding = true
})
addEventListener('pointermove', (e) => {
  pointer = pointer || {}; pointer.x = e.clientX; pointer.y = e.clientY
  if (!down) return
  if (!S.entered) {
    stroke.push({ x: e.clientX, y: e.clientY })
    const p = stroke.at(-2), q = stroke.at(-1)
    ictx.strokeStyle = '#ff4f1a'; ictx.lineWidth = 7
    ictx.beginPath(); ictx.moveTo(p.x, p.y); ictx.lineTo(q.x, q.y); ictx.stroke()
    if (isS()) enter()
    return
  }
  if (e.pointerType === 'touch' && !S.holding && !PATH) nudge((lastY - e.clientY) * -0.012 * -1)
  lastY = e.clientY
}, { passive: true })
const release = () => { down = false; S.holding = false; if (!S.entered) stroke = [] }
addEventListener('pointerup', release)
addEventListener('pointercancel', release)
document.documentElement.addEventListener('pointerleave', () => { pointer = null })

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { leaveDim(); return }
  if (e.target.closest?.('button, a, .dim')) return
  if (!S.entered) { if (e.key === 'Enter') { audio.start(); enter() } return }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); audio.start(); if (atGate()) S.holding = true; else nudge(0.7) }
  else if (e.key === 'ArrowDown' || e.key === 'PageDown') nudge(0.7)
  else if (e.key === 'ArrowUp' || e.key === 'PageUp') nudge(-0.7)
})
addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') S.holding = false })

/* ───────── loop ───────── */
const P = { x: 0, y: 0 }, CUR = { x: innerWidth / 2, y: innerHeight / 2 }
const cur = $('#cur'), rail = $('#rail'), hint = $('#hint')
if (!coarse) {
  document.documentElement.classList.add('fine')
  addEventListener('pointerover', (e) => cur.classList.toggle('act', !!e.target.closest('a, button')), { passive: true })
}
CHAPTERS.slice(0, -1).forEach((c, i) => rail.insertAdjacentHTML('beforeend', `<b style="--at:${(c.until / END).toFixed(3)}">${String(i + 1).padStart(2, '0')}</b>`))

function resize() {
  const w = innerWidth, h = innerHeight, narrow = w < 900 || w / h < 1
  stage.resize(w, h)
  world?.resize(w, h)
  sizeInk()
  if (narrow !== S.narrow || !tl) { S.narrow = narrow; build(narrow); tl.time(S.t) }
}
addEventListener('resize', resize)
document.addEventListener('visibilitychange', () => { S.alive = !document.hidden; if (S.alive) { last = performance.now(); requestAnimationFrame(frame) } })

let last = performance.now(), night = false, wasOpen = false, wasRage = false
function frame(now) {
  if (!S.alive) return
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  S.time += dt; S.idle += dt
  if (S.entered && !S.auto) S.t += (S.target - S.t) * (still ? 1 : 1 - Math.exp(-dt * 6))
  tl.time(S.t)

  // the ink of the entry gate slowly dries
  if (!S.entered || ink.style.opacity !== '0') {
    ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0)
    ictx.globalCompositeOperation = 'destination-out'
    ictx.fillStyle = `rgba(0,0,0,${S.entered ? 0.09 : 0.028})`
    ictx.fillRect(0, 0, ink.width, ink.height)
    ictx.restore()
  }

  // gate 1
  const gate = atGate()
  if (gate) {
    S.hold = clamp(S.hold + (S.holding ? dt / 1.2 : -dt * 1.4), 0, 1)
    audio.hold(S.hold)
    G.shake = Math.max(G.shake, S.hold * 0.55)
    if (S.hold >= 1) solveGate()
  }
  hg.classList.toggle('on', !!gate)
  hgFg.style.strokeDashoffset = String(100 - S.hold * 100)

  // the fork appears when the piece is played out
  const forkOn = S.entered && !S.auto && !PATH && S.t > END - 0.35
  forkEl.classList.toggle('on', forkOn)
  hint.classList.toggle('on', S.entered && !S.auto && !gate && !PATH && !forkOn && S.idle > 2.6)

  // each dimension has its own light
  if (PATH) {
    if (PATH === 'good') G.dark *= 1 - FX.dim
    else G.rage = Math.max(G.rage, FX.dim * (0.05 + 0.035 * Math.sin(S.time * 0.8)))
  }

  const eff = FX.seam > 0.002 || FX.shake > 0.002 ? { ...G, seam: Math.min(1, G.seam + FX.seam), shake: G.shake + FX.shake } : G
  const view = world.update(eff, S.time, dt, coarse ? null : pointer || { x: -9999, y: -9999 })
  stage.render(S.time, world.scene, world.camera)

  if (!coarse) {
    if (pointer) {
      CUR.x += (pointer.x - CUR.x) * (1 - Math.exp(-dt * 24))
      CUR.y += (pointer.y - CUR.y) * (1 - Math.exp(-dt * 24))
      cur.style.transform = `translate3d(${CUR.x.toFixed(1)}px, ${CUR.y.toFixed(1)}px, 0)`
      cur.style.opacity = '1'
    } else cur.style.opacity = '0'
  }

  for (const id in tagEls) {
    const { el, group } = tagEls[id], k = G[group]
    if (k < 0.01) { if (el.style.opacity !== '0') el.style.opacity = '0'; continue }
    world.locate(id, P)
    el.style.opacity = k.toFixed(3)
    el.style.transform = `translate3d(${P.x.toFixed(1)}px, ${P.y.toFixed(1)}px, 0)`
  }

  rail.style.setProperty('--t', (S.t / END).toFixed(4))
  if (S.entered) chapter()
  if (G.dark > 0.5 !== night) { night = G.dark > 0.5; document.body.classList.toggle('night', night); $('meta[name=theme-color]').content = night ? '#0c0c0d' : '#ecebe7'; if (night) audio.hit('reveal') }
  if (G.explode > 0.42 !== wasOpen) { wasOpen = G.explode > 0.42; audio.hit(wasOpen ? 'open' : 'close') }
  if (G.rage > 0.4 !== wasRage) { wasRage = G.rage > 0.4; if (wasRage) { audio.hit('shatter'); gsap.fromTo(FX, { shake: 1.3 }, { shake: 0, duration: 1.3, ease: 'power2.out' }) } }
  document.body.classList.toggle('xray', view.lens > 0.4)

  if (dt > 0.034) { if (++S.slow > 40 && stage.lower()) { S.slow = 0; stage.resize(innerWidth, innerHeight) } } else S.slow = Math.max(0, S.slow - 1)
  requestAnimationFrame(frame)
}

async function start() {
  const bootN = $('#boot-n'), t0 = performance.now()
  const count = setInterval(() => { bootN.textContent = String(Math.min(99, Math.round((performance.now() - t0) / 11))).padStart(3, '0') }, 40)
  await Promise.race([
    Promise.all([document.fonts.load('600 60px "Geist Mono Variable"'), document.fonts.load('800 60px "Archivo Variable"')]),
    new Promise((r) => setTimeout(r, 2500)),
  ])
  clearInterval(count)
  bootN.textContent = '100'
  world = createScene(stage)
  resize()
  tl.time(0)
  document.body.classList.add('ready')
  gsap.to(G, { fade: 0.0001, duration: 1.2, ease: 'power2.out', delay: 0.15, onComplete: () => { if (still) enter() } })
  requestAnimationFrame((t) => { last = t; frame(t) })
  if (import.meta.env.DEV || new URLSearchParams(location.search).has('test')) window.__rs = { G, S, FX, GATE, enter, solveGate, choose, leaveDim, world, stage }
}
start()
