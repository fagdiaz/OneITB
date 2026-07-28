# Estado de documentacion

**Ultima verificacion**: 2026-07-28

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md` | Memoria tecnica integral para Practica Profesionalizante III, con UML modular, secuencias, metodologia hibrida, guiones visuales, citas y referencias APA 7 | Vigente; version 1.2 lista para revision de datos personales y conversion a Word/PDF |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 114/116 (98%); core funcional Feature Complete, etapa 186-189 verificada y Specs 190-193 implementadas |
| `docs/project_docs/scope-and-requirements.md` | Alcance, roles y requisitos | Vigente |
| `docs/project_docs/architecture-and-design.md` | Arquitectura alineada al codigo | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion, migraciones y validacion | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de implementaciones | Vigente |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Reporte tecnico vigente para auditoria academica final | Vigente; remediaciones 186-189 verificadas y Specs 190-193 implementadas con evidencia automatizada |

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
| `specs/193-social-bootstrap-hardening` | Implementada: `MutedUntil` bloquea like/unlike sin cambios en reacciones ni notificaciones, `ToggleReaction` devuelve `USER_ERROR`, Apollo se crea de forma estable bajo un boundary exterior y el bootstrap tiene fallback React/DOM sin dependencias de providers. Backend 147/147, frontend 72/72, builds 0/0 y EF sin drift PASS. Smokes autenticado/browser diferidos |
| `specs/192-credential-crypto-hardening` | Implementada: respuesta Magic Link generica, digest SHA-256, entrega SMTP/pickup sin body logs, consumo de fragmento y limpieza URL, BCrypt costo 12 central con upgrade/no downgrade, seeder inyectado y JWT externalizado. Backend 141/141, frontend 61/61, schema real, builds, compose y EF sin drift PASS. SMTP real/browser smoke pendientes |
| `specs/191-query-pagination-hardening` | Implementada: unico contrato social acotado con cancelacion/filtro de autor, consumidores Apollo migrados y estudiantes academicos paginados. Backend 126/126, frontend 59/59, builds 0/0, schema real y EF sin drift PASS. Smokes autenticados y observacion runtime de cancelacion/logs diferidos |
| `specs/190-upload-magiclink-hardening` | Implementada: inspeccion previa a storage, throttling Magic Link por origen/identidad con memoria/Redis y proxy confiable. Backend 115/115, build 0/0, EF sin drift, compose valido y upload runtime valido/hostil PASS. Magic Link runtime smoke diferido; umbral, recuperacion y concurrencia cubiertos por tests deterministas |
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

- Las Specs 186-189 estan verificadas y las Specs 190-193 estan implementadas `[I]`. El cierre tecnico automatizado esta completo; el Code Freeze operativo definitivo queda condicionado a la regresion manual final.
- Spec 190 ya valida magic bytes/estructura antes de almacenar y aplica rate limiting especifico a Magic Link; solo queda el smoke runtime del throttle para elevarla a `[V]`.
- Spec 193 ya aplica `MutedUntil` a reacciones de publicaciones y eleva la frontera de errores por encima de Apollo/Theme con guard previo a React. Falta elevarla de `[I]` a `[V]` mediante smoke autenticado y navegador.
- Existen baselines de pruebas de componentes frontend y de integracion GraphQL con executor real; queda ampliar cobertura hacia regresion visual/browser y SQL Server/Testcontainers para CI avanzado.
- El flujo social de Specs 178/179/181 quedo verificado por tests, schema y smoke REST/GraphQL donde aplica; falta una ultima regresion manual autenticada de portadas, reemplazo de adjuntos, carrusel/PDF, moderacion con motivo y preferencias en el navegador usado para la defensa.
- Falta regresion autenticada en navegador del hub academico para elevar busqueda/categorias/versionado/modal de recursos desde `[I]` a `[V]`.
- Falta regresion visual en navegador de `/empleos` y `/empleos/mis-ofertas`, mas validacion manual del badge realtime con dos sesiones para elevar la UI de empleos/Gestor de Postulaciones a `[V]`.
- Redis Pub/Sub y Cloudinary estan implementados de forma condicional. SMTP es obligatorio en Production, cuenta con smoke GraphQL admin-only y pickup local seguro; quedan pendientes pruebas con un proveedor real para elevarlo a `[V]`.
- Los aliases GraphQL historicos en espanol siguen como compatibilidad temporal.
- El runtime local canonico usa SQL Server 2022 en Docker con SQL Auth por `dotnet user-secrets`; LocalDB/SQLEXPRESS con Windows Auth queda descartado para validar specs.
- Falta verificacion visual en navegador del panel admin completo contra SQL Docker.
- Falta verificacion visual fina en navegador del perfil CV y `/profile/edit`; avatar, carreras y contrato GraphQL normalizado de guardado/lectura ya fueron verificados en runtime.
- El frontend ya cuenta con baseline Vitest/Testing Library; la auditoria de dependencias no identifico una eliminacion segura durante la spec 163 y el vendor split de Vite permanece vigente.
- YouTube ya no monta iframes en el render inicial; los warnings residuales posteriores al click pertenecen al proveedor/navegador.
- Las miniaturas de YouTube usan imagen estatica y los adjuntos de imagen se resuelven contra el backend antes de renderizar inline.
- La spec 170 restauro dependencias con red, ejecuto npm audit productivo y dejo 0 vulnerabilidades conocidas en dependencias frontend runtime.
- Google SSO productivo queda bloqueado hasta disponer de Client ID/secret, callbacks y aprobacion institucional. La ruta publica de certificados usa meta tags runtime; Open Graph perfecto para crawlers exige SSR o HTML renderizado desde backend.
- Las brechas de fuerza bruta de login y DoS por profundidad GraphQL quedaron mitigadas por Spec 171; queda pendiente aplicar la migracion en cada entorno real con secretos definitivos antes de smoke runtime productivo.
- Magic Link devuelve un payload generico, entrega la credencial fuera de banda, almacena solo SHA-256 y limpia el fragmento en React. El flujo pickup automatizado pasa; falta smoke SMTP real/browser.
- Upload valida extension/tipo/tamano y, desde Spec 190, firmas/estructura antes de invocar storage; fixtures validos y hostiles pasaron tests y smoke local.
- Magic Link cuenta con throttling especifico por origen e identidad/credencial, memoria acotada en desarrollo y Redis atomico configurable. El smoke runtime de umbral queda diferido; tests deterministas cubren concurrencia, expiracion y recuperacion.

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
