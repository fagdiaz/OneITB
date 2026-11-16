# Implementation Plan: Media and Notification Polish

**Branch**: `185-media-notification-polish` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

## Summary

Refine the existing PDF/YouTube/media grid pipeline, add a bounded two-YouTube contract in React and `SocialService`, improve dark-theme legibility/transition/texture, portal notification preferences outside the transformed Header and prove unread badge semantics with backend/frontend regression tests. Reuse PDF.js, Apollo and current entities; add no dependency or migration.

## Technical Context

**Language/Version**: React 18 JavaScript; C# 12 / .NET 8

**Primary Dependencies**: Tailwind CSS 4, Apollo Client 3.7, React Router 6, HotChocolate 14, EF Core 8, pdfjs-dist 5.6; no additions

**Storage**: Existing `Inquiry.Content`, `Notification.IsRead` and `Notification.AggregateCount`; no model change

**Testing**: Vitest/Testing Library, xUnit, Vite build, .NET Release build, EF drift and runtime GraphQL operations

**Performance Goals**: PDF lazy render preserved; orientation state only for primary item; no React state per pointer move; notification count remains one indexed SQL count

**Constraints**: Preserve `/graphql`, authenticated upload exception, anti-framing headers, grouped history, soft delete, no arbitrary URL embedding

## Constitution Check

- **Contracts**: PASS. Business validation stays in GraphQL service layer; no REST expansion.
- **Security/Input**: PASS. YouTube parsing is bounded and server-enforced; no CSP/X-Frame relaxation.
- **Data integrity**: PASS. Existing entities and migrations remain unchanged.
- **Session/state**: PASS. Preferences portal and unread reconciliation stay authenticated and Apollo-scoped.
- **Evidence**: PASS. Tests, builds, EF and runtime tasks are explicit.

Post-design re-check: PASS.

## Design Decisions

1. Extend `parseYouTubeContent` to return ordered video IDs while preserving `videoId` compatibility for existing callers.
2. Validate a maximum of two valid YouTube URLs in `SocialService` during create and edit. Invalid lookalike text does not count.
3. Let the primary image report intrinsic dimensions once. `MediaGrid` switches only landscape attachment covers to a full-width natural-height mode and resets metadata when the primary key changes.
4. Render PDF page-one canvas in a clipped preview region with a separate filename/action footer; retain lazy import and cancellation.
5. Use `createPortal` for preferences so Header transforms cannot redefine its fixed containing block.
6. Keep `AggregateCount` historical. Badge/cache logic uses `unreadNotificationCount` and authoritative refetch; tests prevent accidental use of aggregate count.
7. Add a temporary root `theme-transitioning` class for 800 ms visual-property transitions, disabled by reduced motion.

## Project Structure

```text
FrontEnd/OneItb-FE/src/
|-- utils/mediaParser.js
|-- Components/publication/{Feed,MediaComponent,MediaGrid,MediaAttachment,PdfFirstPageThumbnail,MediaViewerModal}.jsx
|-- Components/branding/BrandLogo.jsx
|-- Components/notifications/{NotificationBell,NotificationPreferencesModal}.jsx
|-- context/ThemeContext.jsx
`-- index.css

API Graphql/
|-- Services/Social/SocialService.cs
`-- Tests/Services.Tests/{Social,Notifications}/*.cs
```

**Structure Decision**: Keep established component/service boundaries and add only small pure helpers where tests need deterministic behavior.
