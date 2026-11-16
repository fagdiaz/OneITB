# User Management Refactor and Mega-Seed

## Context & Motivation
The current `UserManagement.jsx` component displays users in a table where their roles and statuses can be updated directly inline. As the system scales and more actions are added to user management, this inline editing approach becomes cluttered and risks accidental modifications. A cleaner, read-only primary view is needed, with update actions moved into a dedicated "Edit User" modal. Additionally, the user names should link to their public profiles.
On the backend, to properly test the pagination, search, and UI performance of this new component and the system at large, a "Mega-Seed" is required. This means populating the database with a large amount of realistic test data (many users, publications, and interactions).

## Scope & Boundaries
**In Scope:**
- **Frontend (`UserManagement.jsx`)**:
  - Convert the main table into a read-only view.
  - Transform user names into clickable links routing to their profiles (`/profile/:id`).
  - Display the `role` as plain text instead of a `<select>` dropdown.
  - Remove inline edit controls (status toggle, silence buttons) and place an "Edit" button that opens a modal.
  - Create a new Edit Modal that encapsulates the role change, status toggle, and silencing logic.
- **Backend (`DbInitializer.cs`)**:
  - Enhance the existing database seed to generate a large number of users, publications, and interactions (the "Mega-Seed").

**Out of Scope:**
- Changes to the underlying GraphQL API mutations/queries (they already exist and work).
- Modifying the visual design of other admin components.

## Key Scenarios & Use Cases

### Scenario 1: Viewing the User Table
*   **Context:** An admin navigates to the user management dashboard.
*   **Action:** The admin views the list of users.
*   **Expected Outcome:** The table displays users in a read-only format. The admin can click on a user's name to visit their profile. Roles are displayed as text.

### Scenario 2: Editing a User
*   **Context:** An admin wants to suspend a user or change their role.
*   **Action:** The admin clicks the "Edit" button next to a user in the table, opening the Edit Modal. The admin makes the desired changes and submits.
*   **Expected Outcome:** The changes are processed via GraphQL mutations, and the table updates to reflect the new state. The modal encapsulates the logic securely.

### Scenario 3: Mega-Seed Data Generation
*   **Context:** A developer sets up the environment or drops the database.
*   **Action:** The developer runs Entity Framework database update.
*   **Expected Outcome:** The `DbInitializer` runs and populates the database with hundreds of realistic test entities (users, inquiries, subjects) to test application performance and UI scrolling.

## Open Questions
- What is the exact number of users and posts required for the "Mega-Seed"? (Will default to generating ~50 users and ~100 posts for a robust but fast test).
