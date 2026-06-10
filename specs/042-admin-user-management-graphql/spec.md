# Feature Specification: Connect Admin Dashboard to GraphQL (042)

**Feature Branch**: `042-admin-user-management-graphql`
**Created**: 2026-06-10
**Scope**: Full Stack

## Problem Statement
The current `UserManagement` component uses hardcoded Mock Data. To be fully functional, it needs to read actual users from the SQL Server database via the .NET 8 GraphQL backend and push Role/Status updates back to the server in real-time.

## Proposed Solution
### Backend (.NET 8 / HotChocolate)
1. Ensure a query exists to fetch all users (likely `users` returning `[User]`).
2. Add or update mutations to change a user's role (e.g., `updateUserRole`).
3. Add or update mutations to change a user's active status (e.g., `updateUserStatus`).

### Frontend (React / Apollo Client)
1. Create GraphQL query definition `GET_ALL_USERS` in `src/data/graphql/queries`.
2. Create GraphQL mutation definitions `UPDATE_USER_ROLE` and `UPDATE_USER_STATUS` in `src/data/graphql/mutations`.
3. Refactor `UserManagement.jsx` to replace `useState` mock data with Apollo `useQuery` and `useMutation` hooks.
4. Implement proper loading and error states in the UI.

## Success Criteria
- SC-001: Admin dashboard fetches real data from the backend.
- SC-002: Changing a user's role successfully updates the database and reflects in the UI.
- SC-003: Toggling a user's status successfully updates the database and reflects in the UI.
- SC-004: Both frontend and backend compile without errors.
