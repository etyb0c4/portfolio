import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:5183/portfolio/?phase=abyss',{waitUntil:'networkidle'})
await p.waitForSelector('.abyss__canvas',{timeout:20000})
await p.waitForTimeout(1200)
const f = await p.evaluate(()=>{const e=document.querySelector('.abyss__field');const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:Math.round(r.width),h:Math.round(r.height)}})
console.log('drawing field', JSON.stringify(f))
await p.screenshot({path:'.shots/rite-field.png'})
// draw an R that fills the field
const ox = f.x + f.w*0.28, oy = f.y + f.h*0.14, S = f.h*0.72
const seg=(a,bb,n)=>Array.from({length:n+1},(_,i)=>[a[0]+(bb[0]-a[0])*i/n, a[1]+(bb[1]-a[1])*i/n])
const draw=async(pts)=>{await p.mouse.move(ox+pts[0][0]*S,oy+pts[0][1]*S);await p.mouse.down()
  for(const[x,y]of pts.slice(1)){await p.mouse.move(ox+x*S,oy+y*S);await p.waitForTimeout(7)}await p.mouse.up();await p.waitForTimeout(120)}
await draw(seg([0,0],[0,1],24))
await draw([...seg([0,0],[0.28,0.04],8),...seg([0.28,0.04],[0.36,0.23],8),...seg([0.36,0.23],[0.20,0.46],8),...seg([0.20,0.46],[0,0.48],6),...seg([0,0.48],[0.40,1],14)])
await p.waitForTimeout(700)
await p.screenshot({path:'.shots/rite-drawn.png'})
const ok = await p.evaluate(()=>!!document.querySelector('.abyss__accepted'))
console.log('accepted:', ok)
console.log('errors:', errs.length?errs.join('\n'):'none')
await b.close()
