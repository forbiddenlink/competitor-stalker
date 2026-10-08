import { readFile, writeFile } from 'node:fs/promises';
const css = await readFile('src/styles/index.css', 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]));
const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const checks = [];
for (const text of ['text-primary', 'text-secondary', 'text-muted', 'text-subtle', 'accent-brand-soft', 'accent-success-soft', 'accent-warning-soft', 'accent-danger-soft', 'accent-info-soft', 'accent-purple-soft']) {
    for (const background of ['bg-base', 'bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-surface', 'bg-elevated']) {
        const contrast = ratio(tokens[text], tokens[background]);
        checks.push({ text, background, ratio: Number(contrast.toFixed(2)), pass: contrast >= 4.5 });
    }
}
for (const background of ['accent-brand', 'accent-brand-soft', 'accent-success', 'accent-success-soft', 'accent-danger', 'accent-danger-soft']) {
    const contrast = ratio(tokens['text-inverse'], tokens[background]);
    checks.push({ text: 'text-inverse', background, ratio: Number(contrast.toFixed(2)), pass: contrast >= 4.5 });
}
await writeFile('design-research/contrast-evidence.json', JSON.stringify({ method: 'Opaque token pairs, normal-text threshold 4.5:1. Excludes composited alpha surfaces, disabled states and custom chart/image content; Lighthouse supplements this check.', checks }, null, 2));
console.log(`${checks.filter(check => check.pass).length}/${checks.length} opaque text/surface pairs pass`);
if (checks.some(check => !check.pass)) { console.log(checks.filter(check => !check.pass)); process.exitCode = 1; }
