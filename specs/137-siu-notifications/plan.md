# Implementation Plan: SIU Sync and Notifications

**Branch**: `137-siu-notifications` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/137-siu-notifications/spec.md`

## Summary

Close OneITB23 P2 academic scope by adding a decoupled SIU Guarani adapter boundary, an administrator-only subject grade synchronization workflow, persistent academic notifications, user notification preferences and live per-user delivery through the existing GraphQL WebSocket subscription infrastructure.

The implementation extends the verified academic module without changing the existing `AcademicProgress` source of truth. SIU data is consumed through an anti-corruption service that returns simulated institutional records, which are resolved to local students and upserted into `AcademicProgress`. Notifications are stored in SQL Server and emitted to private user topics using the same in-memory subscription transport already used by private messaging.

## Technical Context

**Language/Version**: .NET 8, C#; React 18; JavaScript; GraphQL.

**Primary Dependencies**: ASP.NET Core, HotChocolate 14.2.0, EF Core 8.0.6, SQL Server, Apollo Client 3.7, `graphql-ws`, Tailwind CSS 4.

**Storage**: SQL Server 2022 Docker local for validation; Azure SQL Free Tier remains the deployment target.

**Testing**: Release backend build, Vite frontend build, EF migration gates, authenticated GraphQL runtime checks, WebSocket subscription runtime check where possible.

**Target Platform**: ASP.NET Core backend and browser frontend.

**Project Type**: Full-stack web application.

**Performance Goals**: Synchronize a subject in one admin action after subject selection; load notification menu without blocking page navigation; avoid N+1 when resolving notifications, preferences and sync targets.

**Constraints**:
- Business operations remain on `/graphql`; no new REST business endpoint.
- Binary upload exception remains limited to `/api/upload`.
- All new FKs use `DeleteBehavior.Restrict`.
- No secrets or external SIU credentials are introduced.
- Production SIU integration is out of scope; mock adapter must be replaceable.
- In-memory pub/sub is acceptable for local/single-instance runtime and remains documented as a P3 limitation.

**Scale/Scope**: Subject-level sync over local seeded users and careers; notification fan-out to users associated with the subject career. No email, push, mobile notification provider or distributed pub/sub in this feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Decoupled Application Contracts | All business actions use GraphQL; SIU adapter is service-layer only. | PASS |
| II. Strict Security and Password Hashing | Admin-only sync enforced backend-side; notification mutations use authenticated user identity. | PASS |
| III. Input Validation and ReDoS Protection | Subject IDs, URLs and preference inputs are bounded and validated; no untrusted regex planned. | PASS |
| IV. Relational Integrity and Soft Delete | Notification and preference FKs are explicit and restrictive. | PASS |
| V. Secure Session and Token Management | HTTP and WebSocket operations reuse JWT pipeline and private user topics. | PASS |
| VI. Evidence-Based Completion | Runtime GraphQL, migration and build checks are required before roadmap update. | PASS |

Required planning references:
- `docs/project_docs/ROADMAP.md`: P2 lists SIU adapter and notification preferences as remaining academic scope.
- `docs/project_docs/scope-and-requirements.md`: canonical replacement for removed `REQUERIMIENTOS.md`; RF-021/RF-022 cover SIU and notification preferences.
- `docs/project_docs/architecture-and-design.md`: confirms current subscriptions are in-memory and P3 will replace pub/sub with distributed transport.
- `docs/audit/RUNBOOK_DEV.md`: defines Docker SQL, EF and GraphQL validation gates.
- `docs/project_docs/PLAN_DE_MITIGACION_EVALUACION.md`: no longer exists after documentation normalization; no conflicting mitigation document is present.

## Project Structure

### Documentation (this feature)

```text
specs/137-siu-notifications/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   `-- graphql-siu-notifications.md
|-- quickstart.md
|-- evidence.md
`-- tasks.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/                 # Notification and preference entities
|-- Data/OneItbContext.cs            # DbSets and explicit EF mapping
|-- Services/Academic/               # Academic sync extension points
|-- Services/Notifications/          # Notification persistence/fan-out/preferences
`-- OneITB/GraphQL/                  # Query, Mutation and Subscription resolvers

FrontEnd/OneItb-FE/src/
|-- Components/academic/             # SIU sync button/result in AcademicDashboard
|-- Components/notifications/        # Global notification bell
|-- Components/layout/private/       # Nav integration
`-- data/graphql/                    # Apollo operations
```

**Structure Decision**: Keep SIU integration and notifications in service-layer folders under `API Graphql/Services`, expose only GraphQL contracts, and keep frontend UI domain-specific (`academic`) plus a global notification component for navigation.

## Phase 0 Research

Completed in [research.md](./research.md).

## Phase 1 Design and Contracts

Completed:
- [data-model.md](./data-model.md)
- [contracts/graphql-siu-notifications.md](./contracts/graphql-siu-notifications.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

| Principle | Result | Notes |
|---|---|---|
| Decoupled Application Contracts | PASS | No new REST business endpoints. |
| Security | PASS | Sync is admin-only; subscriptions resolve current user from JWT. |
| Validation | PASS | Service layer validates subject, local users, preference type and message bounds. |
| Integrity | PASS | New relationships are explicit and restrictive. |
| Session | PASS | Existing Apollo JWT and `graphql-ws` connection params are reused. |
| Evidence | PASS | Tasks require migration, runtime and builds before docs status changes. |

## Complexity Tracking

No constitution violations.
