# Tasks: Mega Refactor Core

**Input**: Design documents from `/specs/110-mega-refactor-core/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/graphql.md`, `quickstart.md`

**Tests**: Runtime evidence is required for chat lifecycle, GraphQL contracts,
persistence, Apollo cache behavior, feed filtering, social graph behavior and browser flows.
Compilation alone is insufficient.

## Phase 1: Setup and baseline

- [ ] T001 Verify active feature artifacts and complete checklist in `specs/110-mega-refactor-core/checklists/requirements.md`
- [ ] T002 [P] Record dirty-worktree baseline and preserve existing specs 103-109 changes in `specs/110-mega-refactor-core/evidence.md`
- [ ] T003 [P] Verify `.gitignore` covers `bin/`, `obj/`, `node_modules/`, `dist/`, `*.log`, `*.pid` and `.env*`
- [ ] T004 Audit current chat lifecycle in `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx` and `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
- [ ] T005 Audit current feed/profile/backend contracts in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`, `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`, `API Graphql/OneITB/GraphQL/Query.cs` and `API Graphql/OneITB/GraphQL/Mutation.cs`

## Phase 2: Chat stability bugfix (US1)

- [ ] T006 [US1] Extract shared chat cache helpers into `FrontEnd/OneItb-FE/src/Components/chat/chatCache.js`
- [ ] T007 [US1] Move derived active-contact filtering in `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx` behind `useMemo` and remove state changes from render paths
- [ ] T008 [US1] Add mounted guards and cleanup callbacks to async chat effects in `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
- [ ] T009 [US1] Apply the same subscription cleanup and refetch guard pattern in `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
- [ ] T010 [US1] Validate mini widget to `/chat` to `/feed` navigation in browser and record console evidence in `specs/110-mega-refactor-core/evidence.md`

## Phase 3: Backend data model foundation (US2-US4)

- [ ] T011 [P] [US2] Create `Career` entity in `API Graphql/Entities/Models/Career.cs`
- [ ] T012 [P] [US2] Create `UserCareer` entity in `API Graphql/Entities/Models/UserCareer.cs`
- [ ] T013 [P] [US4] Create `InteractionType` enum and `UserInteraction` entity in `API Graphql/Entities/Models/UserInteraction.cs`
- [ ] T014 [P] [US2] Create `SubjectCareer` entity in `API Graphql/Entities/Models/SubjectCareer.cs`
- [ ] T015 [US3] Add `IsActive` and `UpdatedAt` to `API Graphql/Entities/Models/Inquiry.cs`
- [ ] T016 [US3] Add `IsActive` and `UpdatedAt` to `API Graphql/Entities/Models/Comment.cs`
- [ ] T017 Add navigation collections for careers and interactions in `API Graphql/Entities/Models/User.cs` and `API Graphql/Entities/Models/Subject.cs`
- [ ] T018 Map `Career`, `UserCareer`, `SubjectCareer`, `UserInteraction`, soft-delete filters, indexes and all restricted relationships in `API Graphql/Data/OneItbContext.cs`
- [ ] T019 Seed the ten institutional careers and deterministic subject-career/user-career links in `API Graphql/Data/DbInitializer.cs`
- [ ] T020 Generate EF migration `AddCareersAndSocialGraph` under `API Graphql/Data/Migrations/`
- [ ] T021 Apply the migration and verify no pending model changes, recording output in `specs/110-mega-refactor-core/evidence.md`

## Phase 4: Backend services and GraphQL (US2-US4)

- [ ] T022 [P] [US2] Define career/feed/profile DTOs and service contracts in `API Graphql/Services/Careers/ICareerService.cs`, `API Graphql/Services/Feed/IFeedService.cs` and `API Graphql/Services/Profiles/IProfileService.cs`
- [ ] T023 [P] [US4] Define social graph service contract in `API Graphql/Services/SocialGraph/ISocialGraphService.cs`
- [ ] T024 [US2] Implement career enrollment and subject filtering service logic in `API Graphql/Services/Careers/CareerService.cs`
- [ ] T025 [US3] Extend social publication service logic for edit and soft-delete in `API Graphql/Services/Social/SocialService.cs`
- [ ] T026 [US4] Implement social interaction replacement and feed exclusion rules in `API Graphql/Services/SocialGraph/SocialGraphService.cs`
- [ ] T027 [US2-US4] Implement filtered and prioritized feed query logic in `API Graphql/Services/Feed/FeedService.cs`
- [ ] T028 [US5] Implement read-only profile summary logic in `API Graphql/Services/Profiles/ProfileService.cs`
- [ ] T029 Register new services in `API Graphql/OneITB/Startup.cs`
- [ ] T030 Add `careers`, `myCareers`, filtered `subjects`, filtered `inquiries` and `publicProfile` resolvers in `API Graphql/OneITB/GraphQL/Query.cs`
- [ ] T031 Add `linkUserToCareers`, `editInquiry`, `toggleInquiryStatus`, `editComment`, `toggleCommentStatus` and `interactWithUser` resolvers in `API Graphql/OneITB/GraphQL/Mutation.cs`
- [ ] T032 Build backend in Release and introspect GraphQL contract, recording fields and errors in `specs/110-mega-refactor-core/evidence.md`
- [ ] T033 Execute GraphQL runtime checks for career linking, feed filtering, soft-delete, social graph ranking and public profile in `specs/110-mega-refactor-core/evidence.md`

## Phase 5: Frontend GraphQL integration (US2-US5)

- [ ] T034 [P] [US2] Create career queries and mutations in `FrontEnd/OneItb-FE/src/data/graphql/careers.js`
- [ ] T035 [P] [US3] Create content edit/status mutations in `FrontEnd/OneItb-FE/src/data/graphql/contentModeration.js`
- [ ] T036 [P] [US4] Create social graph mutation documents in `FrontEnd/OneItb-FE/src/data/graphql/socialGraph.js`
- [ ] T037 [P] [US5] Create public profile query in `FrontEnd/OneItb-FE/src/data/graphql/profile.js`
- [ ] T038 Update inquiry query/mutation documents for search, career, subject filters, `isActive`, `updatedAt` and author fields in `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js` and `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js`

## Phase 6: Feed creation, filters and content actions (US2-US4)

- [ ] T039 [US2] Refactor publication creation in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` to select career before subject for multi-career users
- [ ] T040 [US2] Add feed search, career filter and subject multi-filter UI in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [ ] T041 [US3-US4] Add publication action dropdown for edit, delete, follow, mute, block and moderation actions in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [ ] T042 [US3-US4] Add comment action dropdown for edit, delete and moderation actions in `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
- [ ] T043 [US3] Ensure feed and comments update Apollo cache after edit/soft-delete without full reload in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` and `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
- [ ] T044 [US4] Ensure follow/mute/block actions update feed visibility and ordering in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [ ] T045 Validate publication create/filter/edit/soft-delete/social actions in browser and record results in `specs/110-mega-refactor-core/evidence.md`

## Phase 7: Public profile and isolated editing (US5)

- [ ] T046 [US5] Refactor `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` into read-only public summary with recent publications
- [ ] T047 [US5] Add expand/detail modal or panel for public profile "Ver más" in `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
- [ ] T048 [US5] Create isolated edit profile flow in `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`
- [ ] T049 [US5] Add "Editar Perfil" account-menu navigation in `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
- [ ] T050 [US5] Update routes in `FrontEnd/OneItb-FE/src/router/Routing.jsx` for public profile and edit profile separation
- [ ] T051 Validate profile public read-only and isolated editing in browser and record results in `specs/110-mega-refactor-core/evidence.md`

## Phase 8: Quality gates and documentation closure

- [ ] T052 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore` and record exact output in `specs/110-mega-refactor-core/evidence.md`
- [ ] T053 Run `npm.cmd run build` from `FrontEnd/OneItb-FE` and record exact output in `specs/110-mega-refactor-core/evidence.md`
- [ ] T054 Run `git diff --check` and record exact output in `specs/110-mega-refactor-core/evidence.md`
- [ ] T055 Mark `specs/110-mega-refactor-core/spec.md` complete only after runtime evidence passes
- [ ] T056 Recalculate every module and global percentage in `docs/project_docs/ROADMAP.md` from checklist evidence
- [ ] T057 Insert exactly one `110-mega-refactor-core` entry at the top of `docs/audit/DEVELOPMENT_LOG.md`
- [ ] T058 Verify all `docs/audit/DEVELOPMENT_LOG.md` entries remain newest to oldest with spec 110 first
- [ ] T059 Update canonical status and evidence links in `docs/audit/DOCUMENTATION_STATUS.md`
- [ ] T060 Mark completed tasks in `specs/110-mega-refactor-core/tasks.md` only when supported by evidence

## Dependencies and execution order

- US1 blocks browser validation for later UI stories.
- Phases 3 and 4 block all career/feed/social/profile frontend integration.
- Feed UI depends on the GraphQL contracts in Phase 5.
- Documentation closure depends on builds, migrations, GraphQL checks and browser evidence.

## QA corrections applied

- Code, database, GraphQL and React state names must remain English; Spanish is UI-only.
- New relationships use explicit entities and restricted delete behavior; no EF shadow FKs.
- Search input must be bounded and validated before query composition.
- Soft-delete hides normal query results but never physically deletes content.
- Resolvers must delegate to services, not embed large business logic.
- Runtime validation is mandatory before roadmap or completion claims.

## Definition Of Done

- [ ] All required tasks are marked `[X]`.
- [ ] Backend and frontend builds pass with zero errors.
- [ ] Migration and database indexes are applied.
- [ ] GraphQL schema exposes the documented operations.
- [ ] Chat route transitions produce zero cross-render warnings.
- [ ] Career-bound publication creation and feed filters are verified.
- [ ] Edit and soft-delete persist and survive reload.
- [ ] Follow/mute/block feed ranking and exclusion are verified.
- [ ] Public profile is read-only and edit profile is isolated.
- [ ] Roadmap, development log and documentation status reflect only verified outcomes.
