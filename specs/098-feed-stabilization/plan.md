# Implementation Plan: Expose Inquiry Author

**Branch**: `049-estabilizacion` | **Date**: 2026-06-13
**Spec**: `specs/098-feed-stabilization/spec.md`

## Summary

Add the missing `Inquiry.User` navigation, map it explicitly with
`DeleteBehavior.Restrict`, and rely on HotChocolate EF projections to select the
author in the same database query. Generate a migration only if EF reports a
physical model change.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: HotChocolate 14.2.0, Entity Framework Core 8.0.6

**Storage**: SQL Server

**Testing**: Release build, EF pending-model check, GraphQL introspection and
operation execution

**Target Platform**: ASP.NET Core GraphQL API

**Project Type**: Web service backend

**Performance Goals**: Author selection must not cause N+1 database queries

**Constraints**: Backend only; no React changes; no seed changes; no commit or
push

**Scale/Scope**: `Inquiry` to `User` relationship and publication query only

## Constitution Check

- PASS: Communication remains GraphQL-only.
- PASS: Code and canonical GraphQL fields remain English.
- PASS: The relationship uses `DeleteBehavior.Restrict`.
- PASS: No sensitive user fields are exposed.
- PASS: Runtime schema validation is required before completion.
- PASS: No new direct REST endpoint or seed data is introduced.

## Research Decisions

- Use `Inquiry.User` as the required navigation matching the existing `UserId`.
- Keep `[UseProjection]` on `GetInquiries`; do not add `.Include(i => i.User)`
  because projection generates the required SQL shape from selected fields.
- Do not add a migration unless `dotnet ef migrations has-pending-model-changes`
  reports a real model difference.
- Keep `id`, `firstName`, and `lastName` as canonical user fields and expose
  temporary resolver aliases for `idUsuario`, `nombre`, and `apellidos` so the
  existing backend-only scope resolves the current feed request.

## Project Structure

```text
API Graphql/
├── Entities/Models/Inquiry.cs
├── Data/OneItbContext.cs
├── Data/Migrations/
├── OneITB/GraphQL/Query.cs
└── OneITB/Startup.cs

specs/098-feed-stabilization/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/inquiries.graphql
├── quickstart.md
└── tasks.md
```

## Complexity Tracking

No constitutional violation is required.
