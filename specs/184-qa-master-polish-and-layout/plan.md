# Implementation Plan: QA Master Polish and Layout

**Branch**: `184-qa-master-polish-and-layout` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

## Summary

Refine the shared header/footer, responsive composer, media mosaic, dark surfaces and notification UI. Extend existing directed-reply identity into safe mention links, enrich job notification URLs with stable offer IDs and implement one-shot card focus. Use React/Tailwind/browser APIs only and preserve existing EF schema.

## Technical Context

**Language/Version**: React 18 JavaScript/TypeScript; C# 12 / .NET 8

**Primary Dependencies**: Tailwind CSS 4, Apollo Client 3.7, React Router 6, HotChocolate 14, EF Core 8; no additions

**Storage**: Existing SQL Server entities; static `Background.png`; no migration

**Testing**: Vitest/Testing Library, xUnit, Vite build, .NET Release build, GraphQL/runtime smoke where available

**Target Platform**: Evergreen desktop/mobile browser and ASP.NET Core host

**Performance Goals**: Scroll listener RAF-throttled; no pointer React rerenders; media capped at five visible desktop tiles; one-shot deep-link focus

**Constraints**: Preserve auth/session boundaries, two-level comments, career scoping, grouped notifications, strict user identity and dirty Specs 181-183 changes

## Constitution Check

- **Contracts**: PASS. Business changes remain GraphQL/service-backed; no REST expansion.
- **Security**: PASS. Mentions use persisted IDs and job URLs use server-owned IDs.
- **Input validation**: PASS. No regex-based backend identity lookup is introduced.
- **Relational integrity**: PASS. Existing restrictive `ReplyToUserId` relation is reused; no schema change.
- **Session**: PASS. Anonymous/authenticated header behavior remains explicitly separated.
- **Evidence**: PASS. Backend/frontend tests/builds and runtime evidence are tasks.

Post-design re-check: PASS.

## Project Structure

```text
FrontEnd/OneItb-FE/src/
|-- Components/layout/{Footer,private/Header,private/Nav}.jsx
|-- Components/publication/{Feed,MediaGrid,MediaAttachment,MediaViewerModal,MentionText}.jsx
|-- Components/notifications/NotificationPreferencesModal.jsx
|-- Components/jobs/JobBoard.jsx
|-- assets/Background.png
`-- index.css

API Graphql/
|-- Services/Social/SocialService.cs
`-- OneITB/GraphQL/Mutation.cs
```

**Structure Decision**: Reuse the current feature boundaries and extract only the mention formatter as a reusable social-text primitive.

