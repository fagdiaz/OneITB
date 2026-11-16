# Implementation Plan: ATS-Friendly CV Export

**Feature directory:** `specs/208-ats-friendly-cv-export`  
**Branch:** `N/A`  
**Date:** 2026-08-04  
**Specification:** [spec.md](spec.md)  
**Risk:** MEDIUM  
**Code Freeze impact:** Explicitly approved quality repair

## 1. Summary

Replace the fixed, visually arranged CV print root with one semantic single-column
document shared by profile and editor. Use the existing `react-to-print` dependency for
scoped native printing and add DOM plus optional Poppler artifact validation. Backend,
GraphQL, EF Core and persisted profile data remain unchanged.

## 2. Technical Context

| Concern | Decision for this feature |
|---|---|
| Backend | Not affected |
| Frontend | React 18, Vite 8, Tailwind CSS 4, `react-to-print` 3.3 |
| Persistence | None |
| GraphQL | None; reuse existing profile query/data mapping |
| REST exception | None |
| External integrations | Optional local Poppler tools for evidence only |
| Testing | Vitest/Testing Library, build, browser and PDF extraction |
| Performance goals | No network request; preview derived synchronously from bounded profile arrays |
| Security/privacy | Printable data equals already-authorized profile projection; no logging/storage |
| Scale/scope | Existing bounded CV arrays; multi-page A4 output |
| Unknowns | Native PDF tagging varies by browser/driver and remains explicit evidence |

## 3. Change Classification and Blast Radius

| Dimension | Yes/No | Affected contract or risk |
|---|---:|---|
| User-visible behavior | Yes | Profile/editor preview and print action |
| GraphQL schema | No | Existing profile data only |
| Authorization or privacy | No | No wider data access |
| EF model or migration | No | None |
| Apollo cache or session | No | Read-only derived document |
| Files or untrusted input | No | No new file upload/download parser |
| Background or concurrent work | No | None |
| External provider/configuration | No | Poppler is optional QA tooling |
| Deployment or operations | No | No headless browser service |
| Canonical documentation | Yes | CV/export contract and release evidence |

**Affected users/roles:** Estudiante, Egresado and any profile owner using CV export.  
**Explicitly out of scope:** backend PDF service, ATS scoring, LinkedIn and templates.

## 4. Baseline and Inputs

- `CVPrintTemplate.tsx` currently fixes A4 height, hides overflow, renders avatar/chips and
  uses two-column grids for education and skills/languages.
- `/profile` and `/profile/edit` both use the component but call global `window.print()`.
- The reference project proves actual PDF extraction and uses content-driven print height.
- Pre-change frontend baseline used for planning: 205/205 and Vite 558 modules.

## 5. Constitution Check

| Principle | Pre-design | Post-design | Plan evidence / decision |
|---|---|---|---|
| I. Contract-first boundaries | PASS | PASS | Frontend-only; no REST addition |
| II. Identity/privacy | PASS | PASS | Existing authorized data only |
| III. Input/file security | PASS | PASS | No new untrusted file ingestion |
| IV. Data lifecycle | PASS | PASS | No persistence |
| V. Session isolation | PASS | PASS | No cache/session writes |
| VI. Performance/resilience | PASS | PASS | Bounded pure rendering; scoped print |
| VII. Evidence/release truth | PASS | PASS | DOM, browser and artifact gates separated |
| VIII. External adapters | PASS | PASS | Optional tools cannot silently produce PASS |

**Constitution result:** PASS.  
**Known project gap touched:** None.

## 6. Architecture and Ownership

### 6.1 Current flow

Profile query -> `CVData` mapping -> visual preview + fixed `CVPrintTemplate` -> global
`window.print()` -> browser PDF/print driver.

### 6.2 Proposed flow

1. Existing profile mapping produces `CVData`.
2. Pure `CVATSPrintTemplate` filters hidden/empty values and emits the canonical sequence.
3. Profile modal and the editor's visible preview render that same component; the legacy
   visual preview and print-only template are retired after consumer migration.
4. A small print hook uses `react-to-print` with the canonical document ref only.
5. Component tests prove semantic order/parity; browser and Poppler validate the artifact.

### 6.3 Component responsibilities

| Component/service | Responsibility | Must not own |
|---|---|---|
| `CVATSPrintTemplate` | Semantic document and content order | Modal, persistence, printing side effects |
| `useCvAtsPrint` | Scoped print action and title | Profile mapping or business data |
| Profile/editor wrappers | Preview controls and current data | Duplicate document markup |
| ATS analyzer script | Validate a supplied PDF | Generate or store user profile data |

### 6.4 Authorization matrix

Not affected. Existing profile route/query authorization remains authoritative.

## 7. Data and EF Core Design

No model or data change. No migration, seed or drift impact.

## 8. GraphQL and Backend Contract

Not affected.

## 9. Frontend and Apollo Design

| Concern | Decision |
|---|---|
| Route/layout | Existing `/profile` and `/profile/edit` |
| Data source | Existing canonical `CVData` mapping |
| Cache | No writes or policy changes |
| Optimistic state | N/A |
| Session boundary | Component unmount disposes print refs naturally |
| UI states | Disabled print until canonical data exists; controlled print error message |
| Effects | No persistent listener; print hook remains scoped |
| Accessibility | Semantic headings, visible URLs, descriptive action and logical DOM order |
| Responsive/theme/print | Preview may scale; print root stays single-column A4 and theme-independent |

## 10. Security and Privacy Review

| Threat or misuse | Preventive control | Negative test | Residual risk |
|---|---|---|---|
| Hidden fields leak into CV | Filter `hidden` and empty values centrally | Hidden-item component test | Existing profile query remains source |
| XSS via URLs/text | React escaping and existing URL normalization | Unsafe/empty URL fixture | Browser URL handling |
| Data retained by QA tooling | Analyzer accepts a user-selected local PDF only | No profile logging/storage assertion | User controls exported file |
| Overclaiming ATS support | Measurable label and documented limits | Copy assertion | Vendor-specific parsing varies |

## 11. Performance, Concurrency, and Resilience

- Pure rendering over existing bounded arrays; no I/O or N+1 behavior.
- No asynchronous race beyond print invocation; prevent duplicate clicks while preparing.
- Long content grows across pages rather than being clipped.
- Print failures produce a recoverable Spanish message without profile data in logs.

## 12. External Integrations and Configuration

| Environment | Adapter/config | Missing or invalid config | Verification |
|---|---|---|---|
| Development/Test | Optional Poppler executable on PATH | Mark artifact extraction BLOCKED | Finite commands in quickstart |
| Production | Native browser print/PDF | Driver capabilities vary | Manual release acceptance |

## 13. Test and Evidence Plan

| Layer/gate | Cases | Command or method | Evidence status expected |
|---|---|---|---|
| Baseline | Existing CV/profile lifecycle | frontend full suite | PASS |
| Unit | order, hidden/empty, Unicode, links, no image/grid | focused Vitest | PASS |
| Frontend | both routes consume same component/hook | Testing Library | PASS |
| Build | Vite production | `npm.cmd run build` | PASS |
| Runtime/browser | preview parity, long CV, console | quickstart | PASS/BLOCKED |
| PDF artifact | text/order/A4/fonts/encryption/links | Poppler commands | PASS/BLOCKED |
| Cleanup | close print surface; remove temp fixture | bounded manual procedure | PASS |

## 14. Documentation Propagation

| Document | Action and reason |
|---|---|
| `docs/project_docs/ROADMAP.md` | Add quality gate; status only from evidence |
| `docs/audit/DEVELOPMENT_LOG.md` | One entry at implementation completion |
| `docs/audit/DOCUMENTATION_STATUS.md` | Track ATS artifact evidence |
| `docs/project_docs/scope-and-requirements.md` | Add verifiable CV export requirement |
| `docs/project_docs/architecture-and-design.md` | Document canonical semantic print flow |
| `docs/audit/RUNBOOK_DEV.md` | Add finite PDF inspection procedure |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Replace print residual with actual evidence |
| `docs/academic/*` and final memory | Describe PDF optimized for ATS without overclaim |
| `core-web/*` | Regenerate only after canonical docs change |

## 15. Project Structure and Planned Touchpoints

| Path | Planned change | Owner/reason |
|---|---|---|
| `FrontEnd/OneItb-FE/src/Components/resume/CVATSPrintTemplate.tsx` | Create | Canonical semantic document |
| `FrontEnd/OneItb-FE/src/Components/resume/CVATSPrintTemplate.test.tsx` | Create | Order/content regressions |
| `FrontEnd/OneItb-FE/src/hooks/useCvAtsPrint.ts` | Create | Scoped print action |
| `FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx` | Remove after migration | Eliminate divergent visual preview |
| `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx` | Remove after migration | Eliminate fixed-height print duplicate |
| `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx` | Modify | ATS preview/action |
| `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx` | Modify | Same preview/action |
| `FrontEnd/OneItb-FE/src/index.css` | Modify | Content-driven A4 print CSS |
| `FrontEnd/OneItb-FE/scripts/analyzeAtsPdf.mjs` | Create | Optional finite PDF validation |
| `FrontEnd/OneItb-FE/package.json` | Modify | Expose finite `analyze:ats` command |
| `FrontEnd/OneItb-FE/src/visualAssets.test.js` | Modify | Print contract guard |

## 16. Planning Artifacts

- `research.md`: completed.
- `data-model.md`: confirms no persistence change.
- `contracts/ats-document.md`: UI/print/artifact contract.
- `quickstart.md`: finite browser and PDF checks.
- `tasks.md`: dependency-ordered implementation.

## 17. Implementation Order

1. Add semantic contract tests and fixture.
2. Implement canonical ATS document.
3. Add scoped print hook and integrate both routes.
4. Replace fixed/clipping print CSS.
5. Add analyzer and execute automated/browser/artifact gates.
6. Synchronize evidence and canonical documentation.

Tests/analyzer documentation can progress in parallel; shared component and route
integration remain sequential.

## 18. Risks, Rollback, and Complexity Tracking

| Risk | Likelihood/impact | Mitigation | Detection/rollback |
|---|---|---|---|
| Visual regression | M/M | Keep screen wrapper separate from semantic root | Component/browser comparison; restore prior component |
| Multi-page break anomaly | M/H | Content-driven height and break rules | Long fixture PDF inspection |
| Browser driver changes extraction | M/M | Poppler gate and documented driver | Keep `[I]`, record driver, no false PASS |
| Scope expansion from reference app | L/H | Explicit exclusions | Review touched files against plan |

### Constitutional exceptions

None.

## Plan Definition of Done

- [x] Unknowns resolved or represented as evidence gates.
- [x] Blast radius and roles complete.
- [x] Constitution passes before and after design.
- [x] No migration, GraphQL, Apollo or authorization change.
- [x] Positive, negative, browser, artifact and cleanup evidence planned.
- [x] Exact touchpoints and documentation propagation listed.
- [x] Research, data model, contract and quickstart generated.
- [x] No implementation, server, commit or push claimed.
