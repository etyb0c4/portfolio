import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]
p.on('pageerror', e=> errs.push('PAGEERR: '+e.message))
p.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text().slice(0,200)) })
const phase = async () => p.evaluate(() => {
  if (document.querySelector('.world')) return 'world'
  if (document.querySelector('.ascension')) return 'ascension'
  if (document.querySelector('.abyss')) return 'abyss'
  if (document.querySelector('.fall')) return 'falling'
  if (document.querySelector('.boot')) return 'boot'
  return document.body.innerText.slice(0,120) || 'unknown'
})
await p.goto('http://localhost:5183/portfolio/', {waitUntil:'networkidle'})
await p.waitForTimeout(1200)
console.log('1 start   ->', await phase())

// type into the terminal
await p.click('.boot__input').catch(()=>{})
await p.keyboard.type('whoami', { delay: 40 })
const typed = await p.inputValue('.boot__input').catch(()=>'<no input>')
console.log('2 typed   ->', JSON.stringify(typed))
await p.keyboard.press('Enter')
await p.waitForTimeout(2000)
console.log('3 denial  ->', await phase())
await p.waitForTimeout(3000)
console.log('4 falling ->', await phase())
await p.waitForTimeout(5500)
console.log('5 landed  ->', await phase())

// wait for the rite to be ready, then draw an R-ish stroke
await p.waitForSelector('.abyss__canvas', { timeout: 25000 }).catch(()=>console.log('   (no canvas)'))
await p.waitForTimeout(1200)
const box = await p.evaluate(() => { const c=document.querySelector('.abyss__canvas'); if(!c) return null; const r=c.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height} })
if (box) {
  const ox = box.x + box.w/2 - 60, oy = box.y + box.h*0.70 - 200
  const seg=(a,b,n)=>Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n])
  const draw = async (pts) => {
    await p.mouse.move(ox+pts[0][0], oy+pts[0][1]); await p.mouse.down()
    for (const [x,y] of pts.slice(1)) { await p.mouse.move(ox+x, oy+y); await p.waitForTimeout(8) }
    await p.mouse.up(); await p.waitForTimeout(120)
  }
  await draw(seg([0,0],[0,200],24))                                                   // stem
  await draw([...seg([0,0],[55,8],8), ...seg([55,8],[70,45],8), ...seg([70,45],[40,92],8),
              ...seg([40,92],[0,96],6), ...seg([0,96],[78,200],14)])                  // bowl + leg
  console.log('6 drew R  -> ok')
}
await p.waitForTimeout(4200)
console.log('7 after R ->', await phase())

// climb
for (let i=0;i<14;i++){ await p.mouse.wheel(0, 900); await p.waitForTimeout(260) }
await p.waitForTimeout(2500)
console.log('8 climbed ->', await phase())
await p.screenshot({ path:'.shots/flow-end.png' })
console.log('\nERRORS:', errs.length ? '\n'+errs.slice(0,8).join('\n') : 'none')
await b.close()
