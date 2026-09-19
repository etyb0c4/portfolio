import { chromium } from 'playwright'
const [url, out='.shots/sec.png', y='0'] = process.argv.slice(2)
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto(url, { waitUntil:'networkidle' }); await p.waitForTimeout(1500)
// scroll par paliers jusqu'a y pour reveler
const target=+y
for(let s=0;s<=target;s+=300){ await p.evaluate(v=>window.scrollTo(0,v), s); await p.waitForTimeout(90) }
await p.evaluate(v=>window.scrollTo(0,v), target)
await p.waitForTimeout(2200)
await p.screenshot({ path: out })
await b.close(); console.log('OK '+out+' @y='+target)
