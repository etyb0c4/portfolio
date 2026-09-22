import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
for (const ph of ['boot','ascension','world']) {
  await p.goto(`http://localhost:5183/portfolio/${ph==='boot'?'':'?phase='+ph}`, {waitUntil:'networkidle'})
  await p.waitForTimeout(2500)
  const fps = await p.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();
    const l=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(l);else res(Math.round(n/((performance.now()-t0)/1000)))};requestAnimationFrame(l)}))
  console.log(ph.padEnd(12), fps, 'fps (software GL)')
}
await b.close()
