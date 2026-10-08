# Functional issues

Baseline `a182328`; synthetic local fixtures only. Final verification is recorded in coverage.md and report.md.

| ID / severity | Feature and reproduction | Expected / actual and impact | Established cause / implemented fix | Verification |
|---|---|---|---|---|
| F01 / P1 | Pricing: A/B/C; delete A; edit B, or edit B then delete A | Edit remains on B; reused draft overwrites B/C with another plan | Index keys and draft initialized once; transient stable row identity and initialize on open | Business/competitor regressions + browser reload |
| F02 / P1 | Settings Clear; reload | Workspace stays empty; sample data returns | Empty state confused with absent storage; seed only when storage keys absent | Real provider remount and browser reload |
| F03 / P1 | Import malformed nested records or duplicate competitor/history/weakness/strategy/source IDs | Reject before mutation; accepts data causing crashes/ambiguous edits | Unchecked cast; shared validation/legacy normalization for import and stored data | Invalid cases, legacy compatibility, no-mutation browser |
| F04 / P1 | Two synchronous changes/additions | Both edits and before-state history persist; later closed-over write drops earlier | State updater side effects/closed-over arrays; resolve hook updates once at call boundary, functional context/snapshot updates | StrictMode batched tests and disk assertions |
| F05 / P1 | Scrape public page redirects to private IP or IPv4-mapped IPv6 | Every target guarded; redirects follow automatically, mapped/alternate link-local ranges bypass guard | Validate each manually followed redirect; normalize mapped IPv6 and link-local range; cap redirects/body/timeout | Handler integration with DNS/native HTTP boundary mocked; no private requests |
| F06 / P2 | Browser storage throws quota/read error | Visible warning and recovery; console warning only while header implies persistence | Propagate storage failure to persistent workspace warning; keep draft in memory for export/retry | Hook and browser failure injection |
| F07 / P2 | Scan success then save dossier | Extracted handles persist; saved object discards them | Saved social handles taken from old competitor; merge form values and preserve all existing fields | Form payload test + browser saved/reloaded data |
| F08 / P2 | Concurrent/interrupted scans or malformed API response | Latest valid scan wins, cancellation stays canceled; stale result restores data or malformed response crashes | Abort/revision guarding, response shape validation, bounded wait | Hook races/reset/invalid tests; mocked browser retries |
| F09 / P2 | First edit → History → Compare | Compare before to current without manual milestone; button disabled and latest state absent | Add transient compare-to-current using existing Snapshot contract | Test and browser, no new stored snapshot |
| F10 / P2 | Compare sources-only versions | Show changed URLs; falsely says identical | Include omitted content fields and sources in diff | Real diff component negative/positive test |
| F11 / P2 | Save milestone or compare in drawer | Focus remains inside modal; active control unmounts and focus falls to body | Focus stable close/header control on view transition | Component and keyboard browser |
| F12 / P2 | Add weakness with blank source or spaces-only description | No false attribution; nonblank trimmed text; default G2 Crowd evidence invented | Blank source default + Unknown, trim/reject descriptions | Real stored-data regression and browser |
| F13 / P2 | JSON full backup/restore, Clear/Reset | History included and explicit destructive action clears it | Snapshot history omitted/retained ambiguously; user authorized best policy: full backups restore history, old backup preserves history, confirmed reset/clear clears history | Round-trip, old compatibility, reset/clear tests |
| F14 / P2 | CSV includes formula-leading strings or CR line breaks | Spreadsheet treats user data as text; possible formulas and malformed rows | Neutralize formula prefixes and quote CR | Actual CSV output literals |
| F15 / P3 | Search padded company text | Same matches as trimmed query; zero results | Normalize search query consistently | Component + browser |
| F16 / P3 | Invalid JSON selected, corrected file selected again | Same file can retry; early return leaves input selected | Reset input in finally | Browser repeated selection |

| F17 / P1 | Malformed stored workspace → add record | Preserve unread original; fallback-derived edits overwrite original records | Protect unread keys, keep drafts in memory, offer raw download; replacement only explicit import/reset/clear | Hook original-byte test and browser raw download/edit |
| F18 / P1 | Public DNS changes between validation and connection | Connect only to validated public address; second lookup permits rebinding | Native HTTP(S) pinned lookup, fresh validation per redirect, DNS deadline, original TLS hostname | Handler/transport boundary checks, independent review |
| F19 / P2 | Imported enum is array instead of string | Reject malformed record; String coercion accepts arrays, severity page crashes | Require exact string enum values for stored/imported records | Four negative regressions |
| F20 / P2 | Page links to //x.com/company | Keep successful extraction; raw relative link makes client reject response | Resolve social links against final URL and filter scheme/host | Actual HTML → handler → client hook regression |

| F21 / P2 | Focus inside history → Escape after compare/milestone | Return to timeline then dismiss; event never reaches document listener | Drawer focus trap stops bubbling; handle Escape in capture phase | Red focused-control regression and both browser harnesses |

Prior live scrape deployment, mailbox/SLA ownership and telemetry are not verified by local tests. No real communications, production changes or deployment.

All 21 tracked issues are fixed and verified within the local scope documented in coverage.md: 222 tests and 57 browser checks pass. API transport tests simulate DNS/HTTP boundaries; deployment/service configuration remains unverified.
