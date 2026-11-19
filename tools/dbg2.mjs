import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const cx = 720, cy = 430
await p.mouse.move(cx + 120, cy - 180); await p.mouse.down()
for (const [dx, dy] of [[80,-170],[0,-190],[-90,-150],[-110,-90],[-40,-40],[60,10],[110,70],[80,140],[-20,180],[-110,150]]) { await p.mouse.move(cx + dx, cy + dy, { steps: 5 }); await p.waitForTimeout(26) }
console.log(await p.evaluate(() => ({ len: window.__rs.strokeLen(), s: window.__rs.isS(), entered: window.__rs.S.entered })))
await p.mouse.up()
await b.close()
