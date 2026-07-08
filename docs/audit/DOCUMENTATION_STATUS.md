# Estado de documentacion

**Ultima verificacion**: 2026-07-07

## Fuentes canonicas

| Documento | Proposito | Estado |
|---|---|---|
| `README.md` | Unico indice general del repositorio | Vigente |
| `docs/project_docs/ROADMAP.md` | Unica fuente de avance, estabilizacion y prioridades | Vigente, 92/95 (97%) |
| `docs/project_docs/scope-and-requirements.md` | Alcance, roles y requisitos | Vigente |
| `docs/project_docs/architecture-and-design.md` | Arquitectura alineada al codigo | Vigente |
| `docs/audit/RUNBOOK_DEV.md` | Ejecucion, migraciones y validacion | Vigente |
| `docs/audit/DEVELOPMENT_LOG.md` | Historial inverso de implementaciones | Vigente |
| `docs/audit/FINAL_AUDIT_REPORT.md` | Reporte tecnico vigente para auditoria academica final | Vigente |

## Documentacion complementaria

| Documento | Proposito |
|---|---|
| `docs/academic/01-project-overview.md` | Presentacion academica |
| `docs/academic/02-software-requirements.md` | Resumen academico de requisitos |
| `docs/academic/03-use-cases.md` | Casos de uso principales |
| `docs/academic/04-design-diagrams.md` | Diagramas resumidos |
| `docs/audit/HISTORICAL_AUDITS.md` | Auditorias supersedidas consolidadas; no representa el estado actual |
| `core-web/` | Paquete compacto de contexto para Gemini/external AI; no es fuente canonica |
| `.specify/`, `.agents/`, `AGENTS.md`, `specs/` | Tooling local de agentes y evidencia granular; ignorado en el repo profesional |

## Evidencia reciente

| Spec | Estado verificable |
|---|---|
| `specs/175-jobs-module-and-enterprise-seeder/` | Modulo de empleos implementado end-to-end: `JobOffer`, FK restrictiva, migracion `AddJobOffers`, `jobOffers`, `createJobOffer`, `jobOfferCreated`, `/empleos`, badge realtime en Nav y seeder enterprise relacional por fases. Backend build PASS, EF sin cambios pendientes, backend tests 38/38, frontend build PASS y smoke GraphQL HTTP autenticado PASS; Vitest bloqueado por EPERM en cache temporal de `node_modules/.vite-temp` |
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

- Existen baselines de pruebas de componentes frontend y de integracion GraphQL con executor real; queda ampliar cobertura hacia regresion visual/browser y SQL Server/Testcontainers para CI avanzado.
- Falta regresion autenticada en navegador del hub academico para elevar busqueda/categorias/versionado/modal de recursos desde `[I]` a `[V]`.
- Falta regresion visual en navegador de `/empleos` y validacion manual del badge realtime con dos sesiones para elevar la UI de empleos a `[V]`.
- Redis Pub/Sub y Cloudinary estan implementados de forma condicional; quedan pendientes smoke tests productivos con secretos reales para elevarlos a `[V]`.
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

Ante contradicciones, prevalecen codigo, esquema ejecutado y evidencia runtime. Los porcentajes se recalculan exclusivamente desde los checklists de `ROADMAP.md`.
