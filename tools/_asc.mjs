import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=ascension',{waitUntil:'networkidle'})
await p.waitForTimeout(2000); await p.screenshot({path:'.shots/asc-0.png'})
for (const [n,shot] of [[5,'asc-1'],[6,'asc-2']]) {
  for(let i=0;i<n;i++){ await p.mouse.wheel(0,700); await p.waitForTimeout(200) }
  await p.waitForTimeout(900); await p.screenshot({path:`.shots/${shot}.png`}); console.log(shot,'ok')
}
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
