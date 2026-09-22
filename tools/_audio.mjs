import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/', {waitUntil:'networkidle'})
await p.waitForTimeout(1200)
await p.click('.boot__input')
await p.keyboard.type('hi', { delay: 80 })
await p.waitForTimeout(500)
// sample the master bus repeatedly while firing sounds
const sample = async (label, fn) => {
  if (fn) await p.evaluate(fn)
  let peak = 0
  for (let i=0;i<40;i++){ const v = await p.evaluate(()=>window.__sound.level()); if(v>peak) peak=v; await p.waitForTimeout(25) }
  console.log(label.padEnd(22), 'peak RMS =', peak.toFixed(5))
}
await sample('idle (drone+music)')
await sample('key()',    ()=>window.__sound.key())
await sample('whoosh()', ()=>window.__sound.whoosh(1.5))
await sample('impact()', ()=>window.__sound.impact(1.5))
await sample('chime()',  ()=>window.__sound.chime())
await sample('radarPing()', ()=>window.__sound.radarPing())
await sample('beginWind()', ()=>window.__sound.beginWind('deep'))
console.log('state:', JSON.stringify(await p.evaluate(()=>({state:window.__sound.state(),muted:window.__sound.isMuted(),started:window.__sound.started()}))))
await b.close()
