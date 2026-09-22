import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/', {waitUntil:'networkidle'})
await p.waitForTimeout(1000)
await p.click('.boot__input'); await p.keyboard.type('x'); await p.keyboard.press('Enter')
await p.waitForSelector('.fall', { timeout: 15000 })
const t0 = Date.now()
for (const at of [500, 1500, 2500, 3500, 4300, 4900]) {
  await p.waitForTimeout(Math.max(0, at - (Date.now()-t0)))
  const info = await p.evaluate(() => {
    const g = document.querySelector('.fall__glow'), bl = document.querySelector('.fall__blind')
    if (!g) return { gone: true }
    const cs = getComputedStyle(g)
    return { op: (+cs.opacity).toFixed(2), scale: cs.transform.match(/matrix\(([\d.]+)/)?.[1],
             blind: bl ? (+getComputedStyle(bl).opacity).toFixed(2) : '-' }
  })
  console.log(`fall+${at}ms`.padEnd(13), JSON.stringify(info))
}
await b.close()
