# Tasks: Chat Audit and Seeding

**Branch**: `[105-chat-audit-and-seeding]` | **Date**: 2026-06-14 | **Plan**: [plan.md](./plan.md)

## Implementation Steps

### Phase 1: Pipeline and Integrity Audit

- [x] **1.1. Adjust WebSocket Pipeline**: Modify `API Graphql/OneITB/Startup.cs` to ensure `app.UseWebSockets()` is placed before `app.UseRouting()`.
- [x] **1.2. Verify FK Restrictions**: Inspect `API Graphql/Data/OneItbContext.cs` to ensure `Message` entity uses `DeleteBehavior.Restrict`. *(Already compliant)*
- [x] **1.3. Verify Apollo Split**: Inspect `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js` to ensure HTTP/WS split is correctly configured. *(Already compliant)*

### Phase 2: Database Seeding

- [x] **2.1. Seed Test Messages**: Update `API Graphql/Data/DbInitializer.cs` to inject historical `Message` records referencing `StudentId`, `AdminId`, and `TeacherId`.
