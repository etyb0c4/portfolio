import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=ascension',{waitUntil:'networkidle'})
await p.waitForTimeout(2000)
const max = await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
for (const f of [0, 0.22, 0.44, 0.64, 0.82, 0.96]) {
  await p.evaluate(v=>window.__lenis?window.__lenis.scrollTo(v,{immediate:true}):scrollTo(0,v), Math.round(max*f*0.92))
  await p.waitForTimeout(900)
  const c = await p.evaluate(()=>{const cs=getComputedStyle(document.documentElement)
    return {sky:cs.getPropertyValue('--j-sky').trim(), key:cs.getPropertyValue('--j-key').trim()}})
  console.log(`climb ${(f*100).toFixed(0).padStart(3)}%`, JSON.stringify(c))
  await p.screenshot({path:`.shots/j-${Math.round(f*100)}.png`})
}
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
