# Tasks: Refactor all entities to English

**Input**: Design documents from `/specs/011-refactor-all-entities-to-english/`

## Phase 1: Foundational (Refactoring C# domain entities)
- [ ] T001 Rename C# file `Materia.cs` to `Subject.cs` and modify its class name and properties to English.
- [ ] T002 Rename C# file `Consulta.cs` to `Inquiry.cs` and modify its class name and properties to English.
- [ ] T003 Update DbContext `OneItbContext.cs` mappings and DB sets for Subject and Inquiry.
- [ ] T004 Update all unit of work, repositories, and services to reference renamed classes and properties.
- [ ] T005 Update GraphQL schema, descriptors, Query, and Mutation.
- [ ] T006 Rebuild the database using EF Core commands (`drop` -> `migrations add` -> `database update`).
- [ ] T007 Verify backend compile.

## Phase 2: QA Verification (Verify naming conventions)
- [ ] T008 Run `$speckit-qa` checks manually to ensure everything is strictly in English.
