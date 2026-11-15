import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('social share image', () => {
  it.each(['og:image', 'twitter:image'])('%s is a raster image that exists in public/', (name) => {
    const m = html.match(new RegExp(`(?:property|name)="${name}" content="https://[^/]+/([^"]+)"`));
    expect(m).not.toBeNull();
    const file = m![1];
    expect(file).toMatch(/\.(png|jpe?g)$/);
    expect(existsSync(resolve(__dirname, '../public', file))).toBe(true);
  });
});
