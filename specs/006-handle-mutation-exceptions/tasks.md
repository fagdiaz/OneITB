# Tasks: handle-mutation-exceptions

**Input**: Design documents from `/specs/006-handle-mutation-exceptions/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Foundational (Blocking Prerequisites)

- [x] T001 Wrap `usersService.RegisterAsync(input)` call inside `Mutation.RegisterUserAsync` in `API Graphql/OneITB/GraphQL/Mutation.cs` in a `try-catch` block capturing `System.ArgumentException`.
- [x] T002 Return `new UserPayload(Guid.Empty, false, ex.Message)` inside the catch block.

---

## Phase 2: Polish & Logs Update

- [x] T003 Build the solution using `dotnet build OneITB.sln` to verify compilation.
- [x] T004 Update ROADMAP.md progress percentages.
- [x] T005 Add development log entry to DEVELOPMENT_LOG.md.
