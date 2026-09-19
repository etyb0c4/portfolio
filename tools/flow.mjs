import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://localhost:5173/', { waitUntil:'networkidle' })
await p.waitForTimeout(4600)
const btn = await p.$('.breach')
if(btn){ const bx=await btn.boundingBox(); await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up() }
await p.waitForTimeout(500); await p.screenshot({ path:'.shots/d-portal.png' }) // pendant le portail
await p.waitForTimeout(1400); await p.screenshot({ path:'.shots/d-after.png' })  // desktop
await b.close(); console.log(errs.length?('ERR: '+errs.join(' | ')):'flow OK, no JS errors')
