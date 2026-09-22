import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
await p.goto('http://localhost:5183/portfolio/?phase=abyss', {waitUntil:'networkidle'})
const res = await p.evaluate(async () => {
  const { matchR } = await import('/portfolio/src/lib/glyph.js')
  const L = (pts)=>pts.map(([x,y])=>({x,y}))
  const lerp=(a,b,n)=>{const o=[];for(let i=0;i<=n;i++)o.push([a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n]);return o}
  const jit=(pts,m)=>pts.map(([x,y])=>[x+(Math.random()-0.5)*m, y+(Math.random()-0.5)*m])
  const Rpts = (s=1)=>[
    L(lerp([0,0],[0,200*s],24)),
    L([...lerp([0,0],[55*s,8],8), ...lerp([55*s,8],[70*s,45],8), ...lerp([70*s,45],[40*s,92],8), ...lerp([40*s,92],[0,96],6), ...lerp([0,96],[78*s,200*s],14)])
  ]
  const shapes = {}
  shapes['R clean']    = Rpts()
  shapes['R sloppy']   = Rpts().map(s=>L(jit(s.map(p=>[p.x,p.y]), 9)))
  shapes['R very sloppy'] = Rpts().map(s=>L(jit(s.map(p=>[p.x,p.y]), 16)))
  shapes['R narrow']   = [L(lerp([0,0],[0,200],24)), L([...lerp([0,0],[34,8],8),...lerp([34,8],[44,45],8),...lerp([44,45],[24,92],8),...lerp([24,92],[0,96],6),...lerp([0,96],[48,200],14)])]
  shapes['R round bowl']= [L(lerp([0,0],[0,200],24)), L([...Array.from({length:24},(_,i)=>{const a=-Math.PI/2+i/24*Math.PI;return [0+60*Math.cos(a)*0.9+0, 48+48*Math.sin(a)]}), ...lerp([0,96],[78,200],14)])]
  shapes['B']  = [L(lerp([0,0],[0,200],24)), L([...lerp([0,0],[55,8],8),...lerp([55,8],[68,45],8),...lerp([68,45],[0,96],10)]), L([...lerp([0,96],[60,110],8),...lerp([60,110],[70,160],8),...lerp([70,160],[0,198],10)])]
  shapes['K']  = [L(lerp([0,0],[0,200],24)), L(lerp([70,0],[0,100],14)), L(lerp([0,100],[78,200],14))]
  shapes['A']  = [L(lerp([40,0],[0,200],20)), L(lerp([40,0],[80,200],20)), L(lerp([14,130],[66,130],8))]
  shapes['D']  = [L(lerp([0,0],[0,200],24)), L([...lerp([0,0],[60,20],8),...lerp([60,20],[72,100],10),...lerp([72,100],[60,180],10),...lerp([60,180],[0,200],8)])]
  const out = {}
  for (const [k,v] of Object.entries(shapes)) { const r = matchR(v); out[k]=`${r.ok?'PASS':'fail'}  p=${r.precision.toFixed(2)} r=${r.recall.toFixed(2)}  ${r.ok?'':r.reason}` }
  return out
})
for (const [k,v] of Object.entries(res)) console.log(k.padEnd(16), v)
await b.close()
