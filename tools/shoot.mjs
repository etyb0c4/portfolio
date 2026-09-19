// Capture le site rendu (WebGL inclus) sans toucher l'ecran.
// usage: node tools/shoot.mjs <url> <out.png> [scrollY] [waitMs]
import { chromium } from 'playwright';
const [url, out='.shots/out.png', scrollY='0', waitMs='2500'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args:['--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist','--enable-webgl'] });
const p = await b.newPage({ viewport:{ width:1600, height:900 }, deviceScaleFactor:1 });
const errs=[];
p.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });
p.on('pageerror', e=> errs.push('PAGEERR: '+e.message));
await p.goto(url, { waitUntil:'networkidle', timeout:30000 }).catch(e=>errs.push('GOTO: '+e.message));
if(+scrollY>0){ await p.evaluate(y=>window.scrollTo(0,y), +scrollY); }
await p.waitForTimeout(+waitMs);
await p.screenshot({ path: out });
await b.close();
if(errs.length) console.log(errs.slice(0,12).join('\n')); else console.log('OK '+out);
