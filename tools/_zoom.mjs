import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=world',{waitUntil:'networkidle'})
await p.waitForTimeout(4600)
await p.screenshot({path:'.shots/z-0.png'})
const read = ()=>p.evaluate(()=>({label:document.querySelector('.mapzoom__label')?.textContent, y:Math.round(scrollY)}))
console.log('start   ', JSON.stringify(await read()))
for (let i=0;i<3;i++){ await p.click('.mapzoom__btn >> nth=1'); await p.waitForTimeout(1300) }
console.log('after +++', JSON.stringify(await read()))
await p.screenshot({path:'.shots/z-in.png'})
for (let i=0;i<2;i++){ await p.click('.mapzoom__btn >> nth=0'); await p.waitForTimeout(1300) }
console.log('after --', JSON.stringify(await read()))
await p.screenshot({path:'.shots/z-out.png'})
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
