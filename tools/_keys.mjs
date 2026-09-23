import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=world',{waitUntil:'networkidle'})
await p.waitForTimeout(4600)
const read = ()=>p.evaluate(()=>({lbl:document.querySelector('.mapzoom__label')?.textContent.trim().slice(0,28), y:Math.round(scrollY)}))
console.log('start      ', JSON.stringify(await read()))
for (let i=0;i<3;i++){ await p.keyboard.press('+'); await p.waitForTimeout(1300) }
console.log('key + x3   ', JSON.stringify(await read()))
for (let i=0;i<2;i++){ await p.keyboard.press('-'); await p.waitForTimeout(1300) }
console.log('key - x2   ', JSON.stringify(await read()))
await p.keyboard.press('Equal'); await p.waitForTimeout(1300)
console.log('key = (x1) ', JSON.stringify(await read()))
await p.screenshot({path:'.shots/keys.png'})
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
