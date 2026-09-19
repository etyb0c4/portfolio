import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
p.on('console', m => { const t=m.text(); if(/scene|error|Error/i.test(t) && !/BufferGeometry|computeBounding/.test(t)) console.log(m.type().toUpperCase()+': '+t) })
p.on('pageerror', e => console.log('PAGEERR: '+e.message))
await p.goto('http://localhost:5173/?enter', { waitUntil:'networkidle' })
await p.waitForTimeout(3000)
// interroger l'etat des particules
const info = await p.evaluate(() => ({ gl: window.__gl, hasCanvas: !!document.querySelector('#fg-canvas') }))
console.log('STATE', JSON.stringify(info))
await b.close()
