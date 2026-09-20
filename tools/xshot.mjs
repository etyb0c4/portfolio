import { chromium } from 'playwright'
const [frac='0', out='.shots/x.png'] = process.argv.slice(2)
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto('http://localhost:5173/?desktop&snap', { waitUntil:'networkidle' })
await p.waitForTimeout(1600)
await p.evaluate((f) => { const max = document.documentElement.scrollHeight - innerHeight
  if (window.__lenis) window.__lenis.scrollTo(max*f, { immediate:true }); else window.scrollTo(0, max*f) }, +frac)
await p.waitForTimeout(1800)
await p.screenshot({ path: out })
await b.close(); console.log('OK '+out+' @frac='+frac)
