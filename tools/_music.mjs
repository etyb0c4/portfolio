import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
p.on('console', m=>{ if(m.type()==='error') console.log('CONSOLE:', m.text().slice(0,180)) })
await p.goto('http://localhost:5183/portfolio/',{waitUntil:'networkidle'})
await p.waitForTimeout(900)
await p.click('.boot__input'); await p.keyboard.type('x')
// sample the bus over a window and report min/max so we can see the music actually moving
const stat = async (ms)=>{ const xs=[]; const n=Math.ceil(ms/40)
  for(let i=0;i<n;i++){ xs.push(await p.evaluate(()=>window.__sound?.level?.()??-1)); await p.waitForTimeout(40) }
  const mn=Math.min(...xs), mx=Math.max(...xs)
  return `min ${mn.toFixed(3)}  max ${mx.toFixed(3)}  range ${(mx-mn).toFixed(3)}` }
console.log('boot        ', await stat(3000))
for (const [sc, inten] of [['falling',0.9],['abyss',0.4],['ascension',0.25],['ascension',0.95],['world',0.4]]) {
  await p.evaluate(([n,v])=>{ window.__sound.setScene(n); window.__sound.setProgress(v) }, [sc, inten])
  await p.waitForTimeout(700)
  console.log(`${sc}@${inten}`.padEnd(14), await stat(3200))
}
await b.close()
