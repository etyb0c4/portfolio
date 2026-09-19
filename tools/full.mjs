import { chromium } from 'playwright'
const [url, out='.shots/full.png'] = process.argv.slice(2)
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto(url, { waitUntil:'networkidle' })
await p.waitForTimeout(2500)
await p.screenshot({ path: out, fullPage: true })
await b.close(); console.log('OK '+out)
