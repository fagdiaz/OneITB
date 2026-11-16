# Tasks: Spec 159 Auth Guard, Search Scope, CV Consistency and Avatar Math

## Phase 1: Guards and Search UX

- [x] T001 Ensure `GlobalSearch.jsx` returns `null` when no authenticated session/token exists.
- [x] T002 Verify `Nav.jsx` profile/avatar query uses an authenticated skip condition and does not fire for anonymous users.
- [x] T003 Update `GlobalSearch.jsx` subject filter to expose `Todas` as the default state.
- [x] T004 Implement `Todas` behavior: selecting it clears explicit subjects; selecting a subject disables `Todas`.

## Phase 2: Backend Publication Scoping

- [x] T005 Extend `ISocialService`/`SocialService` signatures if needed to receive current-user scoping context without client trust.
- [x] T006 Enforce normal-user career scope in `SocialService.GetInquiries` by intersecting requested careers with `UserCareer`.
- [x] T007 Preserve Admin/Moderador global visibility for feed/search/moderation.
- [x] T008 Ensure profile publication summaries use the same scoped inquiry path or equivalent backend-safe filter.

## Phase 3: CV and Avatar Editor

- [x] T009 Unify `/profile` and `/profile/edit` CV contact rendering through `CVPrintTemplate.tsx`.
- [x] T010 Change `AvatarEditorModal.jsx` visual crop mask from circle to square.
- [x] T011 Lower avatar zoom minimum to `0.1` and redraw using the new scale range.
- [x] T012 Implement pointer drag-to-pan state in `AvatarEditorModal.jsx`.
- [x] T013 Apply pan offset in canvas `drawImage` with rotation, flip, filters and vignette intact.

## Phase 4: Validation and Documentation

- [x] T014 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
- [x] T015 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- [x] T016 Record validation evidence in `specs/159-auth-guard-search-scope-avatar-math/evidence.md`.
- [x] T017 Add one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T018 Update `docs/audit/DOCUMENTATION_STATUS.md`.
