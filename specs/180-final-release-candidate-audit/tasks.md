# Tasks: Final Release Candidate Audit

**Input**: Design documents from `specs/180-final-release-candidate-audit/`

**Tests**: Required for backend, frontend and EF drift where environment permits.

## Phase 1: Setup and Source of Truth

- [x] T001 Confirm active feature path in `.specify/feature.json`
- [x] T002 Read `.specify/memory/constitution.md`
- [x] T003 Read `docs/project_docs/ROADMAP.md`
- [x] T004 Read `docs/project_docs/scope-and-requirements.md`
- [x] T005 Read `docs/project_docs/architecture-and-design.md`
- [x] T006 Read `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T007 Read `docs/audit/FINAL_AUDIT_REPORT.md`

## Phase 2: Git Hygiene

- [x] T008 Inspect `git status --short`
- [x] T009 Inspect `.gitignore` coverage for specs, uploads, build outputs, env and scratch files
- [x] T010 Run `git diff --check`
- [x] T011 Document tracked/untracked intentional changes and any repo hygiene findings in `specs/180-final-release-candidate-audit/evidence.md`

## Phase 3: Backend Release Gates

- [x] T012 Run `docker compose ps`
- [x] T013 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
- [x] T014 Run backend tests for `API Graphql/Tests/Services.Tests/Services.Tests.csproj`
- [x] T015 Run EF model drift check with `dotnet ef migrations has-pending-model-changes`
- [x] T016 Attempt runtime GraphQL smoke if backend can be started safely

## Phase 4: Frontend Release Gates

- [x] T017 Run `npm.cmd run test -- --run --configLoader runner`
- [x] T018 Run `npm.cmd run build`
- [x] T019 Attempt browser/dev-server QA for routes `/login`, `/feed`, `/profile`, `/profile/edit`, `/academic`, `/empleos`, `/empleos/mis-ofertas`, `/admin` when available
- [x] T020 Document console/runtime findings and distinguish own-code from provider/browser warnings

## Phase 5: Security and Contract Audit

- [x] T021 Inspect auth/logout/Apollo cache boundary
- [x] T022 Inspect profile privacy masking and public profile search contract
- [x] T023 Inspect upload validation and static file headers
- [x] T024 Inspect GraphQL depth/paging/rate limiting configuration
- [x] T025 Inspect sensitive mutations for backend-side authorization patterns

## Phase 6: Surgical Fixes Only If Justified

- [x] T026 Apply low-risk own-code fixes found by phases 2-5, if any
- [x] T027 Re-run affected tests/builds after any fix

## Phase 7: Documentation and Closeout

- [x] T028 Update `specs/180-final-release-candidate-audit/evidence.md`
- [x] T029 Update `docs/audit/DEVELOPMENT_LOG.md` with one top Spec 180 entry
- [x] T030 Update `docs/audit/DOCUMENTATION_STATUS.md`
- [x] T031 Update `docs/audit/FINAL_AUDIT_REPORT.md` with Release Candidate Audit section
- [x] T032 Update `docs/project_docs/ROADMAP.md` only for evidence-backed `[V]` changes
- [x] T033 Mark all tasks complete and verify newest-to-oldest log order

## Definition Of Done

- [x] All tasks are marked `[x]`
- [x] Commands and blockers are recorded in evidence
- [x] Builds/tests pass or blockers are explicit
- [x] No roadmap item is elevated without runtime/browser evidence
- [x] No commit or push performed
