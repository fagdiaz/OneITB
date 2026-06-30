# Estado de documentacion

**Ultima verificacion**: 2026-06-30

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 67/77 (87%) |
| `docs/project_docs/scope-and-requirements.md` | Alcance, roles y requisitos | Vigente |
| `docs/project_docs/architecture-and-design.md` | Arquitectura alineada al codigo | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion, migraciones y validacion | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de implementaciones | Vigente |
| `.specify/memory/constitution.md` | Reglas superiores del proyecto | Vigente, v1.4.0 |
| `AGENTS.md` | Reglas operativas para agentes | Vigente |

## Documentacion complementaria

| Documento | Proposito |
|---|---|
| `docs/academic/01-project-overview.md` | Presentacion academica |
| `docs/academic/02-software-requirements.md` | Resumen academico de requisitos |
| `docs/academic/03-use-cases.md` | Casos de uso principales |
| `docs/academic/04-design-diagrams.md` | Diagramas resumidos |
| `docs/audit/HISTORICAL_AUDITS.md` | Auditorias supersedidas consolidadas |

## Evidencia reciente

| Spec | Estado verificable |
|---|---|
| `specs/152-master-quality-interconnectivity-fixes/` | Master quality fixes: rutas reales de perfil auditadas, archivo fantasma eliminado, metricas normalizadas, avatares defensivos, print A4 puro y spotlight header; builds backend/frontend verificados |
| `specs/149-cv-component-abstraction-ux-polish/` | Impresion formal del CV desde `/profile` abstraida en template reutilizable; build frontend verificado |
| `specs/148-profile-data-binding-fixes/` | Avatar persistente, carreras editables desde perfil y normalizacion de identidad verificados por migracion, build y runtime REST/GraphQL |
| `specs/151-ux-fixes-cancel-avatar-metrics-print/` | UX fixes en perfiles y avatars en el nav/header y posts |
| `specs/150-ux-print-polish/` | UX polish: Portfolio Social print:hidden, fallback imagen rota, botón cerrar comentarios, métricas '—'; build verificado |
| `specs/147-profile-cv-print-styles/` | Estilos @media print para UserProfile.tsx: header blanco, layout 1 col, botones ocultos, URLs textuales; build verificado |
| `specs/146-data-normalization/` | Normalizacion a Title Case de Nombres/CV y de Email a lower case verificada |
| `specs/146-enterprise-profile-cv-normalization/` | Perfil/CV enterprise normalizado en tablas relacionales; migracion con traslado desde JSON, builds y runtime GraphQL verificados |
| `specs/145-profile-cv-schema-normalization/` | Transicion MVP con `CvDataJson`; supersedida por spec 146 para persistencia final |
| `specs/144-profile-cv-consolidation/` | Edicion de perfil/CV consolidada sobre query `me`; build backend/frontend verificados, browser runtime pendiente |
| `specs/143-login-error-handling/` | Crash de login por `data.login` indefinido documentado y reconciliado; build frontend verificado |
| `specs/142-profile-as-cv/` | Perfil redisenado como CV institucional; build frontend verificado, browser runtime pendiente |
| `specs/141-auth-ux-fixes/` | F5 en rutas protegidas y errores de login documentados y reconciliados; builds backend/frontend verificados |
| `specs/140-nullability-strict-fix/` | Implementada; backend build limpio (0 warnings) validado sin usar supresiones `<NoWarn>` |
| `specs/139-quick-wins/` | Implementada; advertencias de compilacion frontend/backend silenciadas (Vite chunk size, CS nullability) |
| `specs/138-p2-closure-qa/` | Diagramas Mermaid academicos actualizados; xUnit/Moq para `AcademicService` y `NotificationService` pasando 12/12 |
| `specs/137-siu-notifications/` | SIU mock, upsert de notas, notificaciones persistentes, preferencias y subscription privada verificados contra Docker SQL |
| `specs/136-academic-module/` | Recursos por materia y progreso/notas implementados; runtime GraphQL contra Docker SQL verificado |
| `specs/099-social-admin-ecosystem/` | Feed social, seed y administracion verificados end-to-end |
| `specs/104-realtime-private-messaging/` | Mensajeria persistente y tiempo real verificados |
| `specs/118-end-to-end-subjects-module/` | Implementada; migracion/build verificados, runtime reciente bloqueado |
| `specs/119-superadmin-security/` | Implementada; builds verificados, runtime reciente bloqueado |
| `specs/121-file-upload-inquiries/` | Implementada; migracion/build verificados, runtime reciente bloqueado |
| `specs/122-rich-media-comment-files/` | Implementada; migracion/build/parser verificados, runtime reciente bloqueado |
| `specs/123-link-preview/` | Implementada; endpoint/build verificados, runtime reciente bloqueado |
| `specs/129-console-runtime-cleanup/` | Implementada; builds/schema/seguridad verificados, chat y preview publico pendientes en entorno normal |
| `specs/130-presentation-runtime-baseline/` | Implementada; puerto/DataProtection/CORS/media estáticos verificados, feed autenticado bloqueado por SQL SSPI y certificado HTTPS |
| `specs/131-media-embed-console-contract/` | Implementada; YouTube click-to-load y build frontend verificados, feed autenticado bloqueado por SQL SSPI y certificado HTTPS |
| `specs/132-realtime-chat-console-contract/` | Draft; consolidado posteriomente en estabilizacion general y quick-wins |
| `specs/133-media-preview-stabilization/` | Implementada; miniaturas YouTube, resolucion de imagenes upload y builds verificados |
| `specs/134-local-backend-runtime-unblock/` | Implementada; backend local, HTTPS y GraphQL smoke test verificados |
| `specs/135-core-stabilization-sprint/` | Paginacion feed, cleanup uploads, auditoria persistente y runtime local Docker SQL verificados end-to-end |

## Brechas vigentes

- Busqueda, categorias y versionado de recursos permanece pendiente en el modulo academico.
- Faltan suites automatizadas de autenticacion, feed, GraphQL y componentes; la base backend ya cubre servicios academicos y notificaciones.
- Pub/sub y almacenamiento de archivos sirven a una sola instancia.
- Los aliases GraphQL historicos en espanol siguen como compatibilidad temporal.
- El runtime local canonico usa SQL Server 2022 en Docker con SQL Auth por `dotnet user-secrets`; LocalDB/SQLEXPRESS con Windows Auth queda descartado para validar specs.
- Falta verificacion visual en navegador del panel admin completo contra SQL Docker.
- Falta verificacion visual fina en navegador del perfil CV y `/profile/edit`; avatar, carreras y contrato GraphQL normalizado de guardado/lectura ya fueron verificados en runtime.
- El frontend conserva deuda de dependencias y tamano de bundle.
- YouTube ya no monta iframes en el render inicial; los warnings residuales posteriores al click pertenecen al proveedor/navegador.
- Las miniaturas de YouTube usan imagen estatica y los adjuntos de imagen se resuelven contra el backend antes de renderizar inline.

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
