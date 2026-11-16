# Tasks: Multimedia enriquecida y adjuntos en comentarios

## Phase 1: Setup

- [X] T001 Auditar contratos y componentes vigentes y documentar decisiones
- [X] T002 Ejecutar prerequisitos, checklist y verificacion de ignores

## Phase 2: Backend

- [X] T003 [US2] Agregar `Comment.FileUrl` y configuracion max 500 en entidad/contexto
- [X] T004 [US2] Extender `ISocialService`, `SocialService.AddCommentAsync` y `Mutation.AddComment`
- [X] T005 [US2] Ampliar allowlist de upload para GIF y WebP
- [X] T006 [US2] Generar, revisar y aplicar migracion `AddFileUrlToComment`

## Phase 3: Rich media frontend

- [X] T007 [US1] Crear parser seguro de YouTube y clasificador de archivos en `src/utils/mediaParser.js`
- [X] T008 [US1] Crear `MediaAttachment.jsx` compartido para imagenes y documentos
- [X] T009 [US1] Integrar texto limpio, iframe y adjuntos enriquecidos en `Feed.jsx`
- [X] T010 [US2] Extender query/mutacion Apollo con `Comment.fileUrl`
- [X] T011 [US2] Agregar carga de adjuntos a comentarios y respuestas en `CommentThread.jsx`
- [X] T012 [US2] Renderizar adjuntos compactos dentro del hilo

## Phase 4: Validation and documentation

- [X] T013 Ejecutar build backend, build frontend y validacion EF sin cambios pendientes
- [X] T014 Probar parser con formatos YouTube validos/invalidos y clasificacion de archivos
- [X] T015 Verificar flujo de navegador o registrar bloqueo concreto
- [X] T016 Registrar evidencia en `specs/122-rich-media-comment-files/evidence.md`
- [X] T017 Recalcular `docs/project_docs/ROADMAP.md`
- [X] T018 Insertar una entrada de spec 122 arriba de `docs/audit/DEVELOPMENT_LOG.md`
- [X] T019 Actualizar `docs/audit/DOCUMENTATION_STATUS.md` y verificar orden del log

## Definition Of Done

- [X] Todas las tareas requeridas estan marcadas `[X]`
- [X] Backend y frontend compilan
- [X] La migracion esta aplicada y el modelo EF sincronizado
- [X] Los contratos existentes sin archivo siguen siendo compatibles
- [X] La evidencia distingue implementado, verificado y bloqueado
