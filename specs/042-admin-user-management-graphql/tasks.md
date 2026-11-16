# Tasks: Connect Admin Dashboard to GraphQL (042)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json → 042 plan.

## Phase 2: Backend Implementation (.NET 8 / HotChocolate)
- [x] T002 Audit existing backend schema for users, roles, and status fields.
- [x] T003 Implement `updateUserRole` and `updateUserStatus` mutations in the backend.

## Phase 3: Frontend GraphQL Definitions
- [x] T004 Create/verify `GET_ALL_USERS` query in React.
- [x] T005 Create `UPDATE_USER_ROLE` and `UPDATE_USER_STATUS` mutations in React.

## Phase 4: Frontend Integration
- [x] T006 Update `UserManagement.jsx` to use Apollo Client `useQuery` and `useMutation`.
- [x] T007 Remove Mock Data and wire up UI controls to execute mutations.

## Phase 5: QA
- [x] T008 Run backend build.
- [x] T009 Run frontend build.
- [x] T010 Update DEVELOPMENT_LOG.md.
