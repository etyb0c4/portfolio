import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await p.waitForTimeout(4200)
const tt = await p.evaluate(() => { const m = window.__rs; return null }) // prod: no __rs
const tops = await p.evaluate(() => Object.fromEntries(['recon','teardown','record'].map((i)=>[i,document.getElementById(i).offsetTop])))
const go = async (y, tag, wait = 2200) => { await p.evaluate((y) => scrollTo(0, y), Math.round(y)); await p.waitForTimeout(wait); await p.screenshot({ path: `.shots/v3/${tag}.jpg`, type: 'jpeg', quality: 78 }) }
await go(tops.recon * 0.66, '20-donotopen')
await go(tops.recon + (tops.teardown - tops.recon) * 0.52, '21-opened')
await go(tops.teardown + (tops.record - tops.teardown) * 0.52, '22-gives')
await b.close()
