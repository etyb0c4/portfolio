import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
const errs=[]
p.on('pageerror',e=>errs.push('PAGEERR '+e.message))
p.on('console',m=>{ const t=m.text(); if(m.type()==='error' && !/BufferGeometry|computeBounding/.test(t)) errs.push('CONSOLE '+t) })
await p.goto('http://localhost:5173/?desktop', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
for(let f=0; f<=1; f+=0.12){ await p.evaluate(v=>{const m=document.documentElement.scrollHeight-innerHeight; window.__lenis? window.__lenis.scrollTo(m*v,{immediate:true}) : scrollTo(0,m*v)}, f); await p.waitForTimeout(200) }
await p.screenshot({ path:'.shots/x-final.png' })
await b.close(); console.log(errs.length? errs.slice(0,8).join('\n') : 'NO JS ERRORS')
