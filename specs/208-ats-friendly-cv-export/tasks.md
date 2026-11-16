# Tasks: ATS-Friendly CV Export

**Input**: Design documents from `specs/208-ats-friendly-cv-export/`

## Phase 1: Setup

- [x] T001 Audit all current print/preview consumers in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`, `CvEditorProfile.tsx`, `resume/ResumePreview.tsx`, `resume/CVPrintTemplate.tsx` and `src/index.css`
- [x] T002 Finalize the measurable artifact fixture and required section order in `specs/208-ats-friendly-cv-export/contracts/ats-document.md`
- [x] T003 Run the MEDIUM risk Speckit QA preflight and record the baseline in `specs/208-ats-friendly-cv-export/evidence/evidence.md`

## Phase 2: Foundational

- [x] T004 [P] Add canonical complete/empty/Unicode CV fixtures in `FrontEnd/OneItb-FE/src/Components/resume/cvAtsFixtures.ts`
- [x] T005 [P] Add scoped-print hook tests in `FrontEnd/OneItb-FE/src/hooks/useCvAtsPrint.test.tsx`
- [x] T006 Add semantic order, hidden/empty, link and no-image/no-grid tests in `FrontEnd/OneItb-FE/src/Components/resume/CVATSPrintTemplate.test.tsx`

## Phase 3: User Story 1 - Linear ATS document (P1)

**Independent Test**: A complete and a long fixture render/extract in canonical order
without fixed-height clipping.

- [x] T007 [US1] Implement the single-column semantic document in `FrontEnd/OneItb-FE/src/Components/resume/CVATSPrintTemplate.tsx`
- [x] T008 [US1] Replace fixed-height and hidden-overflow print rules with content-driven A4 pagination in `FrontEnd/OneItb-FE/src/index.css`
- [x] T009 [US1] Implement isolated printing with `react-to-print` and controlled Spanish errors in `FrontEnd/OneItb-FE/src/hooks/useCvAtsPrint.ts`
- [x] T010 [US1] Add guards for A4, linear layout and non-clipping rules in `FrontEnd/OneItb-FE/src/visualAssets.test.js`

## Phase 4: User Story 2 - Route parity (P1)

**Independent Test**: Profile and editor render the same canonical document from the same
`CVData` without duplicating markup.

- [x] T011 [US2] Integrate the ATS preview and scoped action in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T012 [US2] Replace the visible editor preview and print-only copy with the same ATS document and scoped action in `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- [x] T013 [P] [US2] Create/update profile and editor tests for parity, loading and print failure in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.test.tsx` and `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.lifecycle.test.tsx`
- [x] T014 [US2] Remove `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx` and `FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx` only after all consumers and regression guards use the canonical ATS document

## Phase 5: User Story 3 - Objective PDF evidence (P2)

**Independent Test**: A supplied PDF returns explicit results for extraction, order, A4,
Unicode, encryption, fonts and links, or a clear blocked prerequisite.

- [x] T015 [P] [US3] Implement a bounded Poppler-based analyzer that accepts non-sensitive expected terms without persisting extracted text in `FrontEnd/OneItb-FE/scripts/analyzeAtsPdf.mjs` and expose it as `analyze:ats` in `FrontEnd/OneItb-FE/package.json`
- [x] T016 [P] [US3] Document exact Windows tool discovery and commands in `docs/audit/RUNBOOK_DEV.md`
- [ ] T017 [US3] **BLOCKED** - Generate a PDF through the user-visible print flow from an approved complete profile whose content spans at least two pages, without adding production test routes or altering non-disposable profile data, and record tool/browser/driver metadata in `specs/208-ats-friendly-cv-export/evidence/evidence.md`
- [ ] T018 [US3] **BLOCKED** - Execute extraction/order/A4/fonts/encryption/link checks or record the exact missing prerequisite as BLOCKED in `specs/208-ats-friendly-cv-export/evidence/evidence.md`

## Phase 6: Validation and Closeout

- [x] T019 Run focused tests, full `npm.cmd run test -- --run` and `npm.cmd run build`; record results in `specs/208-ats-friendly-cv-export/evidence/evidence.md`
- [ ] T020 **BLOCKED** - Execute `/profile` and `/profile/edit` parity, empty, long, keyboard and native print checks from `specs/208-ats-friendly-cv-export/quickstart.md`
  - Partial browser acceptance on 2026-08-04 passed route parity, semantic order, responsive layout and clean-console checks for the seeded Student. Empty/long profiles and the native print dialog remain blocked.
- [x] T021 Update `docs/project_docs/scope-and-requirements.md` and `docs/project_docs/architecture-and-design.md` with the measured ATS contract
- [x] T022 Update `docs/project_docs/ROADMAP.md` only from recorded evidence
- [x] T023 Add exactly one completed Spec 208 entry in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T024 Update `docs/audit/DOCUMENTATION_STATUS.md`, `docs/audit/FINAL_AUDIT_REPORT.md` and `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`
- [x] T025 Run Speckit Analyze, fix any critical/high artifact inconsistency, and run `git diff --check`

## Dependencies & Execution Order

`T001-T003 -> T004-T006 -> US1 -> US2 -> US3 -> T019-T025`.

T004/T005 and T015/T016 can run in parallel because they own different files. T014 is
strictly last within US2 to prevent dangling imports. Artifact acceptance follows route
integration so it tests the actual user flow.

## Definition Of Done

- [ ] All required tasks are checked with commands and evidence. **BLOCKED** by T017, T018 and T020.
- [x] Both profile routes use one canonical semantic document.
- [ ] Long content spans pages without clipping and required text remains selectable. **BLOCKED** for the native PDF artifact; DOM/CSS guards pass.
- [x] Extracted text, Unicode and section order pass, or the external tool gate is visibly blocked.
- [ ] A4, non-encrypted output and fonts are inspected on the actual PDF. **BLOCKED** by missing native artifact and Poppler tools.
- [x] Full frontend tests/build pass.
- [x] Canonical documentation says `PDF optimizado para ATS`, not universal compatibility.
- [x] No backend, GraphQL, EF, session or privacy behavior changed.
