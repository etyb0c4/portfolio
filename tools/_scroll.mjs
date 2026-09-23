import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=world',{waitUntil:'networkidle'})
await p.waitForTimeout(4500)
const info = await p.evaluate(()=>({
  docH: document.documentElement.scrollHeight, vh: innerHeight,
  worldH: document.querySelector('.world')?.getBoundingClientRect().height,
  pinH: document.querySelector('.beninmap__pin')?.getBoundingClientRect().height,
  contactTop: Math.round(document.querySelector('.contact')?.getBoundingClientRect().top),
}))
console.log('layout', JSON.stringify(info))
for (const y of [0, 400, 800, 1200, 1600, 2000, 2600, 3200]) {
  await p.evaluate(v=>window.__lenis ? window.__lenis.scrollTo(v,{immediate:true}) : scrollTo(0,v), y)
  await p.waitForTimeout(700)
  const st = await p.evaluate(()=>{
    const svg=document.querySelector('.beninmap__svg'), c=document.querySelector('.contact')
    return { scrollY: Math.round(scrollY),
      svgScale: getComputedStyle(svg).transform.match(/matrix\(([\d.]+)/)?.[1],
      svgOp: (+getComputedStyle(svg).opacity).toFixed(2),
      contactTop: Math.round(c.getBoundingClientRect().top) }
  })
  console.log(JSON.stringify(st))
  await p.screenshot({path:`.shots/sc-${y}.png`})
}
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
