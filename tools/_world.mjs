import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text().slice(0,200)) })
await p.goto('http://localhost:5183/portfolio/?phase=world',{waitUntil:'networkidle'})
await p.waitForTimeout(4500)
await p.screenshot({path:'.shots/w-map.png'})
console.log('map ok')
for (const [n,shot] of [[6,'w-zoom'],[8,'w-enter'],[14,'w-contact']]) {
  for(let i=0;i<n;i++){ await p.mouse.wheel(0,600); await p.waitForTimeout(150) }
  await p.waitForTimeout(1200); await p.screenshot({path:`.shots/${shot}.png`})
  console.log(shot, 'ok')
}
console.log('errors:', errs.length?errs.slice(0,5).join('\n'):'none')
await b.close()
