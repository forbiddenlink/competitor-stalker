# Upgrade report

Completed October 8, 2026 on `design/upgrade`, from baseline `28e0dbc`. The requested resume at phase 3 completed decision, foundation, all templates, verification and reporting. Changes are committed locally; no push, merge or deployment occurred.

The workspace now puts research priorities and responses first. Warm neutral surfaces, restrained blue actions, editorial headings and compact mobile layouts replace the previous dark presentation. The root remains a dashboard; routes and stored records remain compatible.

## Delivered features

- Prioritized research queue using existing threat, source and saved-date information, with direct selected-dossier links and useful empty-workspace actions.
- Dossier search, threat filter and sorting; composed battlecards from existing content, with actual text download and printable feature/pricing/response summaries.
- Local snapshot movement feed, including removed-dossier history. Dates represent saved changes; this is not external monitoring.
- Keyboard feature comparisons and keyboard/numeric positioning, with one snapshot per gesture and cancellable pointer interaction.
- Manual public social research links and honest preview status, plus responsive pricing, weakness, strategy, SWOT and transfer controls.
- Shared dialog/menu focus and labels, readable contrast, reduced motion and accessible search/card headings. Existing substantive informational/legal content remains.

Implementation reasoning: [fixed scope](plan.md), [foundation and two homepage review rounds](phase-4-reasoning.md), [template rollout and corrections](phase-5-reasoning.md). Research includes 13 accepted live design references and nine peers across 27 public pages; see [references](references.md) and [feature inventory](features.md). Gated interiors and excluded/blocked pages were not treated as verified product evidence.

## Before / after and acceptance

All 14 templates have native desktop (1440×1000) and mobile (390×844) evidence. Each row scores **4/5 in all six rubric dimensions**: hierarchy, typography/readability, spacing/density, action clarity, responsive usability and consistency/accessibility. These are qualitative self-review scores, not certification. Homepage review rounds first identified queue delay on mobile, then moved the queue ahead of summary metrics; the actual rounds and fixes are documented above.

| Template | Result | Desktop before → after | Mobile before → after |
|---|---|---|---|
| Dashboard | Research queue, direct dossiers, sample/source context | [Before](screenshots/before/dashboard-desktop.png) → [After](screenshots/after/dashboard-desktop.png) | [Before](screenshots/before/dashboard-mobile.png) → [After](screenshots/after/dashboard-mobile.png) |
| Dossiers | Search/filter/sort, selected battlecard, text/print | [Before](screenshots/before/dossier-desktop.png) → [After](screenshots/after/dossier-desktop.png) | [Before](screenshots/before/dossier-mobile.png) → [After](screenshots/after/dossier-mobile.png) |
| Positioning | Keyboard/numeric alternatives, complete/cancel pointer gestures | [Before](screenshots/before/positioning-desktop.png) → [After](screenshots/after/positioning-desktop.png) | [Before](screenshots/before/positioning-mobile.png) → [After](screenshots/after/positioning-mobile.png) |
| Feature matrix | Keyboard status buttons, readable sticky column/scroll cue | [Before](screenshots/before/matrix-desktop.png) → [After](screenshots/after/matrix-desktop.png) | [Before](screenshots/before/matrix-mobile.png) → [After](screenshots/after/matrix-mobile.png) |
| Pricing | Wrapping actions, unchanged free-text recorded prices | [Before](screenshots/before/pricing-desktop.png) → [After](screenshots/after/pricing-desktop.png) | [Before](screenshots/before/pricing-mobile.png) → [After](screenshots/after/pricing-mobile.png) |
| Social | Manual public research links and explicit preview limits | [Before](screenshots/before/social-desktop.png) → [After](screenshots/after/social-desktop.png) | [Before](screenshots/before/social-mobile.png) → [After](screenshots/after/social-mobile.png) |
| Weaknesses | Reachable mobile inputs, severity/source controls | [Before](screenshots/before/weaknesses-desktop.png) → [After](screenshots/after/weaknesses-desktop.png) | [Before](screenshots/before/weaknesses-mobile.png) → [After](screenshots/after/weaknesses-mobile.png) |
| Alerts | Local snapshot movement with retained removed-record history | [Before](screenshots/before/alerts-desktop.png) → [After](screenshots/after/alerts-desktop.png) | [Before](screenshots/before/alerts-mobile.png) → [After](screenshots/after/alerts-mobile.png) |
| Counter strategy | Responsive creation and status transitions | [Before](screenshots/before/strategy-desktop.png) → [After](screenshots/after/strategy-desktop.png) | [Before](screenshots/before/strategy-mobile.png) → [After](screenshots/after/strategy-mobile.png) |
| SWOT | Readable quadrants and labeled additions | [Before](screenshots/before/swot-desktop.png) → [After](screenshots/after/swot-desktop.png) | [Before](screenshots/before/swot-mobile.png) → [After](screenshots/after/swot-mobile.png) |
| Settings | Transfer-first hierarchy, separated danger controls | [Before](screenshots/before/settings-desktop.png) → [After](screenshots/after/settings-desktop.png) | [Before](screenshots/before/settings-mobile.png) → [After](screenshots/after/settings-mobile.png) |
| About | Editorial reading layout, preserved substantive copy | [Before](screenshots/before/about-desktop.png) → [After](screenshots/after/about-desktop.png) | [Before](screenshots/before/about-mobile.png) → [After](screenshots/after/about-mobile.png) |
| Contact | Channel hierarchy, preserved addresses and commitments | [Before](screenshots/before/contact-desktop.png) → [After](screenshots/after/contact-desktop.png) | [Before](screenshots/before/contact-mobile.png) → [After](screenshots/after/contact-mobile.png) |
| Privacy | Readable measure, preserved policy and effective date | [Before](screenshots/before/privacy-policy-desktop.png) → [After](screenshots/after/privacy-policy-desktop.png) | [Before](screenshots/before/privacy-policy-mobile.png) → [After](screenshots/after/privacy-policy-mobile.png) |

Lower-content images are in the same before/after folders. [Final route evidence](after-browser-evidence.json) records 28 route/viewport combinations, zero page exceptions and zero document horizontal overflow. The dense matrix intentionally scrolls inside its region. [Journey evidence](journey-evidence.json) and `screenshots/journeys/` cover selected/empty/partial states, forms, search, history, print, comparison and mobile navigation. Diagnostic `failed-` images and initial `templates` captures are superseded by final evidence.

## Verification

| Check | Final result |
|---|---|
| Runtime | Node 22.23.1, pnpm 10.18.0 |
| Typecheck / ESLint | Pass |
| Tests | 169 pass across 13 files |
| Production build | Pass; 14 route HTML files generated |
| Bundle budgets | All pass: JS entry 44.3/12.3 KB raw/gzip, CSS 58.6/11.2 KB, runtime JS 291.2/92.3 KB |
| Production browser journeys | 33/33 pass, including all aliases, transfer preservation, numeric/pointer cancellation, long/partial and empty records |
| Opaque color pairs | 66/66 pass at 4.5:1 normal-text threshold |
| Independent code review | No blocking findings after corrections |

| Page | Device | Performance | Accessibility | Best practices | SEO |
|---|---|---:|---:|---:|---:|
| Dashboard | mobile | 99 | 100 | 96 | 100 |
| Dashboard | desktop | 100 | 100 | 96 | 100 |
| Dossier | mobile | 99 | 100 | 96 | 100 |
| Dossier | desktop | 100 | 100 | 96 | 100 |
| Matrix | mobile | 99 | 100 | 96 | 100 |
| Matrix | desktop | 100 | 100 | 96 | 100 |

[Raw summary](lighthouse-summary.json). The only remaining binary audit failure is the two unavailable local Vercel telemetry scripts, reflected in best-practices 96. Full verification details and reproduction limits are in [phase-6-verification.md](phase-6-verification.md).

## Deferred and untested

No blocked work remains inside the approved local upgrade scope. [needs-approval.md](needs-approval.md) retains the concrete deferred dependencies: cloud/team storage and permissions, scheduled monitoring/AI, new persistent research fields, CRM/pipeline integrations, external notifications, paid datasets/services, URL changes, destructive retention/data changes, and legal/contact commitments. They were not performed.

The deployed scrape endpoint and Vercel telemetry were not tested remotely. Local telemetry requests return 404, which explains Lighthouse best-practices 96. Synthetic touch checks do not verify a physical touchscreen; no screen-reader session or cross-browser certification was performed. Existing npm configuration and Vite option warnings remain. These limits do not justify changing existing server/config/dependency behavior within this visual upgrade.

Storage schemas/keys and global context, API, route configuration and dependency manifests/lockfile are unchanged against baseline. User-owned `CLAUDE.md` remains untouched and uncommitted. No real-user storage was imported/reset, and no page/content/feature was deleted.

## Phase commits

- Phase 3: `6a51c92` — fixed evidence-backed local scope.
- Phase 4: `d96e922` — foundation and actionable dashboard.
- Phase 5: `7df3566` — complete research-to-response workflow across templates.
- Phase 6: `842fe29` — production journeys, Lighthouse, contrast and accessibility corrections.
- Phase 7: this report and completed progress checkpoint.
