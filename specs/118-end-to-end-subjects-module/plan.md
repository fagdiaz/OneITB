# Implementation Plan: End-to-End Subjects Module

**Branch**: `118-end-to-end-subjects-module` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

## Summary

Replace the obsolete subject-career many-to-many mapping with mandatory `Subject.CareerId`, add optional academic year, model directed prerequisites through an explicit `SubjectPrerequisite` join entity, update GraphQL create/update/query contracts, and complete the admin subject form/table.

## Technical Context

**Language/Version**: .NET 8, C#, React 18

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind v4

**Storage**: SQL Server

**Testing**: Release backend build, Vite production build, EF migration apply/list, GraphQL/runtime smoke when environment permits

**Target Platform**: Web application

**Project Type**: Full-stack web application

**Performance Goals**: Load subject career/prerequisite data without N+1 queries through projection.

**Constraints**: All new FKs use `DeleteBehavior.Restrict`; no shadow properties; no commit/push.

## Constitution Check

- Decoupled GraphQL Architecture: PASS. UI uses `/graphql` only.
- Security/Password Hashing: PASS. No credential changes.
- Input Validation: PASS. IDs and year bounds are validated server-side.
- Relational Integrity: PASS. Career and both prerequisite relationships use `Restrict`.
- Session/Token Management: PASS. Existing administrator authorization is retained.

## Project Structure

```text
API Graphql/Entities/Models/
|-- Subject.cs
`-- SubjectPrerequisite.cs

API Graphql/Data/
|-- OneItbContext.cs
|-- DbInitializer.cs
`-- Migrations/

API Graphql/OneITB/GraphQL/
|-- Query.cs
`-- Mutation.cs

FrontEnd/OneItb-FE/src/
|-- Components/admin/SubjectManagement.jsx
`-- data/graphql/{queries,mutations}/subjects.js
```

**Structure Decision**: Use explicit join entity `SubjectPrerequisite` for deterministic FK names, composite uniqueness, and restricted deletion on both directions.

## Migration Strategy

1. Add nullable `CareerId` and `Year` to `Subjects`.
2. Backfill `CareerId` from the lowest existing `SubjectCareers.CareerId` per subject.
3. Assign the first active career only to legacy subjects without a link; abort if no career exists.
4. Alter `CareerId` to non-null and add restricted FK/index.
5. Create `SubjectPrerequisites` with composite key and two restricted FKs.
6. Drop obsolete `SubjectCareers` table.

## Complexity Tracking

No constitution violations.
