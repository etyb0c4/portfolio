import { chromium } from 'playwright'
import fs from 'fs'
fs.mkdirSync('.shots/vid', { recursive: true })
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, recordVideo: { dir: '.shots/vid', size: { width: 1600, height: 900 } } })
const p = await ctx.newPage()
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await p.waitForTimeout(4600) // boot sequence
const btn = await p.$('.breach')
if (btn) { const bx = await btn.boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await p.waitForTimeout(1650); await p.mouse.up() }
await p.waitForTimeout(2200) // hero + name decrypt
const maxY = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const steps = 58
for (let i = 0; i <= steps; i++) {
  const y = Math.round(maxY * i / steps)
  await p.evaluate((v) => { if (window.__lenis) window.__lenis.scrollTo(v, { immediate: false, duration: 0.4 }); else scrollTo(0, v) }, y)
  await p.waitForTimeout(230)
}
await p.waitForTimeout(1800)
await ctx.close(); await b.close()
const f = fs.readdirSync('.shots/vid').find((x) => x.endsWith('.webm'))
console.log('VIDEO ' + f)
