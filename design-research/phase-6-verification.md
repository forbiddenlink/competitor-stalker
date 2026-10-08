# Verification — phase 6

October 8, 2026; branch `design/upgrade`, implementation phase 5 commit `7df3566`. Checks use Node 22.23.1 and pnpm 10.18.0. All browser storage belongs to isolated test contexts.

## Build and behavior

Final pre-submit passes: typecheck, ESLint, 13 test files / 169 tests, production build, and all bundle budgets. Build produces 14 route HTML files. Entry JS is 44.3 KB raw / 12.3 KB gzip; entry CSS 58.6 / 11.2 KB; runtime JS 291.2 / 92.3 KB, within existing limits. Existing npm configuration warnings and the Vite esbuild/oxc option warning remain; they do not fail the build and were outside this request.

Production-served checks use the confirmed local preview at `http://127.0.0.1:4175`, with an app-title guard before interaction. The preview initially selected this port because other ports were occupied; unrelated apps were not exercised after that was detected. Reproduction: set `VERIFY_BASE_URL` to a confirmed preview, then run `node design-research/verify-journeys.mjs`.

Final result: **33/33 checks pass**. [Journey evidence](journey-evidence.json) covers dashboard → selected dossier; actual text/print output; search/filter and invalid/valid form saves; matrix keyboard cycling and local-history categories; keyboard and mouse map changes; numeric clamping, synthetic touch pointer identity and cancellation; pricing cancel/save; weakness creation; strategy planned/active/completed transitions; milestones and history focus; command navigation; SWOT editing; snapshot comparison; JSON/CSV downloads and isolated invalid/valid import preserving history; all 14 route aliases; informational links; manual social research; mobile menu focus; long/partial records and empty workspaces.

[Final route evidence](after-browser-evidence.json) covers 28 route/viewport combinations at 1440×1000 and 390×844, with top/lower-content screenshots as needed, no page exceptions and no document horizontal overflow. Matrix scrolling is intentional. Captures and journeys use reduced motion; the earlier native homepage review includes the actual two screenshot/score/fix rounds. [Contrast evidence](contrast-evidence.json) checks 66 opaque token pairs at a normal-text threshold of 4.5:1, all passing. This excludes alpha-composited surfaces, disabled states and custom chart/image content; Lighthouse supplements it.

## Corrections and review

Verification exposed print visibility specificity; the battlecard and descendants now remain visible under print rules. Lighthouse exposed shortcut contrast, visible search text/accessibility-name mismatch and dossier heading order. A repeat showed Lighthouse still includes the visible shortcut even when aria-hidden; the explicit search name now includes that shortcut too. Those were fixed in existing components/tokens, then checks repeated. Expanded contrast checks include surface/elevated backgrounds. An independent reviewer rechecked the implementation and final fixes with no concrete blocker. `git diff --check` passes.

Browser harness retries also corrected selector assumptions, restored screen media after printing and guarded preview identity. Files prefixed `failed-` are retained diagnostic captures from intermediate attempts and are superseded by the final passing JSON and accepted screenshots. They are not final acceptance evidence.

## Lighthouse

Final scores are summarized in [lighthouse-summary.json](lighthouse-summary.json); raw production reports are in `lighthouse/`. Runs use Lighthouse 13.5.0 sequentially against the rebuilt production preview, with mobile defaults and desktop preset. Earlier dev-dashboard report is diagnostic only.
| Page | Device | Performance | Accessibility | Best practices | SEO |
|---|---|---:|---:|---:|---:|
| Dashboard | mobile | 99 | 100 | 96 | 100 |
| Dashboard | desktop | 100 | 100 | 96 | 100 |
| Dossier | mobile | 99 | 100 | 96 | 100 |
| Dossier | desktop | 100 | 100 | 96 | 100 |
| Matrix | mobile | 99 | 100 | 96 | 100 |
| Matrix | desktop | 100 | 100 | 96 | 100 |

All six runs have accessibility/SEO 100; the only remaining binary audit failure is local telemetry console errors.

Local preview cannot serve the existing `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` telemetry endpoints, producing two 404 console errors. These are the remaining best-practices failures; deleting telemetry or fabricating endpoints was outside scope. Live Vercel behavior is not verified by local scores.

## Limits and preserved scope

The Vercel scrape function and remote extraction success/failure were not exercised in a deployed environment. Existing scrape controls and server code remain unchanged. Synthetic pointer tests are not a physical touchscreen test. No screen-reader session or cross-browser certification was performed. Lighthouse scores and qualitative visual review do not establish accessibility certification.

Storage keys/types, global data context, serverless API, routes/rewrites, dependency manifests/lockfile and production configuration have no changes against `28e0dbc`. No push, deploy, backend, external feed, account, key, paid service, real-user import/reset or deletion occurred. Deferred work remains in [needs-approval.md](needs-approval.md).
