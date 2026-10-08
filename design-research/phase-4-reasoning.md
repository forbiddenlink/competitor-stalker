# Foundation review — phase 4

Phase 3 commit: `6a51c92`. Implementation follows `plan.md` in the existing upgrade branch. Node 22.23.1 and CI Node 22 verified. No new dependency, persistent field, route, production setting or data mutation.

## Delivered

Warm paper/white/ink tokens, deep blue actions and readable semantic colors. Inverse button text adapts solid controls to the light palette. Shared shell keeps grouped navigation/search/footer and shows browser-local storage accurately. Reduced-motion and link focus rules apply globally.

Dashboard preserves target/threat/feature/weakness counts, threat breakdown and refresh; adds a research queue ranked by threat, missing sources and older local save date, direct dossier/action links, strategy counts and empty-workspace add/import paths. Unknown/invalid dates display as unknown. Starter data caution does not claim to identify all edited sample records. No automated monitoring or verified-research claim is made.

## Two screenshot/score/fix rounds

Scores are qualitative self-review, 1–5, ordered hierarchy / typography / density / action clarity / responsive usability / consistency. These do not substitute for phase 6 accessibility/Lighthouse checks.

| Review | Desktop | Mobile | Visible issue and fix |
|---|---|---|---|
| Round 1 | 4 / 4 / 4 / 4 / 4 / 4 | 4 / 4 / 3 / 4 / 3 / 4 | Mobile metrics and gaps delay the queue; reduce mobile rhythm and KPI spacing. Mobile header's dot lacks visible meaning; retain Browser-local label on mobile. |
| Round 2 | 4 / 4 / 4 / 4 / 4 / 4 | 4 / 4 / 4 / 4 / 3 / 4 | Queue heading enters viewport but first record still requires scrolling past metrics. Move queue ahead of summary metrics on mobile; desktop keeps metrics above queue. |
| Accepted after fix | 4 / 4 / 4 / 4 / 4 / 4 | 4 / 4 / 4 / 4 / 4 / 4 | Native top/lower captures reviewed. Direct add and research priority are visible early; no content-region horizontal overflow or page errors. |

Evidence directories: `screenshots/foundation-round-1`, `screenshots/foundation-round-2`, `screenshots/foundation-accepted`. Each has native desktop/mobile top/bottom captures; corresponding JSON records headings, links, content-region dimensions and page errors. Review script: `review-homepage.mjs`.

## Verification

Three dashboard behavior tests first failed because queue/actions/date labels were absent; all now pass. Typecheck passes. Lint passes. Entire suite: 12 files, 160 tests pass. No build/Lighthouse claimed yet. Browser captures use isolated storage and do not alter real saved research.

## Remaining

Dossier query parameters become selected views in phase 5; phase 4 verifies destination links only. Full mobile navigation/dialog focus semantics, all other templates, main journeys, build budgets, contrast and Lighthouse remain phase 5–6 work. Inherited colors do not count as template completion.
