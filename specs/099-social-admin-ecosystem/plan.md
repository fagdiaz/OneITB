# Implementation Plan: Social and Administration Ecosystem

**Branch**: `099-social-admin-ecosystem` | **Date**: 2026-06-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/099-social-admin-ecosystem/spec.md`

## Summary

Extend the academic feed with authenticated comments, nested replies, unique reactions and inquiry reports; initialize deterministic demonstration data; and consolidate user, subject and moderation views into a tabbed administration dashboard. The backend uses explicit EF Core relationships with restricted deletion, service-backed HotChocolate resolvers, JWT-derived actor identity and projection-based reads before React integration.

## Technical Context

**Language/Version**: C# 12 / .NET 8; JavaScript / React 18

**Primary Dependencies**: HotChocolate 14.2, EF Core 8.0.6, SQL Server, BCrypt.Net-Next 4.2, Apollo Client 3.7, Tailwind CSS 4.3, Vite 8

**Storage**: SQL Server through EF Core Code First migrations

**Testing**: `dotnet build`, EF migration checks, GraphQL runtime operations, `npm run build`, authenticated browser smoke flows

**Target Platform**: ASP.NET Core backend and modern desktop/mobile web browsers

**Project Type**: Full-stack web application with separate backend and frontend projects

**Performance Goals**: Load the seeded feed and social graph through bounded projected queries without per-row resolver database access

**Constraints**: Explicit foreign keys, `DeleteBehavior.Restrict`, no shadow properties, JWT-derived actor identity, deterministic/idempotent local seed, Tailwind v4, stable React hook order

**Scale/Scope**: Development dataset of 10 users, 5+ subjects, 30 publications and representative interactions; production-compatible schema and operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **GraphQL boundary**: PASS. All frontend communication remains under `/graphql`.
- **Service delegation**: PASS by design. New mutation and moderation logic belongs to scoped services.
- **Password hashing**: PASS. Seed passwords use BCrypt and the existing `char(60)` mapping.
- **Input validation**: PASS by design. Content and reason lengths are validated before persistence.
- **Relational integrity**: PASS by design. Every social FK is explicit and uses `DeleteBehavior.Restrict`.
- **Session security**: PASS after enabling JWT lifetime validation and retaining authentication before authorization.
- **CORS**: PASS after replacing wildcard origins with configured local frontend origins.
- **Runtime evidence**: REQUIRED. Build-only completion is prohibited.

Post-design re-check: PASS. No constitutional exceptions are required by the data model or contracts.

## Project Structure

### Documentation (this feature)

```text
specs/099-social-admin-ecosystem/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/
|-- Data/
|   |-- Migrations/
|   `-- OneItbContext.cs
|-- Services/
|   |-- Social/
|   `-- Moderation/
`-- OneITB/
    |-- GraphQL/
    `-- Startup.cs

FrontEnd/OneItb-FE/src/
|-- Components/
|   |-- publication/
|   |-- moderation/
|   `-- admin/
|-- data/graphql/
|   |-- mutations/
|   `-- queries/
`-- router/
```

**Structure Decision**: Extend the existing layered backend and feature-oriented frontend directories. Do not introduce another project or direct context access from new resolvers.

## Complexity Tracking

No constitutional exceptions are required.

