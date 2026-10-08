# Upgrade progress

Updated October 8, 2026. Branch: `design/upgrade`. Baseline: `28e0dbc`.

## Scope and constraints

Complete the user-requested seven phases in order. Commit after each phase. Never merge, push, deploy, change main/production, delete files/pages/content, remove features, change routes, migrate a database or add paid services/API keys. Keep artifacts here. Make design and implementation decisions independently; no options or routine approval questions.

Existing untracked `CLAUDE.md` belongs to the user and must remain untouched/uncommitted. No application code changed during phase 1. Phase 1 evidence totals 52 native Chromium screenshots (28 route/viewport baselines, 17 lower-content views, 7 shared-state views), plus 2 contact sheets. Browser page errors: 0. Build/lint/tests/Lighthouse are not yet run; they belong to phase 6 after implementation.

## Phase status

| Phase | Status | Evidence / next step |
|---|---|---|
| 1 Understand | done | `profile.md`; all 14 templates loaded and captured in Chromium desktop/mobile; shared states captured; `before-browser-evidence.json`, `before-states-evidence.json` |
| 2 Research | not done | Initial discovery searches only. Need 12–15 live gallery-qualified design references, including 4 outside CI; need 8–10 leaders with key-page screenshots and observed feature inventories. Do not count search results as loaded live sites. |
| 3 Decide | not started | Write `plan.md` only after live reference/feature research. |
| 4 Foundation + homepage | not started | Tokens, typography, shared components, homepage; at least 2 screenshot/score/fix rounds. |
| 5 Every template | not started | All 14 templates still need upgrade and state verification. |
| 6 Verify | not started | Full pre-submit, Lighthouse on key pages, every main journey. |
| 7 Report | not started | Before/after evidence, features, rubric, blocked/untested items, approval list. |

## Template implementation tracker

All are **not started**, not complete: dashboard, dossiers, positioning, matrix, pricing, social, weaknesses, alerts, strategy, SWOT, settings, about, contact, privacy policy. Forms/history/search/mobile navigation also require foundation verification. No upgraded template has been scored or accepted.

## Decisions / findings

- Keep app dashboard at `/`; preserve clean and `.html` routes.
- Treat this as an individual local intelligence workspace, with team-oriented existing copy but no shared backend.
- Preserve seed content, distinguish samples from verified intelligence.
- Prioritize actionable dashboard, dossier search/filter, research freshness/evidence, local history-derived movement, useful social research links/workflow, responsive strategy controls, keyboard/touch positioning and keyboard matrix controls. Final feature choices await phase 2.
- Alerts are empty placeholders, social scans simulated; do not claim real-time monitoring.
- Contact mailbox ownership and SLA are unknown. Preserve current content; route substantive changes to `needs-approval.md`.
- CI Node 22; verified local Node 22.23.1, pnpm 10.18.0. Package metadata currently TypeScript 6.0, not the supplied summary's 5.9.

## Reproducible browser environment

Local Vite server: `pnpm dev --host 127.0.0.1`, port 5173. Starting a listening server and launching Chromium required sandbox escalation; approval review allowed both. No rejection occurred.

`capture.mjs before` captures every route at 1440×1000 and 390×844 after animations settle, plus bottom-of-scroll views where relevant. `inspect-states.mjs` captures form/history/search/mobile navigation without saving records. These scripts currently reference the installed bundled Playwright and cached Chromium paths; adapt those paths if the machine/runtime changes. Browser cache has Chromium revision 1243, while bundled Playwright expects 1234, so the scripts explicitly select the installed executable.

Initial default Python lacks Playwright; the stale standalone `playwright` launcher points to a missing Anaconda executable. Use the functioning Node Playwright import in the saved scripts instead. Do not repeat the failed Python/launcher attempts.

## Research discovery (not accepted references)

Web search was used as requested. Land-book and SiteInspire gallery text loaded successfully. Godly redirected to recent.design and the text browser could not fetch that redirect; Awwwards' SOTD index failed in the text browser. Try real Chromium for those galleries and document any actual browser blocking. None has yet been captured in Chromium, so **phase 2 is incomplete and no live reference site is being cited**.

Competitive-intelligence searches surfaced candidate vendors; verify their own live public pages, not comparison articles, before listing features. Do not claim exhaustive access to gated product interiors. Mark genuinely blocked pages and missing evidence explicitly.

## Context checkpoint

Phase 1 is complete. Stop here because the context is long, as the user instructed. Resume in a new session at phase 2; do not treat this as a completed upgrade or final phase-7 report.

## Resume instructions

Start with phase 2. Read `profile.md`, this checkpoint and `needs-approval.md`. Confirm branch/status; leave `CLAUDE.md` alone. Research/screenshots must precede final direction. Use real Chromium; keep evidence and notes here. Commit phase 2, then phase 3, then implement. Finish the current phase before any next context checkpoint. The seven-phase goal is still incomplete.
