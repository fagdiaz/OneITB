# Tasks: Superadmin Security

## Setup

- [X] T001 Create and validate spec 119 artifacts
- [X] T002 Update active Spec Kit pointers

## Backend

- [X] T003 Extend IUsersService.UpdateUserRoleAsync with operator ID and optional password
- [X] T004 Throw on role changes targeting existing administrators
- [X] T005 Verify authenticated operator BCrypt hash before administrator promotion
- [X] T006 Throw on status changes targeting existing administrators
- [X] T007 Pass authenticated operator ID and optional password from Mutation.UpdateUserRole
- [X] T008 Run backend Release build

## Frontend

- [X] T009 Add optional adminPassword Apollo variable
- [X] T010 Intercept administrator promotion in UserManagement.jsx
- [X] T011 Add Tailwind password confirmation modal and explicit confirmation
- [X] T012 Preserve disabled role and status controls for existing administrators
- [X] T013 Clear sensitive modal state on cancel and success
- [X] T014 Run frontend build

## Closure

- [X] T015 Attempt runtime validation or record blocker
- [X] T016 Record evidence
- [X] T017 Add one top development log entry
- [X] T018 Verify task completion and diff integrity

## Definition Of Done

- [X] Existing administrators cannot be role-edited or deactivated
- [X] Promotion requires correct operator password
- [X] Builds pass
- [X] Runtime evidence is recorded or blocked
- [X] Documentation closure is complete
