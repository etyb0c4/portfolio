import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(3000)
let n = 0
const shot = (t) => p.screenshot({ path: `.shots/v8/${String(n++).padStart(2, '0')}-${t}.jpg`, type: 'jpeg', quality: 78 })
await shot('seal')
// trace the S
const cx = 720, cy = 430
await p.mouse.move(cx + 120, cy - 180); await p.mouse.down()
for (const [dx, dy] of [[80,-170],[0,-190],[-90,-150],[-110,-90],[-40,-40],[60,10],[110,70],[80,140],[-20,180],[-110,150]]) { await p.mouse.move(cx + dx, cy + dy, { steps: 5 }); await p.waitForTimeout(26) }
await shot('tracing')
await p.mouse.up()
await p.waitForTimeout(2500); await shot('melted')
await p.waitForFunction(() => !window.__rs.S.auto, null, { timeout: 20000 })
const go = async (t, wait = 1700) => { await p.evaluate((t) => { window.__rs.S.target = t }, t); await p.waitForTimeout(wait) }
await go(5.2); await shot('act1')
await go(9, 2200); await shot('gate1')
await p.mouse.move(cx, cy); await p.mouse.down(); await p.waitForTimeout(700); await shot('gate1-hold')
await p.waitForFunction(() => window.__rs.GATES[0].solved, null, { timeout: 20000 }); await p.mouse.up()
await p.waitForTimeout(600); await shot('broke-cut')
await p.waitForFunction(() => !window.__rs.S.auto, null, { timeout: 20000 }); await p.waitForTimeout(300); await shot('broke')
for (const [t, tag] of [[14.5, 'shards'], [17.5, 'shards2'], [21, 'deep-in'], [26, 'depths'], [30.5, 'core-back']]) { await go(t, 1800); await shot(tag) }
await go(32, 2200); await shot('gate2')
await p.mouse.move(cx, cy); await p.mouse.down(); await p.waitForTimeout(700); await shot('gate2-hold')
await p.waitForFunction(() => window.__rs.GATES[1].solved, null, { timeout: 20000 }); await p.mouse.up()
await p.waitForFunction(() => window.__rs.S.t > 33.7, null, { timeout: 20000 }); await shot('intro')
await p.waitForFunction(() => !window.__rs.S.auto, null, { timeout: 20000 }); await shot('name')
await go(38.2, 1800); await shot('two-dim')
await go(40, 2600); await shot('fork')
await p.click('.gate-card.dark'); await p.waitForTimeout(1600); await shot('dim-dark')
await p.click('#cross'); await p.waitForTimeout(1600); await shot('dim-good')
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n') : 'clean')
await b.close()
