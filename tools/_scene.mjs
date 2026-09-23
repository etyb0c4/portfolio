import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/',{waitUntil:'networkidle'})
await p.waitForTimeout(900)
await p.click('.boot__input'); await p.keyboard.type('x')
const peak = async (ms)=>{ let m=0; const n=Math.ceil(ms/30)
  for(let i=0;i<n;i++){ const v=await p.evaluate(()=>window.__sound?.level?.()??-1); if(v>m)m=v; await p.waitForTimeout(30) } return m.toFixed(3) }
console.log('scene@boot   ', await p.evaluate(()=>window.__sound.scene()), 'peak', await peak(1500))
await p.evaluate(()=>window.__sound.glass())
console.log('glass()      ', 'peak', await peak(1400))
for (const sc of ['falling','abyss','ascension','world']) {
  await p.evaluate(n=>window.__sound.setScene(n), sc)
  console.log(`scene@${sc}`.padEnd(17), await p.evaluate(()=>window.__sound.scene()), 'peak', await peak(2600))
}
await b.close()
