import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
for (const ph of ['abyss','ascension','world']) {
  const p = await b.newPage({ viewport:{width:1600,height:900} })
  const errs=[]
  p.on('pageerror', e=> errs.push('PAGEERR: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,6).join('\n')))
  p.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text().slice(0,400)) })
  await p.goto(`http://localhost:5183/portfolio/?phase=${ph}`, {waitUntil:'networkidle', timeout:30000}).catch(e=>errs.push('GOTO: '+e.message))
  await p.waitForTimeout(3500)
  await p.screenshot({ path:`.shots/${ph}.png` })
  console.log(`\n===== ${ph} =====`)
  console.log(errs.length ? errs.slice(0,6).join('\n---\n') : 'no errors')
  await p.close()
}
await b.close()
