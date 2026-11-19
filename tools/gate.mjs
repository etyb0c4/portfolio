import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5199/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(350)
await p.screenshot({ path: '.shots/v3/00-boot.jpg', type: 'jpeg', quality: 78 })
await p.waitForTimeout(1300) // mid-drop
await p.screenshot({ path: '.shots/v3/01-drop.jpg', type: 'jpeg', quality: 78 })
await p.waitForTimeout(2500)
await p.screenshot({ path: '.shots/v3/02-hero.jpg', type: 'jpeg', quality: 78 })
// hold the seal
const btn = await p.locator('#seal-btn').boundingBox()
await p.mouse.move(btn.x + btn.width / 2, btn.y + btn.height / 2)
await p.mouse.down()
await p.waitForTimeout(700)
await p.screenshot({ path: '.shots/v3/03-holding.jpg', type: 'jpeg', quality: 78 })
await p.waitForTimeout(800)
await p.screenshot({ path: '.shots/v3/04-crack.jpg', type: 'jpeg', quality: 78 })
await p.mouse.up()
await p.waitForTimeout(1500)
await p.screenshot({ path: '.shots/v3/05-broken.jpg', type: 'jpeg', quality: 78 })
// scroll through the interlude words
const tops = await p.evaluate(() => Object.fromEntries(['recon','teardown','record','work','contact'].map((i)=>[i,document.getElementById(i).offsetTop])))
const H = 900
const go = async (y, tag, wait = 2000) => { await p.evaluate((y) => scrollTo(0, y), Math.round(y)); await p.waitForTimeout(wait); await p.screenshot({ path: `.shots/v3/${tag}.jpg`, type: 'jpeg', quality: 78 }) }
await go(tops.recon * 0.62, '06-word-donotopen')
await go((tops.recon + tops.teardown) / 2 + H * 0.2, '07-word-opened')
await go(tops.teardown + H * 2.52, '08-word-gives')
await go(tops.record - H * 0.35, '09-word-better')
await go(tops.contact - H * 0.55, '10-word-yourmove')
await go(tops.contact, '11-contact', 2500)
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n') : 'clean')
await b.close()
