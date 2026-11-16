# Implementation Plan: Privacy Controls and SMTP Smoke Tests

**Branch**: `175-privacy-controls-and-smoke-tests` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/175-privacy-controls-and-smoke-tests/spec.md`

## Summary

Close the remaining profile privacy roadmap item and add an admin-only SMTP smoke test. The backend remains the source of truth: profile privacy is persisted on `User`, GraphQL masks sensitive public DTO fields for unauthorized viewers, and admins can validate SMTP via the existing `IEmailSender` abstraction. The frontend adds a compact privacy switch in `/profile/edit` and a private-profile notice in `/profile`.

## Technical Context

**Language/Version**: .NET 8, React 18

**Primary Dependencies**: EF Core 8, HotChocolate 14, Apollo Client 3, Tailwind CSS 4

**Storage**: SQL Server via EF Core migrations

**Testing**: `dotnet build`, `dotnet test`, `npm.cmd run build`, EF pending model check, GraphQL smoke where runtime permits

**Target Platform**: Web browser and .NET API host

**Project Type**: Full-stack web application

**Performance Goals**: Profile queries should stay single-query/split-query without N+1; SMTP smoke is admin-only and manually triggered.

**Constraints**: No secret leakage, no terminology regression, no REST business endpoint, preserve existing public behavior by defaulting privacy to public.

**Scale/Scope**: Existing institutional demo and pre-production deployment.

## Constitution Check

- **Decoupled Application Contracts**: PASS. Business operation remains GraphQL; no new REST endpoint.
- **Strict Security and Password Hashing**: PASS. No password handling changes; backend enforces privacy.
- **Input Validation and ReDoS Protection**: PASS. SMTP email input is bounded and validated.
- **Relational Integrity and Soft Delete**: PASS. New scalar column on `Users`, no new FK.
- **Secure Session and Token Management**: PASS. Protected mutations/queries use `[Authorize]` roles.
- **Evidence-Based Completion**: PASS. Builds, migration checks and runtime attempts recorded.

## Project Structure

### Documentation

```text
specs/175-privacy-controls-and-smoke-tests/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/
|-- Entities/Models/User.cs
|-- Data/OneItbContext.cs
|-- Data/Migrations/
|-- OneITB/GraphQL/Query.cs
|-- OneITB/GraphQL/Mutation.cs
|-- OneITB/Services/Email/
`-- Services/Users/

FrontEnd/OneItb-FE/src/
|-- Components/profile/
`-- data/graphql/
```

**Structure Decision**: Use existing profile DTOs and email abstraction; avoid adding new screens.

## Complexity Tracking

No constitutional violations.
