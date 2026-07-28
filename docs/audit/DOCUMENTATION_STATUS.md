# Estado de documentacion

**Ultima verificacion**: 2026-07-28

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | Memoria tecnica integral para Practica Profesionalizante III, con UML modular, secuencias, metodologia hibrida, guiones visuales, citas y referencias APA 7 | Vigente; version 1.2 lista para revision de datos personales y conversion a Word/PDF |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 115/116 (99%); core funcional Feature Complete, Specs 186-195 verificadas localmente y SSO institucional bloqueado |
| `docs/project_docs/scope-and-requirements.md` | Alcance, roles y requisitos | Vigente |
| `docs/project_docs/architecture-and-design.md` | Arquitectura alineada al codigo | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion, migraciones y validacion | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de implementaciones | Vigente |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Reporte tecnico vigente para auditoria academica final | Vigente; matriz 186-193 y aceptaciones 194-195 alineadas, con resolucion, evidencia y gate residual por hallazgo |

## Documentacion complementaria

| Documento | Proposito |
|---|---|
| `docs/academic/01-project-overview.md` | Presentacion academica |
| `docs/academic/02-software-requirements.md` | Resumen academico de requisitos |
| `docs/academic/03-use-cases.md` | Casos de uso principales |
| `docs/academic/04-design-diagrams.md` | Diagramas resumidos |
| `docs/entrega_final/GUIA_MAQUETACION_FINAL.md` | Guia 2.0 definitiva para producir 10 diagramas Mermaid, 3 graficos de gestion, convertir a DOCX/PDF y auditar APA 7 |
| `core-web/` | Paquete compacto de contexto para Gemini/external AI; no es fuente canonica |
| `.specify/`, `.agents/`, `AGENTS.md`, `specs/` | Tooling local de agentes y evidencia granular; ignorado en el repo profesional |

## Evidencia reciente

| Spec | Estado verificable |
|---|---|
| `specs/195-local-infrastructure-and-moderator-acceptance` | Moderador canonico/idempotente y JWT/limites cubiertos; Redis cross-provider y aislamiento de topic verificados; tres escenarios SMTP capturados en Mailpit; backend 152/152, frontend 79/79, builds y EF PASS; cleanup de contenedores/puertos y preservacion SQL comprobados. Proveedores publicos y WebSocket de red siguen `[B]` |
| `specs/194-final-operational-acceptance` | Aceptacion local cerrada: backend 147/147, frontend 79/79, builds Release/Vite, EF sin drift, Compose y diff-check PASS. Runtime ya ejecutado para uploads, paginacion, silenciamiento y Magic Link; navegador limpio con Estudiante, Profesor, Egresado, Administrador y Empleador, incluido A -> logout -> B. Moderator, dos sesiones realtime y SMTP/Redis/Cloudinary reales quedan `[B]` por ambiente/configuracion |
| `specs/193-social-bootstrap-hardening` | Verificada localmente: `MutedUntil` bloquea like/unlike con cero delta de reaccion/notificacion; Apollo y providers permanecen bajo frontera global. Backend 147/147, frontend 79/79 y navegador sin errores propios |
| `specs/192-credential-crypto-hardening` | Verificada localmente: respuesta Magic Link generica, digest SHA-256, pickup, consumo unico/replay y limpieza de credencial ejecutados; BCrypt central y JWT externalizado cubiertos. SMTP real permanece `[B]` |
| `specs/191-query-pagination-hardening` | Verificada localmente: contrato social acotado, orden/deduplicacion/next page/filtro de autor y paginacion academica con autorizacion ejecutados; cancelacion mantiene cobertura sin escritura |
| `specs/190-upload-magiclink-hardening` | Verificada localmente: PDF valido aceptado, ejecutable renombrado y PDF truncado rechazados; limites Magic Link y recuperacion cuentan con evidencia previa. Redis distribuido permanece `[B]` |
| `specs/186-189` | Cierre de seguridad verificado: JWT central y Magic Link atomico; cancelacion end-to-end con guard automatizado; frontera de sesion Apollo/React/WebSocket; matriz declarativa de 42 mutaciones. Backend 82/82, frontend 54/54, builds PASS, EF sin drift, GraphQL runtime y browser smoke PASS |
| `specs/185-media-notification-polish/` | Media Grid orientado por dimensiones, dos YouTube con limite UI/backend, PDF con primera hoja y pie de acciones, logo/nombres legibles en dark, transicion de tema accesible, textura global visible, preferencias en portal y badge estrictamente no leido. Backend 65/65, frontend 49/49, builds PASS, Vite 858 ms en el gate final, EF sin drift, npm audit 0 vulnerabilidades y runtime GraphQL HTTP 200; regresion visual manual pendiente |
| `specs/184-qa-master-polish-and-layout/` | Header auto-hide defensivo, Footer unificado, textura global, dark mode suavizado, compositor acotado, mosaico mixto con portada/YouTube/overflow, menciones respaldadas por identidad, preferencias en drawer y deep-link laboral exacto. Backend 63/63, frontend 39/39, builds PASS, Vite 1.19 s, npm audit 0 vulnerabilidades y schema GraphQL runtime HTTP 200; regresion visual manual pendiente |
| `specs/183-premium-branding-landing/` | Identidad final normalizada en cuatro assets canonicos, Header con isotipo aprobado y landing institucional unica Clean Tech/Tech Noir. Spotlight usa RAF sin re-render, reveals respetan reduced-motion y limpian observers; los PNG de fondo de 4.47/5.12 MB quedan fuera del bundle. Frontend 31/31, Vite build PASS en 941 ms, npm audit 0 vulnerabilidades y diff-check PASS; aprobacion visual responsive/manual pendiente |
| `specs/182-qa-session4-feed-hierarchy-and-media-grid/` | Mosaico acotado 4/3, portada PDF por worker local diferido, respuestas dirigidas sin tercer nivel, deep-link exacto con highlight, widget no leido independiente y follow/unfollow explicito. Migracion aplicada a Docker SQL, EF sin drift, tests backend 62/62, frontend 25/25, Vite build PASS, npm audit 0 vulnerabilidades y smoke GraphQL autenticado PASS; regresion visual manual pendiente |
| `specs/181-qa-session3-media-moderation/` | Portada multimedia y carrusel, PDF por Blob URL, reemplazo de adjuntos, texto expandible, reaccion unificada, nesting maximo de dos niveles, edicion exclusiva del autor, ocultamiento moderado auditado, badges de chat, recordatorio idempotente con reintentos de concurrencia y preferencias separadas. Migracion aplicada a Docker SQL, EF sin drift, backend 0/0 y tests 55/55, frontend tests 18/18 y Vite build PASS; schema/runtime HTTP 200. La regresion visual autenticada final queda explicitamente pendiente |
| `specs/180-final-release-candidate-audit/` | Auditoria Release Candidate ejecutada: Git hygiene revisado, builds/tests backend y frontend PASS, EF sin drift, runtime GraphQL HTTP 200 contra Docker SQL y contratos criticos auditados. Se corrigio idempotencia del `EnterpriseDemoSeeder` para `JobApplications` ya existentes por `Id` y por par `JobOfferId + ApplicantId`, evitando fallos de arranque sobre bases demo previamente pobladas |
| `specs/179-social-polish-quick-wins/` | Quick wins del muro implementados: enlace copiable por publicacion con deep-link estable, drag-and-drop de adjuntos reutilizando validaciones existentes, restauracion de foco en visores/listado de reacciones, guard contra cargas duplicadas y fallback de preview de enlaces rotos. Frontend tests PASS 12/12 y Vite build PASS |
| `specs/178-qa-session2-social-core-fixes/` | Nucleo social estabilizado: scoping de materias backend/UI, `SocialAttachment`, `CommentReaction`, adjuntos multiples con nombre original, galeria multimedia no excluyente, visores, autofocus, listado paginado de likes, notificaciones agrupadas con deep-link, footer y retiro del compositor legacy del sidebar. Migracion aplicada a Docker SQL, EF sin cambios pendientes, backend build PASS, tests 47/47, frontend tests 6/6, build Vite PASS y smoke GraphQL autenticado PASS. Browser QA fue parcial: detecto el sidebar duplicado y motivo el fix; la recarga post-fix quedo bloqueada por politica de URL de la herramienta |
| `specs/175-privacy-controls-and-smoke-tests/` | Controles de privacidad implementados: `User.IsPublicProfile`, migracion `AddUserProfilePrivacy`, `toggleProfilePrivacy`, masking backend-side en `publicProfile`/`searchPublicProfiles`, switch en `/profile/edit` con toast local, badges de perfil privado en busqueda, y `testSmtpConnection` admin-only con errores controlados. Backend build PASS, backend tests 39/39, frontend build PASS, EF sin cambios pendientes y diff-check PASS; smoke runtime temporal bloqueado por revisor automatico del entorno Codex al iniciar proceso persistente |
| `docs/` audit 2026-07-08 | Registro historico de la normalizacion institucional. La configuracion de correo opcional documentada en ese corte fue reemplazada por la politica Production/pickup de Spec 192 |
| `specs/174-ux-alignment-and-smtp/` | Registro historico del primer adaptador SMTP y terminologia laboral. Su fallback de consola fue retirado por Spec 192; actualmente Production exige SMTP y Development usa pickup `.eml` ignorado |
| `specs/173-enterprise-jobs-ats-seeder-qa/` | Modulo de empleos y Gestor de Postulaciones implementado end-to-end: `JobOffer`, `JobApplication`, FKs restrictivas, indice unico por oferta/postulante, migraciones `AddJobOffers` y `AddJobApplications`, `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus`, `jobOfferCreated`, `/empleos`, `/empleos/mis-ofertas`, badge realtime en Nav y seeder enterprise con postulaciones. Backend build PASS, EF sin cambios pendientes, backend tests 38/38 y frontend build PASS; Vitest bloqueado por EPERM en cache temporal de `node_modules/.vite-temp` y smoke runtime bloqueado por restriccion del entorno Codex al iniciar proceso temporal |
| `specs/171-production-security-and-seeding/` | Hardening final de seguridad/backend: profundidad maxima GraphQL configurable, paging global, lockout persistente por cuenta, migracion `AddAccountLockout`, seeding demo/productivo configurable sin reset de passwords existentes, backend build PASS, backend tests 38/38, EF sin cambios pendientes y compose productivo validado con `ONEITB_SEED_DEMO_PASSWORD` efimero |
| `specs/170-cloud-devops-scalability/` | Preparacion cloud/devops: Dockerfiles multi-stage API/Web, `docker-compose.prod.yml` con SQL Server/Redis/API/Nginx, Redis Pub/Sub condicional con fallback InMemory, Cloudinary opcional con fallback local, rate limiting, security headers, healthcheck, npm audit productivo 0 vulnerabilidades, backend build PASS, backend tests 35/35, frontend tests 3/3, frontend build PASS, compose config/build PASS |
| `specs/169-final-qa-and-hardening/` | Code Freeze hardening: `GraphQLErrorFilter` para sanitizar errores inesperados, `GlobalErrorBoundary` institucional, baseline Vitest/Testing Library para `CertificateExport` (3/3), baseline de integracion GraphQL con executor real HotChocolate + EF Core InMemory, workflow CI ejecuta tests frontend, backend tests 35/35, frontend build PASS; `npm audit --omit=dev` bloqueado por endpoint npm |
| `specs/168-wow-production-polish/` | Over-delivery institucional: `AuditLog` + `AuditSaveChangesInterceptor`, migracion `AddAuditLogs` generada/aplicada, `auditLogs` admin-only, `publicCertificate` para progreso aprobado, export CSV/impresion de constancias en `/academic`, ruta publica `/certificate/:id` y toasts globales por `notificationReceived`; backend build, tests 34/34, frontend build y schema smoke HTTP verificados; SSO Google queda bloqueado por credenciales OAuth reales |
| `specs/167-production-readiness-hardening/` | Hardening de produccion: middleware de correlation id, logging estructurado de metodo/path/status/duracion, metricas GraphQL sociales con DataLoaders para evitar N+1, smoke runtime GraphQL HTTP 200 con `X-Correlation-ID`, metric smoke admin y backend tests 34/34; build host PASS con cache NuGet local y warnings `NU1900` por metadata de vulnerabilidades inaccesible |
| `specs/166-roadmap-quality-closure/` | Cierre de calidad roadmap/docs: tests backend de auth/feed agregados y pasando 34/34, bug de login con usuario inactivo corregido, busqueda social normalizada, workflow `quality-gates.yml` agregado, workflows Azure actualizados a .NET/actions vigentes, README/project_docs/academic/runbook alineados; build frontend y `git diff --check` verificados, build final del host .NET bloqueado por NuGet/red tras intento de EF restore |
| `specs/165-academic-hub-hardening/` | Cierre de brechas de Specs 163/164: upload academico convertido a modal, busqueda local instantanea por titulo, mutaciones de recursos con Apollo cache update, alias GraphQL `resourcesBySubject`, feed social con `AsSplitQuery` y respuestas anidadas; tests backend 16/16, backend Release, frontend build, schema smoke y `git diff --check` verificados |
| `specs/164-academic-hub-resources/` | Hub academico de recursos implementado: `AcademicResource` agrega categoria/version, filtros GraphQL por materia/busqueda/categoria, `uploadAcademicResource`, `deleteResource` soft-delete, UI `/academic` con sidebar/filtros/grid/upload y migracion `AddAcademicResourceCategoryVersion`; tests backend 16/16, backend Release, frontend build, migracion aplicada y schema GraphQL temporal validados |
| `specs/163-zero-debt-audit/` | Deuda tecnica acotada: Apollo agrega key policies para entidades principales y cache scope de `academicResources`, el servicio academico usa graph loading explicito con `AsSplitQuery`, Vite conserva vendor split y no se eliminaron dependencias sin evidencia fuerte; builds backend/frontend verificados |
| `specs/162-session-boundary-header-fix/` | Bleed de sesion en Header corregido: `/logout` usa `AuthContext.logout()`, login/logout limpian Apollo en frontera de sesion, `Query.me` y notificaciones tienen policies de reemplazo, y Header/GlobalSearch/Profile Edit ignoran `me` si no coincide con `auth.id`; build frontend y checks estaticos verificados, QA manual usuario A -> usuario B pendiente |
| `specs/161-session-cache-search-avatar-hardening/` | Session bleed mitigado con `clearStore()` en logout/expiracion, Apollo type policies para feed/mensajes, busqueda de perfiles por email, registro institucional/copy de contrasena y export de avatar 1:1 con preview; builds backend/frontend verificados, smoke GraphQL bloqueado por certificado HTTPS dev local ausente/vencido |
| `specs/160-registration-avatar-chat-search-hardening/` | Registro con rol/carreras, retencion de avatar, canvas clamp, chat con avatares/no leidos/sin presencia falsa y filtros inteligentes implementados; builds backend/frontend verificados, runtime/browser QA pendiente |
| `specs/159-auth-guard-search-scope-avatar-math/` | Guardias anonimos, selector `Todas`, scoping cross-career backend, metricas de perfil acotadas, contactos de CV unificados y editor de avatar con crop cuadrado/zoom 0.1/drag-to-pan; builds backend/frontend verificados |
| `specs/158-masterization-navigation-search-cv-avatar/` | Masterizacion UX: navegacion activa estricta por ruta, notificaciones iluminadas al abrirse, busqueda global multi-filtro con materias por codigo/nombre, publicaciones por autor/comentarios con `careerIds`, resultados paginados de 15, contactos de CV semanticos y editor de avatar canvas compacto; builds backend/frontend verificados |
| `specs/157-core-ux-session-header-constraints/` | Core UX/session/header constraints: active glow por `useLocation`, logo estatico, omni-search como popover, Light Mode por defecto anonimo/no-preferencia, toggles de password y expiracion JWT interceptada; build frontend verificado |
| `specs/156-header-omni-search-print-stabilization/` | Header/omni-search/print estabilizados: logo estatico, overlay sin doble input, perfiles publicos buscables con query segura, filtros por carreras de `me`, avatar real hidratado y modal de impresion CV; builds backend/frontend verificados |
| `specs/155-ux-master-polish-grid-layout/` | UX master polish: Header reordenado con buscador expansible, active glow por ruta, perfil en grid responsivo, WhatsApp link, `/profile/edit` con Tech Noir y CV print unificado; build frontend verificado |
| `specs/154-ui-consistency-theme-polish/` | Pulido de consistencia UI: Header brand oscuro restaurado, glow homogéneo, widget de chat compacto, comentarios/academico/admin con Tech Noir y CV print limpio; build frontend verificado |
| `specs/153-tech-noir-clean-tech-theming/` | Sistema visual Clean Tech / Tech Noir implementado con ThemeContext, bootstrap anti-FOUC, selector en Header y build frontend verificado |
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

- No quedan hallazgos criticos o altos de las Specs 186-193 en condicion vulnerable
  original. La Spec 194 cerro sus gates locales y la regresion A -> logout -> B.
- La identidad Moderador, su JWT, permisos representativos y seed idempotente quedaron
  verificados. El recorrido visual completo de ese rol sigue dentro de la auditoria
  manual previa a la defensa, no como bloqueo de codigo.
- Redis distribuido quedo verificado localmente entre dos proveedores independientes,
  con entrega exacta y aislamiento de topic. El handshake WebSocket de red con dos
  navegadores permanece bloqueado por la restriccion de no iniciar servidores.
- SMTP local quedo verificado contra Mailpit y Cloudinary conserva su fallback local.
  Los proveedores SMTP/Cloudinary publicos requieren secretos no versionados y ambiente
  aprobado; no se presentan como smokes productivos.
- Google SSO sigue bloqueado hasta disponer de Client ID/secret, callbacks y aprobacion
  institucional. Open Graph perfecto para crawlers exige SSR o HTML desde backend.
- React Router 6.30.4 conserva dos advisories moderados upstream y cero altos/criticos.
  OneITB no usa SSR y sanitiza destinos internos de notificaciones; la version 7.x
  evaluada se descarto porque introducia advisories altos en el corte de Code Freeze.
- La medicion del costo BCrypt debe repetirse sobre el hardware objetivo antes de un
  despliegue publico.
- El runtime local canonico sigue siendo SQL Server 2022 en Docker con SQL Auth por
  `dotnet user-secrets`; LocalDB/SQLEXPRESS con Windows Auth no es un gate valido.
- Azure App Service/SQL y el ecosistema movil permanecen como evolucion posterior a la
  entrega academica, no como deuda del core Feature Complete.

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
