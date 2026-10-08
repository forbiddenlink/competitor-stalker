# Upgrade progress

Updated October 8, 2026. Branch: `design/upgrade`. Baseline: `28e0dbc`.

## Scope and constraints

Complete the user-requested seven phases in order. Commit after each phase. Never merge, push, deploy, change main/production, delete files/pages/content, remove features, change routes, migrate a database or add paid services/API keys. Keep artifacts here. Make design and implementation decisions independently; no options or routine approval questions.

Existing untracked `CLAUDE.md` belongs to the user and must remain untouched/uncommitted. No application code changed during phases 1–2. Phase 4 changes tokens, solid-button contrast, shell and dashboard. Phase 1 evidence totals 52 native Chromium screenshots (28 route/viewport baselines, 17 lower-content views, 7 shared-state views), plus 2 contact sheets. Browser page errors: 0. Phase 4 focused verification: typecheck/lint pass, all 160 tests pass. Build/budgets/Lighthouse and full journeys remain phase 6.

## Phase status

| Phase | Status | Evidence / next step |
|---|---|---|
| 1 Understand | done | `profile.md`; all 14 templates loaded and captured in Chromium desktop/mobile; shared states captured; `before-browser-evidence.json`, `before-states-evidence.json` |
| 2 Research | done | `references.md`: 13 loaded live design references, 5 clearly outside industry; `features.md`: 9 loaded leaders × 3 public pages. Native Chromium screenshots and JSON evidence saved. Gallery protection, failed rendering and gated-product limits documented. |
| 3 Decide | done | `plan.md`: editorial research workspace; ranked local-only features, all 14 templates, acceptance/verification gates. |
| 4 Foundation + homepage | done | `phase-4-reasoning.md`; two native screenshot/score/fix rounds plus accepted desktop/mobile captures; typecheck/lint and 160 tests pass. |
| 5 Every template | done | `phase-5-reasoning.md`; all 14 templates upgraded; 29/29 initial browser journey checks and 169 tests pass; final captures supersede initial rollout. |
| 6 Verify | not started | Full pre-submit, Lighthouse on key pages, every main journey. |
| 7 Report | not started | Before/after evidence, features, rubric, blocked/untested items, approval list. |

## Template implementation tracker

All 14 templates are implemented and qualitatively scored: dashboard, dossiers, positioning, matrix, pricing, social, weaknesses, alerts, strategy, SWOT, settings, about, contact and privacy policy. Forms/history/search/mobile navigation have isolated browser state checks. Phase 6 production verification remains pending.

## Decisions / findings

- Keep app dashboard at `/`; preserve clean and `.html` routes.
- Treat this as an individual local intelligence workspace, with team-oriented existing copy but no shared backend.
- Preserve seed content, distinguish samples from verified intelligence.
- Prioritize actionable dashboard, dossier search/filter, research freshness/evidence, local history-derived movement, useful social research links/workflow, responsive strategy controls, keyboard/touch positioning and keyboard matrix controls. Final feature choices are fixed in `plan.md`.
- Alerts are empty placeholders, social scans simulated; do not claim real-time monitoring.
- Contact mailbox ownership and SLA are unknown. Preserve current content; route substantive changes to `needs-approval.md`.
- CI Node 22; verified local Node 22.23.1, pnpm 10.18.0. Package metadata currently TypeScript 6.0, not the supplied summary's 5.9.

## Reproducible browser environment

Local Vite server: `pnpm dev --host 127.0.0.1`, port 5173. Starting a listening server and launching Chromium required sandbox escalation; approval review allowed both. No rejection occurred.

`capture.mjs before` captures every route at 1440×1000 and 390×844 after animations settle, plus bottom-of-scroll views where relevant. `inspect-states.mjs` captures form/history/search/mobile navigation without saving records. These scripts currently reference the installed bundled Playwright and cached Chromium paths; adapt those paths if the machine/runtime changes. Browser cache has Chromium revision 1243, while bundled Playwright expects 1234, so the scripts explicitly select the installed executable.

Initial default Python lacks Playwright; the stale standalone `playwright` launcher points to a missing Anaconda executable. Use the functioning Node Playwright import in the saved scripts instead. Do not repeat the failed Python/launcher attempts.

## Phase 2 research checkpoint

- Web search discovery followed by live Chromium loads, screenshots and public-page text inspection.
- Accepted design references: Paper, Stripe Press, Mintlify, Retool, Plain, Fey (current closure announcement only), Topology, Time.fyi, Capsule, Lidar Drone Scanning, TWKS, Paste and AuthKit. Five are outside the app's industry. Gallery provenance spans Awwwards SOTD, SiteInspire, Godly's current Recent Design redirect and Land-book text discovery.
- Land-book galleries blocked by Cloudflare 403 in Chromium; their target sites independently loaded. Shopify Design rendered a blank hero on two attempts. Edolus stayed on a preloader and its retry failed. Both excluded. Native screenshots and errors preserved; HTTP 200 alone is not accepted as a finished design reference.
- Nine accepted peers: Crayon, Klue, Kompyte, Contify, Visualping, Competitors App, Rival IQ, Brandwatch and Hexowatch. Their home/product/supporting pages all loaded. Similarweb returned 403 and is excluded. Public feature inventory is bounded by those pages, not gated interiors.
- Competitor evidence: 27 loaded pages, 81 screenshots; Similarweb adds 3 blocked-page captures. Design evidence: 13 accepted sites, 39 native screenshots; excluded attempts and gallery captures retained separately.
- Strongest candidates: actionable research briefing, find/filter/sort, local snapshot-derived change feed, composed battlecards, accessible comparisons, honest manual social research and printable/exportable summaries. Final scope remains phase 3.
- Strongest visual inputs: Paper's precise workspace, Stripe Press's editorial structure, Mintlify's type hierarchy and Retool/Paste's visible tool content. Showcase motion, low contrast and unsupported product promises are rejected.
- No application code, runtime dependencies, data, routes or production settings changed. No forms submitted, accounts created or services purchased. Build/typecheck/lint/tests/Lighthouse remain pending until implementation.

Research capture runner: `node design-research/research-browser.mjs design-research/<targets>.json`. It records native top/middle/bottom viewport images, public text/headings/links, HTTP/final URL and failures. Normal-motion retries were necessary for Topology/TWKS/Lidar. `references.md` distinguishes accepted captures from preloader/blank attempts; earlier machine statuses are preliminary and do not override visual review.

## Context checkpoint

Phases 1–5 are complete. Resumed October 8 at phase 3; implementation now proceeds to phase 6. This remains an incomplete seven-phase upgrade.

## Resume instructions

Continue with phase 6. Read `profile.md`, `references.md`, `features.md`, this checkpoint and `needs-approval.md`. Confirm branch/status; leave `CLAUDE.md` alone. Follow the fixed direction and scope in `plan.md`. Phase 3 committed as `6a51c92`; phase 4 implementation and evidence are complete. Use real Chromium; keep evidence and notes here. The two homepage screenshot/score/fix rounds are complete; see `phase-4-reasoning.md`. Finish the current phase before any next context checkpoint. The seven-phase goal is still incomplete.
