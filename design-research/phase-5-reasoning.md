# Template rollout — phase 5

Phase 4 commit: `d96e922`. All work remains on `design/upgrade`. No persistent field, dependency, route, data migration, external feed or production change was introduced.

## Delivered across all templates

- Dossiers: name/summary/website search, threat filter, name/threat/saved sorting, recoverable no-match state; selected query opens a composed battlecard with SWOT, sources, responses, features and pricing. Download includes existing notes; print uses the displayed card. Existing add/edit/scrape/research/history/delete controls remain.
- Positioning: pointer dragging, keyboard gestures saved once at release/blur, no snapshots for boundary no-ops, pointer identity/cancellation, numeric price/quality controls. Written coordinate/ threat context supports the visual map.
- Matrix: labeled native status buttons, persistent status text, labeled add control, narrower sticky feature column and horizontal overflow guidance. Existing status order and persistence remain.
- Pricing: wrapping section controls, visible edit/delete actions and readable free-text prices. Removed inferred monthly suffix from the presentation; recorded price strings are unchanged.
- Social: public X/LinkedIn research links, honest local preview/no-feed copy, preserved filter/handle editing/scan control; compact scrolling target list on mobile.
- Weaknesses: responsive target grid, full-width mobile description/source, associated severity label; source/severity/save actions remain.
- Alerts: derived local snapshot changes, preserved category/read controls, correct saved-state dates, retained removed-dossier changes without invalid dossier links; no external-feed claims.
- Strategy: responsive labeled creation controls, preserved planned/active/completed transitions, reachable delete action.
- SWOT: editorial page header, visible item actions, labeled inputs and mobile input sizing. Existing quadrants, content, threat filters and expansion remain.
- Settings: transfer actions before overview, preserved JSON/CSV/import behavior and separate danger area with wrapping controls. No destructive controls exercised against real user storage.
- About/contact/privacy: reading measure, type hierarchy and section rhythm. All original substantive copy, addresses, response commitments, effective date and links remain.
- Shared states: associated competitor-form labels, viewport scrolling, focus trap/return; history portal/dialog semantics/focus and milestone labels; search results select individual dossiers; mobile drawer is inert while closed and traps/returns focus while open.

## Review and corrections

An independent reviewer found boundary-arrow snapshot flooding, incorrect change dates, omitted removed-record history, uncancelled pointer gestures and missing printed feature/pricing sections. All were corrected and rechecked; no blocking findings remain. Browser checks additionally exposed StrictMode focus replay, which now refocuses the form after effect replay. Initial mobile captures exposed a squeezed weakness input; it now occupies its own row.

Nine workspace tests cover selected summary, combined filter recovery, form focus/return, keyboard matrix snapshots, boundary movement without snapshots, local feature-category changes, retained removed-record history, public research links and strategy creation. New behavior tests were observed failing before corresponding implementation/fixes. Current focused and full verification is recorded in progress.

## Evidence and rubric

`templates-browser-evidence.json` / `screenshots/templates` document initial rollout. `after-browser-evidence.json` / `screenshots/after` supersede that capture after fixes. `journey-evidence.json` / `screenshots/journeys` exercise actual isolated-browser records, not just static screens.

Qualitative acceptance: each template scores 4/5 for hierarchy, typography/readability, spacing/density, action clarity, responsive usability and consistency. Dashboard's two rounds remain separately documented. Scores are self-review, not accessibility certification. Key improvements are action visibility and mobile reachability; the map remains an estimate view and dense matrix remains horizontally scrollable.

Browser round before the final numeric/cancellation additions: 29/29 checks pass on desktop/mobile, covering selected dossier/download, search/form validation/save, keyboard matrix/local feed filters, keyboard/pointer map, pricing cancel/save, weakness/strategy status changes, history/milestone/focus, command navigation, SWOT editing, snapshot comparison, JSON/CSV download, invalid/valid isolated import with preserved snapshots, all 14 aliases and informational links, manual social preview, mobile drawer focus and page errors. Final numeric/cancellation checks repeat in phase 6.

## Remaining phase 6 work

Production build/budgets, production-served journey repeat including numeric editing/pointer cancellation, production Lighthouse on dashboard/dossier/matrix desktop/mobile, formal contrast results and final evidence/report. The local server does not execute Vercel's scrape endpoint; deployment behavior stays untested and unchanged.
