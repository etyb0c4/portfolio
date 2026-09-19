import { chromium } from 'playwright'
const [sel, out, waitMs='1500'] = process.argv.slice(2)
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto('http://localhost:5173/?desktop', { waitUntil:'networkidle' })
await p.waitForTimeout(1600)
const el = await p.$(sel)
if (el) { await el.click(); await p.waitForTimeout(+waitMs) }
else console.log('NO ELEMENT '+sel)
await p.screenshot({ path: out })
await b.close(); console.log('OK '+out)
