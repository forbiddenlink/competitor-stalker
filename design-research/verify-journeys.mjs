import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, executablePath: '/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const results = [];
const dir = 'design-research/screenshots/journeys';
await mkdir(dir, { recursive: true });
for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const go = async route => { await page.goto(`${process.env.VERIFY_BASE_URL || 'http://127.0.0.1:5173'}${route}`, { waitUntil: 'networkidle' }); assert.ok((await page.title()).includes('| Stalker | Competitive Intelligence'), 'Refuse to exercise an unexpected app'); };
    const capture = async name => page.screenshot({ path: `${dir}/${name}-${device}.png` });
    const step = async (name, action) => {
        try { await action(); results.push({ device, name, passed: true }); }
        catch (e) { results.push({ device, name, passed: false, error: String(e) }); await capture(`failed-${name.replaceAll(' ', '-')}`); }
    };
    await step('dashboard selected dossier', async () => {
        await go('/');
        await page.getByRole('region', { name: 'Research queue' }).getByRole('link').first().click();
        await page.getByRole('heading', { name: 'Vercel / Battlecard' }).waitFor();
        await capture('battlecard');
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download brief' }).click();
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), 'competitor-brief.txt');
        const stream = await download.createReadStream();
        let text = ''; for await (const chunk of stream) text += chunk.toString();
        assert.ok(text.includes('Features:') && text.includes('Pricing:') && text.includes('Vercel'));
        try {
            await page.emulateMedia({ media: 'print' });
            assert.equal(await page.locator('.battlecard').evaluate(el => getComputedStyle(el).visibility), 'visible');
            await capture('battlecard-print');
        } finally { await page.emulateMedia({ media: 'screen' }); }
    });
    await step('dossier search and form', async () => {
        await go('/dossier');
        await page.getByRole('searchbox', { name: 'Find competitors' }).fill('missing-company');
        await page.getByRole('heading', { name: 'No matching competitors' }).waitFor();
        await capture('dossier-no-match');
        await page.getByRole('button', { name: 'Clear filters' }).click();
        await page.getByRole('button', { name: 'Edit Vercel', exact: true }).click();
        const input = page.getByRole('textbox', { name: 'Company Name *', exact: true });
        assert.equal(await input.evaluate(el => el === document.activeElement), true);
        await page.getByRole('textbox', { name: 'Website', exact: true }).fill('invalid');
        assert.equal(await page.getByRole('button', { name: 'Save Changes' }).isDisabled(), true);
        await page.getByRole('textbox', { name: 'Website', exact: true }).fill('https://vercel.com');
        await page.getByRole('textbox', { name: 'One-liner Description' }).fill('Browser verification research note');
        await capture('competitor-form');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_competitors')).find(c => c.id === 'vercel').oneLiner), 'Browser verification research note');
    });
    await step('matrix keyboard and local changes', async () => {
        await go('/matrix');
        const status = page.getByRole('button', { name: /^Vercel:.*Change status$/ }).first();
        await status.focus(); await page.keyboard.press('Enter');
        await go('/alerts');
        await page.getByRole('link', { name: 'Vercel: features changed' }).first().waitFor();
        await capture('local-changes');
        await page.getByRole('button', { name: 'Pricing', exact: true }).click();
        assert.equal(await page.getByRole('link', { name: 'Vercel: features changed' }).count(), 0);
    });
    await step('positioning keyboard and pointer', async () => {
        await go('/positioning');
        let marker = page.getByRole('button', { name: /^Position Vercel:/ });
        await marker.focus(); await page.keyboard.press('ArrowLeft');
        const before = await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length);
        const box = await marker.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + 12);
        await page.mouse.down(); await page.mouse.move(box.x - 20, box.y + 25, { steps: 5 }); await page.mouse.up();
        await page.waitForTimeout(100);
        const after = await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length);
        assert.equal(after, before + 1);
        await capture('positioning');
    });
    await step('position numeric and pointer cancellation', async () => {
        await go('/positioning');
        await page.getByRole('spinbutton', { name: 'Price coordinate for Vercel' }).fill('120');
        await page.getByRole('spinbutton', { name: 'Price coordinate for Vercel' }).press('Enter');
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_competitors')).find(c => c.id === 'vercel').positionX), 100);
        const marker = page.getByRole('button', { name: /^Position Vercel:/ });
        const before = await page.evaluate(() => localStorage.getItem('stalker_snapshots'));
        await marker.dispatchEvent('pointerdown', { pointerId: 21, pointerType: 'touch', clientX: 300, clientY: 300 });
        await page.waitForTimeout(50);
        await page.evaluate(() => {
            window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 22, clientX: 200, clientY: 200 }));
            window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 21 }));
        });
        await page.waitForTimeout(50);
        await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 22 })));
        assert.equal(await page.evaluate(() => localStorage.getItem('stalker_snapshots')), before);
    });
    await step('pricing editing', async () => {
        await go('/pricing');
        await page.getByRole('button', { name: 'Edit pricing plan', exact: true }).first().click();
        await page.getByRole('textbox', { name: 'Price', exact: true }).fill('Custom annual quote');
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await page.getByRole('button', { name: 'Edit pricing plan', exact: true }).first().click();
        await page.getByRole('textbox', { name: 'Price', exact: true }).fill('Custom annual quote');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await page.getByText('Custom annual quote', { exact: true }).waitFor();
    });
    await step('weakness and strategy', async () => {
        await go('/weaknesses');
        await page.getByRole('textbox', { name: 'Vulnerability Description' }).fill('Documented onboarding friction');
        await page.getByRole('textbox', { name: 'Source', exact: true }).fill('Public documentation review');
        await page.getByRole('button', { name: 'Log', exact: true }).click();
        await page.getByText('Documented onboarding friction', { exact: true }).waitFor();
        await go('/strategy');
        await page.getByRole('textbox', { name: 'Strategy title' }).fill('Simplify onboarding');
        await page.getByRole('combobox', { name: 'Select target competitor' }).selectOption('vercel');
        await capture('strategy-form');
        await page.getByRole('button', { name: 'Plan', exact: true }).click();
        const card = page.locator('div.relative').filter({ has: page.getByRole('heading', { name: 'Simplify onboarding' }) }).last();
        await card.getByRole('button', { name: 'Activate' }).click();
        await card.getByRole('button', { name: 'Complete' }).click();
        const strategy = await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_competitors')).find(c => c.id === 'vercel').strategies.find(s => s.title === 'Simplify onboarding'));
        assert.equal(strategy.status, 'Completed');
    });
    await step('history milestone and focus', async () => {
        await go('/dossier');
        await page.getByRole('button', { name: 'View history for Vercel', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'History for Vercel' });
        await dialog.waitFor();
        assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
        await capture('history');
        await dialog.getByRole('button', { name: 'Add Milestone', exact: true }).click();
        await page.getByRole('textbox', { name: 'Milestone Label' }).fill('Browser verification');
        await page.getByRole('button', { name: 'Save Milestone', exact: true }).click();
        await page.getByText('Browser verification', { exact: true }).waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('button', { name: 'View history for Vercel', exact: true }).evaluate(el => el === document.activeElement), true);
    });
    await step('search navigation', async () => {
        await go('/'); await page.getByRole('button', { name: 'Search workspace' }).click();
        await page.getByRole('textbox', { name: 'Search competitors and pages' }).fill('Netlify');
        await capture('search'); await page.keyboard.press('Enter');
        await page.getByRole('heading', { name: 'Netlify / Battlecard' }).waitFor();
    });
    await step('SWOT editing', async () => {
        await go('/swot');
        await page.getByRole('button').filter({ hasText: 'Vercel' }).first().click();
        await page.getByRole('button', { name: 'Add Item', exact: true }).first().click();
        await page.getByRole('textbox', { name: 'New strengths item' }).fill('Browser verified strength');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await page.getByText('Browser verified strength', { exact: true }).waitFor();
        await capture('swot-expanded');
    });
    await step('snapshot comparison', async () => {
        await go('/dossier');
        await page.getByRole('button', { name: 'View history for Vercel', exact: true }).click();
        await page.getByRole('button', { name: 'Compare', exact: true }).click();
        await page.getByRole('button', { name: /^Select snapshot / }).nth(0).click();
        await page.getByRole('button', { name: /^Select snapshot / }).nth(1).click();
        await page.getByRole('button', { name: 'Compare', exact: true }).click();
        await page.getByRole('heading', { name: 'Compare Snapshots', exact: true }).waitFor();
        await capture('snapshot-diff');
    });
    await step('export and isolated import', async () => {
        await go('/settings');
        const original = await page.evaluate(() => ({ version: '1.0', competitors: JSON.parse(localStorage.getItem('stalker_competitors')), userProfile: JSON.parse(localStorage.getItem('stalker_profile')) }));
        const history = await page.evaluate(() => localStorage.getItem('stalker_snapshots'));
        for (const name of ['Export as JSON', 'Export as CSV']) {
            const download = page.waitForEvent('download');
            await page.getByRole('button', { name, exact: true }).click();
            assert.ok((await download).suggestedFilename());
        }
        await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
        await page.getByText('Invalid file format. Please use a valid JSON export.', { exact: true }).waitFor();
        await page.locator('input[type=file]').setInputFiles({ name: 'research.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(original)) });
        await page.getByText(/Imported 6 competitors successfully/).waitFor();
        assert.equal(await page.evaluate(() => localStorage.getItem('stalker_snapshots')), history);
    });
    await step('route aliases and informational links', async () => {
        for (const route of ['/', '/dossier', '/positioning', '/matrix', '/pricing', '/social', '/weaknesses', '/alerts', '/strategy', '/swot', '/settings', '/about', '/contact', '/privacy-policy']) {
            await go(route === '/' ? '/index.html' : `${route}.html`);
            assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
        }
        await go('/contact');
        assert.equal(await page.locator('a[href^="mailto:"]').count(), 3);
    });
    await step('social manual research', async () => {
        await go('/social');
        assert.equal(await page.getByRole('link', { name: 'Research Vercel on X' }).getAttribute('href'), 'https://x.com/search?q=Vercel');
        await page.getByRole('button', { name: 'Scan local targets' }).click();
        await page.getByText(/No connected social API/).waitFor();
        await capture('social-preview');
    });
    if (device === 'mobile') await step('mobile navigation focus', async () => {
        await go('/'); await page.getByRole('button', { name: 'Open sidebar' }).click();
        const dialog = page.getByRole('dialog', { name: 'Research navigation' });
        assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true);
        await capture('navigation'); await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('button', { name: 'Open sidebar' }).evaluate(el => el === document.activeElement), true);
    });
    await step('long partial records and empty workspace', async () => {
        await go('/dossier');
        const name = 'A very long competitor name for responsive layout verification';
        await page.evaluate(name => {
            localStorage.setItem('stalker_competitors', JSON.stringify([{ id: 'partial', name, website: '', threatLevel: 'Low', features: {}, pricingModels: [], notes: '', updatedAt: 'invalid' }]));
            localStorage.setItem('stalker_profile', JSON.stringify({ name: 'Browser test business', positionX: 50, positionY: 50, features: {}, pricingModels: [] }));
            localStorage.setItem('stalker_snapshots', '[]');
        }, name);
        await go('/dossier?competitor=partial');
        await page.getByRole('heading', { name: `${name} / Battlecard` }).waitFor();
        assert.equal(await page.locator('.flex-1.overflow-auto').evaluate(el => el.scrollWidth > el.clientWidth), false);
        await capture('partial-battlecard');
        await page.evaluate(() => localStorage.setItem('stalker_competitors', '[]'));
        await go('/');
        await page.getByRole('heading', { name: 'Start your research workspace' }).waitFor();
        await capture('empty-dashboard');
        for (const route of ['/dossier', '/positioning', '/matrix', '/pricing', '/social', '/weaknesses', '/alerts', '/strategy', '/swot', '/settings']) {
            await go(route);
            assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
            assert.equal(await page.locator('.flex-1.overflow-auto').first().evaluate(el => el.scrollWidth > el.clientWidth), false);
        }
    });
    results.push({ device, name: 'page errors', passed: errors.length === 0, errors });
    await context.close();
}
await browser.close();
await writeFile('design-research/journey-evidence.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.filter(r => !r.passed), null, 2));
console.log(`${results.filter(r => r.passed).length}/${results.length} browser checks passed`);
if (results.some(r => !r.passed)) process.exitCode = 1;
