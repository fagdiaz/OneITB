# Feature Specification: Admin User Management Dashboard (041)

**Feature Branch**: `041-admin-user-management`
**Created**: 2026-06-10
**Scope**: Frontend Only

## Problem Statement
The application lacks an administrative interface for managing users. An administrator needs a dedicated view to see all registered users, modify their roles (e.g., User, Admin), and toggle their active/inactive status (admission rights).

## Proposed Solution
1. Create a new `UserManagement` component (`AdminDashboard`).
2. Implement a responsive Data Grid layout using Tailwind CSS v4.
3. Integrate mock data to visually validate the UI before connecting to the GraphQL backend.
4. Add action buttons for Role modification and Status toggling.
5. Create a new private route `/admin/users` to access this view.

## Success Criteria
- SC-001: The component renders a responsive table/grid using Tailwind CSS v4.
- SC-002: Mock data populates the grid successfully.
- SC-003: UI controls for Role and Status exist and have visual interactive states.
- SC-004: The route is accessible within the application routing.
