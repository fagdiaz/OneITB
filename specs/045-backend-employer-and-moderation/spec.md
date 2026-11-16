# Feature Specification: Backend Employer & Moderation Infrastructure (045)

**Feature Branch**: `045-backend-employer-and-moderation`
**Created**: 2026-06-10
**Scope**: Backend Only

## Problem Statement
The requirements document was recently updated to introduce the "Employer" role, "Passwordless" authentication (Magic Link) with simulated AFIP validation, and Community Moderation. The backend infrastructure must now be implemented to persist and serve these new capabilities.

## Proposed Solution
1. **Entities & Context**:
   - Create a `CommunityReport` entity to track user reports against posts/content.
   - Create a `MagicLinkToken` entity or add fields to `Account` to support one-time passwordless login tokens.
   - Map these new entities in `OneItbContext.cs`.
2. **EF Core Migrations**: Add and apply a migration for the new tables.
3. **Business Logic & Services**:
   - Implement `IAuthService` or extend `IUsersService` with methods for simulating AFIP validation and generating Magic Links.
   - Implement `IModerationService` for creating community reports.
4. **GraphQL Resolvers**:
   - Expose `RequestMagicLink` and `LoginWithMagicLink` mutations.
   - Expose `ReportContent` mutation.

## Success Criteria
- SC-001: The `OneItbContext` cleanly builds and migrations are applied without data loss.
- SC-002: A GraphQL mutation exists to request a Magic Link (which internally "simulates" AFIP validation for employers).
- SC-003: A GraphQL mutation exists to login using the Magic Link token.
- SC-004: A GraphQL mutation exists to create a `CommunityReport`.
