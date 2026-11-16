# Tasks: Frontend Console Runtime Cleanup

## Phase 1: Diagnosis and baseline

- [x] T001 Classify `errores.txt` findings in `specs/129-console-runtime-cleanup/research.md`
- [x] T002 Run `.agents/skills/speckit-qa/scripts/preflight.ps1`

## Phase 2: User Story 1 - Clean application console

- [x] T003 [US1] Skip collapsed subscriptions in `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
- [x] T004 [US1] Ignore expected subscription shutdown in `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
- [x] T005 [US1] Record feed and chat browser checks in `specs/129-console-runtime-cleanup/evidence.md`

## Phase 3: User Story 2 - Safe link previews

- [x] T006 [US2] Replace the anonymous controller with a bounded SSRF-safe service in `API Graphql/Services/LinkPreviews/`
- [x] T007 [US2] Expose the JWT-authenticated query in `API Graphql/OneITB/GraphQL/Query.cs` and `API Graphql/OneITB/Startup.cs`
- [x] T008 [US2] Replace REST fetches with Apollo in `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` and `MediaComponent.jsx`
- [x] T009 [US2] Record public and unsafe target checks in `specs/129-console-runtime-cleanup/evidence.md`

## Phase 4: Quality and documentation

- [x] T010 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
- [x] T011 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`
- [x] T012 Re-run QA and record residual risk in `specs/129-console-runtime-cleanup/evidence.md`
- [x] T013 Update `docs/project_docs/ROADMAP.md` from evidence
- [x] T014 Add one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`
- [x] T015 Update `docs/audit/DOCUMENTATION_STATUS.md` when canonical status changes

## Dependencies

- T003-T004 and T006-T009 depend on T002.
- T010-T015 depend on implementation tasks.

## Definition Of Done

- [x] All required tasks are checked.
- [ ] Clean-browser application console is clean.
- [ ] Messaging remains real time while chat is open.
- [x] Unsafe preview targets are rejected and valid GraphQL is executed.
- [x] Builds, evidence, and canonical documentation are complete.
