# Reporte final de auditoria tecnica - OneITB23

**Fecha**: 2026-07-12
**Specs de referencia**: `specs/171-production-security-and-seeding/`, `specs/173-enterprise-jobs-ats-seeder-qa/`, `specs/174-ux-alignment-and-smtp/`, `specs/175-privacy-controls-and-smoke-tests/`, `specs/178-qa-session2-social-core-fixes/`, `specs/179-social-polish-quick-wins/`, `specs/180-final-release-candidate-audit/`, `specs/181-qa-session3-media-moderation/`, `specs/182-qa-session4-feed-hierarchy-and-media-grid/`, `specs/183-premium-branding-landing/`, `specs/184-qa-master-polish-and-layout/`
**Estado global del roadmap**: 98% (106/108 items); core funcional Feature Complete

## 1. Resumen ejecutivo

OneITB23 se encuentra en fase avanzada de cierre tecnico y se aproxima al Code Freeze funcional. La plataforma ya cubre autenticacion, perfiles/CV, feed social, multimedia, mensajeria privada, administracion/moderacion, recursos academicos, progreso academico, adaptador SIU mock, notificaciones, empleabilidad y un set de over-delivery institucional: Audit Trail EF, constancias academicas, credenciales publicas aprobadas y toasts globales.

Esta iteracion no intenta inflar artificialmente el estado a 100%. La Spec 169 cerro baselines reales de testing y resiliencia sin agregar features nuevas. La Spec 170 cerro la brecha de infraestructura productiva: Docker multicontenedor, Redis Pub/Sub, Cloudinary opcional, rate limiting y security headers. La Spec 171 cerro brechas finales de seguridad de API y demo readiness: profundidad maxima GraphQL, lockout persistente por cuenta y seeding productivo configurable sin secretos versionados. La Spec 173 agrego empleos y postulaciones; la Spec 174 alineo la terminologia hacia Gestor de Postulaciones e incorporo SMTP real con fallback local. La Spec 175 cerro controles de privacidad de perfil y agrego un smoke SMTP admin-only. Las Specs 178, 179, 181 y 182 consolidaron el muro: adjuntos multiples, mosaico/portada PDF segura, nesting dirigido acotado, ownership estricto, moderacion reversible auditada, seguidores explicitos, notificaciones exactas y recordatorios de mensajes. La Spec 180 ejecuto auditoria Release Candidate y corrigio un bug real de idempotencia en el seeder enterprise. La Spec 183 retiro el laboratorio visual temporal y adopto la identidad OneITB definitiva. La Spec 184 cerro el polish tecnico verificable de Header/Footer, contraste, mosaico multimedia, menciones dirigidas, preferencias y navegacion laboral exacta, con lifecycle cleanup y pruebas de regresion. Google SSO, despliegue Azure real y mobile quedan bloqueados/pendientes hasta contar con credenciales, recursos cloud y alcance aprobado.

## 2. Acciones ejecutadas

### Observabilidad y trazabilidad

- Se agrego `CorrelationIdMiddleware` para aceptar o generar `X-Correlation-ID`.
- Cada request devuelve el correlation id en el header de respuesta.
- El backend registra metodo, path, status code, duracion y correlation id en el log operativo.
- Se configuro logging de consola simple, una linea por evento, apto para entorno local y CI.

### Rendimiento GraphQL

- Se reemplazaron resolvers de metricas sociales por DataLoaders:
  - `UserPostCountDataLoader`
  - `UserCommentCountDataLoader`
  - `UserLikesReceivedCountDataLoader`
  - `UserReportsReceivedCountDataLoader`
  - `InquiryReportCountDataLoader`
- Los conteos ahora se resuelven con consultas agrupadas por lote, evitando un conteo por cada usuario/publicacion de la respuesta.

### Gobernanza Speckit

- Se creo la spec `168-wow-production-polish` con especificacion, plan, tareas y evidencia.
- Se actualizo el roadmap solo por evidencia ejecutada.
- Se mantuvieron como pendientes las brechas que exigen browser runtime, pruebas frontend o infraestructura distribuida.

### Over-delivery institucional

- Se agrego `AuditLog` con `SaveChangesInterceptor` para registrar cambios de `User`, `AcademicProgress`, `AcademicResource`, `Inquiry` y `Comment`.
- Se expuso `auditLogs(first, entityName, actorUserId)` solo para administradores.
- Se agrego `publicCertificate(id)` para certificados publicos de progreso aprobado.
- `/academic` permite exportar progreso academico en CSV e imprimir una constancia formal.
- `/certificate/{id}` muestra una credencial publica compartible y limitada a aprobaciones.
- `NotificationProvider` muestra toasts globales deduplicados desde `notificationReceived`.

### Code Freeze y hardening final

- Se agrego un `GlobalErrorBoundary` en React para evitar pantalla blanca ante crasheos no controlados y ofrecer una salida institucional al usuario.
- Se agrego `GraphQLErrorFilter` para sanitizar errores inesperados del backend sin romper el contrato GraphQL existente.
- Se incorporo baseline de pruebas frontend con Vitest/Testing Library.
- Se incorporo baseline de integracion GraphQL con executor real de HotChocolate sobre EF Core de prueba.
- El workflow `quality-gates.yml` ejecuta los tests frontend antes del build.

### Preparacion Cloud y DevOps

- Se agregaron imagenes productivas multi-stage para backend .NET 8 y frontend React/Vite servido por Nginx.
- `docker-compose.prod.yml` orquesta SQL Server 2022, Redis 7, API y frontend, usando variables de entorno para todos los secretos.
- Nginx sirve la SPA con fallback a `index.html` y proxyea `/graphql`, `/api` y `/uploads` hacia la API, incluyendo soporte WebSocket para subscriptions.
- HotChocolate selecciona Redis Subscriptions si existe configuracion Redis y conserva InMemory Pub/Sub como fallback local.
- `/api/upload` quedo desacoplado por `IFileStorageService`: disco local por defecto y Cloudinary cuando se define `CloudinarySettings:Url`.
- La API agrega rate limiting fixed-window por IP, endpoint `/health`, HSTS en produccion y headers HTTP defensivos.
- La auditoria npm productiva quedo en cero vulnerabilidades conocidas tras actualizar dependencias compatibles.

### Seguridad final de API y demo readiness

- HotChocolate quedo configurado con `AddMaxExecutionDepthRule` y limite default de profundidad 10 para bloquear queries GraphQL abusivamente anidadas antes de ejecutar resolvers.
- Se agregaron limites globales de paginacion (`DefaultPageSize` 20 y `MaxPageSize` 50) para reducir respuestas no acotadas en campos paginados.
- `Account` persiste `FailedLoginAttempts` y `LockoutEnd`; el login bloquea por 15 minutos al quinto intento fallido y resetea el estado al autenticar correctamente.
- La respuesta de login mantiene el contrato `AuthPayload`, pero las fallas controladas usan codigos GraphQL estables (`AUTH_INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`).
- El seeder demo/productivo exige password por configuracion en produccion y ya no resetea passwords de cuentas existentes en cada arranque.

### Empleabilidad y correo institucional

- Se agrego `JobOffer` y `JobApplication` con ownership estricto del empleador y estados `Pending`, `Reviewed`, `Rejected`.
- El Gestor de Postulaciones permite revisar postulantes y cambiar estado sin exponer privilegios a terceros.
- El cambio de estado genera notificacion interna y, si SMTP esta configurado, correo institucional al postulante.
- Si SMTP no esta configurado, `ConsoleEmailService` conserva la experiencia local/CI sin secretos ni fallos de arranque.

### Privacidad y operabilidad SMTP

- `User.IsPublicProfile` permite a cada usuario decidir si su perfil extendido es publico o privado.
- `publicProfile` y `searchPublicProfiles` aplican masking backend-side para bio, contacto, carreras, CV y metricas cuando el visor no esta autorizado.
- `/profile/edit` incorpora switch de privacidad con feedback visual y toast institucional.
- `testSmtpConnection(targetEmail)` permite a administradores probar la salida de correo con validacion de email y errores GraphQL controlados sin exponer secretos.

### Estabilizacion del nucleo social

- `SocialAttachment` normaliza varios adjuntos por publicacion o comentario y conserva nombre original, MIME, tamano y orden sin eliminar `FileUrl` historico.
- `CommentReaction` agrega Me gusta persistente y unico sobre comentarios/respuestas con FKs restrictivas y filtro de contenido activo.
- El backend valida que la materia de una publicacion pertenezca a una carrera activa del autor; Administrador conserva alcance institucional explicito.
- Las notificaciones de comentarios y reacciones se agrupan en escritura con clave unica, contador persistente, `RowVersion` y deep-link al post.
- React muestra previews locales, galeria mixta YouTube/adjuntos, visores de imagen/video/PDF, autofocus de comentarios, modal paginado de likes y footer institucional.
- Se elimino el compositor legacy duplicado del sidebar y sus metricas hardcodeadas; queda un resumen real de `me` y accesos rapidos.

## 3. Evidencia ejecutada

| Validacion | Resultado |
|---|---|
| Backend build Release con cache NuGet local | PASS, 0 errores |
| Backend tests `Services.Tests` | PASS, 34/34 |
| GraphQL smoke `{ __typename }` | PASS, HTTP 200 |
| Introspeccion `auditLogs` / `publicCertificate` | PASS, HTTP 200 |
| Migracion `AddAuditLogs` | PASS, generada y aplicada |
| Frontend build Vite | PASS, 346 modulos, 1.21 s |
| Frontend component tests | PASS, 3/3 |
| Backend tests con integracion GraphQL | PASS, 35/35 |
| Backend build tras Spec 170 | PASS, 0 errores |
| Docker compose productivo `config` | PASS |
| Docker compose productivo `build` | PASS, imagenes API/Web construidas |
| Frontend tests tras audit fix | PASS, 3/3 |
| Frontend build tras audit fix | PASS, 349 modulos, 1.25 s |
| NPM audit productivo | PASS, 0 vulnerabilidades |
| Header `X-Correlation-ID` | PASS |
| Log operativo con correlation id | PASS |
| Smoke autenticado de metricas de usuarios | PASS, 53 usuarios |
| Smoke autenticado de metricas de publicaciones | PASS, 5 items sobre 154 |
| Backend build tras Spec 171 | PASS, 0 warnings, 0 errores |
| Migracion `AddAccountLockout` | PASS, generada |
| EF modelo sin cambios pendientes | PASS |
| Backend tests con lockout de cuenta | PASS, 38/38 |
| Docker compose productivo con seed password requerido | PASS, `config` con variables efimeras |
| Migracion `AddUserProfilePrivacy` | PASS, generada y aplicada contra SQL Server Docker |
| Backend build tras Spec 175 | PASS, 0 warnings, 0 errores |
| Backend tests tras Spec 175 | PASS, 39/39 |
| Frontend build tras Spec 175 | PASS, 352 modulos |
| EF modelo sin cambios pendientes tras Spec 175 | PASS |
| Runtime smoke temporal tras Spec 175 | BLOQUEADO por revisor automatico del entorno Codex al iniciar proceso persistente |
| Migracion `AddSocialAttachmentsCommentReactionsAndNotificationGrouping` | PASS, aplicada contra SQL Server Docker |
| EF modelo sin cambios pendientes tras Spec 178 | PASS |
| Backend build tras Spec 178 | PASS, 0 warnings, 0 errores |
| Backend tests tras Spec 178 | PASS, 47/47 |
| Frontend component tests tras Spec 178 | PASS, 6/6 |
| Frontend build tras Spec 178 | PASS, 356 modulos, 1.07 s |
| Smoke GraphQL autenticado Spec 178 | PASS: scoping, adjuntos, comentarios, reacciones, listado de likes, agrupacion y deep-link |
| Browser QA Spec 178 | PARCIAL: inspeccion autenticada ejecutada y sidebar legacy corregido; recarga final bloqueada por politica de URL de la herramienta |
| Backend build Spec 180 | PASS, 0 warnings, 0 errores |
| Backend tests Spec 180 | PASS, 47/47 |
| EF drift Spec 180 | PASS, sin cambios pendientes |
| Frontend tests Spec 180 | PASS, 4 archivos / 12 tests |
| Frontend build Spec 180 | PASS, 357 modulos, 743 ms |
| Runtime GraphQL smoke Spec 180 | PASS, backend Release inicia en Development y `{ __typename }` responde HTTP 200 |
| Seeder enterprise Spec 180 | PASS, `JobApplications` idempotente por `Id` y por `JobOfferId + ApplicantId` |
| Migracion `AddMediaModerationState` Spec 181 | PASS, aplicada a Docker SQL y EF sin drift |
| Backend build/tests Spec 181 | PASS, 0 warnings/0 errores y 55/55 tests |
| Frontend build/tests Spec 181 | PASS, Vite 360 modulos/879 ms y 8 archivos/18 tests |
| Runtime schema Spec 181 | PASS, `/health` Healthy, GraphQL HTTP 200 y mutaciones sociales/moderacion introspectadas |
| Migracion `AddDirectedRepliesAndSocialGraphIndex` Spec 182 | PASS, aplicada a Docker SQL; EF sin drift y FKs restrictivas |
| Backend tests Spec 182 | PASS, 62/62 |
| Frontend tests/build Spec 182 | PASS, 12 archivos/25 tests; 368 modulos en 1.12 s con PDF.js separado |
| NPM audit productivo Spec 182 | PASS, 0 vulnerabilidades |
| Runtime GraphQL autenticado Spec 182 | PASS: login, follow/query/unfollow, respuesta dirigida con raiz/destinatario y cleanup por soft-delete |
| Frontend tests/build Spec 183 | PASS, 16 archivos/31 tests y Vite 373 modulos/941 ms |
| Frontend/backend tests Spec 184 | PASS, 18 archivos/39 tests y 63/63 tests .NET |
| Builds Release Spec 184 | PASS, backend 0 warnings/0 errores y Vite 374 modulos/1.07 s en la ejecucion final |
| NPM audit Spec 184 | PASS, 0 vulnerabilidades |
| Runtime schema Spec 184 | PASS, GraphQL HTTP 200 y `Comment.replyToUser` expuesto en el schema real |

Advertencia de entorno: `NU1900` aparece porque el runner local no puede consultar metadata de vulnerabilidades en `https://api.nuget.org/v3/index.json`. No es una advertencia de codigo fuente.

## 4. Estado pendiente honesto

Quedan items funcionales/de despliegue abiertos o bloqueados:

1. Regresion visual/runtime del panel admin contra SQL Docker.
2. Regresion autenticada en navegador del hub academico y del Gestor de Postulaciones.
3. Smoke SMTP real con proveedor institucional configurado, usando la query admin-only ya implementada.
4. Google SSO productivo, bloqueado por credenciales OAuth, callbacks y aprobacion institucional.
5. Provisioning Azure real y aplicacion movil nativa.

Ademas, el despliegue Azure App Service/Azure SQL real queda como tarea operativa pendiente: la infraestructura Docker/cloud-ready existe, pero no se debe declarar desplegada hasta ejecutar provisionamiento, migracion y smoke test en Azure.

Estos puntos no deben presentarse como cerrados hasta tener implementacion y evidencia runtime/CI correspondiente.

## 5. Riesgos residuales

- Redis Pub/Sub y Cloudinary estan implementados, pero requieren variables/secretos productivos y smoke runtime con esos servicios activos antes de elevarlos a `[V]`.
- SMTP esta implementado con fallback seguro y smoke admin-only, pero requiere proveedor/secretos reales y prueba de entrega para elevarlo a `[V]`.
- El compose productivo fue construido y validado estaticamente; la ejecucion completa contra migraciones y trafico real debe hacerse con secretos definitivos.
- La validacion visual completa del panel admin, hub academico, `/empleos` y `/empleos/mis-ofertas` sigue dependiendo de una sesion de navegador autenticada.
- Las Specs 178/179/181/182 tienen validacion funcional por tests, schema y smoke REST/GraphQL donde aplica; resta confirmar manualmente portada/mosaico PDF, reemplazo de adjuntos, carrusel, highlight dirigido, badge minimizado, Follow en feed/perfil, moderacion con motivo y preferencias en una sesion autenticada del navegador de presentacion.
- El seeder enterprise ya no bloquea el arranque al reejecutarse sobre una base demo existente; queda recomendado ejecutar una regeneracion completa de base antes de la defensa solo si se necesita partir de datos limpios.
- El entorno necesita restauracion NuGet con red para ejecutar auditoria de vulnerabilidades sin warnings `NU1900`.
- Open Graph perfecto para LinkedIn requiere SSR o HTML renderizado desde backend; la SPA actual actualiza meta tags en runtime y ofrece URL publica compartible, pero los crawlers pueden no ejecutar JavaScript.
- El badge rojo de "Empleos nuevos" en la navegacion es deliberadamente efimero: depende del estado WebSocket/Apollo en memoria, se limpia al ingresar a `/empleos` y no persiste tras recargar la pagina. Si se requiere contador persistente, debe modelarse como notificacion leida/no leida en base de datos.
- El proyecto entra en Code Freeze funcional: la Spec 169 mitigo el riesgo de pantalla blanca con un Error Boundary global y agrego baselines automatizados frontend/GraphQL. La cobertura todavia no debe confundirse con una suite exhaustiva de regresion visual ni con pruebas distribuidas de infraestructura.
- Las vulnerabilidades de DoS por profundidad GraphQL y fuerza bruta por cuenta quedaron mitigadas a nivel backend; faltan pruebas de penetracion externas para elevarlas de hardening implementado a certificacion formal.

## 6. Recomendacion de cierre hacia produccion

Para una presentacion academica final, el sistema es demostrable si se usa el runtime local Docker SQL documentado, se configura `ONEITB_SEED_DEMO_PASSWORD` para la base demo y se conserva el Code Freeze: no agregar features nuevas antes de la defensa, ejecutar los gates documentados y limitar cambios a bugs bloqueantes. Para produccion real, antes de declarar 100%, se recomienda cerrar regresion browser admin, configurar secretos reales de Redis/Cloudinary/Azure, ejecutar migraciones y smoke tests en el entorno cloud definitivo, y extender la suite SQL Server/Testcontainers como continuidad del baseline GraphQL incorporado en la Spec 169.
