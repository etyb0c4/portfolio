import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
p.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE:', m.text()) })
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
console.log('has __rs:', await p.evaluate(() => !!window.__rs))
const cx = 720, cy = 430
await p.mouse.move(cx + 120, cy - 180); await p.mouse.down()
for (const [dx, dy] of [[80,-170],[0,-190],[-90,-150],[-110,-90],[-40,-40],[60,10],[110,70],[80,140],[-20,180],[-110,150]]) { await p.mouse.move(cx + dx, cy + dy, { steps: 5 }); await p.waitForTimeout(26) }
await p.mouse.up()
await p.waitForTimeout(500)
console.log(await p.evaluate(() => ({ entered: window.__rs.S.entered, auto: window.__rs.S.auto, t: window.__rs.S.t })))
await b.close()
