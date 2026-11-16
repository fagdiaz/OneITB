# Tasks: Archivos adjuntos en publicaciones

**Input**: Design documents from `specs/121-file-upload-inquiries/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/upload-api.md`

## Phase 1: Setup and baseline

- [X] T001 Confirmar implementacion heredada y registrar la estrategia de renombrado en `specs/121-file-upload-inquiries/research.md`
- [X] T002 Verificar hooks, prerequisitos, checklist e ignores del repositorio

## Phase 2: Backend persistence and upload

- [X] T003 [US1] Renombrar `AttachedFileUrl` a `FileUrl` en `API Graphql/Entities/Models/Inquiry.cs` y `API Graphql/Data/OneItbContext.cs`
- [X] T004 [US1] Normalizar servicio y mutacion `addInquiry` en `API Graphql/Services/Social/` y `API Graphql/OneITB/GraphQL/Mutation.cs`
- [X] T005 [US1] Reemplazar la carga heredada por `POST /api/upload` autenticado y limitado en `API Graphql/OneITB/Controllers/UploadController.cs`
- [X] T006 [US1] Verificar `UseStaticFiles` y excluir `API Graphql/OneITB/wwwroot/uploads/` en `.gitignore`
- [X] T007 [US1] Generar y revisar migracion `AddFileUrlToInquiry` como renombrado sin perdida en `API Graphql/Data/Migrations/`

## Phase 3: Frontend integration

- [X] T008 [US1] Actualizar query y mutacion Apollo a `fileUrl` en `FrontEnd/OneItb-FE/src/data/graphql/`
- [X] T009 [US1] Implementar selector oculto, carga REST y bloqueo de doble envio en `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [X] T010 [US1] Renderizar URL estatica del adjunto desde la tarjeta en `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
- [X] T011 [US2] Confirmar que el submit sin archivo envia `fileUrl: null`
- [X] T012 [US3] Mostrar errores de carga y estado `Subiendo...`

## Phase 4: Validation and documentation

- [X] T013 Aplicar la migracion y validar ausencia de cambios pendientes del modelo EF
- [X] T014 Ejecutar build Release del backend y build Vite del frontend
- [X] T015 Ejecutar los contratos HTTP/GraphQL y el flujo de navegador, o registrar el bloqueo concreto
- [X] T016 Registrar evidencia real en `specs/121-file-upload-inquiries/evidence.md`
- [X] T017 Recalcular `docs/project_docs/ROADMAP.md` desde sus checklists
- [X] T018 Insertar una unica entrada de spec 121 arriba en `docs/audit/DEVELOPMENT_LOG.md`
- [X] T019 Verificar orden descendente del log y actualizar `docs/audit/DOCUMENTATION_STATUS.md`

## Definition Of Done

- [X] All required tasks are marked `[X]`
- [X] Backend and frontend builds pass
- [X] Migration preserves existing attachment URLs
- [X] Runtime checks are recorded honestly
- [X] Roadmap and audit documents match the evidence
