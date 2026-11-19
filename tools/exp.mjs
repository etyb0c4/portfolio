import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/?test', { waitUntil: 'networkidle' })
await p.waitForTimeout(3500)
let n = 0
const shot = (t) => p.screenshot({ path: `.shots/v7/${String(n++).padStart(2, '0')}-${t}.jpg`, type: 'jpeg', quality: 78 })
await shot('trace')
// draw an S with the mouse
const cx = 720, cy = 420
await p.mouse.move(cx + 120, cy - 180); await p.mouse.down()
const pts = [[80,-170],[0,-190],[-90,-150],[-110,-90],[-40,-40],[60,10],[110,70],[80,140],[-20,180],[-110,150]]
for (const [dx, dy] of pts) { await p.mouse.move(cx + dx, cy + dy, { steps: 6 }); await p.waitForTimeout(30) }
await shot('drawing')
await p.mouse.up()
await p.waitForTimeout(1800); await shot('entered')
const go = async (t, wait = 1600) => { await p.evaluate((t) => { const z = window.__rs; z.S.target = t }, t); await p.waitForTimeout(wait) }
await go(0.6); await shot('hero-story')
await go(1.4); await shot('wayin')
await go(2.0, 2000); await shot('gate')
// hold the seal gate
await p.mouse.move(cx, cy); await p.mouse.down()
await p.waitForTimeout(800); await shot('holding')
await p.waitForFunction(() => window.__rs.GATE.solved, null, { timeout: 15000 })
await p.mouse.up()
await p.waitForTimeout(1200); await shot('rupture-ride')
await p.waitForFunction(() => !window.__rs.S.auto, null, { timeout: 15000 })
await go(3.8, 2200); await shot('teardown')
await go(5.3, 2400); await shot('rebuild')
await go(6.3, 2200); await shot('name')
await go(7, 2400); await shot('fork')
await p.click('.gate-card.dark'); await p.waitForTimeout(1800); await shot('dim-dark')
await p.evaluate(() => { document.querySelector('#dim-dark').scrollTop = 1200 }); await p.waitForTimeout(900); await shot('dim-dark-ops')
await p.click('#cross'); await p.waitForTimeout(1800); await shot('dim-good')
await p.click('.dim-x'); await p.waitForTimeout(1400); await shot('back-to-fork')
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n') : 'clean')
await b.close()
