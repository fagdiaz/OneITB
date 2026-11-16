# Implementation Plan: QA Session 3 - Media, Moderation and Notifications

**Branch**: `181-qa-session3-media-moderation` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/181-qa-session3-media-moderation/spec.md`

## Summary

Close the real QA gaps left after Specs 178-180 without duplicating existing chat badges, grouped social notifications, or attachment infrastructure. Persist cover preference and moderator-hidden state, enforce author-only edits and two-level comments, provide reversible reasoned moderation, replace cross-origin PDF framing with abortable object-URL viewing, add attachment editing and accessible media/feed controls, move notification preferences into a dialog, and add an idempotent unread-message reminder worker.

## Technical Context

**Language/Version**: C# 12 / .NET 8; JavaScript/JSX on React 18

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind CSS 4, native browser Fetch/Blob APIs

**Storage**: SQL Server 2022 Docker; existing local/Cloudinary upload storage

**Testing**: xUnit service tests; Vitest and Testing Library; GraphQL runtime smoke; browser workflow smoke

**Target Platform**: ASP.NET Core host and evergreen desktop/mobile browsers

**Project Type**: Full-stack web application with GraphQL and authenticated REST upload exception

**Performance Goals**: No additional feed query round-trips; at most 10 media items per card; reminder query grouped in SQL and bounded per cycle; no repeated notification write for unchanged unread data

**Constraints**: Preserve global `X-Frame-Options: DENY`; no physical deletion of social content; no new media library; explicit EF fields/defaults/indexes; `DeleteBehavior.Restrict`; controlled GraphQL errors; no third-party log suppression

**Scale/Scope**: Existing institutional demo and production baseline; feed pages up to 25 posts, 10 attachments per social item, 15 MB aggregate upload limit

## Constitution Check

- **Decoupled contracts**: PASS. Business changes stay in GraphQL/services; binary transport remains `/api/upload` and `/uploads`.
- **Security**: PASS. Author ownership is tightened; moderation is reasoned and audited; framing policy is not relaxed.
- **Input validation**: PASS. Existing attachment limits remain server-side; moderation reasons and nesting are bounded.
- **Relational integrity**: PASS. Two explicit booleans and indexes are added; social content remains soft-deleted; no new cascades or shadow properties.
- **Session/token**: PASS. Existing JWT and Apollo links are reused.
- **Evidence-based completion**: PASS. Tasks require tests, EF drift check, schema execution, and browser evidence; unverifiable external warnings remain documented.

Post-design re-check: PASS. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/181-qa-session3-media-moderation/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/graphql.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/                         domain fields
|-- Data/OneItbContext.cs                    filters, indexes, migration
|-- Services/Social/                         ownership, nesting, attachment edits
|-- Services/Moderation/                     reasoned visibility changes and audit
|-- Services/Notifications/                  idempotent reminder contract
|-- OneITB/GraphQL/Mutation.cs               GraphQL boundary
|-- OneITB/Infrastructure/                   hosted reminder worker
`-- Tests/Services.Tests/                    backend regression tests

FrontEnd/OneItb-FE/src/
|-- Components/publication/                  gallery, PDF, cover, edits, feed UX
|-- Components/notifications/                preferences dialog
|-- Components/layout/private/Nav.jsx        mobile unread badge
`-- data/graphql/                             operation contracts
```

**Structure Decision**: Extend existing social, moderation, notification, and publication modules. No parallel media system, REST business endpoint, or new state library is introduced.

## Complexity Tracking

No constitutional violations or additional architectural layers are required.
