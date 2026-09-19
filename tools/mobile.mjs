import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:390, height:844 }, deviceScaleFactor:2 })
await p.goto('http://localhost:5173/?enter&still', { waitUntil:'networkidle' })
await p.waitForTimeout(2500)
await p.screenshot({ path:'.shots/14-mobile-hero.png' })
await p.evaluate(()=>scrollTo(0, innerHeight*3.05)); await p.waitForTimeout(1800)
await p.screenshot({ path:'.shots/15-mobile-proj.png' })
await b.close(); console.log('mobile OK')
