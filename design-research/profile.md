# Site profile — phase 1

Recorded October 8, 2026. Baseline commit: `28e0dbc`; upgrade branch: `design/upgrade`.

## Purpose and audience

Competitor Stalker is a browser-local competitive intelligence workspace for comparing competitors and turning research into response strategies.

The existing About page addresses product, strategy, and go-to-market teams. The actual storage architecture supports an individual browser workspace, with manual export/import for transfer, rather than shared team accounts. The primary action should be to add a competitor, build an evidence-backed dossier, then compare capabilities/pricing and record a response. This is an interpretation of existing functionality, not a verified business strategy.

The root page is an application dashboard, not a public acquisition landing page. Preserve that role and all existing routes.

## Repository and runtime

- `src/App.tsx`: BrowserRouter, lazy page imports, metadata, provider composition, route loading state.
- `src/components/layout/Shell.tsx`: sidebar, grouped navigation, mobile drawer, header, search palette, footer.
- `src/components/common/`: Button, Input/TextArea/Select, Badge/ThreatBadge, Card and card subcomponents, SearchCommand, Toast, ErrorBoundary.
- `src/components/features/`: dossiers and forms; positioning; matrix; pricing; social; weaknesses; alerts; strategy; historical timeline, milestone form and snapshot comparison.
- `src/pages/`: 14 route templates, some thin feature wrappers, plus standalone dashboard, SWOT, settings and informational pages.
- `src/context/CompetitorContext.tsx`: global competitor/profile store and snapshot operations; consumed through `useCompetitors`.
- `src/hooks/`: storage, snapshots, scrape request, provider guard.
- `src/types/index.ts`: typed content models; `src/data/seedData.ts`: sample hosting-platform competitor dataset and Railway business profile.
- `src/utils/`: validation, formatting, CSV/JSON transfer.
- `api/scrape.ts`: Vercel POST endpoint for public page extraction, with SSRF protections. The Vite development server does not itself host this serverless function.
- `scripts/`: SEO asset generation, per-route HTML prerendering, build-size checks.
- `src/main.tsx`: production-only Vercel Analytics, Speed Insights and custom web-vitals sampling.
- `vercel.json`: existing static route rewrites and security headers. No changes authorized to production or URLs.
- Package metadata currently declares React 19.2, TypeScript 6.0, Vite 8.2, React Router 8.3, Tailwind 4.3 and Vitest 4.1. The supplied project summary is stale for TypeScript. CI selects Node 22; local runtime verified as Node 22.23.1. pnpm is pinned to 10.18.0.

## Routes, templates and baseline screenshots

All 14 templates loaded in headless Chromium locally. Desktop: 1440 × 1000. Mobile: 390 × 844. Browser contexts were newly created for this task; existing user browser data was not used. All routes share the shell. Every clean route has a corresponding `.html` alias; root also has `/index.html`. Unknown routes currently redirect to root. Preserve these aliases and behavior.

| Route | Template / content | Main existing actions | Desktop | Mobile |
|---|---|---|---|---|
| `/` | Dashboard, four KPIs, first five competitors, threat summary | Reload page | [Before](screenshots/before/dashboard-desktop.png) | [Before](screenshots/before/dashboard-mobile.png) |
| `/dossier` | DossierGrid / DossierCard, competitor form modal | Add, edit, delete, scrape, research, history | [Before](screenshots/before/dossier-desktop.png) | [Before](screenshots/before/dossier-mobile.png) |
| `/positioning` | PositioningMap, price/quality grid | Mouse drag competitor and business markers | [Before](screenshots/before/positioning-desktop.png) | [Before](screenshots/before/positioning-mobile.png) |
| `/matrix` | FeatureMatrix, horizontally scrolling table | Add feature, cycle comparison status | [Before](screenshots/before/matrix-desktop.png) | [Before](screenshots/before/matrix-mobile.png) |
| `/pricing` | PricingIntel / PricingCard, business and competitor tiers | Add, edit and delete pricing plans | [Before](screenshots/before/pricing-desktop.png) | [Before](screenshots/before/pricing-mobile.png) |
| `/social` | SocialSurveillance, handles and empty feed | Edit handles, filter targets, simulated scan | [Before](screenshots/before/social-desktop.png) | [Before](screenshots/before/social-mobile.png) |
| `/weaknesses` | WeaknessSpotter, target selector, evidence form and list | Add sourced weakness, choose severity, delete | [Before](screenshots/before/weaknesses-desktop.png) | [Before](screenshots/before/weaknesses-mobile.png) |
| `/alerts` | MovementAlerts, type filters, empty list/detail | Filter, mark read; no alert ingestion | [Before](screenshots/before/alerts-desktop.png) | [Before](screenshots/before/alerts-mobile.png) |
| `/strategy` | CounterStrategy, three-column board | Add strategy, activate, complete, delete | [Before](screenshots/before/strategy-desktop.png) | [Before](screenshots/before/strategy-mobile.png) |
| `/swot` | SwotPage, threat filter, expandable competitor quadrants | Add/remove SWOT items | [Before](screenshots/before/swot-desktop.png) | [Before](screenshots/before/swot-mobile.png) |
| `/settings` | SettingsPage, data overview, transfer and danger zone | Export JSON/CSV, import, reset, clear | [Before](screenshots/before/settings-desktop.png) | [Before](screenshots/before/settings-mobile.png) |
| `/about` | Informational sections | Contact/privacy links | [Before](screenshots/before/about-desktop.png) | [Before](screenshots/before/about-mobile.png) |
| `/contact` | Support channels and response-time copy | Three mailto links, privacy link | [Before](screenshots/before/contact-desktop.png) | [Before](screenshots/before/contact-mobile.png) |
| `/privacy-policy` | Existing policy and date | Contact link | [Before](screenshots/before/privacy-policy-desktop.png) | [Before](screenshots/before/privacy-policy-mobile.png) |

Scrollable templates also have `*-bottom.png` captures of their lower content. The shell uses an internal scrolling region, so a full-page browser screenshot alone does not expose all content. Top and bottom views are baseline samples, not stitched captures of every intermediate scroll position. Contact sheets are inspection aids assembled from real Chromium screenshots.

Shared state captures: `competitor-form-{desktop,mobile}.png`, `history-{desktop,mobile}.png`, `search-{desktop,mobile}.png`, and `navigation-mobile.png`. Captures and machine-readable observations live together under this directory. These document existing presentation, not successful end-to-end feature verification.

## Current design system

`src/styles/index.css:3` defines the existing dark zinc palette. Base `#09090b`, primary `#0c0c0f`, secondary `#121218`, tertiary `#18181b`; translucent white border scale; text `#e4e4e7`, `#a1a1aa`, `#71717a`, `#52525b`. Brand blue `#3b82f6`, success green `#22c55e`, warning amber `#f59e0b`, danger red `#ef4444`, info cyan `#06b6d4`, purple `#a855f7`.

Sans stack begins with Inter, followed by Segoe UI, Roboto, Helvetica Neue and Arial. No font file or external font stylesheet is loaded by `index.html`, so Inter availability depends on the device. Mono stack is system monospace; display stack is Georgia/Times. Body is 14px/1.6. Headings range from 2rem down to .875rem; utility classes frequently override the scale. KPI values use 30px monospace (`src/styles/index.css:444`).

Spacing tokens run from 4px to 80px. Radii run from 6px to 20px with separate control/card/modal tokens. Existing 140–350ms transitions, fade/slide/scale entry animations, shimmer, spin and pulsing indicators. No reduced-motion media query was found. Cards, rows, pills, colored icon boxes, borders and subtle gradients carry the visual language. No editorial photography or illustration system exists. The sidebar is 248px; main content max width is 1200px. Mobile hides the sidebar off-canvas. Header and footer remain outside the internal content scroll area.

## Content models and persistence

`src/types/index.ts:3` defines a Competitor: ID, name, logo/website, company metadata, one-liner, audience, revenue/key people, threat level, position coordinates, features, pricing plans, social handles, weaknesses, strategies, notes, SWOT arrays, sources and timestamps. Not all model fields have an editor in the current form.

Feature statuses: Have, DontHave, Better, Worse. Pricing plans have free-text name, price and description, so numeric pricing comparisons must not pretend every price is directly comparable. Weaknesses have source text, severity and date. Strategies have description, status, target and optional deadline. Sources have URL, label and added date. BusinessProfile has name, position, features and pricing. Snapshot stores a full competitor state, timestamp, automatic/milestone type and optional label. Alert is typed but not populated by a real feed.

Persistence: `stalker_competitors`, `stalker_profile`, `stalker_snapshots`. First load seeds sample data (`src/context/CompetitorContext.tsx:68`). Updating a competitor captures its previous state before persisting the update. Automatic snapshot retention is 50 per competitor; milestones are retained (`src/hooks/useSnapshots.ts:6`). JSON transfer currently includes competitors and business profile, not history (`src/utils/export.ts:7`). No account system, CMS, collaborative backend, server database or synchronization exists.

## Current user journeys

1. First load → sample dashboard → competitors → add/edit modal → optionally scrape public website → save dossier → inspect stored competitor elsewhere.
2. Competitor research → external website or Google news query → manually update dossier, weaknesses, features, pricing or SWOT.
3. Compare → edit cells in feature matrix, mouse-drag positioning, edit free-text pricing cards → snapshots record competitor changes.
4. Respond → select competitor → record weakness/source → create strategy → move Planned → Active → Completed.
5. Review history → dossier History button → timeline → milestone or compare two saved snapshots.
6. Transfer → Settings → JSON or CSV download; import JSON for competitors/profile. Existing clear/reset/delete controls are destructive and must not be exercised against real saved data.
7. Navigation → grouped sidebar or mobile drawer → command palette via Ctrl/Cmd+K; competitor search results currently lead to the generic dossier page rather than a selected record.
8. About/contact/privacy → existing content and links. Addresses and response-time claims are present but not independently verified.

## Findings to carry into research and planning

- Dashboard rows suggest interactivity with an arrow but do not navigate (`src/pages/Dashboard.tsx:197`). Refresh only reloads (`src/pages/Dashboard.tsx:156`). No clear first action, priority queue or research freshness signal.
- Alerts initialize to an empty array without an ingestion path (`src/components/features/alerts/MovementAlerts.tsx:13`); real-time language overstates the implementation.
- Social scanning is a timer and resets an empty feed (`src/components/features/social/SocialSurveillance.tsx:33`). No network search or packet interception occurs. Preserve useful handle editing and target filtering while adding honest capability explanations.
- Mobile strategy creation is visibly clipped. Weakness and social pages introduce extra inner padding and put long competitor lists ahead of the working area. Mobile dashboard stacks four large KPI cards before the actionable content.
- Positioning has mouse-only handlers and hover-only competitor labels (`src/components/features/positioning/PositioningMap.tsx:23`). It needs touch and keyboard/numeric alternatives.
- Feature status cells use clickable table cells rather than keyboard-operable controls (`src/components/features/matrix/FeatureMatrix.tsx:189`). Some inputs rely on placeholders. Verify labels, focus, contrast and motion with formal accessibility checks later.
- HistoryDrawer is visually modal but lacks a dialog role (`src/components/features/history/HistoryDrawer.tsx:75`); browser inspection exposed this during shared-state capture. Include semantic dialog, focus handling and keyboard review in the foundation.
- Seed pricing/revenue/company details are examples, not newly verified market intelligence. Make that distinction visible without discarding existing data.
- Informational pages share dark cards and repetitive hierarchy; dashboard/table/form layouts lack a consistent page header and purposeful content rhythm.

## Unknowns

No verified revenue model, customer count, testimonials, pricing for this app, branding guidelines, conversion analytics, support mailbox ownership or operating SLA. The exact target market beyond existing About copy is unknown. No proven need for shared/team accounts or automatic scraping schedule. No permission to add paid APIs, credentials, a database or new routes. Privacy copy requires owner review before making substantive legal claims; production analytics and on-demand scraping should be considered in that review.

Proceed as a local research workspace for founders/product marketers/strategists. Favor evidence quality, comparison, freshness and practical response planning. Do not invent audience proof, automated monitoring, business claims or data feeds.
