import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), 'public');
mkdirSync(outputDir, { recursive: true });

const siteUrlEnv = process.env.SITE_URL?.trim();
const fallbackUrl = 'https://competitor-stalker.vercel.app';
const normalizedBase = new URL((siteUrlEnv || fallbackUrl).replace(/\/+$/, '')).toString().replace(/\/$/, '');

const routes = [
  { path: '/', crawlPath: '/' },
  { path: '/dossier', crawlPath: '/dossier' },
  { path: '/positioning', crawlPath: '/positioning' },
  { path: '/matrix', crawlPath: '/matrix' },
  { path: '/pricing', crawlPath: '/pricing' },
  { path: '/social', crawlPath: '/social' },
  { path: '/weaknesses', crawlPath: '/weaknesses' },
  { path: '/alerts', crawlPath: '/alerts' },
  { path: '/strategy', crawlPath: '/strategy' },
  { path: '/swot', crawlPath: '/swot' },
  { path: '/settings', crawlPath: '/settings' },
  { path: '/about', crawlPath: '/about' },
  { path: '/contact', crawlPath: '/contact' },
  { path: '/privacy-policy', crawlPath: '/privacy-policy' },
];

const urlset = routes
  .map(({ path, crawlPath }) => {
    const loc = `${normalizedBase}${crawlPath}`;
    const changefreq = path === '/' || path === '/dossier' || path === '/pricing' || path === '/alerts'
      ? 'daily'
      : path === '/settings' || path === '/about' || path === '/contact' || path === '/privacy-policy'
        ? 'monthly'
        : 'weekly';
    const priority = path === '/'
      ? '1.0'
      : path === '/dossier' || path === '/pricing' || path === '/alerts'
        ? '0.9'
        : path === '/social'
          ? '0.7'
          : path === '/settings'
            ? '0.5'
            : path === '/about' || path === '/contact' || path === '/privacy-policy'
              ? '0.4'
              : '0.8';

    return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  })
  .join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`;

const robotsContent = `User-agent: *
Allow: /

Sitemap: ${normalizedBase}/sitemap.xml
`;

const sitemapVariants = [
  'sitemap.xml',
  'sitemap_index.xml',
  'sitemap-index.xml',
  'sitemaps.xml',
  'sitemap1.xml',
  'post-sitemap.xml',
  'page-sitemap.xml',
  'news-sitemap.xml',
];

for (const filename of sitemapVariants) {
  writeFileSync(resolve(outputDir, filename), sitemapContent, 'utf8');
}

writeFileSync(resolve(outputDir, 'robots.txt'), robotsContent, 'utf8');

console.log(`Generated SEO assets using SITE_URL=${normalizedBase}`);
