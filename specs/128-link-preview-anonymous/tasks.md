# Tasks — 128-link-preview-anonymous

## Phase 1: Backend

- [x] T001 Crear `LinkPreviewController.cs` con `[AllowAnonymous]`, ruta `api/link-preview`, SSRF protection en `API Graphql/OneITB/Controllers/LinkPreviewController.cs`
- [x] T002 Eliminar `LinkInfoController.cs` (reemplazado)

## Phase 2: Frontend

- [x] T003 `Feed.jsx`: GET limpio a `/api/link-preview` sin jwt/Authorization/credentials
- [x] T004 `MediaComponent.jsx`: GET limpio a `/api/link-preview` sin jwt/Authorization/credentials

## Phase 3: Validation

- [x] T005 Backend build — 0 Errores
- [x] T006 Frontend build — 0 Errores
- [x] T007 Actualizar DEVELOPMENT_LOG.md
