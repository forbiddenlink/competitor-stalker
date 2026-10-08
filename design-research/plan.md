# Research workspace implementation plan — phase 3

**Goal:** Make the existing browser-local intelligence workspace easier to research, compare and act on, preserving all records, content, routes and features.

**Architecture:** Keep React's existing provider and localStorage models. Compose new views from competitors, profile and snapshots; use URL query parameters for selected dossiers without introducing routes. Shared CSS tokens, controls and shell establish the visual foundation before template rollout.

**Stack:** Existing React, TypeScript, Tailwind, React Router, Vitest and native Chromium. Node 22.23.1 / pnpm 10.18.0 verified locally. No new runtime dependency.

**Spec:** `profile.md`, `references.md`, `features.md`, `needs-approval.md`, and `progress.md` in this directory. Execute natively in the existing `design/upgrade` branch; commit each phase. No routine approval questions.

## One direction: editorial research workspace

Use Paper's warm, precise workspace surfaces, Stripe Press's clear editorial hierarchy and Mintlify's differentiated headings. Retool/Paste inform compact, visible working content. This is an app dashboard: the reference sites' promotional heroes, ornamental motion and expansive blank space do not transfer.

The direction is cream canvas, white working panels, ink text, fine neutral rules, restrained deep blue action color, squared 6–8px control/card radii, system sans controls and Georgia display headings. Monospace is reserved for counts and data. Semantic threat colors remain distinct with written labels. No font purchase, remote font request or decorative imagery is needed. Avoid opaque glowing panels, pulsing monitoring indicators and repetitive large icon boxes.

Alternatives considered: retaining the dark command-center style would preserve familiarity but would retain the implied surveillance framing; a marketing-style illustrated dashboard would add visual ceremony ahead of actual work. The paper workspace offers the clearest reading and comparison structure without inventing branding or product capabilities.

## Constraints

- Preserve all 14 templates, clean and `.html` routes, seed content, current storage keys, snapshots and transfer behavior.
- Never merge, push, deploy, change production, delete files/pages/content, remove features, migrate a database or add paid services/API keys.
- Preserve contact addresses, SLA statements and legal commitments; presentation only for those passages.
- No new persistent content fields, confidence claims, shared accounts or external feeds.
- `CLAUDE.md` is user-owned, untracked and excluded from every commit.
- Captures use isolated Chromium storage. Never reset/import/delete the user's live browser data.

## Ranked implementation scope

| Rank | Deliverable | Evidence and boundary | Verification |
|---|---|---|---|
| 1 | Actionable dashboard briefing | Crayon/Contify/Kompyte; rank existing high threats, missing sources and old saved dates. Updated date means saved activity, not verified research. | Empty/populated datasets; links reach the right task; dates and metrics match records. |
| 2 | Find/filter/sort dossiers | Visualping/Rival IQ; search existing name/description, threat filter, stable sorting. Selected record uses query string. | Combined filters, no matches, cleared filters, selected dossier from dashboard/search. |
| 3 | Local change feed | Visualping/Hexowatch; compare current record with saved snapshots. Keep existing alert filters/read controls. | No history, milestone, changed pricing/features and deleted-record history. Explicit local-history label. |
| 4 | Composed battlecard and report | Klue/Crayon; summarize existing SWOT/weakness/strategy/features, with missing-input prompts. | Empty fields, long text, copy/print output; no generated facts. |
| 5 | Accessible comparisons | Rival IQ/Brandwatch; keyboard matrix controls and numeric/keyboard positioning alternatives. | Keyboard status cycle, position boundaries, touch interaction and mobile horizontal scroll. |
| 6 | Manual social research workflow | Competitors App/Rival IQ; public profile/search links alongside existing handle editing and scan control. | Correct URL encoding, missing handles, scan limitation visible. |
| 7 | Guided next actions | Existing add/import/edit/history actions; no fabricated outcomes. | Focus/validation/error/success states and mobile action reachability. |

## Review focus

1. Empty, partial or imported records must yield useful empty states and no invalid-date text. Test dashboard/dossier derivation with missing timestamps and sources.
2. Long names, descriptions and many records must wrap or scroll without clipping controls. Browser-check 390px and 1440px, including lower content.
3. Local saves and samples must not appear to be external monitoring or verified intelligence. Use precise labels; show sample caution without guessing whether edited records remain samples.
4. Keyboard/touch users must be able to operate navigation, dialogs, positioning and matrix controls. Check focus entry, Escape, return focus and visible focus indicators.
5. Preserved routes and storage must remain compatible. Run all aliases/journeys in isolated storage and existing transfer/snapshot tests.

## Phase 4: foundation and homepage

Files: `src/styles/index.css`, `src/components/common/Button.tsx`, `src/components/common/Card.tsx`, `src/components/layout/Shell.tsx`, `src/pages/Dashboard.tsx`; behavior tests adjacent to dashboard; evidence in this directory.

- [ ] Set warm neutral surface/text/border tokens, accessible semantic colors and inverse text for solid buttons. Set common radius, spacing, focus and reduced-motion rules.
- [ ] Restyle shell with clear workspace identity and browser-local status; keep navigation groups, search, footer, mobile drawer and routes.
- [ ] Replace dashboard hierarchy with compact metrics, a prioritized research queue, direct dossier/action links, saved-date/source context and useful empty state. Keep refresh and threat/feature/weakness summaries.
- [ ] Add behavior tests for empty/partial records, queue ordering and direct action destinations; confirm expected failure before implementation and pass afterward.
- [ ] Capture homepage desktop/mobile round 1, score it, fix visible issues; capture/score/fix round 2 and capture accepted state. Do not roll out templates before both rounds.
- [ ] Review diff, run focused checks, write phase reasoning/progress and commit foundation.

## Phase 5: every template

Use existing page/feature files. Share the new tokens and header/section rhythm; avoid new wrappers unless duplication requires one. Every row below needs desktop/mobile top/lower-content evidence and action checks, not merely inherited colors.

| Template | Concrete upgrade and retained functionality | Required states |
|---|---|---|
| Dashboard `/` | Accepted briefing foundation | Empty/partial, priority links, refresh |
| Dossiers `/dossier` | Search/threat/sort controls, selected record, composed summary/export; preserve add/edit/scrape/research/history/delete controls | Add/edit errors, no matches, partial record, history, selected query |
| Positioning `/positioning` | Readable axes/legend, touch pointers and keyboard/numeric alternatives | Min/max coordinates, saved update, long labels, mobile |
| Matrix `/matrix` | Semantic status buttons, visible legend, sticky identifiers and overflow cue; retain add feature and cycling | Keyboard cycle, no records, long feature, mobile |
| Pricing `/pricing` | Clear business/competitor grouping, readable plan values, controls that wrap | Add/edit/cancel; free-text prices remain unnormalized |
| Social `/social` | Manual research explanation, public research links, compact target selector | Missing handles, edit/cancel, filtering and existing scan |
| Weaknesses `/weaknesses` | Compact responsive selector and evidence hierarchy | Validation, severity/source, empty target, add result |
| Alerts `/alerts` | Local-history movement feed alongside existing alert controls | No snapshots, category filters, local changes vs milestones |
| Strategy `/strategy` | Responsive creation form and board, clear status actions | Mobile create/cancel, planned/active/completed transitions |
| SWOT `/swot` | Strong quadrant hierarchy, readable expanded content | Threat filter, expand/collapse, add validation |
| Settings `/settings` | Transfer actions first, readable data overview, distinct danger area | Export, invalid/valid isolated import, preserved history |
| About `/about` | Editorial reading layout and useful navigation; preserve content | Long reading, links, mobile |
| Contact `/contact` | Clear channel hierarchy; preserve addresses/SLA | All mailto/privacy links, mobile |
| Privacy `/privacy-policy` | Readable legal measure, section rhythm; preserve policy/date | All content, contact link, mobile |

- [ ] Verify shared form/history/search/mobile navigation focus and semantics; fix within existing components.
- [ ] Complete each template's listed states, update tracker, review diff, commit phase 5.

## Phase 6: verification

- [ ] Run `pnpm exec tsc -b`, `pnpm lint`, `pnpm test:run`, `pnpm build`, `pnpm check:bundles` with Node 22.
- [ ] Exercise research → dossier → comparison → weakness → strategy → snapshot → transfer journeys in isolated storage; verify clean and `.html` routes.
- [ ] Capture all templates and shared states in Chromium at 1440×1000 and 390×844. Record errors, overflow and focus results. Check reduced motion and text/background contrast.
- [ ] Run Lighthouse on dashboard, dossier and a dense comparison page desktop/mobile. Record scores and actual failures. Local Vite cannot validate the deployed serverless scrape function: keep that limitation explicit.
- [ ] Fix attributable failures, rerun affected checks, record results and commit phase 6.

## Phase 7: report

- [ ] Write report with linked before/after screenshots, delivered features, per-template rubric, test/Lighthouse results and blocked/untested items.
- [ ] Update approval list only for concrete deferred dependencies. No implicit permission to perform them.
- [ ] Verify diff and branch status, leave untracked user file alone, commit phase 7. Report local completion and commit IDs; no push/deploy.

## Visual acceptance rubric

Score each from 1–5: hierarchy, typography/readability, spacing/density, action clarity, responsive usability, consistency/accessibility. Acceptance requires all at least 4, with no clipped actions, page errors, misleading automation claims or unreachable keyboard controls. Scores are qualitative self-review; automated accessibility/performance results are recorded separately. Each homepage round documents actual visible issues and a corresponding fix.
