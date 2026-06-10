# Tasks: Fix Admin Users Query & GraphQL Exceptions (043)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json → 043 plan.

## Phase 2: GraphQL Configuration
- [x] T002 Enable detailed exception logging for HotChocolate in `Startup.cs` (`opt.IncludeExceptionDetails = true`).
- [x] T002.1 Apply `.AddAuthorization()` to correct schema resolver error with `@AuthorizeDirective`.

## Phase 3: EF Core Mapping Fix
- [x] T003 Locate the `DbContext` and Repository class.
- [x] T004 Audit and fix EF Core query in `UnitOfWork.cs` for `Users.GetAll()` to include the `Account` entity, fixing the query projection failure.

## Phase 4: QA
- [x] T005 Build backend.
- [x] T006 Update DEVELOPMENT_LOG.md.
