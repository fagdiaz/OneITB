# Spec 159: Auth Guard, Search Scope, CV Consistency and Avatar Math

## Objective

Close QA findings from the final polish sprint by hardening authenticated UI guards, enforcing cross-career publication scoping, normalizing CV contact rendering, and fixing the avatar editor canvas math for square avatar crops with drag-to-pan.

## Requirements

1. Omni-search must not render or execute when no authenticated session/token exists.
2. Header profile queries must skip while the user is not logged in.
3. Subject filters in search must expose a default `Todas` option.
4. Selecting `Todas` must clear individual subject filters; selecting an individual subject must unset `Todas`.
5. A user can only see publications belonging to careers in which the current user is enrolled.
6. When viewing another user profile, visible publication summaries must be restricted to the intersection between viewer careers and publication careers.
7. Admin and Moderator may retain global visibility for moderation and institutional operations.
8. `/profile` and `/profile/edit` must use identical CV print contact/social row rendering.
9. Avatar editor crop mask must be square, matching the app avatar shape.
10. Avatar editor zoom must allow scaling down substantially, with a minimum of `0.1`.
11. Avatar editor must support drag-to-pan with mouse and touch/pointer events.
12. Canvas redraw must honor pan offset, zoom, rotation, flip, filters and vignette without adding dependencies.

## Non-Goals

- No database migration.
- No new REST endpoint.
- No external crop/editor libraries.
- No unrelated redesign outside Header/search, publication scoping, CV print, and avatar editor.

## Acceptance Criteria

- Anonymous pages do not render the omni-search and do not fire the header `me`/profile query.
- Search subject filter defaults to `Todas`; individual subject selection produces explicit filtering only.
- GraphQL inquiry queries cannot return publications outside the current user's enrolled careers for normal users.
- Profile publication summaries follow the same career scope rule.
- CV print from `/profile` and `/profile/edit` uses the same contact row helper and output order.
- Avatar canvas editor allows square crop, zoom down to `0.1`, and drag-to-pan.
- Backend Release build passes.
- Frontend Vite build passes with 0 errors.
