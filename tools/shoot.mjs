// usage: node tools/shoot.mjs <outDir> [w] [h] — scrolls through the page and screenshots each beat
import { chromium } from 'playwright'
const out = process.argv[2] || '.shots', W = +process.argv[3] || 1440, H = +process.argv[4] || 900
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: W, height: H } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2800)
let n = 0
const shot = (tag) => p.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}.jpg`, type: 'jpeg', quality: 78 })
await p.mouse.move(W * 0.68, H * 0.5)
await shot('hero')
const ids = ['recon', 'teardown', 'record', 'work', 'arsenal', 'contact']
const tops = await p.evaluate((ids) => Object.fromEntries(ids.map((i) => [i, document.getElementById(i).offsetTop])), ids)
const go = async (y, tag, wait = 2100) => { await p.evaluate((y) => scrollTo(0, y), Math.round(y)); await p.waitForTimeout(wait); await shot(tag) }
await go(tops.recon, 'recon')
await go(tops.teardown + H * 0.4, 'seal')
await go(tops.teardown + H * 1.35, 'teardown')
await go(tops.teardown + H * 2.1, 'parts')
await go(tops.record - H * 0.25, 'night')
await go(tops.record, 'record')
await go(tops.work, 'work')
await go(tops.arsenal, 'arsenal')
await go(tops.contact, 'contact', 2600)
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 12).join('\n')) } else console.log('clean')
await b.close()
