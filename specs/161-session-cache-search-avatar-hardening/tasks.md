# Tasks: Spec 161 Session Cache, Search and Avatar Hardening

## Phase 1: Session Bleed and Apollo Cache

- [x] T001 Expose a safe Apollo cache clearing method from `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`.
- [x] T002 Update `FrontEnd/OneItb-FE/src/context/AuthContext.jsx` logout to clear Apollo memory in addition to storage and React auth state.
- [x] T003 Add explicit Apollo `Query` field policies for feed and messaging result sets in `GraphqlProvider.js`.

## Phase 2: Search and Authentication Copy

- [x] T004 Update `API Graphql/OneITB/GraphQL/Query.cs` so public profile search includes `Account.Email`.
- [x] T005 Replace visible `Contrasena`/`contrasena` strings in auth forms with `Contraseña`/`contraseña`.

## Phase 3: Registration Production Rules

- [x] T006 Confirm `Register.jsx` keeps role as a single non-admin select.
- [x] T007 Update `Register.jsx` institutional email regex to `^[a-zA-Z0-9._%+-]+@itbeltran\.com\.ar$` and keep a friendly validation error.

## Phase 4: Avatar Canvas Export Fidelity

- [x] T008 Refactor `AvatarEditorModal.jsx` zoom/effective scale math so the slider supports values below `1` while the canvas stays covered.
- [x] T009 Remove the mismatched inner crop mask so the visible square preview equals the exported square JPEG.
- [x] T010 Verify export uses the same canvas pipeline as preview with pan, zoom, rotation, flip, filters and vignette.

## Phase 5: Validation and Documentation

- [x] T011 Run `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
- [x] T012 Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- [x] T013 Record validation evidence in `specs/161-session-cache-search-avatar-hardening/evidence.md`.
- [x] T014 Add one newest-first entry to `docs/audit/DEVELOPMENT_LOG.md`.
- [x] T015 Update `docs/audit/DOCUMENTATION_STATUS.md`.
