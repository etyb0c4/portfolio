import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
const errs=[]
p.on('pageerror', e=> errs.push('PAGEERR: '+e.message))
p.on('console', m=>{ const t=m.text(); if(m.type()==='error' && !/computeBoundingSphere|BufferGeometry/.test(t)) errs.push('CONSOLE: '+t) })
await p.goto('http://localhost:5173/?enter&still', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
for(let s=0;s<=4000;s+=500){ await p.evaluate(v=>scrollTo(0,v),s); await p.waitForTimeout(150) }
await b.close()
console.log(errs.length? errs.join('\n') : 'NO JS ERRORS')
