# AGENTS.md — Competitor Stalker

## Quick reference

```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # TypeScript check → Vite build → SEO assets → prerender
npm run lint         # ESLint (flat config, eslint.config.js)
npm test             # Vitest in watch mode
npm run test:run     # Vitest single run (CI)
npm run check:bundles # Post-build bundle budget check
npx tsc -b           # Type-check only
```

Full pre-submit: `npx tsc -b && npx eslint . && npx vitest run && npm run build && npm run check:bundles`

## Stack

- **UI**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4
- **Routing**: React Router 7 (lazy-loaded pages via `React.lazy`)
- **Testing**: Vitest + React Testing Library + jsdom
- **Deployment**: Vercel (static), prerendered route HTML, security headers in `vercel.json`
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

## Architecture

### No backend
All data lives in browser `localStorage`. Keys:
- `stalker_competitors` — competitor array
- `stalker_profile` — user's business profile
- `stalker_snapshots` — historical competitor snapshots

### Directory layout
```
src/
├── components/
│   ├── common/       # Button, Badge, Card, Modal, ErrorBoundary, Layout, Sidebar
│   └── features/     # Feature modules (dossier, pricing, weaknesses, alerts, etc.)
├── context/          # CompetitorContext (provider + raw context) and ToastContext
├── hooks/            # useCompetitors, useLocalStorage, useSnapshots
├── pages/            # Route-level components (lazy-loaded in App.tsx)
├── styles/           # CSS custom properties design system + Tailwind
├── types/            # Shared TypeScript interfaces (Competitor, BusinessProfile, etc.)
├── utils/            # Pure functions: validation, format, export/import
├── test/             # Test setup (localStorage + matchMedia mocks)
└── data/             # Seed data (seed-competitors.ts, seed-profile.ts)
scripts/
├── generate-seo-assets.mjs    # Sitemap + robots.txt generation
├── prerender-route-html.mjs   # Per-route HTML with metadata
└── check-bundle-budgets.mjs   # Bundle size limits (enforced in CI)
```

### State management
- `CompetitorContext` is the single global store. It wraps `useLocalStorage` for persistence.
- **Always use `useCompetitors()` hook** (from `src/hooks/useCompetitors.ts`) to consume context — never raw `useContext(CompetitorContext)`. The hook includes a provider guard.
- `useSnapshots` manages historical competitor snapshots separately.
- `ToastContext` provides transient success/error notifications.

### Build pipeline
1. `prebuild`: `generate-seo-assets.mjs` writes `dist/sitemap.xml` and `dist/robots.txt`
2. `build`: Vite produces chunked output with manual chunks: `vendor` (react+deps), `icons` (lucide-react)
3. `postbuild`: `prerender-route-html.mjs` generates per-route HTML files with unique metadata

### Bundle budgets (checked in CI)
- Entry JS (gzip): 65 KB
- Entry CSS (gzip): 12 KB
- Runtime JS (gzip): 105 KB

## Testing conventions

- Test files live next to source in `__tests__/` directories.
- Test setup is in `src/test/setup.ts` — mocks `localStorage` and `matchMedia`.
- Components that need context should be wrapped in `<CompetitorContext.Provider value={...}>`.
- Pure utility functions (`src/utils/`) are tested without any provider setup.
- Prefer `screen.getByRole` and `screen.getByText` selectors; use `aria-label` for icon-only buttons.
- Run `npx vitest run` (not `npm test`) for non-interactive single-pass execution.

## Conventions

- CSS uses design-system custom properties defined in `src/styles/` (e.g., `var(--accent-danger)`).
- Threat-level colors: `danger` = High, `warning` = Medium, `success` = Low.
- Date strings stored as ISO 8601 (`toISOString().split('T')[0]` for date-only).
- All pages are lazy-loaded in `App.tsx` via `React.lazy(() => import(...))`.
- ESLint uses flat config (`eslint.config.js`), not `.eslintrc`.

## Common pitfalls

- `isUniqueName` in `validation.ts` accepts an `excludeName` param (not an ID) — it compares normalized name strings.
- `formatDate` / `formatRelativeTime` use the browser's locale — avoid hardcoding date format expectations in tests; use `toContain` on date parts.
- `downloadFile` in `export.ts` manipulates the DOM (creates/removes anchor element) — mock `document.createElement`, `URL.createObjectURL`, etc. in tests.
- The `WeaknessSpotter` component uses derived state for auto-selection (not `setState` during render) — see its test file for the pattern.
