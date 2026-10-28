# competitor-stalker

Competitive intelligence dashboard: competitor dossiers, positioning map, feature
matrix, pricing intelligence, SWOT, weakness tracking, counter strategy.
No user backend; all data lives in browser `localStorage`. One Vercel serverless
function (`api/scrape.ts`) fetches and parses a competitor's page server-side.
Live at https://competitor-stalker.vercel.app.

## Stack

- React 19, TypeScript 5.9, Vite 8 (README says Vite 7; package.json pins `^8.2.2`)
- Tailwind CSS 4 + PostCSS, React Router 8
- Vitest + React Testing Library + jsdom
- ESLint flat config (`eslint.config.js`)
- pnpm (`packageManager: pnpm@10.18.0`, pnpm-lock.yaml)
- Vercel: static build + one serverless function + prerendered route HTML

## Commands

- `pnpm dev` - Vite dev server (port 5173)
- `pnpm build` - `tsc -b && vite build`, with `prebuild` generating SEO assets
  and `postbuild` prerendering per-route HTML
- `pnpm lint` - ESLint
- `pnpm test` / `pnpm test:run` - Vitest (watch / single run)
- `pnpm test:coverage` - Vitest with coverage
- `pnpm check:bundles` - post-build bundle size budget check
- `pnpm exec tsc -b` - type-check only
- Full pre-submit: `pnpm exec tsc -b && pnpm lint && pnpm test:run && pnpm build && pnpm check:bundles`

## Architecture

- No backend for app data. `localStorage` keys: `stalker_competitors`,
  `stalker_profile`, `stalker_snapshots`.
- `src/context/CompetitorContext.tsx` is the single global store, wrapping
  `useLocalStorage`. Always consume it via the `useCompetitors()` hook
  (`src/hooks/useCompetitors.ts`), never raw `useContext(CompetitorContext)`
  (the hook has a provider guard). `useSnapshots` manages historical snapshots.
- `ToastContext` provides transient notifications.
- All pages are lazy-loaded in `App.tsx` via `React.lazy`.
- `scripts/generate-seo-assets.mjs` writes `dist/sitemap.xml` / `robots.txt`;
  `scripts/prerender-route-html.mjs` generates per-route HTML with metadata;
  `scripts/check-bundle-budgets.mjs` enforces bundle size limits in CI.
- `vercel.json` rewrites clean routes (e.g. `/dossier`) to the prerendered
  `.html` files, and sets CSP/frame/referrer headers.

## Layout

```
src/
├── components/{common,features,layout}
├── context/       # CompetitorContext, ToastContext
├── hooks/         # useCompetitors, useLocalStorage, useSnapshots
├── pages/         # route-level, lazy-loaded
├── data/          # seed data
├── types/, utils/, constants/, styles/, monitoring/, test/
api/scrape.ts      # Vercel function: fetches + parses a competitor URL,
                   # with SSRF guards against private/loopback/link-local IPs
```

## Testing conventions

- Tests live in `__tests__/` next to source; setup mocks `localStorage` and
  `matchMedia` in `src/test/setup.ts`.
- Wrap context-dependent components in `<CompetitorContext.Provider>`.
- Prefer `screen.getByRole` / `screen.getByText`; use `aria-label` on
  icon-only buttons.

## Env vars

- `SITE_URL` - used by `scripts/generate-seo-assets.mjs` and
  `scripts/prerender-route-html.mjs`; defaults to the production URL if unset.
- `VITE_WEB_VITALS_SAMPLE_RATE` - read in `src/monitoring/webVitals.ts`.

## Gotchas

- `isUniqueName` in `validation.ts` takes an `excludeName` string, not an ID.
- `formatDate` / `formatRelativeTime` use the browser locale; tests should
  assert with `toContain` on date parts, not exact strings.
- `downloadFile` in `export.ts` touches the DOM directly; mock
  `document.createElement` / `URL.createObjectURL` in tests.
- `WeaknessSpotter` uses derived state for auto-selection, not `setState`
  during render; see its test file for the pattern.
