# Tasks: Profile Data Binding Fixes

## Phase 1: Setup

- [x] T001 Activate spec 148 in `.specify/feature.json` and `AGENTS.md`
- [x] T002 Document plan, data model, contracts, and quickstart under `specs/148-profile-data-binding-fixes/`

## Phase 2: Backend

- [x] T003 Add `AvatarUrl` to `API Graphql/Entities/Models/User.cs`
- [x] T004 Map `AvatarUrl` in `API Graphql/Data/OneItbContext.cs`
- [x] T005 Extend `UpdateProfileInput` and `PublicProfileSummary` in `API Graphql/Services/DTOs.cs`
- [x] T006 Update `API Graphql/Services/Users/UsersService.cs` for avatar, careers, and identity normalization
- [x] T007 Expose avatar/careers in `API Graphql/OneITB/Startup.cs` and `API Graphql/OneITB/GraphQL/Query.cs`
- [x] T008 Generate/apply EF migration `AddAvatarUrlAndNormalizeIdentity`

## Phase 3: Frontend

- [x] T009 Update profile/public profile GraphQL queries for avatar and career IDs
- [x] T010 Refactor `CvEditorProfile.tsx` to upload avatar through `/api/upload` with JWT and persist returned URL
- [x] T011 Add career checkboxes to `CvEditorProfile.tsx` and send `careerIds` with `updateProfile`
- [x] T012 Render persisted avatar in `UserProfile.tsx` and feed user cards when available

## Phase 4: Validation & Documentation

- [x] T013 Run backend Release build
- [x] T014 Run frontend production build
- [x] T015 Run runtime GraphQL smoke for avatar URL, career IDs, and identity normalization
- [x] T016 Update `DEVELOPMENT_LOG.md`, `DOCUMENTATION_STATUS.md`, and `ROADMAP.md`
