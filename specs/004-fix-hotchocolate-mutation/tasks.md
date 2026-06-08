# Tasks: fix-hotchocolate-mutation

**Input**: Design documents from `/specs/004-fix-hotchocolate-mutation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Verify project compiling before changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Remove `[ExtendObjectType(OperationTypeNames.Mutation)]` decorator from the `Mutation` class in `API Graphql/OneITB/GraphQL/Mutation.cs`.
- [x] T003 Verify `Startup.cs` configuration and run compilation.

---

## Phase 3: Polish & Logs Update

- [x] T004 Run `dotnet build` to ensure the project compiles successfully.
- [x] T005 Update the ROADMAP.md file.
- [x] T006 Add development log entry to DEVELOPMENT_LOG.md.
