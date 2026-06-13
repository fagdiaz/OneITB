# Tasks: Expose Inquiry Author

## Phase 1: Contract and Model

- [x] T001 Add required `User` navigation to `API Graphql/Entities/Models/Inquiry.cs`.
- [x] T002 Map `Inquiry.User` through `UserId` with `DeleteBehavior.Restrict` in `API Graphql/Data/OneItbContext.cs`.
- [x] T003 Keep `[UseProjection]` on `GetInquiries` and verify no explicit `Include` is required.
- [x] T004 Add temporary backend compatibility fields for the current feed query.

## Phase 2: Database Safety

- [x] T005 Run EF pending-model validation.
- [x] T006 Skip `AddInquiryUserRelation` because T005 reported no physical schema change.
- [x] T007 Confirm no seed data changes were made.

## Phase 3: Verification

- [x] T008 Build `API Graphql/OneITB/GraphQL.csproj` in Release with zero errors.
- [x] T009 Start the updated backend on an isolated local port.
- [x] T010 Confirm `Inquiry.user` with a canonical query.
- [x] T011 Execute the exact current feed nested fields without HTTP 400.
- [x] T012 Record exact validation commands and outcomes in `quickstart.md`.

## Phase 4: Documentation Closure

- [x] T013 Recalculate `docs/project_docs/ROADMAP.md` from checklist evidence.
- [x] T014 Insert one feature entry at the top of `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T015 Verify `DEVELOPMENT_LOG.md` remains ordered newest to oldest.
- [x] T016 Update `docs/audit/DOCUMENTATION_STATUS.md`.
- [x] T017 Mark this spec complete only when backend runtime checks pass.
