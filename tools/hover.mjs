import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto('http://localhost:5173/?enter&still', { waitUntil:'networkidle' })
await p.waitForTimeout(1200)
await p.evaluate(()=>scrollTo(0,2000)); await p.waitForTimeout(1500)
const cards = await p.$$('.pcard')
if(cards[1]){ const box=await cards[1].boundingBox(); await p.mouse.move(box.x+box.width/2, box.y+box.height/2); await p.waitForTimeout(700) }
await p.screenshot({ path:'.shots/18-hover.png' })
await b.close(); console.log('hover shot OK')
