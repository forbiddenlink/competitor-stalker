import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const exec = promisify(execFile);
const base = process.env.VERIFY_BASE_URL;
if (!base) throw new Error('Set VERIFY_BASE_URL to the confirmed production preview URL.');
const summary = [];
await mkdir('design-research/lighthouse', { recursive: true });
for (const [name, route] of [['dashboard', '/'], ['dossier', '/dossier'], ['matrix', '/matrix']]) {
    for (const device of ['mobile', 'desktop']) {
        const output = `design-research/lighthouse/${name}-${device}.json`;
        const args = ['dlx', 'lighthouse@13.5.0', `${base}${route}`, '--chrome-path=/Users/elizabethstein/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell', '--chrome-flags=--headless --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${output}`, '--quiet'];
        if (device === 'desktop') args.push('--preset=desktop');
        try {
            await exec('pnpm', args, { timeout: 120000, maxBuffer: 1024 * 1024 });
            const report = JSON.parse(await readFile(output, 'utf8'));
            const row = { name, route, device, runtimeError: report.runtimeError, scores: Object.fromEntries(Object.entries(report.categories).map(([key, category]) => [key, Math.round(category.score * 100)])), failures: Object.values(report.audits).filter(audit => audit.scoreDisplayMode === 'binary' && audit.score === 0).map(audit => ({ id: audit.id, title: audit.title, details: audit.details?.items })) };
            summary.push(row); console.log(JSON.stringify(row));
        } catch (error) { summary.push({ name, route, device, error: String(error) }); console.log(`${name} ${device}: ${error}`); }
        await writeFile('design-research/lighthouse-summary.json', JSON.stringify(summary, null, 2));
    }
}
if (summary.some(row => row.error || row.runtimeError)) process.exitCode = 1;
