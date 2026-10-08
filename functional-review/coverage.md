# Functional coverage

Audit baseline: `a182328`, branch `design/upgrade`, October 8, 2026. Prior design report/checks are inspected evidence, not audit proof. Repository instructions and README read; README versions/installation commands are stale, so package metadata, pnpm pin and CI Node 22 govern execution. Node 22.23.1 / pnpm 10.18.0. Baseline: 169 tests / 13 files pass.

## Product and boundaries

One Vite/React application, one unauthenticated Vercel scrape function, no shared packages, database, accounts, roles/permissions, billing, admin, entitlements, uploads beyond JSON import, background workers or scheduled jobs. All users are local workspace users; public information pages are available without accounts. External integration: scrape via public HTTP pages; manual social/research links; Vercel telemetry. No live social/news feed or shared team storage exists.

Data: competitors own features/pricing/social/weaknesses/strategies/SWOT/sources; profile owns business positioning/features/pricing; snapshots store competitor before-state or milestones. Storage keys: stalker_competitors/profile/snapshots. Expected behavior is sourced from README feature/data-management promises, visible controls/copy, existing typed models and tests. Clear must remain empty, failed import must not replace data, plan edits must target their own row, blank findings must not fabricate evidence, and a scan result must survive saving. Treat external automation/team claims as conflicting product decisions, not authorization to add services.

## Inventory and final status

Every row uses synthetic isolated data only. Generated/dependency/vendor outputs are excluded from code review; production build is checked as an artifact.

| Feature/journey | Routes/paths | Roles, prerequisites and expected result/source | Inspection/test status, findings, fixes, evidence and limits |
|---|---|---|---|
| Dashboard | `/`; `src/pages/Dashboard.tsx` | Local first-time/returning user; metrics derive from stored records, queue selects correct dossier (UI/models). | Verified: selected dossier, downloads, long/partial/empty states. J dashboard + empty checks; A all routes. No external metrics service. |
| Dossier CRUD/search/research | `/dossier`; `src/components/features/dossier` | Local user; create/edit/delete/cancel, unique nonblank name and HTTP(S) URL, fields persist; scan requires endpoint (README/UI/models). | Fixed and verified: F07/F08; component payload and races; J form/search/brief; A scan retry/reload. Browser scans are mocked; live Vercel endpoint unverified. |
| Positioning | `/positioning`; `src/components/features/positioning/PositioningMap.tsx` | Local user; bounded pointer/keyboard/numeric changes persist, canceled drag does not save (UI/tests). | Verified: J keyboard/pointer/boundaries/numeric/cancel and unit tests. Browser emulates mobile; physical touch untested. |
| Matrix | `/matrix`; `src/components/features/matrix/FeatureMatrix.tsx` | Local user; add features, status cycle across business/competitors persists (README/UI). | Fixed and verified shared persistence F04/F06: J keyboard/status, A quota/draft export/reload; provider StrictMode batch regression. |
| Pricing CRUD | `/pricing`; `src/components/features/pricing` | Local user; edit/delete correct row, cancel leaves original (UI/model). | Fixed and verified F01: both business/competitor delete/edit, deletion during open draft, reload; component regressions + J/A. |
| Social/manual research | `/social`; `src/components/features/social/SocialSurveillance.tsx` | Local user; handle edits, filters and external research links; scan explicitly local preview (UI). | Partially verified: J manual links/preview and route inspection; no connected social API, collection or live feed. Scope decision C1. |
| Weakness CRUD | `/weaknesses`; `src/components/features/weaknesses` | Local user; nonblank trimmed evidence, severity and honest optional source (UI/model). | Fixed and verified F12/F19: component persisted record, whitespace rejection; J CRUD + A blank/source/search. Evidence credibility requires user judgment. |
| Movement/history categories | `/alerts`; `src/components/features/alerts/MovementAlerts.tsx` | Local user; local snapshot movements and categories, no live external feed (UI/model). | Partially verified: derived movement/date tests and all-route inspection. External feed/read controls are unavailable; reasons visible. No background collection exists. |
| Strategy lifecycle | `/strategy`; `src/components/features/strategy/CounterStrategy.tsx` | Local user; target selection, create planned, activate/complete/delete (UI/model). | Verified: J weakness/strategy and existing component regressions; no notifications/jobs/billing side effects. |
| SWOT CRUD/filter | `/swot`; `src/pages/SwotPage.tsx` | Local user; select competitor, expand categories, trim/add/delete/filter persisted content (UI/tests). | Verified: J editing plus existing component tests; independent code inspection, all-route checks. |
| Transfer/reset/clear/profile | `/settings`; `src/pages/SettingsPage.tsx`; `src/utils/export.ts` | Local user; round-trip full backup, reject malformed input without mutation, retry same file, clear stays empty, reset explicit. History policy approved by user. | Fixed and verified F02/F03/F13/F14/F16/F19; own business-name input B. J downloads/import; A complete/legacy history/clear/reset/name reload; unit CSV/validation. Multi-key operations nontransactional. |
| About links | `/about`; `src/pages/AboutPage.tsx` | Visitor/local user; public information renders and internal links resolve (UI). | Partially verified: J aliases/link paths; all-route inspection. Team/monitoring commitments exceed implementation; owner decision C1. |
| Contact channels | `/contact`; `src/pages/ContactPage.tsx` | Visitor; mailto/privacy destinations available without sending (UI). | Partially verified: J three mailto destinations and routes; mailbox ownership and SLA unverified. No real messages sent. |
| Privacy/legal | `/privacy-policy`; `src/pages/PrivacyPolicyPage.tsx` | Visitor; current policy renders and internal contact navigation works (UI). | Partially verified: page/alias/link checks only. Legal validity and deployed telemetry commitments require owner review. |
| Navigation/search/dialogs | All routes; `src/components/layout/Shell.tsx`; `src/components/common/SearchCommand.tsx` | Local user; menu/search keyboard navigation, focus trap/return, clean/direct/.html links (UI/tests). | Fixed and verified F11/F15/F21: J search/mobile navigation/history focus; A padded search/compare/milestone trap/escape. Chromium desktop/mobile, no screen-reader audit. |
| History/milestones/compare | Dossiers/history; `src/hooks/useSnapshots.ts`; `src/components/features/history` | Local user; deep before-state, milestones retained, current/historical content comparison without new stored version (UI/model). | Fixed and verified F04/F09/F10/F11/F13/F21: real provider/diff tests; J milestones/historical comparison; A current comparison/storage count. 50 automatic snapshots per competitor unchanged. |
| Persistence/recovery | All workspace routes; `src/hooks/useLocalStorage.ts`; `src/context/CompetitorContext.tsx` | Local user; reload persists success; failed storage visible; unread originals protected; exports recover draft/raw data (README/UI invariant). | Fixed and verified F02/F04/F06/F17: quota/retry/read/StrictMode regressions, A injected failures and raw export. Cross-tab conflicts remain C2; no synchronized backend. |
| Scrape API/extraction | POST `/api/scrape`; `api/scrape.ts`; `src/hooks/useScraper.ts` | Public unauthenticated endpoint; validate URL/hosts, only public connections, cap redirects/time/body, parse HTML, visible failure/retry (existing API promise). | Fixed and partially verified F05/F07/F08/F18/F20: real handler/parser/client with only DNS/HTTP mocked; pinned redirect addresses, private/mapped IPv6, missing body/non-HTML, DNS/body timeout, decompressed 2MB limit/social URLs. Deployed service not tested. |
| Production build/monitoring | `src/main.tsx`; `src/monitoring/webVitals.ts`; `scripts`; `vercel.json`; `.github/workflows/ci.yml` | Build static app and 14 SEO/HTML aliases; production telemetry (configuration). | Partially verified: type/lint/tests/build/budgets and production preview journeys. Vercel telemetry locally 404; no deployed configuration/telemetry acceptance asserted. |

## Comparison with previous coverage

`design-research/report.md`, `phase-6-verification.md`, route evidence and the 33-journey harness were inspected. They cover all page families, aliases, form/save and import paths, but miss persisted clear-after-reload, malformed nested imports, quota/read failures, scan-response saving/races, pricing deletion/draft identity, first-edit comparison and omitted history fields. The audit adds these rather than treating 169 green tests as completeness.

## Verification workflow

1. Capture fresh baseline and reproduce failures with unit/component/browser tests.
2. Fix established root causes, retaining existing storage models/services/routes.
3. Re-run all original journeys plus audit-specific persistence/recovery/delete/async checks desktop/mobile.
4. Run type/lint/all tests/build/budgets; record final status, exact counts, evidence links and live-integration limits.

Detailed issue reproduction/fixes will be tracked in `issues.md`; product decisions in `improvements.md`.

## Evidence and control accountability

A = `evidence/audit-browser.json` and `browser.mjs`; J = `evidence/journeys.json` and `journeys.mjs`. Fresh production preview uses the current build at 127.0.0.1:4175 with a title guard, isolated browser contexts and synthetic fixtures. `evidence/control-inventory.json` inventories visible names, destinations and disabled states on all 14 routes at both viewport sizes; page screenshots are `evidence/*-desktop.png` / `*-mobile.png`. The inventory is an accountability list, not proof that each control was clicked.

| Control families | Outcome checked / evidence | Limits |
|---|---|---|
| Sidebar links/mobile menu, queue/dossier links, search input/results/keyboard/Escape | J direct/alias destinations, selected dossier, menu focus/return, search navigation; A trimmed query | Browser Back/Forward and every external destination were not separately exercised. |
| Dossier add/edit/save/cancel/delete/filter, source links, brief/print | J forms/search/brief content/print styling; A extraction/save/reload; component payload test preserves evidence/fields | External research sites not crawled; file deletion only synthetic records. |
| Position sliders/drag/numeric edit/cancel; matrix add/status | J keyboard/pointer/bounds/cancel, persisted changes; component tests | No physical device touch hardware. |
| Pricing add/edit/cancel/delete in both columns | J editing; A deletion/draft ownership/reload; UI regression tests | Plan IDs remain transient; no new pricing schema. |
| Weakness, strategy, SWOT selection/add/delete/status/filter | J creation/lifecycle/SWOT and existing tests; A blank/source validation | All local records; no remote task execution. |
| History open/close/milestone/delete/compare/select/back | J and A focus, milestones, old-old/current comparison; existing delete tests | Current comparison is transient; no additional retention. |
| Social handles, filters, manual links, local scan; movement filters/read controls | J preview/manual link; unit derivation/filters and code inspection; visible unavailability copy | No external social/news connection. Disabled movement read action has no unread external feed. |
| JSON/CSV downloads, file chooser, clear/reset confirmations, business-name field, original recovery download | J and A actual downloads/import/reload, cancel/confirm; hook/CSV/import tests | Raw recovery download contains original text for manual repair, not an automatically repaired import. |
| About/contact/privacy internal links and mailto channels | J route aliases and expected link destinations; all-page captures | Mailbox delivery, SLA and policy/legal review excluded; sending unauthorized. |

## Requirements, assumptions and invariants

Confirmed requirements: existing local CRUD/persistence, backup/import, page extraction, comparisons and keyboard-accessible controls. Confirmed user decision: full backups restore history; old imports without snapshots preserve it; explicit clear/reset delete it. Reasonable assumptions: malformed imports reject atomically before UI mutation; ordinary edits must not overwrite unread original data; clear remains empty after reload; evidence sources must not be invented. Conflicting product decisions: team use and automatic monitoring claims have no infrastructure (C1). There is one local-user role; account/session/permission/billing/admin coverage is intentionally excluded because those features do not exist.

Invariants protected by tests: changes address the intended record/plan; batched updates survive and snapshot once; older scans cannot win; rejected imports leave workspace intact; enum/URL/nested field shapes are compatible with renderers; original unread bytes remain downloadable; successful local persistence survives reload. Recovery drafts are in memory until storage can save. Multi-key import/reset/clear is not a browser transaction, and simultaneous tabs can still conflict. These limits are explicit, not claimed as solved.

## Check evidence and remaining environment limits

Baseline: 169 tests passed in the initial audit run; prior design verification separately records the same count. Red reproductions: `regressions-before.log`, `storage-before.log`, `ui-api-before.log`, `additional-before.log`, `profile-before.log`, `review-before.log`, `transport-before.log`, `escape-before.log`, `nested-ids-before.log`. Some early runs contained harness/provider/mock mistakes; only actual behavioral assertions are treated as defects. `transport-diagnostic.log` records a corrected Node default/named mocking mismatch; it is not a production failure. Failed screenshots/logs are retained for diagnosis; final JSON summaries determine accepted browser results.

Final results are summarized in report.md with `typecheck.log`, `lint.log`, `tests.log`, `build.log`, `bundles.log`, `audit-browser.log` and `journeys.log`. Vitest uses one thread worker because default fork workers timed out under severe host load; assertions and test scope are unchanged. Chromium desktop/mobile emulation is the tested browser scope. No deployed API, live telemetry, mailbox, physical touch, alternate browser or assistive technology certification is claimed. No deployment or real communications occurred.

The intermediate full suite (`tests-before-final.log`) started before the last nested-ID fix and included the three red cases while other files were still running. Its 219 passing checks plus three failures are superseded by the clean final run; `import-final.log` separately verifies all 18 import checks against the fixed validator. No source or tests are modified during the clean final run.

Final accepted results: 222/222 tests in 18 files; 24/24 audit browser checks + 33/33 original journeys (57/57 total), zero page exceptions in either harness, type-check/lint/build/all six bundle budgets pass. All results use the final source and production build. No material local defect remains identified by the audit or independent review; partially verified rows retain the explicit external/environment limits above.

Post-audit main integration: fresh checks under Node 22.23.1 / pnpm 10.34.5 pass all 295 tests across 19 files, type-check, lint, build and six bundle budgets. The additional upstream API security suite and audit transport assertions are retained; merge review found no concrete blocker. `merge-*.log` records this newer checkpoint.

Fresh production-build browser verification: 24/24 audit checks and 33/33 design journeys pass (57 total), with no page exceptions. Evidence: `merge-browser.log`, `merge-journeys.log` and refreshed synthetic captures.
