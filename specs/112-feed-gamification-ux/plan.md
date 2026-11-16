# Implementation Plan: Feed Gamification UX

**Branch**: `112-feed-gamification-ux` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/112-feed-gamification-ux/spec.md`

## Summary

Implement the second slice after moderation safety: improve the feed and admin review UX using existing GraphQL data. Add profile links, inline follow, activity badges, subtle administrator hierarchy, modal previews in admin content tabs, and contextual search behavior without changing database schema.

## Technical Context

**Language/Version**: React 18 frontend, .NET 8 backend

**Primary Dependencies**: Apollo Client, React Router, Tailwind v4, HotChocolate

**Storage**: No schema change expected

**Testing**: Vite build, .NET build, runtime browser/GraphQL smoke when local services are available

**Target Platform**: Local web application

**Project Type**: Full-stack web application with frontend-heavy changes

**Performance Goals**: Avoid extra network roundtrips beyond existing feed/admin queries.

**Constraints**: No external CSS, no commits/pushes, do not undo 110/111 dirty worktree.

**Scale/Scope**: UX-only social/gamification slice.

## Constitution Check

- I. Decoupled GraphQL Architecture: PASS. UI consumes existing GraphQL mutations/queries.
- II. Strict Security & Password Hashing: PASS. No credential handling.
- III. Input Validation & ReDoS Protection: PASS. No backend regex changes.
- IV. Relational Integrity Restrictions: PASS. No schema relationship changes.
- V. Secure Session & Token Management: PASS. Existing auth context reused.

## Project Structure

```text
specs/112-feed-gamification-ux/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- tasks.md

FrontEnd/OneItb-FE/src/
|-- Components/publication/
|-- Components/admin/
`-- data/graphql/
```

**Structure Decision**: Keep changes inside feed/comment/admin components and existing query files.

## Complexity Tracking

No constitution violations.
