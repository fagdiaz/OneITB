# Evidence - 110-mega-refactor-core

Date: 2026-06-15

## Summary

Implemented the structural full-stack refactor for chat isolation, careers/enrollments,
feed filters, content soft-delete, social interactions and read-only profile separation.

## Backend Evidence

- Added domain entities:
  - `Career`
  - `UserCareer`
  - `SubjectCareer`
  - `UserInteraction` with `InteractionType`
- Added `IsActive` and `UpdatedAt` to `Inquiry` and `Comment`.
- Mapped all new relationships explicitly in `OneItbContext` with `DeleteBehavior.Restrict`.
- Added global query filters for soft-deleted inquiries/comments and matching filters for reactions/reports.
- Extended `DbInitializer` with institutional careers, subject-career links, user-career links and sample social interactions.
- Added GraphQL read operations:
  - `careers`
  - `myCareers`
  - `subjects(careerId)`
  - `inquiries(searchTerm, careerId, subjectIds)`
  - `publicProfile(userId)`
- Added GraphQL mutations:
  - `linkUserToCareers`
  - `editInquiry`
  - `toggleInquiryStatus`
  - `editComment`
  - `toggleCommentStatus`
  - `interactWithUser`

## Migrations

`dotnet ef migrations add` could not be used because the EF CLI attempted to reach
NuGet metadata and the environment blocked `https://api.nuget.org/v3/index.json`.
The migration was created manually using EF Core migration APIs and compiled.

Applied migrations:

```text
20260615211200_AddCareersAndSocialGraph
20260615211900_SeedCareersAndSocialGraphData
```

Verification:

```text
dotnet ef migrations list --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
```

Result: both spec 110 migrations are listed without `(Pending)`.

## Frontend Evidence

- Extracted chat cache helpers into `Components/chat/chatCache.js`.
- Added mounted guards and cleanup-aware WebSocket status subscriptions in `PrivateChat` and `MiniChatWidget`.
- Moved active-contact derivation/filtering to `useMemo`.
- Added career queries and public profile query documents.
- Extended inquiry query/mutations for feed filters, edits, status toggles and social interactions.
- Refactored `Feed.jsx` with:
  - search bar
  - career filter
  - subject filter
  - career-first publication flow for multi-career users
  - post edit/soft-delete actions
  - follow/mute/block/report actions
- Extended `CommentThread.jsx` with comment edit/soft-delete actions.
- Replaced `/profile` with read-only public summary and recent posts.
- Added `/profile/edit` and avatar dropdown entry for isolated editing.

## Quality Gates

```text
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Result: build completed with 0 errors. Final build after snapshot update compiled successfully.

```text
npm.cmd run build
```

Result: Vite build completed successfully with 0 errors.

```text
git diff --check
```

Result: no whitespace errors. Git reported line-ending warnings only.

## Runtime Notes

- `dotnet ef database update --no-build` succeeded and applied all migrations.
- Starting the backend from the sandbox executed Kestrel, but `DbInitializer` could not connect through Integrated Security due `Failed to generate SSPI context`.
- To avoid leaving the database without careers, the spec includes the idempotent SQL seed migration `SeedCareersAndSocialGraphData`.
- Browser runtime checks were not completed in this environment because the app startup path cannot complete DB seeding under sandboxed Integrated Security. Build and migration checks passed.
