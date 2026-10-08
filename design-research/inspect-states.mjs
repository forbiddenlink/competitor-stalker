import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const evidence=[];
for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto('http://127.0.0.1:5173/dossier',{waitUntil:'networkidle'});
 await page.waitForTimeout(800);
 await page.getByRole('button',{name:'Add Target',exact:true}).click();
 await page.waitForTimeout(400);
 evidence.push({device,state:'competitor-form',headings:await page.locator('h1,h2,h3').allTextContents(),labels:await page.locator('label').allTextContents(),buttons:await page.getByRole('button').allTextContents()});
 await page.screenshot({path:`design-research/screenshots/before/competitor-form-${device}.png`});
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'View history for Vercel',exact:true}).click();
 await page.waitForTimeout(400);
 await page.screenshot({path:`design-research/screenshots/before/history-${device}.png`});
 evidence.push({device,state:'history',text:await page.locator('.fixed.inset-y-0.right-0').innerText()});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.keyboard.press('Control+k');
 await page.waitForTimeout(400);
 await page.screenshot({path:`design-research/screenshots/before/search-${device}.png`});
 evidence.push({device,state:'search',text:await page.getByRole('dialog').innerText()});
 if(device==='mobile') {
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Open sidebar',exact:true}).click();
  await page.waitForTimeout(400);
  await page.screenshot({path:'design-research/screenshots/before/navigation-mobile.png'});
 }
 await page.close();
}
await writeFile('design-research/before-states-evidence.json',JSON.stringify(evidence,null,2));
await browser.close();
console.log('Captured form, history, search and mobile navigation without changing saved records.');
