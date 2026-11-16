# Implementation Plan: QA Session 4 - Feed Hierarchy and Media Grid

**Branch**: `182-qa-session4-feed-hierarchy-and-media-grid` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/182-qa-session4-feed-hierarchy-and-media-grid/spec.md`

## Summary

Bound feed and comment media with a reusable responsive mosaic, lazy local PDF.js first-page thumbnails, and an accessible all-media gallery. Persist directed-reply identity while retaining the two-level hierarchy, emit precise comment deep links, make unread widget state independent of its open state, and normalize the existing `UserInteraction` model into explicit idempotent follow/unfollow contracts without adding per-post queries.

## Technical Context

**Language/Version**: C# 12 / .NET 8; JavaScript/TypeScript with React 18; Node 20.19+ or 22.13+

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind CSS 4, `pdfjs-dist` 5.6.205 loaded lazily

**Storage**: SQL Server 2022 Docker; existing local/Cloudinary binary storage

**Testing**: xUnit service tests; Vitest and Testing Library; EF migration/drift checks; GraphQL schema/runtime smoke; browser workflow smoke

**Target Platform**: ASP.NET Core host and evergreen desktop/mobile browsers

**Project Type**: Full-stack web application with GraphQL and authenticated upload exception

**Performance Goals**: Initial feed execution excludes PDF.js; one first-page render per visible PDF cover; at most four post tiles/three comment tiles; one followed-ID query per screen; no N+1 follow checks

**Constraints**: Preserve strict framing headers, career scoping, soft delete, two comment levels, 10 files/15 MB, `DeleteBehavior.Restrict`, controlled GraphQL errors, and existing Apollo pagination semantics

**Scale/Scope**: Feed pages up to 25 posts, 10 attachments per social item, bounded demo/production social graph

## Constitution Check

- **Decoupled contracts**: PASS. Binary transfer is unchanged; new business operations remain GraphQL/service based.
- **Security**: PASS. Directed targets are derived from persisted comments; blocked users cannot be followed; no framing/header relaxation.
- **Input validation**: PASS. Mention targets, IDs, hierarchy, active state and PDF fallbacks are bounded.
- **Relational integrity**: PASS. Nullable reply-target FK and social unique index are explicit and restrictive.
- **Session/token**: PASS. Existing JWT/Apollo links are reused; anonymous follow operations remain impossible.
- **Evidence-based completion**: PASS. Migration, tests, schema operations and browser behavior have explicit gates.

Post-design re-check: PASS. No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/182-qa-session4-feed-hierarchy-and-media-grid/
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
|-- Entities/Models/Comment.cs
|-- Data/OneItbContext.cs, Migrations/
|-- Services/Social/, Services/Notifications/
|-- OneITB/GraphQL/Query.cs, Mutation.cs
`-- Tests/Services.Tests/

FrontEnd/OneItb-FE/src/
|-- Components/publication/
|-- Components/profile/
|-- Components/chat/
|-- Components/notifications/
`-- data/graphql/
```

**Structure Decision**: Extend the existing backend service boundaries and publication/profile component tree. Add one focused social-graph service and reusable media/follow components; do not create a parallel follower entity or media subsystem.

## Complexity Tracking

No constitutional violations require justification.
