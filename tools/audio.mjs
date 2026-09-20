import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto('http://localhost:5173/', { waitUntil:'networkidle' })
await p.waitForTimeout(4600)
console.log('avant geste:', await p.evaluate(()=>window.__sound?.state()))
const btn = await p.$('.breach')
if(btn){ const bx=await btn.boundingBox(); await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2); await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up() }
await p.waitForTimeout(1500)
console.log('apres breach:', JSON.stringify(await p.evaluate(()=>({ state: window.__sound?.state(), started: window.__sound?.started(), muted: window.__sound?.isMuted() }))))
await b.close()
