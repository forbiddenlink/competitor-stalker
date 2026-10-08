import { chromium } from '/Users/elizabethstein/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.VERIFY_BASE_URL;
if (!base) throw new Error('Set a confirmed local checkout URL');
const browser = await chromium.launch({ headless: true, executablePath: '/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const dir = 'functional-review/evidence'; await mkdir(dir, { recursive: true });
const routes = ['/', '/dossier', '/positioning', '/matrix', '/pricing', '/social', '/weaknesses', '/alerts', '/strategy', '/swot', '/settings', '/about', '/contact', '/privacy-policy'];
const results = [], inventory = [];
const record = { id: 'audit-one', name: 'Audit One', website: 'https://example.com', notes: '', threatLevel: 'Medium', features: { Deploy: 'Have' }, pricingModels: ['A', 'B', 'C'].map((name, i) => ({ name, price: `$${i + 1}`, description: 'Audit plan' })) };
const profile = { name: 'Audit Business', positionX: 50, positionY: 50, features: { Deploy: 'Have' }, pricingModels: record.pricingModels };
for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const go = async route => { await page.goto(`${base}${route}`, { waitUntil: 'networkidle' }); assert.ok((await page.title()).includes('| Stalker | Competitive Intelligence'), 'Unexpected application'); };
    const reset = async () => {
        await go('/');
        await page.evaluate(({ record, profile }) => {
            localStorage.setItem('stalker_competitors', JSON.stringify([record]));
            localStorage.setItem('stalker_profile', JSON.stringify(profile));
            localStorage.setItem('stalker_snapshots', '[]');
        }, { record, profile }); await page.reload({ waitUntil: 'networkidle' });
    };
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('stalker_competitors')));
    const step = async (name, action) => {
        try { await action(); results.push({ device, name, passed: true }); }
        catch (error) { results.push({ device, name, passed: false, error: String(error) }); try { await page.screenshot({ animations: 'disabled', timeout: 30000, path: `${dir}/failed-${name.replaceAll(' ', '-')}-${device}.png` }); } catch (captureError) { results.at(-1).captureError = String(captureError); } }
        await writeFile(`${dir}/audit-browser.json`, JSON.stringify(results, null, 2));
    };
    await step('all page families and controls', async () => {
        await reset();
        for (const route of routes) {
            await go(route);
            inventory.push({ device, route, title: await page.title(), headings: await page.locator('h1,h2,h3').allTextContents(), controls: await page.locator('button,input,select,textarea,a[href]').evaluateAll(items => items.map(item => ({ tag: item.tagName, name: item.getAttribute('aria-label') || item.textContent?.trim().slice(0, 100) || item.getAttribute('placeholder'), href: item.getAttribute('href'), disabled: item.disabled ?? false }))), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
            assert.equal(inventory.at(-1).overflow, false, route);
            await page.screenshot({ animations: 'disabled', timeout: 30000, path: `${dir}/${route === '/' ? 'dashboard' : route.slice(1)}-${device}.png` });
        }
        await writeFile(`${dir}/control-inventory.json`, JSON.stringify(inventory, null, 2));
    });
    await step('pricing deletion keeps drafts with intended plans', async () => {
        await reset(); await go('/pricing');
        for (const owner of ['Audit Business', 'Audit One']) {
            const section = page.locator('section').filter({ has: page.getByRole('heading', { name: owner, exact: true }) });
            await section.getByRole('button', { name: 'Edit pricing plan' }).nth(1).click();
            await section.getByLabel('Plan Name', { exact: true }).fill('B revised');
            await section.getByRole('button', { name: 'Delete pricing plan' }).first().click();
            await section.getByRole('button', { name: 'Save', exact: true }).click();
            await section.getByRole('heading', { name: 'B revised' }).waitFor();
            await section.getByRole('heading', { name: 'C', exact: true }).waitFor();
        }
        await page.reload({ waitUntil: 'networkidle' });
        assert.deepEqual((await saved())[0].pricingModels.map(p => p.name), ['B revised', 'C']);
    });
    await step('invalid nested import does not replace data and same file retries', async () => {
        await reset(); await go('/settings');
        const before = await saved();
        const file = { name: 'audit-invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ competitors: [{ ...record, features: null }], userProfile: profile })) };
        await page.locator('input[type=file]').setInputFiles(file);
        await page.getByText('Invalid file format.', { exact: false }).waitFor();
        assert.deepEqual(await saved(), before);
        await page.waitForFunction(() => document.querySelector('input[type=file]').value === '');
        assert.equal(await page.locator('input[type=file]').inputValue(), '');
        await page.locator('input[type=file]').setInputFiles(file);
        await page.waitForFunction(() => document.querySelector('input[type=file]').value === '');
        assert.equal(await page.locator('input[type=file]').inputValue(), '');
    });
    await step('clear and reset remove history and persist after reload', async () => {
        await reset(); await go('/matrix');
        await page.getByRole('button', { name: 'Audit One: Deploy — Have. Change status' }).click();
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length), 1);
        await go('/settings'); await page.getByRole('button', { name: 'Clear', exact: true }).click();
        await page.getByRole('button', { name: 'Delete All', exact: true }).click();
        await page.reload({ waitUntil: 'networkidle' });
        assert.deepEqual(await saved(), []);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length), 0);
        await page.getByRole('button', { name: 'Reset', exact: true }).click(); await page.getByRole('button', { name: 'Confirm', exact: true }).click();
        await page.reload({ waitUntil: 'networkidle' }); assert.equal((await saved()).length, 6);
        assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length), 0);
    });
    await step('backup restores history and legacy import preserves it', async () => {
        await reset(); await go('/matrix'); await page.getByRole('button', { name: 'Audit One: Deploy — Have. Change status' }).click();
        await go('/settings'); const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Export as JSON' }).click();
        const stream = await (await downloadPromise).createReadStream(); let backup = ''; for await (const chunk of stream) backup += chunk;
        assert.equal(JSON.parse(backup).snapshots.length, 1);
        await page.getByRole('button', { name: 'Clear', exact: true }).click(); await page.getByRole('button', { name: 'Delete All', exact: true }).click();
        await page.locator('input[type=file]').setInputFiles({ name: 'audit-backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
        await page.getByText('Imported 1 competitors successfully!').waitFor();
        await page.reload({ waitUntil: 'networkidle' }); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length), 1);
        await page.locator('input[type=file]').setInputFiles({ name: 'audit-legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ competitors: [record], userProfile: profile })) });
        await page.getByText('Imported 1 competitors successfully!').waitFor(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stalker_snapshots')).length), 1);
    });
    await step('scrape failure retry saved response and malformed response recovery', async () => {
        await reset(); let attempts = 0;
        await page.route('**/api/scrape', async route => {
            attempts++; const request = route.request().postDataJSON(); assert.equal(request.url, 'https://example.com');
            await route.fulfill({ status: attempts === 1 ? 503 : 200, contentType: 'application/json', body: JSON.stringify(attempts === 1 ? { error: 'Audit service unavailable' } : { title: 'Audit extracted page', description: 'Audit extracted description', pricing: '', features: [], h1: '', h2s: [], socialLinks: { twitter: 'https://x.com/audit_handle' }, techStack: [], ctaButtons: [] }) });
        });
        await go('/dossier'); await page.getByRole('button', { name: 'Open battlecard for Audit One' }).click(); await page.getByRole('button', { name: 'Edit dossier' }).click();
        const dialog = page.getByRole('dialog'); await dialog.getByRole('button', { name: 'Scan', exact: true }).click();
        await dialog.getByText('Audit service unavailable').waitFor(); await dialog.getByRole('button', { name: 'Scan', exact: true }).click();
        await dialog.getByText('Data extracted successfully').waitFor(); await dialog.getByRole('button', { name: 'Save Changes' }).click();
        await page.reload({ waitUntil: 'networkidle' }); assert.equal((await saved())[0].socialHandles.twitter, 'audit_handle');
        await page.unroute('**/api/scrape');
        await page.route('**/api/scrape', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"title":"incomplete"}' }));
        await page.getByRole('button', { name: 'Edit dossier' }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Scan', exact: true }).click();
        await page.getByText('Page extraction returned invalid data.', { exact: false }).waitFor(); await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click(); await page.unroute('**/api/scrape');
    });
    await step('history current comparison milestone focus and keyboard containment', async () => {
        await reset(); await go('/matrix'); await page.getByRole('button', { name: 'Audit One: Deploy — Have. Change status' }).click();
        await go('/dossier'); await page.getByRole('button', { name: 'View history' }).click();
        const drawer = page.getByRole('dialog'); await drawer.getByRole('button', { name: 'Compare with current' }).click();
        await drawer.getByText('Comparing Snapshots').waitFor(); assert.ok(await drawer.evaluate(el => el.contains(document.activeElement)));
        await drawer.getByRole('button', { name: 'Back to timeline' }).click(); await drawer.getByRole('button', { name: 'Add Milestone' }).click();
        await drawer.getByLabel('Milestone Label').fill('Audit evidence reviewed'); await drawer.getByRole('button', { name: 'Save Milestone' }).click();
        await drawer.getByText('Audit evidence reviewed', { exact: true }).waitFor(); assert.ok(await drawer.evaluate(el => el.contains(document.activeElement)));
        for (let i = 0; i < 12; i++) { await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab'); assert.ok(await drawer.evaluate(el => el.contains(document.activeElement))); }
        await page.keyboard.press('Escape'); await drawer.waitFor({ state: 'hidden' }); assert.equal(await drawer.count(), 0);
    });
    await step('blank weakness prevention source honesty and padded search', async () => {
        await reset(); await go('/weaknesses'); await page.getByLabel('Vulnerability Description').fill('   '); await page.getByRole('button', { name: 'Log', exact: true }).click();
        assert.equal((await saved())[0].weaknesses?.length || 0, 0);
        await page.getByLabel('Vulnerability Description').fill('  Audit finding  '); await page.getByRole('button', { name: 'Log', exact: true }).click();
        assert.equal((await saved())[0].weaknesses[0].source, 'Unknown');
        await page.getByRole('button', { name: 'Search workspace' }).click(); await page.getByRole('textbox', { name: 'Search competitors and pages' }).fill(' Audit One ');
        await page.getByRole('dialog', { name: 'Command palette' }).getByRole('button', { name: /Audit One/ }).waitFor(); await page.keyboard.press('Escape');
    });
    await step('quota failure stays visible and draft can be exported', async () => {
        await reset(); await go('/matrix'); await page.evaluate(() => {
            const original = Storage.prototype.setItem;
            window.auditRestoreStorage = () => { Storage.prototype.setItem = original; };
            Storage.prototype.setItem = () => { throw new DOMException('Audit quota', 'QuotaExceededError'); };
        });
        await page.getByRole('button', { name: 'Audit One: Deploy — Have. Change status' }).click();
        await page.getByRole('alert').filter({ hasText: 'Changes are not saved' }).waitFor();
        await page.getByRole('link', { name: 'Open backup controls' }).click();
        const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export as JSON' }).click();
        const stream = await (await downloadPromise).createReadStream(); let text = ''; for await (const chunk of stream) text += chunk;
        assert.equal(JSON.parse(text).competitors[0].features.Deploy, 'Better');
        await page.evaluate(() => window.auditRestoreStorage());
    });
    await step('malformed stored data has visible recovery without overwriting original', async () => {
        await reset(); await page.evaluate(() => localStorage.setItem('stalker_competitors', '{"bad":"shape"}')); await page.reload({ waitUntil: 'networkidle' });
        await page.getByRole('alert').filter({ hasText: 'Saved data could not be read' }).waitFor();
        assert.equal(await page.evaluate(() => localStorage.getItem('stalker_competitors')), '{"bad":"shape"}');
        await page.getByRole('link', { name: 'Open backup controls' }).click(); await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor();
        await page.getByLabel('Your business name').fill('Recovered draft');
        const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download original storage' }).click();
        const stream = await (await downloadPromise).createReadStream(); let raw = ''; for await (const chunk of stream) raw += chunk;
        assert.equal(JSON.parse(raw).stalker_competitors, '{"bad":"shape"}');
        await go('/dossier');
        await page.getByRole('button', { name: 'Add Target', exact: true }).click();
        await page.getByLabel('Company Name *').fill('Recovery draft');
        await page.getByRole('button', { name: 'Add Competitor', exact: true }).last().click();
        assert.equal(await page.evaluate(() => localStorage.getItem('stalker_competitors')), '{"bad":"shape"}');
        await page.getByRole('alert').filter({ hasText: 'Saved data could not be read' }).waitFor();
    });
    await step('business name saves and survives reload', async () => {
        await reset(); await go('/settings'); await page.getByLabel('Your business name').fill('Audit Company');
        await page.reload({ waitUntil: 'networkidle' }); assert.equal(await page.getByLabel('Your business name').inputValue(), 'Audit Company');
    });
    results.push({ device, name: 'page exceptions', passed: errors.length === 0, errors });
    await context.close();
}
await browser.close(); await writeFile(`${dir}/audit-browser.json`, JSON.stringify(results, null, 2));
console.log(`${results.filter(r => r.passed).length}/${results.length} audit browser checks pass`);
console.log(JSON.stringify(results.filter(r => !r.passed), null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
