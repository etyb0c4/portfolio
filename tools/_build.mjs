import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/?phase=ascension',{waitUntil:'networkidle'})
await p.waitForTimeout(700)
await p.mouse.click(800,450)   // unlock audio
await p.waitForTimeout(900)
const max = await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
const stat = async (ms)=>{ const xs=[]; const n=Math.ceil(ms/40)
  for(let i=0;i<n;i++){ xs.push(await p.evaluate(()=>window.__sound?.level?.()??0)); await p.waitForTimeout(40) }
  const mean=xs.reduce((a,c)=>a+c,0)/xs.length; return `mean ${mean.toFixed(4)}  peak ${Math.max(...xs).toFixed(3)}` }
for (const f of [0.02, 0.3, 0.6, 0.9]) {
  await p.evaluate(v=>window.__lenis?window.__lenis.scrollTo(v,{immediate:true}):scrollTo(0,v), Math.round(max*f))
  await p.waitForTimeout(600)
  console.log(`climb ${(f*100).toFixed(0).padStart(3)}%  ${await stat(3000)}`)
}
await b.close()
