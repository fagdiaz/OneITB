# Admin UX and Mega-Seed

## Context & Motivation
The user management grid requires UX improvements to avoid accidental role changes. Roles should be text labels, and a dedicated modal should be used for modifications. The system also requires a realistic Mega-Seed implementation in the backend to populate sufficient data (users, inquiries, and comments) to test UI scaling and pagination properly.

## Scope & Boundaries
**In Scope:**
- **UX Refactor (Frontend):** Convert the admin user grid to read-only. Add clickable profile links and a dedicated "Editar" button that opens a modal for role and status changes.
- **Mega-Seed (Backend):** Expand `DbInitializer.cs` to generate at least 15 inquiries, comments, and diverse users properly mapped to careers without using hard-coded IDs.

**Out of Scope:**
- Changes to API/GraphQL mutations.

## Key Scenarios & Use Cases
### Scenario 1: Mega-Seed Data Generation
*   **Context:** A developer resets the database to prepare a test environment.
*   **Action:** The developer drops and updates the database using EF Core tools.
*   **Expected Outcome:** `DbInitializer` creates 50 users (students, teachers, admins), links them to careers, and spawns over 150 inquiries and comments with stable relationships.

### Scenario 2: Safe User Editing
*   **Context:** An admin wants to suspend a user.
*   **Action:** They view the read-only list, click "Editar", and toggle the status in the safe Edit User Modal.
*   **Expected Outcome:** Accidental clicks in the main grid are prevented, and dangerous operations like promoting to Administrator explicitly require the current admin's password.

## Open Questions
- None. (Already anticipated and completed in previous iteration).
