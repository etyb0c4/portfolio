import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/',{waitUntil:'networkidle'})
await p.waitForTimeout(1000)
await p.click('.boot__input'); await p.keyboard.type('x'); await p.keyboard.press('Enter')
await p.waitForSelector('.fall',{timeout:15000})
const t0=Date.now()
for (let i=0;i<10;i++){
  await p.waitForTimeout(900)
  const st = await p.evaluate(()=>({
    fall: +(window.__gl?.fall ?? -1).toFixed(2),
    depth: Math.round(window.__gl?.fallDepth ?? -1),
    glow: +(getComputedStyle(document.querySelector('.fall__glow')||document.body).opacity),
    blind: +(getComputedStyle(document.querySelector('.fall__blind')||document.body).opacity),
    ticker: typeof window.gsap,
  }))
  console.log(`+${Date.now()-t0}ms`, JSON.stringify(st))
}
await b.close()
