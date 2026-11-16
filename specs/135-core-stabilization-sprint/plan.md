# Implementation Plan: Core Stabilization Sprint

**Branch**: `135-core-stabilization-sprint` | **Date**: 2026-06-24 | **Spec**: `specs/135-core-stabilization-sprint/spec.md`

**Input**: Feature specification from `specs/135-core-stabilization-sprint/spec.md`

## Summary

This sprint converts compile-only core features into runtime-verified functionality and closes the current P1 social-core roadmap items. The execution order is intentionally conservative: first validate existing subjects, superadmin security, upload, and rich-media workflows against the now-working local backend; then fix any observed contract/runtime issues; then implement feed pagination, orphan upload cleanup, and persistent moderation audit with backend and frontend integration where needed.

## Technical Context

**Language/Version**: .NET 8 backend, React 18 frontend, JavaScript/TypeScript mix in UI

**Primary Dependencies**: ASP.NET Core, HotChocolate GraphQL 14.2.0, Entity Framework Core 8.0.6, Apollo Client 3.7, Vite 8, Tailwind CSS 4

**Storage**: SQL Server/LocalDB for runtime validation; local `wwwroot/uploads` file storage for detached uploads

**Testing**: Runtime GraphQL/REST smoke tests, `dotnet build`, `npm.cmd run build`, EF migration validation, browser verification when UI changes are present

**Target Platform**: Local Windows development runtime matching `docs/audit/RUNBOOK_DEV.md`; web browser for frontend verification

**Project Type**: Full-stack web application with decoupled backend and frontend

**Performance Goals**: Feed must load bounded pages without N+1 growth; pagination must avoid duplicate/missing items across at least three page requests

**Constraints**:
- Business operations remain on `/graphql`; binary upload remains the only REST exception.
- No secrets in tracked files.
- Development SQL certificate trust remains scoped to Development.
- Social and moderation relationships use explicit FKs and `DeleteBehavior.Restrict`.
- `Inquiry` and `Comment` remain soft-delete entities.
- Roadmap `[V]` status requires runtime evidence, not compile success.

**Scale/Scope**: Local presentation-ready stability for core social workflows, not cloud/distributed storage or production observability.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Decoupled Application Contracts**: PASS. New business capabilities use GraphQL; upload cleanup uses existing file storage and no new business REST endpoint.
- **II. Strict Security and Password Hashing**: PASS. Superadmin validation must continue using backend password verification; no plaintext secrets added.
- **III. Input Validation and ReDoS Protection**: PASS. Upload cleanup and pagination inputs must be bounded; no new unbounded regex.
- **IV. Relational Integrity and Soft Delete**: PASS. Moderation audit uses explicit relationships with restrict behavior; no physical delete of social content.
- **V. Secure Session and Token Management**: PASS. Runtime validation and new admin audit queries remain authenticated/authorized.
- **VI. Evidence-Based Completion**: PASS. Tasks require live GraphQL/REST evidence before roadmap verification updates.

## Phase 0: Research

See `research.md`.

Key decisions:
- Use deterministic cursor-like feed pagination based on `(CreatedAt, Id)` ordering instead of raw offset for stability under concurrent inserts/deletes.
- Add a durable `ModerationAudit` entity and service layer helper so moderation mutations can record successful state changes consistently.
- Add a hosted cleanup service plus injectable cleanup component; service can run on startup/interval and component can be tested directly.
- Treat specs 118/119/121/122 as runtime validation gates before new features are marked verified.

## Phase 1: Design and Contracts

See:
- `data-model.md`
- `contracts/graphql.md`
- `contracts/runtime-validation.md`
- `quickstart.md`

## Project Structure

### Documentation (this feature)

```text
specs/135-core-stabilization-sprint/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   |-- graphql.md
|   `-- runtime-validation.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/              # New ModerationAudit entity
|-- Data/OneItbContext.cs          # DbSet and Fluent API mapping
|-- Data/Migrations/               # EF migration for audit/pagination indexes if needed
|-- Services/Social/               # Feed pagination and cleanup integration points
|-- Services/Moderation/           # Persistent moderation audit
|-- Services/Uploads/              # Orphan upload cleanup service/component
`-- OneITB/GraphQL/                # Query/mutation contracts

FrontEnd/OneItb-FE/src/
|-- data/graphql/queries/          # Paginated feed and audit query definitions
|-- data/graphql/mutations/        # Existing mutation compatibility updates
|-- Components/publication/Feed.jsx
`-- Components/admin/              # Audit visibility if admin panel changes are required
```

**Structure Decision**: Reuse existing service-first backend boundaries. Keep new cleanup logic out of GraphQL resolvers. Keep frontend changes inside existing Feed/Admin components and Apollo operation modules.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- GraphQL remains the business contract.
- Upload REST remains the only binary transfer exception.
- `ModerationAudit` will use explicit FKs and `DeleteBehavior.Restrict`.
- Cleanup deletes only unreferenced physical files, not social database entities.
- Evidence and roadmap updates are deferred until runtime checks complete.
