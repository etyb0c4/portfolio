import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/', {waitUntil:'networkidle'})
await p.waitForTimeout(1200)
await p.click('.boot__input'); await p.keyboard.type('sudo su',{delay:40})
await p.keyboard.press('Enter')
await p.waitForSelector('.fall', { timeout: 15000 })
const t0 = Date.now()
for (const at of [1500, 3500, 5000, 5900, 6600, 7600]) {
  await p.waitForTimeout(Math.max(0, at - (Date.now()-t0)))
  const ph = await p.evaluate(()=> document.querySelector('.world')?'world':document.querySelector('.ascension')?'ascension':document.querySelector('.abyss')?'abyss':document.querySelector('.fall')?'falling':'boot')
  await p.screenshot({ path:`.shots/vx-${at}.png` })
  console.log(`fall+${at}ms`.padEnd(13), ph)
}
await b.close()
