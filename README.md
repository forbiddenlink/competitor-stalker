# Competitor Stalker

A competitive intelligence dashboard for tracking and analyzing competitor strategies, pricing, positioning, and market presence. It is for solo founders and small teams. Built with React, TypeScript, and Tailwind CSS. Data stays in your browser; one serverless function fetches and parses a competitor page on request.

Live: <https://competitor-stalker.vercel.app>

## Features

### Core Intelligence
- **Dashboard** - Central hub with competitive metrics and a threat overview
- **Competitor Dossiers** - Detailed profiles including company info, key people, and revenue estimates
- **Positioning Map** - Interactive 2D map showing market positioning (drag competitors to reposition)
- **Feature Matrix** - Side-by-side comparison of features across competitors
- **Pricing Intelligence** - Monitor and compare competitor pricing tiers

### Analysis Tools
- **SWOT Analysis** - Strengths, Weaknesses, Opportunities, and Threats for each competitor
- **Weakness Spotter** - Track identified vulnerabilities with severity ratings and sources
- **Historical Tracking** - Automatic and milestone snapshots per competitor, with a timeline and diff view
- **Counter Strategy** - Develop and track strategic responses to competitive threats
- **Social Monitor** - Track competitor social media handles and presence
- **Movement Alerts** - An alerts page for competitor changes

### Productivity Features
- **Global Search** - Quick search across all competitors (`Cmd/Ctrl + K`)
- **Import/Export** - Backup and restore data as JSON or export to CSV
- **Auto-seeding** - Pre-loaded sample data for developer tools market (Railway vs competitors)
- **Toast Notifications** - Feedback on actions throughout the app
- **Public Pages** - About, Contact, and Privacy Policy routes with prerendered SEO metadata

## Sample Data

The app loads sample data for the developer tools and PaaS market. The sample is illustrative; check it before relying on it:

| Company | Threat Level | Notes |
|---------|--------------|-------|
| **Railway** | Your Company | Usage-based PaaS with great DX |
| **Vercel** | High | Frontend-focused, Next.js creator |
| **Netlify** | High | JAMstack pioneer |
| **Render** | High | Direct competitor, full-stack PaaS |
| **Fly.io** | Medium | Edge computing, container-native |
| **Heroku** | Medium | Original PaaS, Salesforce-owned |
| **DigitalOcean** | Low | Budget alternative |

Each competitor includes:
- Sample pricing tiers and feature sets
- Social media handles
- Sample weaknesses, each tagged with a source such as Reddit or HackerNews
- Market positioning coordinates
- Sample counter-strategies

You can reset to this sample data or clear all data from **Settings**.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open global search |
| `Escape` | Close modals/dialogs |
| `↑ / ↓` | Navigate search results |
| `Enter` | Select search result |

## Tech Stack

- **Framework**: React 19 with TypeScript 6.0
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 with PostCSS
- **Routing**: React Router 8
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Storage**: Browser localStorage (no database or accounts)
- **Server code**: One Vercel serverless function, `api/scrape.ts`, which fetches and parses a competitor page with `cheerio`
- **Monitoring**: Vercel Analytics + Vercel Speed Insights (production only)

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Starts the dev server at `http://localhost:5173` with hot module replacement. The `api/scrape.ts` function runs only on Vercel (or `vercel dev`), not under `pnpm dev`.

### Build

```bash
pnpm build
```

Builds for production with TypeScript checking and optimization.

### SEO + Route Prerendering

`robots.txt` and sitemap files are generated from `SITE_URL` during build, and route-level HTML
is prerendered with canonical/OpenGraph/Twitter metadata:

```bash
SITE_URL=https://your-domain.com pnpm build
```

If `SITE_URL` is not provided, it defaults to `https://competitor-stalker.vercel.app`.

This supports crawlable route metadata for:
`/`, `/dossier`, `/positioning`, `/matrix`, `/pricing`, `/social`, `/weaknesses`,
`/alerts`, `/strategy`, `/swot`, `/settings`, `/about`, `/contact`, `/privacy-policy`.

### Test

```bash
pnpm test:run
```

Runs the test suite with Vitest. Use `pnpm test:coverage` for coverage report, or `pnpm test` to watch.

### Lint

```bash
pnpm lint
```

### Bundle Budgets

```bash
pnpm check:bundles
```

Enforces max bundle sizes for entry JS/CSS and runtime JS chunks.

### Real User Performance Monitoring

Production captures Web Vitals two ways:
- `@vercel/speed-insights` for built-in Vercel performance dashboards
- `web-vitals` + `@vercel/analytics` custom `web_vital` events for metric-level analysis

Current target thresholds (p75-aligned):
- `INP`: good <= `200ms`, needs improvement <= `500ms`
- `LCP`: good <= `2500ms`, needs improvement <= `4000ms`
- `CLS`: good <= `0.1`, needs improvement <= `0.25`
- `FCP`: good <= `1800ms`, needs improvement <= `3000ms`
- `TTFB`: good <= `800ms`, needs improvement <= `1800ms`

Optional sampling configuration:

```bash
VITE_WEB_VITALS_SAMPLE_RATE=0.25 pnpm build
```

## Project Structure

```
src/
├── pages/              # Route pages (lazy-loaded)
├── components/
│   ├── common/         # Reusable UI (Button, Card, Input, Toast, Search)
│   ├── features/       # Feature-specific components
│   └── layout/         # Shell layout with sidebar
├── context/            # React Context (Competitors, Toast)
├── hooks/              # Custom hooks (useCompetitors, useLocalStorage)
├── data/               # Seed data for sample competitors
├── lib/                # Page parsing helpers (cheerio)
├── monitoring/         # Web Vitals reporting
├── types/              # TypeScript definitions
├── utils/              # Validation, formatting, import/export
├── constants/          # App constants and config
└── styles/             # Global CSS with design system
api/scrape.ts           # Serverless function: fetch and parse a competitor page
scripts/                # SEO asset generation, route prerendering, bundle budgets
```

## Data Management

### Export
- **JSON**: Full backup including competitors, user profile, and metadata
- **CSV**: Spreadsheet-compatible export of competitor data

### Import
- Upload a previously exported JSON file to restore data

### Storage
All data is stored in browser localStorage:
- `stalker_competitors` - Competitor data
- `stalker_profile` - Your company profile
- `stalker_snapshots` - Historical snapshots for change tracking
- `stalker_theme` and `stalker_sidebar_collapsed` - Interface preferences

## Future Enhancements

Potential features for future development:

- [ ] External data connectors (news, changelog feeds, pricing scrapers)
- [ ] Scheduled monitoring and alert digests
- [ ] Team collaboration and shared workspaces
- [ ] Backend persistence and auth
- [ ] Report generation (PDF/markdown) and executive summaries
- [ ] Advanced analytics (trendlines, scoring weights, anomaly detection)

## Development Notes

- Components are code-split with React.lazy for optimal loading
- Vite manual chunking splits `react-core`, `router`, `icons`, and generic `vendor` bundles
- Design system uses CSS custom properties for consistent theming
- All forms include inline validation
- Toast notifications provide action feedback
- Empty states guide users to next actions
- Mobile-responsive layout with collapsible sidebar
- Vercel rewrites map clean routes (for example `/dossier`) to prerendered HTML files
- Vercel headers include CSP, frame protection, content-type hardening, and strict referrer policy
- GitHub Actions CI runs lint, tests, production build, and bundle budget checks on every push/PR

## License

MIT. See [LICENSE](LICENSE).
