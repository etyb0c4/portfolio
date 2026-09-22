import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
p.on('pageerror', e=>console.log('PAGEERR:', e.message))
await p.goto('http://localhost:5183/portfolio/', {waitUntil:'networkidle'})
await p.waitForTimeout(1200)
await p.click('.boot__input'); await p.keyboard.type('sudo su', {delay:50})
await p.keyboard.press('Enter')
await p.waitForTimeout(1700); await p.screenshot({path:'.shots/denial-panic.png'})
await p.waitForTimeout(800);  await p.screenshot({path:'.shots/denial-tear.png'})
await p.waitForTimeout(1400)
// falling
await p.waitForTimeout(2200); await p.screenshot({path:'.shots/falling.png'})
await p.waitForTimeout(3000)
await p.waitForSelector('.abyss__canvas',{timeout:25000}); await p.waitForTimeout(1400)
const box = await p.evaluate(()=>{const c=document.querySelector('.abyss__canvas');const r=c.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})
const ox=box.x+box.w/2-60, oy=box.y+box.h*0.70-200
const seg=(a,bb,n)=>Array.from({length:n+1},(_,i)=>[a[0]+(bb[0]-a[0])*i/n, a[1]+(bb[1]-a[1])*i/n])
const draw=async(pts)=>{await p.mouse.move(ox+pts[0][0],oy+pts[0][1]);await p.mouse.down()
  for(const[x,y]of pts.slice(1)){await p.mouse.move(ox+x,oy+y);await p.waitForTimeout(7)}await p.mouse.up();await p.waitForTimeout(110)}
await draw(seg([0,0],[0,200],24))
await draw([...seg([0,0],[55,8],8),...seg([55,8],[70,45],8),...seg([70,45],[40,92],8),...seg([40,92],[0,96],6),...seg([0,96],[78,200],14)])
await p.waitForTimeout(600);  await p.screenshot({path:'.shots/mark-ignite.png'})
await p.waitForTimeout(1600); await p.screenshot({path:'.shots/mark-rise.png'})
await p.waitForTimeout(2200); await p.screenshot({path:'.shots/ascension-beacon.png'})
for(let i=0;i<6;i++){await p.mouse.wheel(0,800);await p.waitForTimeout(220)}
await p.waitForTimeout(1200); await p.screenshot({path:'.shots/ascension-climb.png'})
console.log('shots done')
await b.close()
