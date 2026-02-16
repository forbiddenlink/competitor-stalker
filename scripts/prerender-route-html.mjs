import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const indexPath = resolve(distDir, 'index.html');

const inlineStylesheet = (html) => {
  const stylesheetTagPattern = /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/i;
  const stylesheetTagMatch = html.match(stylesheetTagPattern);
  if (!stylesheetTagMatch) {
    return html;
  }

  const stylesheetHref = stylesheetTagMatch[1];
  const stylesheetPath = resolve(distDir, stylesheetHref.replace(/^\//, ''));
  if (!existsSync(stylesheetPath)) {
    throw new Error(`Could not find compiled stylesheet at ${stylesheetPath}`);
  }

  const stylesheetContent = readFileSync(stylesheetPath, 'utf8');
  const inlinedStyles = `<style data-inlined-styles>${stylesheetContent}</style>`;
  return html.replace(stylesheetTagPattern, inlinedStyles);
};

const baseHtml = inlineStylesheet(readFileSync(indexPath, 'utf8'));

const siteUrlEnv = process.env.SITE_URL?.trim();
const fallbackUrl = 'https://competitor-stalker.vercel.app';
const baseUrl = new URL((siteUrlEnv || fallbackUrl).replace(/\/+$/, '')).toString().replace(/\/$/, '');

const routeMetadata = {
  '/': {
    title: 'Dashboard | Stalker',
    description: 'Central intelligence dashboard for tracking competitor risk, movement, and strategic response.',
  },
  '/dossier': {
    title: 'Competitor Dossiers | Stalker',
    description: 'Maintain detailed competitor profiles, summaries, notes, and key commercial signals.',
  },
  '/positioning': {
    title: 'Positioning Map | Stalker',
    description: 'Compare competitors on a live positioning map to identify whitespace and direct pressure.',
  },
  '/matrix': {
    title: 'Feature Matrix | Stalker',
    description: 'Analyze feature parity and product differentiation across your competitive landscape.',
  },
  '/pricing': {
    title: 'Pricing Intel | Stalker',
    description: 'Track competitor plans, packaging, and pricing shifts to inform commercial strategy.',
  },
  '/social': {
    title: 'Social Monitor | Stalker',
    description: 'Monitor competitor social presence and messaging changes over time.',
  },
  '/weaknesses': {
    title: 'Weakness Spotter | Stalker',
    description: 'Capture verified competitor weaknesses and evidence to support your positioning strategy.',
  },
  '/alerts': {
    title: 'Movement Alerts | Stalker',
    description: 'Review movement alerts and stay ahead of strategic competitor changes.',
  },
  '/strategy': {
    title: 'Counter Strategy | Stalker',
    description: 'Plan and track strategic response initiatives against top competitive threats.',
  },
  '/swot': {
    title: 'SWOT Analysis | Stalker',
    description: 'Maintain SWOT context for each competitor and map opportunity against risk.',
  },
  '/settings': {
    title: 'Settings | Stalker',
    description: 'Manage exports, imports, and data controls for your intelligence workspace.',
  },
  '/about': {
    title: 'About | Stalker',
    description: 'Learn how Stalker helps teams make faster, better competitive decisions.',
  },
  '/contact': {
    title: 'Contact | Stalker',
    description: 'Contact the Stalker team for product support and partnership inquiries.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Stalker',
    description: 'Read how data is handled in the Stalker competitive intelligence workspace.',
  },
};

const TITLE_SUFFIX = ' | Competitive Intelligence';
const DESCRIPTION_SUFFIX =
  ' Trusted by teams for fast, evidence-based decisions.';

const replaceTag = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in dist/index.html`);
  }
  return html.replace(pattern, replacement);
};

const renderRouteHtml = (route, metadata) => {
  const routePath = route === '/' ? '/' : route.replace(/\/$/, '');
  const url = `${baseUrl}${routePath}`;
  const pageTitle = `${metadata.title}${TITLE_SUFFIX}`;
  const pageDescription = `${metadata.description}${DESCRIPTION_SUFFIX}`;

  let html = baseHtml;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`, 'title');
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${pageDescription}" />`,
    'description meta',
  );
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
    'canonical link',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${pageTitle}" />`,
    'og:title meta',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${pageDescription}" />`,
    'og:description meta',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
    'og:url meta',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${baseUrl}/favicon.svg" />`,
    'og:image meta',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${pageTitle}" />`,
    'twitter:title meta',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${pageDescription}" />`,
    'twitter:description meta',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${baseUrl}/favicon.svg" />`,
    'twitter:image meta',
  );

  return html;
};

for (const [route, metadata] of Object.entries(routeMetadata)) {
  const html = renderRouteHtml(route, metadata);
  if (route === '/') {
    writeFileSync(indexPath, html, 'utf8');
    continue;
  }

  writeFileSync(resolve(distDir, `${route.slice(1)}.html`), html, 'utf8');
}

console.log(`Prerendered ${Object.keys(routeMetadata).length} route HTML files for ${baseUrl}`);
