# Implementation Plan: Academic Module

**Branch**: `136-academic-module` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/136-academic-module/spec.md`

## Summary

Implement the P2 academic module by adding a dedicated academic repository for subject resources and a private academic progress/grades model. Backend changes introduce explicit EF Core entities, restricted relationships, service-layer authorization and HotChocolate queries/mutations. Frontend changes add Apollo operations and a private `/academic` experience with subject-scoped resources and progress views using Tailwind v4.

## Technical Context

**Language/Version**: .NET 8, C# 12; React 18 with JavaScript

**Primary Dependencies**: ASP.NET Core, HotChocolate 14.2.0, EF Core 8.0.6, Apollo Client 3.7, Vite 8, Tailwind CSS 4

**Storage**: SQL Server 2022 via Docker for local validation; uploaded files continue using authenticated `POST /api/upload` and persisted `/uploads/...` URLs

**Testing**: Release backend build, Vite production build, EF migration update/has-pending-model-changes, live GraphQL operations against Docker SQL

**Target Platform**: Authenticated web application and .NET backend

**Project Type**: Full-stack web application with separate backend and frontend

**Performance Goals**: Subject resource/progress queries remain bounded, projection-friendly and avoid N+1 by eager loading or projection over explicit relationships

**Constraints**: Business operations remain on `/graphql`; binary transfer remains the existing upload REST exception; all new FKs use `DeleteBehavior.Restrict`; secrets stay out of tracked files; Spanish only in user-facing UI

**Scale/Scope**: P2 subset: academic resources and local progress/grades only. SIU Guarani adapter, notifications, versioning and automated test suites stay pending.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| Decoupled Application Contracts | Business operations must use GraphQL; upload REST remains the only binary exception. | PASS |
| Strict Security and Password Hashing | No password or sensitive field exposure; protected operations validate JWT/role server-side. | PASS |
| Input Validation and ReDoS Protection | Titles, URLs, scores, statuses and descriptions must be bounded and validated. | PASS |
| Relational Integrity and Soft Delete | Academic FKs must be explicit and restrictive; resources use logical deactivation. | PASS |
| Secure Session and Token Management | Apollo JWT flow reused; no frontend-only authorization. | PASS |
| Evidence-Based Completion | Runtime GraphQL and migration validation required before marking roadmap items complete. | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/136-academic-module/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/
|   `-- graphql-academic.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/AcademicResource.cs
|-- Entities/Models/AcademicProgress.cs
|-- Entities/Models/AcademicProgressStatus.cs
|-- Data/OneItbContext.cs
|-- Data/Migrations/
|-- Services/Academic/
`-- OneITB/GraphQL/{Query.cs,Mutation.cs}

FrontEnd/OneItb-FE/src/
|-- Components/academic/AcademicDashboard.jsx
|-- Components/layout/private/{Nav.jsx,SideBar.jsx}
`-- data/graphql/{queries,mutations}/academic.js
```

**Structure Decision**: Follow existing domain split: EF entities in `Entities`, DbContext/migrations in `Data`, business rules in `Services`, GraphQL entry points in `OneITB`, Apollo operations under `data/graphql`, and UI components by domain under `Components/academic`.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [contracts/graphql-academic.md](./contracts/graphql-academic.md), and [quickstart.md](./quickstart.md).

## Constitution Check Post-Design

| Principle | Design Result | Status |
|---|---|---|
| Decoupled Application Contracts | Queries/mutations only; file uploads reuse existing REST endpoint. | PASS |
| Strict Security and Password Hashing | Academic progress read/write paths check identity and role in backend services. | PASS |
| Input Validation and ReDoS Protection | Resource fields, URL prefixes, links, score range and status enum are validated before persistence. | PASS |
| Relational Integrity and Soft Delete | AcademicResource and AcademicProgress have explicit FKs and restrictive delete behavior; resources have `IsActive`. | PASS |
| Secure Session and Token Management | Frontend operations depend on existing Apollo auth header injection. | PASS |
| Evidence-Based Completion | Tasks require migration, builds, live GraphQL and frontend build evidence. | PASS |

## Complexity Tracking

No constitution violations require justification.
