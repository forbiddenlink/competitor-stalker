import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const routes = ['/', '/dossier', '/positioning', '/matrix', '/pricing', '/social', '/weaknesses', '/alerts', '/strategy', '/swot', '/settings', '/about', '/contact', '/privacy-policy'];
const phase = process.argv[2] || 'before';
const browser = await chromium.launch({headless:true, executablePath:'/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const evidence=[];
for (const [device, width, height] of [['desktop',1440,1000], ['mobile',390,844]]) {
 const context=await browser.newContext({viewport:{width,height}, reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes) {
  const name=route==='/'?'dashboard':route.slice(1);
  await page.goto(`http://127.0.0.1:5173${route}`,{waitUntil:'networkidle'});
  await page.locator('h1,h2').first().waitFor();
  await page.waitForTimeout(800);
  await mkdir(`design-research/screenshots/${phase}`,{recursive:true});
  await page.screenshot({path:`design-research/screenshots/${phase}/${name}-${device}.png`,fullPage:true});
  const scrollRegion = page.locator('.flex-1.overflow-auto').first();
  if (await scrollRegion.count() && await scrollRegion.evaluate(el => el.scrollHeight > el.clientHeight)) {
   await scrollRegion.evaluate(el => el.scrollTop = el.scrollHeight);
   await page.screenshot({path:`design-research/screenshots/${phase}/${name}-${device}-bottom.png`,fullPage:true});
  }
  evidence.push({route,device,title:await page.title(),headings:await page.locator('h1,h2,h3').allTextContents(),buttons:await page.getByRole('button').allTextContents(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors:[...errors]});
 }
 await context.close();
}
await writeFile(`design-research/${phase}-browser-evidence.json`,JSON.stringify(evidence,null,2));
await browser.close();
console.log(`Captured ${evidence.length} page/viewport combinations`);
