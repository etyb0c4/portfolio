import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
await p.goto('http://localhost:5183/portfolio/?phase=abyss', {waitUntil:'networkidle'})
const res = await p.evaluate(async () => {
  const { matchR } = await import('/portfolio/src/lib/glyph.js')
  const L = (pts)=>pts.map(([x,y])=>({x,y}))
  const lerp=(a,b,n)=>{const o=[];for(let i=0;i<=n;i++){o.push([a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n])}return o}
  const shapes = {}
  // proper R: stem down, then bowl + leg
  shapes['R (2 strokes)'] = [
    L(lerp([0,0],[0,200],24)),
    L([...lerp([0,0],[55,8],8), ...lerp([55,8],[70,45],8), ...lerp([70,45],[40,92],8), ...lerp([40,92],[0,96],6), ...lerp([0,96],[78,200],14)])
  ]
  // R drawn in one continuous stroke
  shapes['R (1 stroke)'] = [ L([...lerp([0,200],[0,0],20), ...lerp([0,0],[60,10],8), ...lerp([60,10],[72,50],8), ...lerp([72,50],[36,95],8), ...lerp([36,95],[0,98],6), ...lerp([0,98],[76,200],14)]) ]
  // circle
  shapes['circle'] = [ L(Array.from({length:60},(_,i)=>{const a=i/60*Math.PI*2;return [60+55*Math.cos(a), 100+95*Math.sin(a)]})) ]
  // vertical line
  shapes['line'] = [ L(lerp([30,0],[30,200],30)) ]
  // zigzag scribble
  shapes['scribble'] = [ L(Array.from({length:50},(_,i)=>[ (i%2?10:110), i*4 ])) ]
  // letter O-ish blob / square
  shapes['square'] = [ L([...lerp([0,0],[100,0],10), ...lerp([100,0],[100,200],16), ...lerp([100,200],[0,200],10), ...lerp([0,200],[0,0],16)]) ]
  // letter P (close to R but no leg) - should ideally fail
  shapes['P'] = [ L(lerp([0,0],[0,200],24)), L([...lerp([0,0],[55,8],8), ...lerp([55,8],[70,45],8), ...lerp([70,45],[40,92],8), ...lerp([40,92],[0,96],6)]) ]
  const out = {}
  for (const [k,v] of Object.entries(shapes)) { const r = matchR(v); out[k] = `${r.ok?'PASS':'fail'}  p=${r.precision.toFixed(2)} r=${r.recall.toFixed(2)}` }
  return out
})
for (const [k,v] of Object.entries(res)) console.log(k.padEnd(16), v)
await b.close()
