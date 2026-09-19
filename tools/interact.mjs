import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport:{ width:1600, height:900 } })
await p.goto('http://localhost:5173/', { waitUntil:'networkidle' })
await p.waitForTimeout(4200) // laisser jouer le boot
// tenir le bouton breach 1.6s
const btn = await p.$('.breach')
if (btn){ const box = await btn.boundingBox(); await p.mouse.move(box.x+box.width/2, box.y+box.height/2)
  await p.mouse.down(); await p.waitForTimeout(1700); await p.mouse.up() }
await p.waitForTimeout(1400)
await p.screenshot({ path:'.shots/08-breached.png' })
// ouvrir le terminal easter egg
await p.keyboard.press('~'); await p.waitForTimeout(400)
await p.keyboard.type('ls projects'); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
await p.keyboard.type('sudo su'); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
await p.screenshot({ path:'.shots/09-terminal.png' })
await b.close(); console.log('breach+term OK, btn='+(!!btn))
