// usage: node tools/shoot.mjs <outDir> [w] [h]   — walks the whole experience and screenshots each beat
import { chromium } from 'playwright'
const out = process.argv[2] || '.shots', W = +process.argv[3] || 1440, H = +process.argv[4] || 900
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: W, height: H } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
let n = 0
const shot = async (tag) => p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}.jpg`, type: 'jpeg', quality: 80 })
await shot('gate0')
const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.2
await p.mouse.move(cx, cy - r); await p.mouse.down()
for (let i = 0; i <= 60; i++) {
  const a = -Math.PI / 2 + (i / 60) * Math.PI * 2.05
  await p.mouse.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r); await p.waitForTimeout(20)
  if (i === 36) await shot('drawing')
}
await p.mouse.up()
await p.waitForTimeout(700); await shot('melt')
await p.waitForTimeout(4200); await shot('act1-a')
const go = async (t, wait = 1500) => { await p.evaluate((t) => { const z = window.__zero; z.S.target = t }, t); await p.waitForTimeout(wait) }
const hold = async (ms) => { await p.mouse.move(cx, cy); await p.mouse.down(); await p.waitForTimeout(ms); }
await go(5.2); await shot('act1-b')
await go(9, 2200); await shot('gate1')
await hold(700); await shot('gate1-hold'); await p.waitForFunction(() => window.__zero.GATES[0].solved, null, { timeout: 30000 }); await p.mouse.up()
await p.waitForTimeout(500); await shot('cut')
await p.waitForFunction(() => !window.__zero.S.auto, null, { timeout: 30000 }); await p.waitForTimeout(400); await shot('act2-broke')
for (const t of [13.6, 15.2, 16.8, 18.2]) { await go(t, 1700); await shot('act2-' + t) }
for (const t of [20, 23, 26.6, 30.2]) { await go(t, 1800); await shot('act3-' + t) }
await go(32, 2200); await shot('gate2')
await hold(700); await shot('gate2-hold'); await p.waitForFunction(() => window.__zero.GATES[1].solved, null, { timeout: 30000 }); await p.mouse.up()
await p.waitForFunction(() => window.__zero.S.t > 33.7, null, { timeout: 30000 }); await shot('intro')
await p.waitForFunction(() => !window.__zero.S.auto, null, { timeout: 30000 }); await p.waitForTimeout(300); await shot('name')
for (const t of [37.9, 39.2]) { await go(t, 1800); await shot('open-' + t) }
await go(40, 2600); await shot('world')
await p.mouse.move(W * 0.3, H * 0.6); await p.waitForTimeout(300)
await p.evaluate(() => window.__zero.openPanel('chess3d')); await p.waitForTimeout(1800); await shot('panel-chess')
await p.evaluate(() => window.__zero.openPanel('b2r-kit')); await p.waitForTimeout(1800); await shot('panel-b2r')
await p.evaluate(() => window.__zero.openPanel('ring0')); await p.waitForTimeout(1800); await shot('panel-about')
await p.evaluate(() => window.__zero.closePanel()); await p.waitForTimeout(1500)
await p.click('#menu-btn'); await p.waitForTimeout(600); await shot('menu')
console.log(errs.length ? errs.slice(0, 20).join('\n') : 'no console errors')
await b.close()
