# Functional audit handoff

October 8, 2026 · baseline a182328 · branch design/upgrade · audit verified locally before commit/push.

The audit inventories all 14 routes, the shared storage/history flows and the public-page scrape endpoint. It tracks 21 concrete defects in [issues.md](issues.md), with full expectations, control accountability and limitations in [coverage.md](coverage.md).

## Fixed and improved

- Pricing drafts now stay attached to the correct business or competitor row after deletion: [PricingIntel.tsx](/Volumes/LizsDisk/competitor-stalker/src/components/features/pricing/PricingIntel.tsx:10).
- Clear remains empty after reload; batched edits persist and snapshot once. Storage failures are visible; ordinary edits preserve unread original bytes, with recovery download: [useLocalStorage.ts](/Volumes/LizsDisk/competitor-stalker/src/hooks/useLocalStorage.ts:6).
- Imports validate nested records, IDs, URLs and exact enum types before replacement. Legacy sparse records remain compatible: [validation.ts](/Volumes/LizsDisk/competitor-stalker/src/utils/validation.ts:130). Same-file retry and safer CSV output are included.
- Full JSON backups include history. Restore replaces included history, old backups preserve it, and confirmed Clear/Reset remove it, following the user's approved policy: [SettingsPage.tsx](/Volumes/LizsDisk/competitor-stalker/src/pages/SettingsPage.tsx:34).
- Scanned handles survive saving, obsolete scans cannot overwrite newer results, and malformed responses show recovery errors. Scraper connections pin validated addresses, recheck redirects, bound DNS/body time and decompressed size, and normalize social links: [scrape.ts](/Volumes/LizsDisk/competitor-stalker/api/scrape.ts:270).
- History compares the first before-state with current content, shows omitted evidence changes, retains modal focus and handles Escape from focused controls: [HistoryDrawer.tsx](/Volumes/LizsDisk/competitor-stalker/src/components/features/history/HistoryDrawer.tsx:49).
- Weaknesses reject whitespace and no longer invent a G2 source. Search accepts padded queries. Settings exposes the existing business name: [SettingsPage.tsx](/Volumes/LizsDisk/competitor-stalker/src/pages/SettingsPage.tsx:99).

## Actual verification

Evidence is local and uses synthetic records only. The suite grew from 169 to 222 tests (53 added regression cases).

| Check | Result / evidence |
|---|---|
| Runtime | Node 22.23.1 / pnpm 10.18.0, matching Node 22 project workflow |
| Baseline | 169 tests passed before audit changes |
| Type-check | Pass; evidence/typecheck.log (no diagnostics) |
| Lint | Pass; evidence/lint.log (no errors or warnings) |
| Full Vitest suite | 222/222 pass across 18 files; evidence/tests.log; pnpm exec vitest run --pool=threads --maxWorkers=1 |
| Production build | Pass; evidence/build.log; 14 prerendered routes |
| Bundle budgets | All six budgets pass; evidence/bundles.log; entry JS 49.2KB raw / 13.8KB gzip, runtime 93.8KB gzip |
| Audit browser journeys | 24/24 pass; evidence/audit-browser.json and audit-browser.log |
| Original design journeys repeated | 33/33 pass; evidence/journeys.json and journeys.log |
| Independent review | Storage, scraper, enum, Escape and nested-ID fixes reviewed; no remaining concrete blocker found |

Red reproductions were captured before fixes, including storage, pricing, malformed import, profile-name and focused Escape cases. The suite uses one thread worker because the overloaded host timed out default fork workers; no assertions were removed. Early provider/selector/Node-mock mistakes are identified in coverage rather than counted as product defects. Failed captures remain diagnostic evidence; accepted results use the final JSON summaries.

Browser coverage includes selected dossiers, CRUD, pricing deletion/drafts/reload, feature/positioning keyboard and pointer input, strategy/SWOT, milestone/current/historical comparison, backup downloads/restores, invalid imports/retries, empty/partial content, all route aliases, manual social preview and desktop/mobile navigation. Audit browser fixtures simulate network failure/retry/malformed scan responses and storage failures. Handler tests execute real validation, transport options and HTML extraction with DNS/HTTP boundaries mocked; they do not prove deployed Vercel configuration.

## Remaining limits and decisions

No deployment or real communication occurred. Live scrape service, deployed telemetry, mailbox ownership/SLA, legal commitments, physical touch, alternate browsers and screen readers were not verified. Vercel telemetry is unavailable on the local preview. Multi-key browser storage is not transactional, and simultaneous tabs can still conflict. Recovery export preserves original text for manual repair; it is not an automatic repair tool.

The most valuable proposals in [improvements.md](improvements.md) need owner decisions: align team/automatic-monitoring promises with actual infrastructure; define cross-tab conflict behavior; consider import previews and assisted recovery. They are not implemented. Accounts, billing, admin and background jobs are intentionally excluded because they do not exist in this application.

The final accepted browser total is 57/57 checks, covering both viewport sizes and all 14 page families. Audit changes are prepared on design/upgrade; unrelated user-owned CLAUDE.md was not read, edited or included.

## Follow-up integration verification

After the user authorized commit, push and verification, main `e87d60a` was integrated into `design/upgrade`. The merge preserves upstream origin/rate-limit/IP safeguards and dependency pins alongside audited connection pinning, bounded extraction and storage recovery. Upstream scraper responses remain 415 for non-HTML and sanitized 502 for upstream failures, with at most five redirects. Independent review found no concrete blocker in the resolved source and API tests.

Fresh verification uses Node 22.23.1 / pnpm 10.34.5: 295/295 tests in 19 files pass, including 87 API tests. Type-check, lint, production build and all six bundle budgets pass. Evidence: `merge-types.log`, `merge-lint.log`, `merge-tests.log`, `merge-build.log`, `merge-bundles.log`. The initial audit results above remain their original checkpoint.

Fresh production-build browser verification: 24/24 audit checks and 33/33 design journeys pass (57 total), with no page exceptions. Evidence: `merge-browser.log`, `merge-journeys.log` and refreshed synthetic captures.

## All-branch integration — October 8

The user authorized merging all active branches into main after fixes. The dependency branches `renovate/pnpm-10.x` and `renovate/prod-minor` were merged into the upgrade branch for combined verification. Node 22.23.1 / pnpm 10.34.6, React/DOM 19.3.0, React Router 8.4.0 and lucide-react 1.52.0 pass all 295 tests, type-check, lint, build and six budgets. The runtime bundle is 104.0KB gzip against its 105KB budget. Logs: `all-branches-types.log`, `all-branches-lint.log`, `all-branches-tests.log`, `all-branches-build.log`, `all-branches-bundles.log`. Independent review found no concrete blocker.

CodeQL alert 59 at the outbound scraper request appears to be unrecognized custom validation: every hop checks all DNS answers, uses only a validated address for connection lookup, disables agent reuse and automatic family fallback, and validates literal IPs separately. Regression tests cover rebinding and private redirects. The alert remains visible; no suppression or security-policy change was made.

The combined production build also passes 24 audit browser checks and 33 design journeys (57/57 total), with zero page exceptions. Evidence: `all-branches-browser.log`, `all-branches-journeys.log` and refreshed synthetic captures.
