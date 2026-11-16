# Tasks: Profile Storage and Hydration Resilience

- [x] T001 [P] [US1] Añadir regresiones de red lenta e identidad activa en `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.lifecycle.test.tsx`.
- [x] T002 [US1] Consolidar snapshot de editor en `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`.
- [x] T003 [P] [US2] Añadir tests de provider explícito, rechazo de modo ausente/desconocido, `Local` fuera de Development y configuración Cloudinary incompleta en `API Graphql/Tests/Services.Tests/Uploads`.
- [x] T004 [US2] Implementar selección explícita en `API Graphql/OneITB/Services/Storage/FileStorageRegistration.cs`.
- [x] T005 [US2] Mejorar error y correlación en `API Graphql/OneITB/Controllers/UploadController.cs` y `FrontEnd/OneItb-FE/src/utils/uploadFile.js`.
- [x] T006 [US3] Añadir timeout/cancelación, limpieza local de archivos parciales y smoke automatizado del adapter Cloudinary; registrar el smoke real como bloqueado si no existen credenciales aprobadas.
- [x] T007 Ejecutar suites, builds, persistencia local automatizada y negative cases.
- [x] T008 Actualizar configuración Development/Production, Compose, runbook, audit y evidencia sin secretos.
- [ ] T009 [B] Ejecutar en navegador el ciclo local upload-save-refresh y el smoke contra Cloudinary real con credenciales aprobadas antes de promover la spec a `[V]`.
