# Tasks: Profile as a CV

**Input**: Design documents from `specs/142-profile-as-cv/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Frontend build required. Browser validation is recorded if the local app is available.

**Roadmap targets**: Module 2 profile/CV quality; no new checklist item is completed unless runtime/browser evidence proves a pending item.

## Phase 1: Setup and Baseline

**Purpose**: Confirm active feature and inspect profile contracts before editing.

- [x] T001 Record branch/worktree constraints and frontend-only scope in `specs/142-profile-as-cv/evidence.md`
- [x] T002 Verify requirements checklist in `specs/142-profile-as-cv/checklists/requirements.md`
- [x] T003 Inspect current `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T004 Inspect current profile and academic query contracts in `FrontEnd/OneItb-FE/src/data/graphql/queries/`

---

## Phase 2: User Story 1 - Public CV presentation (Priority: P1)

**Goal**: Profile reads as a modern institutional CV/portfolio.

**Independent Test**: Open another user's profile and confirm hero, professional profile, contact/social and education/activity sections render without edit controls.

- [x] T005 [US1] Update `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js` to consume the `publicProfile(userId)` summary fields
- [x] T006 [US1] Refactor `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx` hero section into a CV-style layout
- [x] T007 [US1] Add contact/social icon card rendering in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T008 [US1] Add education/trayectoria section using careers and public activity in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T009 [US1] Improve recent publication cards as portfolio activity in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

---

## Phase 3: User Story 2 - Owner-only editing controls (Priority: P2)

**Goal**: Edit actions appear only on the logged-in user's own profile.

**Independent Test**: Compare `/profile` and `/profile/{otherId}` with the same session.

- [x] T010 [US2] Add robust owner detection in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T011 [US2] Render "Editar CV/Perfil" only for owner views in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

---

## Phase 4: User Story 3 - Private academic summary (Priority: P3)

**Goal**: Owner gets useful academic summary without exposing grades on public profiles.

**Independent Test**: Own profile may show progress summary; public profile never shows private progress.

- [x] T012 [US3] Load `GET_MY_ACADEMIC_PROGRESS` only for owner views in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
- [x] T013 [US3] Render owner-only academic status metrics in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

---

## Phase 5: Validation and Closeout

- [x] T014 Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record result
- [x] T015 Run `git diff --check` and focused pending/secret scans over changed files
- [x] T016 Update `specs/142-profile-as-cv/evidence.md` with commands, outputs and residual risk
- [x] T017 Recalculate `docs/project_docs/ROADMAP.md` percentages from current checklists without overstating verification
- [x] T018 Update `docs/audit/DOCUMENTATION_STATUS.md` with spec 142 evidence
- [x] T019 Insert exactly one newest-first entry for spec 142 in `docs/audit/DEVELOPMENT_LOG.md`
- [x] T020 Mark all tasks complete and verify the development log ordering

## Definition Of Done

- [x] All required tasks are marked `[x]`.
- [x] Public profile uses a CV-style layout.
- [x] Edit controls render only for owner profile.
- [x] Private academic progress renders only for owner profile.
- [x] Frontend build passes.
- [x] Evidence, roadmap and development log are synchronized.
