import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const round = process.argv[2] || 'round-1';
const dir = `design-research/screenshots/foundation-${round}`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const evidence = [];
for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${dir}/dashboard-${device}.png` });
    const scroll = page.locator('.flex-1.overflow-auto');
    const viewport = await scroll.evaluate(el => ({ height: el.clientHeight, scrollHeight: el.scrollHeight, width: el.clientWidth, scrollWidth: el.scrollWidth }));
    await scroll.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.screenshot({ path: `${dir}/dashboard-${device}-bottom.png` });
    evidence.push({ device, viewport, errors, headings: await page.locator('h1,h2,h3').allTextContents(), links: await page.getByRole('link').evaluateAll(els => els.map(el => ({ text: el.textContent, href: el.getAttribute('href') }))) });
    await context.close();
}
await browser.close();
await writeFile(`design-research/foundation-${round}-evidence.json`, JSON.stringify(evidence, null, 2));
console.log(`Homepage ${round}: captured desktop/mobile top/bottom`);
