import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader'] })
const p = await b.newPage({ viewport:{width:1600,height:900} })
await p.goto('http://localhost:5183/portfolio/?phase=world', {waitUntil:'networkidle'})
await p.waitForTimeout(4000)
const info = await p.evaluate(() => {
  const out = {}
  const t = document.querySelector('.beninmap__title')
  out.title = t ? { text: t.textContent.trim(), spans: t.querySelectorAll('span').length,
    box: t.getBoundingClientRect(), op: getComputedStyle(t).opacity, disp: getComputedStyle(t).display } : 'MISSING'
  const sp = t && t.querySelector('span')
  out.span0 = sp ? { op: getComputedStyle(sp).opacity, tr: getComputedStyle(sp).transform, box: sp.getBoundingClientRect() } : 'none'
  const relics = [...document.querySelectorAll('.relic')]
  out.relicCount = relics.length
  out.relics = relics.map(r => ({ op: getComputedStyle(r).opacity, tr: getComputedStyle(r).transform,
    attr: r.getAttribute('transform'), box: r.getBoundingClientRect() }))
  const svg = document.querySelector('.beninmap__svg')
  out.svgBox = svg ? svg.getBoundingClientRect() : 'MISSING'
  return out
})
console.log(JSON.stringify(info, null, 1))
await b.close()
