# Implementation Plan: Full Profile & CV Schema Normalization

**Branch**: `145-profile-cv-schema-normalization` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/145-profile-cv-schema-normalization/spec.md`

## Summary

Normalize `/profile/edit` so that profile basics and extended CV data are loaded and saved through one backend contract. The MVP persists extended CV data as validated JSON on `User`, removes duplicated personal inputs from the builder, and centralizes save through `updateProfile`.

## Technical Context

**Language/Version**: .NET 8, React 18, TypeScript/JavaScript

**Primary Dependencies**: EF Core 8, HotChocolate 14.2, Apollo Client 3.7, Vite 8, Tailwind v4

**Storage**: SQL Server

**Testing**: `dotnet build`, `npm.cmd run build`, targeted static scans; runtime GraphQL/browser flow if environment is available

**Target Platform**: Web browser and local .NET backend

**Project Type**: Full-stack web application

**Performance Goals**: Single profile load/save round trip; CV payload bounded to prevent excessive profile documents

**Constraints**: Preserve authorization; no duplicate UI state; no LocalStorage persistence for CV; no business REST endpoint

**Scale/Scope**: MVP per-user CV document; future normalization into per-section tables remains possible

## Constitution Check

- Decoupled contracts: PASS. Business operation remains GraphQL.
- Security/passwords: PASS. No sensitive field exposure; update remains authorized.
- Input validation: PASS. CV JSON is size-limited and parsed before persistence.
- Relational integrity: PASS. Adds scalar profile document field only; no FK changes.
- Session/token: PASS. Existing JWT auth remains unchanged.
- Evidence completion: PASS if builds and migration generation are recorded; runtime gaps remain explicit.

## Project Structure

### Documentation

```text
specs/145-profile-cv-schema-normalization/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/profile-cv-graphql.md
├── quickstart.md
├── tasks.md
└── evidence.md
```

### Source Code

```text
API Graphql/
├── Entities/Models/User.cs
├── Data/OneItbContext.cs
├── Services/DTOs.cs
├── Services/Users/UsersService.cs
└── OneITB/
    ├── GraphQL/Query.cs
    ├── GraphQL/Mutation.cs
    └── Startup.cs

FrontEnd/OneItb-FE/src/
├── Components/profile/CvEditorProfile.tsx
├── data/graphql/queries/getUserProfile.js
├── data/graphql/mutations/updateProfile.js
└── types/resume.ts
```

**Structure Decision**: Use a validated `CvDataJson` field on `User` for MVP agility. This avoids premature tables for every CV section while keeping SQL persistence and a future migration path.

## Complexity Tracking

No constitution violations.
