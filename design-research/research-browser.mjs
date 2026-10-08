import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const browser = await chromium.launch({headless:true,executablePath:'/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const targets = JSON.parse(await readFile(process.argv[2], 'utf8'));
const results=[];
for(let i=0;i<targets.length;i+=3) {
 await Promise.all(targets.slice(i,i+3).map(async target=>{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:target.motion||'reduce',ignoreHTTPSErrors:false});
  const page=await context.newPage();
  const result={...target,capturedAt:new Date().toISOString()};
  try {
   const response=await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:25000});
   result.httpStatus=response?.status();
   await page.waitForLoadState('networkidle',{timeout:7000}).catch(()=>{});
   await page.waitForTimeout(target.settleMs||1500);
   result.finalUrl=page.url(); result.title=await page.title();
   result.text=await page.locator('body').innerText({timeout:5000});
   result.links=await page.locator('a[href]').evaluateAll(els=>els.map(el=>({text:el.innerText?.trim().slice(0,200),url:el.href})));
   result.headings=await page.locator('h1,h2,h3').allTextContents();
   const dir=`design-research/screenshots/${target.group}`;
   await mkdir(dir,{recursive:true});
   await page.screenshot({path:`${dir}/${target.id}.png`,timeout:15000});
   // Sample lower content as native viewport images; do not inflate giant page captures.
   if(target.group!=='galleries') {
    for(const [name,fraction] of [['middle',.45],['bottom',1]]) {
     await page.evaluate(f=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f),fraction);
     await page.waitForTimeout(500);
     await page.screenshot({path:`${dir}/${target.id}-${name}.png`,timeout:15000});
    }
   }
   result.status=result.httpStatus>=400||/verify you are human|just a moment|access denied|checking your browser/i.test(result.text.slice(0,2000))?'blocked':'loaded';
  } catch(e) {result.status='blocked';result.error=e.message;}
  results.push(result);
  console.log(`${target.id}: ${result.status} ${result.httpStatus||''} ${result.finalUrl||''}`);
  await context.close();
 }));
 await writeFile(process.argv[2].replace('.json','-evidence.json'),JSON.stringify(results,null,2));
}
await browser.close();
