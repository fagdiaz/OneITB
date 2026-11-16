# Implementation Plan: Moderation Roles Safety

**Branch**: `111-moderation-roles-safety` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/111-moderation-roles-safety/spec.md`

## Summary

Add a moderation safety slice on top of the existing social graph: support `Egresado` as a selectable role, persist `MutedUntil`, expose activity/report metrics, prevent destructive actions against administrator accounts, block silenced users from publishing/commenting, and surface the moderation state in the admin user panel.

## Technical Context

**Language/Version**: .NET 8 backend, React 18 frontend

**Primary Dependencies**: EF Core 8, HotChocolate 14, Apollo Client, Tailwind v4

**Storage**: SQL Server through EF Core migrations

**Testing**: `dotnet build`, `npm.cmd run build`, GraphQL/admin smoke where environment allows

**Target Platform**: Local web application

**Project Type**: Full-stack web application

**Performance Goals**: Keep admin metrics bounded and avoid changing public feed latency significantly.

**Constraints**: Preserve AD-004 `DeleteBehavior.Restrict`, avoid shadow properties, no commits or pushes.

**Scale/Scope**: One moderation slice; broader gamification UI remains for the next spec.

## Constitution Check

- I. Decoupled GraphQL Architecture: PASS. UI changes consume GraphQL only.
- II. Strict Security & Password Hashing: PASS. No password handling changes.
- III. Input Validation & ReDoS Protection: PASS. No regex changes introduced.
- IV. Relational Integrity Restrictions: PASS. Only a nullable scalar column is added.
- V. Secure Session & Token Management: PASS. Existing authorization context is reused.

## Project Structure

### Documentation (this feature)

```text
specs/111-moderation-roles-safety/
|-- spec.md
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
|-- Data/
|-- Entities/Models/
|-- OneITB/GraphQL/
`-- Services/

FrontEnd/OneItb-FE/src/
|-- Components/admin/
|-- data/graphql/
`-- Components/publication/
```

**Structure Decision**: Keep backend domain changes in existing models/services/resolvers and frontend changes inside the current admin/feed GraphQL modules.

## Complexity Tracking

No constitution violations.
