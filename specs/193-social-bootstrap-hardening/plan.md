# Implementation Plan: Social Policy and UI Bootstrap Resilience

## Summary

Close the administrative mute bypass for publication reactions and restructure frontend bootstrap so global error recovery covers client/provider initialization without duplicating Apollo state.

## Technical Context

- Backend: .NET 8, EF Core 8 social service and notification service.
- Frontend: React 18, Apollo Client 3.7, ThemeContext, Vite.
- Primary paths: `SocialService.cs`, social tests, `main.jsx`, `GlobalErrorBoundary.tsx`, GraphQL provider and frontend tests.
- Migration: none.
- Risk: MEDIUM/HIGH (moderation consistency and application bootstrap).

## Constitution Check

- **Authorization/moderation**: PASS; centralized backend guard remains authoritative.
- **State isolation**: PASS; one Apollo instance and Spec 188 cleanup remain mandatory.
- **Error handling**: PASS; fallback becomes provider-independent.
- **Compatibility**: PASS; no GraphQL/schema change.
- **Evidence**: PASS; zero-side-effect and injected-bootstrap-failure tests required.

## Implementation Phases

1. Add failing social test for muted user liking and unliking a publication.
2. Assert zero Reaction change and zero notification/event side effect.
3. Reuse `EnsureUserCanCreateContentAsync` in `ToggleReactionAsync`.
4. Add regression tests distinguishing administrative silence from observer Mute.
5. Extract dependency-free institutional error fallback.
6. Introduce `AppProviders` with stable lazy Apollo client creation.
7. Move `GlobalErrorBoundary` outside all providers.
8. Add pre-mount bootstrap `try/catch` for failures before React boundary coverage.
9. Add failure-injection tests for client factory, Apollo provider, theme provider and child tree.
10. Verify single client/WebSocket lifecycle and logout/session regression.
11. Run tests, builds, browser startup and authenticated muted-reaction smoke.

## Planned Touchpoints

- `API Graphql/Services/Social/SocialService.cs`: `ToggleReactionAsync`.
- `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`: muted like/unlike and observer-Mute regressions.
- `FrontEnd/OneItb-FE/src/main.jsx`: guarded root/bootstrap tree.
- `FrontEnd/OneItb-FE/src/Components/layout/GlobalErrorBoundary.tsx`: provider-independent fallback.
- `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`: injectable/stable client factory only as needed.
- New colocated `AppProviders`/bootstrap tests following existing frontend test conventions.
- Existing `AuthContext.test.jsx` and `GraphqlProvider.test.js`: Spec 188 regression.

## Test Strategy

- EF InMemory/SQLite service tests for insert/delete denial and no notifications.
- Existing feed personal-Mute regression.
- Testing Library tests that mock client factory/provider/theme/child failures.
- Assertion that fallback contains stable institutional recovery UI.
- StrictMode/singleton construction count test.
- AuthContext/Apollo session-boundary regression suite from Spec 188.
- Browser smoke for normal load, forced malformed theme preference and recovery.

## Rollback

Backend change is one guard call. Frontend bootstrap can revert to the previous tree without data migration. Rollback must not remove the existing child error boundary until provider coverage is restored another way.

## Definition of Done

Publication reactions obey administrative silence with zero side effects, and every feasible initialization/render layer displays a self-contained recovery UI while normal Apollo/session behavior remains unchanged.
