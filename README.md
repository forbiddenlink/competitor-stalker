# Competitor Stalker

A competitive intelligence dashboard for tracking and analyzing competitor strategies, pricing, positioning, and market presence. Built with React, TypeScript, and Tailwind CSS.

## Features

### Core Intelligence
- **Dashboard** - Central hub with real-time competitive metrics and threat overview
- **Competitor Dossiers** - Detailed profiles including company info, key people, and revenue estimates
- **Positioning Map** - Interactive 2D map showing market positioning (drag competitors to reposition)
- **Feature Matrix** - Side-by-side comparison of features across competitors
- **Pricing Intelligence** - Monitor and compare competitor pricing tiers

### Analysis Tools
- **SWOT Analysis** - Strengths, Weaknesses, Opportunities, and Threats for each competitor
- **Weakness Spotter** - Track identified vulnerabilities with severity ratings and sources
- **Counter Strategy** - Develop and track strategic responses to competitive threats
- **Social Monitor** - Track competitor social media handles and presence

### Productivity Features
- **Global Search** - Quick search across all competitors (`Cmd/Ctrl + K`)
- **Import/Export** - Backup and restore data as JSON or export to CSV
- **Auto-seeding** - Pre-loaded sample data for developer tools market (Railway vs competitors)
- **Toast Notifications** - Feedback on actions throughout the app

## Sample Data

The app comes pre-loaded with real competitive intelligence data for the **developer tools/PaaS market**:

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
- Real pricing tiers and feature sets
- Social media handles
- Documented weaknesses from G2, Reddit, HackerNews
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

- **Framework**: React 19 with TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with PostCSS
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Storage**: Browser localStorage (no backend required)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the dev server at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Builds for production with TypeScript checking and optimization.

### Test

```bash
npm test
```

Runs the test suite with Vitest. Use `npm test -- --coverage` for coverage report.

### Lint

```bash
npm run lint
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
├── types/              # TypeScript definitions
├── utils/              # Validation, formatting, import/export
├── constants/          # App constants and config
└── styles/             # Global CSS with design system
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

## Future Enhancements

Potential features for future development:

- [ ] Historical tracking (changes over time)
- [ ] API integrations for real-time data
- [ ] Competitor news feed aggregation
- [ ] Team collaboration features
- [ ] Backend persistence option
- [ ] Comparison report generation (PDF/markdown)
- [ ] Custom positioning axes

## Development Notes

- Components are code-split with React.lazy for optimal loading
- Design system uses CSS custom properties for consistent theming
- All forms include inline validation
- Toast notifications provide action feedback
- Empty states guide users to next actions
- Mobile-responsive layout with collapsible sidebar

## License

MIT
