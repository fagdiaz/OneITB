# Tasks: UX B2B and Academic Onboarding

## Phase 1 - Specification and quality gate

- [x] T001 Audit active contracts, session boundary, routes, roles, and B2B flow
- [x] T002 Create spec, plan, research, contracts, checklist, and initial evidence
- [x] T003 Execute HIGH-risk Speckit QA before implementation

## Phase 2 - Microsoft configuration

- [x] T004 Add pure Entra configuration resolver with canonical/legacy precedence
- [x] T005 Accept GUID tenant or explicit `common`, retaining GUID client validation
- [x] T006 Refactor MSAL provider/button to consume the same resolved configuration
- [x] T007 Add unit tests for canonical, fallback, precedence, blanks, and incompleteness

## Phase 3 - Employer CTA

- [x] T008 Add shared employer navigation constants
- [x] T009 Add desktop/mobile employer CTA to the real public Header/Nav
- [x] T010 Reuse route/text in Landing and ensure responsive menu closes on navigation
- [x] T011 Add navigation/visibility/accessibility tests

## Phase 4 - Academic onboarding

- [x] T012 Correct Apollo `linkUserToCareers` return selection to match GraphQL
- [x] T013 Add pure role, careers, identity, and redirect normalization helpers
- [x] T014 Add `RequireAcademicOnboarding` route guard with controlled states
- [x] T015 Add dedicated `/onboarding/academic` screen with active career selection
- [x] T016 Persist, await canonical profile refetch, validate, and restore destination
- [x] T017 Add retry/logout/error/empty/submission protections and dual-theme UI
- [x] T018 Add guard role-matrix, stale-session, and component state tests

## Phase 5 - Verification and documentation

- [x] T019 Run targeted frontend tests
- [x] T020 Run complete frontend test suite
- [x] T021 Run Vite production build
- [x] T022 Run `git diff --check` and Speckit Analyze
- [x] T023 Update Roadmap without inflating the existing denominator
- [x] T024 Add one newest-first Development Log entry
- [x] T025 Update Documentation Status and complete evidence
- [x] T026 Record browser/real-tenant validation as pending, without starting servers

## Definition Of Done

- [x] Canonical Entra client ID works and takes precedence over the legacy alias
- [x] `common` is accepted as tenant while malformed client IDs remain rejected
- [x] Provider and Login visibility use one resolved configuration
- [x] No browser secret or new dependency was introduced
- [x] Employer CTA is present on desktop/mobile public navigation
- [x] CTA route/text is shared with Landing
- [x] Only careerless Students are blocked
- [x] All other roles and anonymous users follow their expected route behavior
- [x] Stale/mismatched `me` data cannot make a routing decision
- [x] Setup cannot be dismissed and includes Retry/Logout recovery
- [x] At least one active career is required and IDs are unique integers
- [x] Failed saves retain selection and do not unlock the application
- [x] Successful saves await matching persisted `me` before redirect
- [x] Frontend tests and Vite build pass
- [x] Documentation and evidence are synchronized
- [x] Browser and real-tenant checks are not overclaimed
- [x] No server, commit, or push was executed
