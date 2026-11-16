# Implementation Plan: Mega Refactor Core

**Branch**: `110-mega-refactor-core` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/110-mega-refactor-core/spec.md`

## Summary

Stabilize the chat render/cache boundary, add career enrollment and social graph foundations,
apply soft-delete to publications/comments, refactor the feed around career/subject/search and
social relevance, and separate public profile presentation from authenticated editing.

## Technical Context

**Language/Version**: .NET 8, C# 12-compatible project style, React 18, JavaScript, Vite 8

**Primary Dependencies**: Entity Framework Core 8, HotChocolate 14, Apollo Client 3.7,
Tailwind CSS v4, BCrypt.Net-Next already present

**Storage**: SQL Server through EF Core migrations

**Testing**: `dotnet build`, `dotnet ef`, `npm.cmd run build`, direct GraphQL runtime scripts,
and in-app browser validation for feed/chat/profile flows

**Target Platform**: Local web app with .NET backend and Vite frontend

**Project Type**: Full-stack web application

**Performance Goals**: Feed and chat interactions should remain interactive under the seeded
dataset; GraphQL list operations stay cursor/filtered where possible and avoid client-side
N+1 behavior

**Constraints**: AD-004 requires `DeleteBehavior.Restrict`; no physical delete for content;
all code identifiers and GraphQL fields in English; Spanish only in visible UI text; no git
commit or push

**Scale/Scope**: One local SQL Server database, one GraphQL backend instance, one React frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Decoupled GraphQL Architecture: Pass. All standard operations remain behind `/graphql`.
- Strict Security & Password Hashing: Pass. No new password persistence is introduced.
- Input Validation & ReDoS Protection: Pass with explicit task for bounded search validation.
- Relational Integrity Restrictions: Pass with explicit `DeleteBehavior.Restrict` on every new FK.
- Secure Session & Token Management: Pass. New operations derive user identity from JWT.
- Evidence-Based Completion: Pass. Tasks require build, migration, GraphQL, persistence, cache,
  and browser evidence before completion.

## Project Structure

### Documentation

```text
specs/110-mega-refactor-core/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── graphql.md
├── quickstart.md
├── tasks.md
└── evidence.md
```

### Source Code

```text
API Graphql/
├── Entities/Models/
├── Data/
├── Services/
└── OneITB/GraphQL/

FrontEnd/OneItb-FE/src/
├── Components/chat/
├── Components/publication/
├── Components/profile/
├── Components/layout/private/
├── data/graphql/
└── router/
```

**Structure Decision**: Add domain entities in `Entities`, EF mapping/seeding in `Data`,
business rules in `Services`, thin GraphQL resolvers in `OneITB/GraphQL`, and React UI in
feature-oriented component folders using existing Apollo/Tailwind patterns.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Large multi-story spec | User explicitly requested a structural full-stack update | Splitting would delay cross-cutting schema/feed/profile consistency, but tasks remain independently testable |
