# Tasks: Production Readiness Hardening

**Input**: Design documents from `specs/167-production-readiness-hardening/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Include the validation needed to prove the acceptance scenarios. Compilation alone is insufficient for GraphQL contracts, persistence, authentication, or browser flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup and Audit

- [x] T001 Read canonical contracts in `core-web/agent_contracts.md`, `.specify/memory/constitution.md`, `docs/project_docs/ROADMAP.md`, `docs/project_docs/scope-and-requirements.md`, `docs/project_docs/architecture-and-design.md`, and `core-web/decisions_log.md`.
- [x] T002 Audit startup, GraphQL metrics, social query loading, Apollo cache, and remaining roadmap gaps using `rg` and targeted file reads.

---

## Phase 2: User Story 1 - Observable Backend Runtime (P1)

**Goal**: Every backend request gets traceable correlation metadata.

**Independent Test**: GraphQL smoke returns `X-Correlation-ID` and console logging includes the same value.

- [x] T003 [US1] Add request correlation middleware in `API Graphql/OneITB/Infrastructure/CorrelationIdMiddleware.cs`.
- [x] T004 [US1] Register correlation middleware in `API Graphql/OneITB/Startup.cs` before routing/authentication.

---

## Phase 3: User Story 2 - GraphQL Metric Fields Without N+1 (P1)

**Goal**: Social/admin metric fields use batched grouped loading.

**Independent Test**: GraphQL list metric queries execute with batched count loading.

- [x] T005 [US2] Add metric DataLoaders in `API Graphql/OneITB/Infrastructure/GraphQLMetricsDataLoaders.cs`.
- [x] T006 [US2] Replace per-parent metric resolvers in `API Graphql/OneITB/Startup.cs` with DataLoader-backed resolvers.

---

## Phase 4: User Story 3 - Honest Production Readiness Evidence (P2)

**Goal**: Provide audit-ready evidence without overstating completion.

**Independent Test**: Documentation clearly separates completed, verified, and blocked items.

- [x] T007 [US3] Create final academic audit report in `docs/audit/FINAL_AUDIT_REPORT.md`.
- [x] T008 [US3] Update `docs/project_docs/ROADMAP.md` only for evidence-backed status.
- [x] T009 [US3] Update `docs/audit/DOCUMENTATION_STATUS.md` with new evidence and residual blockers.
- [x] T010 [US3] Insert one newest-first entry in `docs/audit/DEVELOPMENT_LOG.md`.

---

## Phase 5: Validation and Closeout

- [x] T011 Run `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore` when current restore assets permit it.
- [x] T012 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` or record NuGet/restore blocker.
- [x] T013 Run GraphQL correlation and metric smoke when backend runtime is available or record blocker.
- [x] T014 Record executed commands and blockers in `specs/167-production-readiness-hardening/evidence.md`.
- [x] T015 Verify `DEVELOPMENT_LOG.md` newest-first ordering and active spec top entry.

## Dependencies & Execution Order

- T001-T002 before implementation.
- T003-T004 can complete independently of T005-T006.
- T007-T010 after implementation decisions are known.
- T011-T015 close the spec.

## Definition Of Done

- [x] Required tasks are marked `[x]`.
- [x] Runtime checks are recorded when executable.
- [x] Blocked checks are explicit and not reported as verified.
- [x] Roadmap percentage is recalculated only from checklist evidence.
- [x] Development log contains exactly one top entry for this spec.
