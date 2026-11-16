# Tasks: Spec 160 Registration, Avatar, Chat and Search Hardening

## Phase 1: Registration Contract and UI

- [x] T001 Update `RegisterInput` in `API Graphql/Services/DTOs.cs` to accept public `Role` and `CareerIds`.
- [x] T002 Update `UsersService.RegisterAsync` to validate allowed public roles and active career IDs, then create `UserCareer` rows.
- [x] T003 Update `FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js` if needed for the expanded input.
- [x] T004 Refactor `Register.jsx` with confirm-password validation, non-admin role selector, career selector via `GET_CAREERS`, and required career validation.
- [x] T005 Update `Login.jsx` to display registration success state from navigation.

## Phase 2: Avatar Retention and Canvas Bounds

- [x] T006 Update `CvEditorProfile.tsx` so profile save preserves the existing `avatarUrl` when no new edited upload was produced.
- [x] T007 Update `AvatarEditorModal.jsx` to compute effective rendered dimensions for rotation/zoom.
- [x] T008 Clamp zoom and pan offsets so exported canvas never contains blank borders.

## Phase 3: Chat Unread, Avatars and Presence

- [x] T009 Add `AvatarUrl` to `MessagingContact` DTO and populate it in `MessagingService.GetContacts`.
- [x] T010 Extend `chat.js` message/contact GraphQL operations to request `avatarUrl` and sender/receiver profile data.
- [x] T011 Add unread badge to Header `Mensajes` nav item using existing `GET_MESSAGING_CONTACTS` with authenticated skip.
- [x] T012 Highlight unread contacts in `PrivateChat.jsx` and `ChatSidebar.jsx`.
- [x] T013 Render received sender avatar/fallback in `PrivateChat.jsx` and `ChatWindow.jsx`.
- [x] T014 Remove fake contact presence copy (`En línea`) from full chat and widget/sidebar.

## Phase 4: Smart Search Filters

- [x] T015 Update `GlobalSearch.jsx` to hide career filter unless multi-career user or global role.
- [x] T016 Update subject filter so `Todas` visually selects all visible subjects, unchecking it clears all subjects, and unchecking one subject disables `Todas` while keeping the others checked.
- [x] T017 Ensure subject options depend on selected/effective careers without widening backend visibility.

## Phase 5: Validation and Documentation

- [x] T018 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
- [x] T019 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- [x] T020 Record validation evidence in `specs/160-registration-avatar-chat-search-hardening/evidence.md`.
- [x] T021 Add one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T022 Update `docs/audit/DOCUMENTATION_STATUS.md`.
