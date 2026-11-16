# Tasks — 127-link-preview-adblocker-bypass

## Phase 1: Backend Refactor

- [x] T001 Renombrar `MetadataController.cs` a `LinkInfoController.cs` y actualizar clase y ruta en `API Graphql/OneITB/Controllers/LinkInfoController.cs`
- [x] T002 Eliminar `.AllowCredentials()` de la política CORS en `API Graphql/OneITB/Startup.cs`

## Phase 2: Frontend Refactor

- [x] T003 [P] En `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`: cambiar endpoint a `/api/link-info` y eliminar `credentials: 'include'`
- [x] T004 [P] En `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`: cambiar endpoint a `/api/link-info` y eliminar `credentials: 'include'`

## Phase 3: Validation

- [x] T005 Compilar backend: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release` — verificar 0 errores
- [x] T006 Compilar frontend: `npm run build` desde `FrontEnd/OneItb-FE` — verificar 0 errores
- [x] T007 Registrar evidencia en `specs/127-link-preview-adblocker-bypass/evidence.md`
- [x] T008 Actualizar `docs/audit/DEVELOPMENT_LOG.md`
