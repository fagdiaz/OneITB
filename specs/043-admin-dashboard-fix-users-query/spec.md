# Feature Specification: Fix Admin Users Query & GraphQL Exceptions (043)

**Feature Branch**: `043-admin-dashboard-fix-users-query`
**Created**: 2026-06-10
**Scope**: Backend Only

## Problem Statement
The GraphQL backend is throwing a 500 Internal Server Error ("Invalid object name") when the Admin Dashboard attempts to query users. This indicates an Entity Framework mapping issue where the expected table name does not match the database. Additionally, GraphQL exceptions are currently obfuscated, making debugging difficult.

## Proposed Solution
1. Modify the HotChocolate configuration in `Startup.cs` or `Program.cs` to expose detailed exceptions in development mode.
2. Inspect the `OneItbContext` (or equivalent `DbContext`) to ensure the `User` and `Account` models are correctly mapped to their respective database tables using `ToTable()` or `DbSet` properties.
3. Fix the mapping to resolve the 500 error.

## Success Criteria
- SC-001: GraphQL responses include exception details when errors occur.
- SC-002: Entity Framework Core maps the `User` entity to the correct table.
- SC-003: The `GET_USERS` query from the Admin Dashboard executes successfully without 500 errors.
