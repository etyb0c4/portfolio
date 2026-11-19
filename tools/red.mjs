import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(4200)
const tops = await p.evaluate(() => Object.fromEntries(['recon','rupture','teardown','record'].map((i)=>[i,document.getElementById(i).offsetTop])))
const go = async (y, tag, wait = 2300) => { await p.evaluate((y) => scrollTo(0, y), Math.round(y)); await p.waitForTimeout(wait); await p.screenshot({ path: `.shots/v5/${tag}.jpg`, type: 'jpeg', quality: 78 }) }
const span = tops.teardown - tops.rupture
await go(tops.rupture - span * 0.25, '00-approach')
await go(tops.rupture + span * 0.1, '01-red-in')
await go(tops.rupture + span * 0.32, '02-burst-early')
await go(tops.rupture + span * 0.55, '03-burst-mid')
await go(tops.rupture + span * 0.8, '04-gave')
await go(tops.teardown + 300, '05-exit-red')
await go(tops.teardown + (tops.record - tops.teardown) * 0.45, '06-teardown')
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].slice(0, 8).join('\n') : 'clean')
await b.close()
