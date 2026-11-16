# Implementation Plan: Superadmin Security

**Branch**: 119-superadmin-security | **Date**: 2026-06-18 | **Spec**: spec.md

## Summary

Pass the authenticated operator ID from the resolver into IUsersService, reject mutations targeting existing administrators with GraphQL errors, verify the operator BCrypt hash for promotions, and add a Tailwind confirmation modal in UserManagement.

## Technical Context

**Language/Version**: .NET 8, React 18
**Primary Dependencies**: HotChocolate, BCrypt.Net-Next, Apollo Client, Tailwind v4
**Storage**: Existing SQL Server account hashes; no migration
**Testing**: Backend Release build, frontend Vite build, runtime smoke when environment permits
**Constraints**: Password remains ephemeral; no logging or persistence; no commit or push.

## Constitution Check

- GraphQL resolvers delegate business rules to IUsersService: PASS.
- Password verification uses the existing BCrypt hash: PASS.
- Sensitive password data is not exposed in responses: PASS.
- Existing JWT authorization remains required: PASS.

## Project Structure

API Graphql/Services/Users/IUsersService.cs
API Graphql/Services/Users/UsersService.cs
API Graphql/OneITB/GraphQL/Mutation.cs
FrontEnd/OneItb-FE/src/data/graphql/mutations/admin.js
FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx

## Complexity Tracking

No schema or persistence changes.
