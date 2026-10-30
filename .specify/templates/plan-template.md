# Implementation Plan: [FEATURE NAME]

**Feature directory:** `[specs/NNN-feature-name]`  
**Branch:** `[branch-name or N/A]`  
**Date:** `[YYYY-MM-DD]`  
**Specification:** `[relative link to spec.md]`  
**Risk:** `[LOW | MEDIUM | HIGH]`  
**Code Freeze impact:** `[Allowed fix | Explicitly approved scope | Not applicable]`

**Input:** validated requirements from the active feature selected by
`.specify/feature.json`.

> This document defines the implementation design. It does not prove that code, schema,
> migration, browser behavior, or an external integration works.

## 1. Summary

[State the user/business outcome, the smallest viable technical approach, affected layers,
and the reason this approach fits existing OneITB23 patterns. Keep this to 1-3 paragraphs.]

## 2. Technical Context

Replace every unresolved item before generating tasks.

| Concern | Decision for this feature |
|---|---|
| Backend | [.NET 8 / EF Core 8.0.6 / HotChocolate 14.2.0 / not affected] |
| Frontend | [React 18 / Apollo Client 3.7 / Vite 8 / Tailwind CSS 4 / not affected] |
| Persistence | [SQL Server entities/tables affected, file storage, or none] |
| GraphQL | [Queries, mutations, subscriptions, types, or none] |
| REST exception | [`POST /api/upload`, approved file delivery, or none] |
| External integrations | [Microsoft Entra, SMTP, Redis, Cloudinary, SIU mock, or none] |
| Testing | [xUnit/Moq, HotChocolate executor, Vitest/Testing Library, runtime/browser] |
| Performance goals | [bounded measurable goals or unchanged baseline] |
| Security/privacy | [actors, data classification, abuse and confidentiality constraints] |
| Scale/scope | [expected records, page limits, payload limits, concurrency, environments] |
| Unknowns | [None after research, or list each NEEDS CLARIFICATION item] |

## 3. Change Classification and Blast Radius

| Dimension | Yes/No | Affected contract or risk |
|---|---:|---|
| User-visible behavior | [ ] | [flow/routes/copy] |
| GraphQL schema | [ ] | [operations/types/compatibility] |
| Authorization or privacy | [ ] | [roles/ownership/scope/masking] |
| EF model or migration | [ ] | [entities/constraints/backfill] |
| Apollo cache or session | [ ] | [keys/merge/logout/realtime] |
| Files or untrusted input | [ ] | [limits/content/delivery] |
| Background or concurrent work | [ ] | [idempotency/lease/retry] |
| External provider/configuration | [ ] | [adapter/fallback/fail-closed] |
| Deployment or operations | [ ] | [Docker/health/logging/rollback] |
| Canonical documentation | [ ] | [scope/architecture/runbook/audit/memory] |

**Affected users/roles:** [Visitante, Estudiante, Profesor, Egresado, Empleador,
Moderador, Administrador].  
**Explicitly out of scope:** [items that must not be implemented].

## 4. Baseline and Inputs

- **Current behavior:** [what code/runtime does before the change].
- **Reproduction or evidence:** [test, log, query, browser path, audit finding].
- **Reusable components/services:** [existing ownership boundaries to preserve].
- **Compatibility constraints:** [current clients/data/routes that must keep working].
- **Candidate baseline checks:** [finite commands/checks required before implementation].

Do not rely on a historical task checkbox as baseline evidence. If the current worktree is
already failing in the affected scope, record whether the failure blocks this feature.

## 5. Constitution Check

*Gate before research/design and again after design. A violation blocks planning unless it
is documented under Complexity and Exceptions with explicit approval.*

| Principle | Pre-design | Post-design | Plan evidence / decision |
|---|---|---|---|
| I. Contract-first boundaries and service ownership | [PASS/BLOCKED] | [PASS/BLOCKED] | [GraphQL/REST/service boundary] |
| II. Identity, authorization, and privacy | [PASS/BLOCKED] | [PASS/BLOCKED] | [declarative + contextual controls] |
| III. Input, abuse, and file security | [PASS/BLOCKED] | [PASS/BLOCKED] | [bounds/rate/file controls] |
| IV. Relational integrity and data lifecycle | [PASS/BLOCKED] | [PASS/BLOCKED] | [FKs/Restrict/constraints/transactions] |
| V. Session and realtime identity isolation | [PASS/BLOCKED] | [PASS/BLOCKED] | [Apollo/WS/account boundary] |
| VI. Bounded performance and resilience | [PASS/BLOCKED] | [PASS/BLOCKED] | [async/cancellation/N+1/retry] |
| VII. Evidence and release truth | [PASS/BLOCKED] | [PASS/BLOCKED] | [tests/runtime/blocked checks] |
| VIII. External adapters and environment safety | [PASS/BLOCKED] | [PASS/BLOCKED] | [configuration/fallback/fail-closed] |

**Constitution result:** [PASS | BLOCKED].  
**Known project gap touched:** [None or GAP-* identifier and containment strategy].

## 6. Architecture and Ownership

### 6.1 Current flow

[Describe the existing request/event/data path and ownership boundaries.]

### 6.2 Proposed flow

[Describe the proposed path in numbered steps. Identify transaction boundaries, external
side effects, cache changes, and failure handling.]

### 6.3 Component responsibilities

| Component/service | Responsibility | Must not own |
|---|---|---|
| [component] | [single responsibility] | [logic kept elsewhere] |

### 6.4 Authorization matrix

Complete when authentication, authorization, visibility, or role-specific UI is affected.
Otherwise write `Not affected` with one-line justification.

| Operation/data | Anonymous | Allowed roles | Ownership/scope rule | Denial behavior |
|---|---:|---|---|---|
| [operation] | [Yes/No] | [roles] | [actor/resource relation] | [controlled error/masking] |

Identity MUST come from validated claims. Client-provided actor IDs are never authority.

## 7. Data and EF Core Design

Complete when persistence changes; otherwise state `No model or data change`.

### 7.1 Model

| Entity/change | Fields/invariants | Explicit FKs and navigation | Lifecycle |
|---|---|---|---|
| [entity] | [required/limits/defaults] | [FKs, Restrict] | [active/soft delete/state transitions] |

### 7.2 Database enforcement

- **Unique/check/XOR constraints:** [details].
- **Indexes and query shape:** [columns, selectivity, ordering].
- **Concurrency:** [rowversion, isolation, lease, idempotency key, or N/A].
- **UTC/time behavior:** [creation, expiration, display conversion].

### 7.3 Migration and existing data

- **Migration name:** `[Name or none]`.
- **Forward operations:** [schema/default/backfill/index/FK order].
- **Existing-data safety:** [nullability, duplicates, backfill validation].
- **Down/rollback:** [safe reversal or explicit abort condition].
- **Seed impact:** [none/idempotent update/demo reset implications].
- **Drift gate:** `dotnet ef migrations has-pending-model-changes` after build/migration.

### 7.4 Transaction and side-effect boundary

[Define which writes commit atomically. External email/storage/PubSub work must occur at a
safe point; use Outbox or compensation when loss/duplication is material.]

## 8. GraphQL and Backend Contract

Complete when backend contracts change; otherwise state `Not affected`.

| Operation/type | Signature/result | Authorization | Service owner | Errors | Paging/performance |
|---|---|---|---|---|---|
| [query/mutation/subscription] | [contract] | [attribute + contextual] | [service] | [stable codes/messages] | [paging/projection/DataLoader] |

- **Compatibility:** [additive/breaking and client migration].
- **Cancellation:** [propagation through resolver/service/EF/network].
- **Validation:** [normalization, bounds, anti-enumeration, rate limit].
- **Error mapping:** [domain -> controlled GraphQL; no internals/PII].
- **Realtime:** [authenticated topic, deduplication, reconnect, or N/A].

Place detailed operation examples and payloads in `contracts/`; do not duplicate the full
schema here.

## 9. Frontend and Apollo Design

Complete when frontend behavior changes; otherwise state `Not affected`.

| Concern | Decision |
|---|---|
| Route/layout | [public/private route and guard] |
| Data source | [query/mutation/subscription and variables] |
| Cache | [type policy, keyArgs, merge, cache.modify, refetch rationale] |
| Optimistic state | [response/rollback/deduplication or N/A] |
| Session boundary | [identity epoch/logout/account replacement impact] |
| UI states | [loading, empty, error, success, disabled/retry] |
| Effects | [dependencies, cleanup, cancellation, event listeners] |
| Accessibility | [labels, focus, keyboard, reduced motion, announcements] |
| Responsive/theme/print | [Clean Tech, Tech Noir, breakpoints, print isolation] |

Client-side checks mirror backend policy but never replace it. Avoid hard reloads and
unbounded refetch loops.

## 10. Security and Privacy Review

| Threat or misuse | Preventive control | Negative test | Residual risk |
|---|---|---|---|
| [enumeration/IDOR/injection/abuse/file/session leak/etc.] | [control] | [test] | [remaining risk] |

Address where applicable:

- authentication, role, ownership, career/subject/participant scope;
- sensitive field minimization and server-side masking;
- input lengths, regex timeout, rate/depth/cost/page limits;
- upload content validation and authorized delivery;
- secrets/configuration/log sanitization;
- audit event without unnecessary PII;
- CSRF/XSS/URL/CORS/CSP implications;
- privileged, inactive, muted, blocked, or soft-deleted actors/resources.

## 11. Performance, Concurrency, and Resilience

- **EF query strategy:** [AsNoTracking, projection, split query, DataLoader, indexes].
- **Bounded result/payload:** [page/count/size/time limits].
- **Async/cancellation:** [all I/O paths].
- **Concurrency/idempotency:** [duplicate request/event behavior].
- **Retry/timeout:** [finite policy and side-effect safety].
- **Background work:** [lease/cancellation/health/cleanup or N/A].
- **Frontend lifecycle:** [subscription/effect cleanup and stale response protection].
- **Observability:** [structured event, correlation ID, metrics/health impact].

## 12. External Integrations and Configuration

Complete for provider or infrastructure changes; otherwise state `Not affected`.

| Environment | Adapter/config | Missing or invalid config | Verification |
|---|---|---|---|
| Development/Test | [local/mock/container] | [explicit fallback/failure] | [finite test/smoke] |
| Production | [real provider] | [fail-closed behavior] | [external acceptance gate] |

List configuration keys by name only. Never place secret values in plan, evidence, logs,
screenshots, or tracked examples.

## 13. Test and Evidence Plan

| Layer/gate | Cases | Command or method | Evidence status expected |
|---|---|---|---|
| Baseline | [affected existing behavior] | [finite command] | [PASS/BLOCKED] |
| Unit | [business rules/edge cases] | [test filter] | [PASS] |
| Integration | [EF/GraphQL/provider adapter] | [test/smoke] | [PASS/BLOCKED] |
| Authorization | [allowed and denied roles/ownership] | [executor/runtime] | [PASS] |
| Frontend | [loading/error/success/cache] | [Vitest] | [PASS] |
| Build/drift | [backend/frontend/EF] | [commands] | [PASS] |
| Runtime/browser | [primary flow and console] | [bounded procedure] | [V or BLOCKED] |
| Cleanup | [server/container/files/data] | [targeted stop/cleanup] | [PASS] |

Required baseline commands when their layer is affected:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

From `FrontEnd/OneItb-FE`:

```powershell
npm.cmd run test -- --run
npm.cmd run build
```

Do not use an unbounded `dotnet run` or `npm run dev` as evidence. Temporary runtime must
record PID/log, readiness, smoke, targeted shutdown, and cleanup. Unavailable providers or
manual browser checks remain `BLOCKED`/unverified.

## 14. Documentation Propagation

Mark each owner as `Update`, `Review compatible`, or `Not affected`:

| Document | Action and reason |
|---|---|
| `docs/project_docs/ROADMAP.md` | [status only from evidence] |
| `docs/audit/DEVELOPMENT_LOG.md` | [one newest entry at completion] |
| `docs/audit/DOCUMENTATION_STATUS.md` | [canonical status/inventory change] |
| `docs/project_docs/scope-and-requirements.md` | [product contract change] |
| `docs/project_docs/architecture-and-design.md` | [architecture/decision change] |
| `docs/audit/RUNBOOK_DEV.md` | [operation/configuration change] |
| `docs/audit/FINAL_AUDIT_REPORT.md` | [risk/remediation/release change] |
| `docs/academic/*` and final memory | [academic narrative/diagram impact] |
| `core-web/*` | [regenerate derived AI context after canonical change] |

## 15. Project Structure and Planned Touchpoints

Use real repository paths. Remove unaffected groups.

```text
API Graphql/
|-- Entities/                 domain entities
|-- Data/                     DbContext, migrations, seed
|-- Services/                 domain/application services
|-- OneITB/                   host, GraphQL, controllers, adapters, workers
`-- Tests/Services.Tests/     backend and integration tests

FrontEnd/OneItb-FE/
|-- src/Components/           React UI
|-- src/context/              application/session/theme state
|-- src/data/graphql/         Apollo contracts and provider
|-- src/hooks/                shared behavior
|-- src/utils/                pure helpers
`-- src/**/*.test.*           frontend tests
```

| Path | Planned change | Owner/reason |
|---|---|---|
| `[exact/path]` | [create/modify/delete] | [responsibility] |

## 16. Planning Artifacts

- `research.md`: decisions, rationale, alternatives, and resolved unknowns.
- `data-model.md`: entities, validation, relationships, states, migration and queries;
  omit only when persistence is not affected.
- `contracts/`: GraphQL/input/output/UI/integration contracts when an interface changes.
- `quickstart.md`: bounded verification procedure with prerequisites and cleanup.
- `tasks.md`: generated after this plan; dependency ordered and independently testable.

## 17. Implementation Order

1. [Baseline and regression tests.]
2. [Foundational model/configuration changes.]
3. [Service and backend contract changes.]
4. [Frontend/cache/UI changes.]
5. [Integration, migration and bounded runtime validation.]
6. [Evidence, documentation reconciliation and final Analyze.]

State which phases can run in parallel and why. Work touching the same file, contract, or
uncommitted dependency remains sequential.

## 18. Risks, Rollback, and Complexity Tracking

| Risk | Likelihood/impact | Mitigation | Detection/rollback |
|---|---|---|---|
| [risk] | [L/M/H] | [control] | [signal and recovery] |

### Constitutional exceptions

Fill only when a principle cannot pass. An undocumented exception is invalid.

| Principle/violation | Why required | Simpler alternative rejected | Owner | Compensating control | Review/expiry |
|---|---|---|---|---|---|
| [none or detail] | | | | | |

## Plan Definition of Done

- [ ] All `NEEDS CLARIFICATION` items are resolved or planning is explicitly blocked.
- [ ] Blast radius and affected roles are complete.
- [ ] Constitution Check passes before and after design, or exceptions are approved.
- [ ] Authorization and privacy rules exist for every affected operation/data set.
- [ ] Migration, existing-data safety, transaction and rollback are designed when needed.
- [ ] GraphQL and Apollo compatibility/cache behavior are designed when needed.
- [ ] Input, files, performance, concurrency and external-provider behavior are bounded.
- [ ] Positive, negative, runtime, cleanup and blocked evidence are planned.
- [ ] Exact repository touchpoints and documentation propagation are listed.
- [ ] Research, data model, contracts and quickstart are generated or explicitly unnecessary.
- [ ] No implementation, migration application, server, commit, or push is claimed by this plan.
