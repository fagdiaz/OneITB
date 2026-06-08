# Tasks: throw-graphql-exception

**Input**: Design documents from `/specs/007-throw-graphql-exception/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Foundational (Blocking Prerequisites)

- [x] T001 Wrap `usersService.RegisterAsync(input)` call inside `Mutation.RegisterUserAsync` in `API Graphql/OneITB/GraphQL/Mutation.cs` to catch `System.ArgumentException` and throw `new HotChocolate.GraphQLException(ex.Message)`.

---

## Phase 2: Polish & Logs Update

- [x] T002 Build the solution using `dotnet build OneITB.sln` to verify compilation.
- [x] T003 Update ROADMAP.md progress percentages.
- [x] T004 Add development log entry to DEVELOPMENT_LOG.md.
