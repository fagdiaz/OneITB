# Tasks: Microsoft Entra Redirect Authentication

## Phase 1 - Specification and preflight

- [x] T001 Audit MSAL, routing, GraphQL token, AuthContext, and Apollo boundaries
- [x] T002 Create specification, plan, research, data model, contracts, and checklist
- [x] T003 Execute HIGH-risk Speckit QA before implementation

## Phase 2 - Redirect configuration and initiation

- [x] T004 Require the dedicated callback URI in Entra configuration
- [x] T005 Keep MSAL on the callback and separate logout destination
- [x] T006 Add safe flow descriptor and completion coordinator
- [x] T007 Replace popup initiation with guarded `loginRedirect`

## Phase 3 - Callback and session completion

- [x] T008 Add callback route with non-interactive accessible UI
- [x] T009 Select the returned account and acquire the delegated token silently
- [x] T010 Exchange the access token exactly once and hydrate AuthContext
- [x] T011 Sanitize destination and handle failures without automatic redirects

## Phase 4 - Verification and closure

- [x] T012 Add configuration and flow-helper tests
- [x] T013 Replace popup tests with redirect/busy-state tests
- [x] T014 Add callback success, duplicate, unsafe-target, and failure tests
- [x] T015 Run targeted and complete frontend test suites
- [x] T016 Run the Vite production build
- [x] T017 Run static popup search and `git diff --check`
- [x] T018 Update Roadmap, Development Log, Documentation Status, and evidence
- [x] T019 Execute Speckit Analyze and reconcile final claims

## Definition Of Done

- [x] No active popup authentication call remains
- [x] Login starts one redirect and blocks all concurrent interaction states
- [x] The callback route never renders a Login action
- [x] The delegated API access token is exchanged exactly once per flow
- [x] Canonical AuthContext/Apollo session replacement remains intact
- [x] Unsafe destinations fall back to `/feed`
- [x] Errors are accessible, retryable, and do not create loops
- [x] Targeted/full tests and Vite build pass
- [x] Documentation and evidence match executed checks
- [x] Browser/tenant acceptance is explicitly pending
- [x] No server, commit, or push was executed
