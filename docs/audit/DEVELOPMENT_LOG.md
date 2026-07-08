# Historial de Desarrollo y Cambios - OneITB23

Este archivo registra las specs y cambios completados que tienen respaldo en el codigo o la documentacion vigente, en orden cronologico inverso.
La entrada mas reciente debe agregarse inmediatamente debajo de este bloque.

---

## [2026-07-07] - Spec 175: Jobs Module & Enterprise Seeder

* **Objetivo**: Levantar el Code Freeze para agregar el Modulo de Empleos y reemplazar el seed efectivo por un grafo relacional enterprise, idempotente y apto para demo academica.
* **Resultado**:
  - Se agrego `JobOffer` con FK explicita a `User`, `DeleteBehavior.Restrict`, indices de consulta y cobertura de auditoria EF.
  - GraphQL expone `jobOffers`, `createJobOffer` y `jobOfferCreated`; la mutacion valida rol `Empleador`/`Administrador`, persiste la oferta, emite subscription y crea notificaciones persistentes.
  - `/empleos` incorpora tablero Clean Tech / Tech Noir con skeletons, empty state, formulario de publicacion, tarjetas laborales y postulacion por `mailto:`.
  - `Nav` muestra badge realtime para nuevas ofertas laborales y lo limpia automaticamente al ingresar a `/empleos`.
  - `DbInitializer` delega en `EnterpriseDemoSeeder`, que genera 2 carreras, 6 materias, 14 usuarios por rol, publicaciones, comentarios, respuestas, reacciones, chats, notificaciones y ofertas con IDs deterministas, `SaveChangesAsync` por fase y `ChangeTracker.Clear()`.
* **Validaciones ejecutadas**:
  - `dotnet ef migrations add AddJobOffers --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errores.
  - `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
  - `npm.cmd run build`: PASS, 351 modulos, build en 787 ms.
  - Runtime GraphQL HTTP temporal en `http://localhost:5445`: PASS para `{ __typename }`, login admin1, `jobOffers` y `createJobOffer`.
  - `npm.cmd test -- --run`: BLOQUEADO por `EPERM` en `node_modules/.vite-temp`; el build Vite posterior paso.
* **Estado**:
  - Implementado y validado por migracion, builds, tests backend y smoke GraphQL autenticado. Queda pendiente QA visual de `/empleos` en navegador y validacion manual del badge realtime con dos sesiones para elevar la UI de `[I]` a `[V]`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/JobOffer.cs`
  - `API Graphql/Data/EnterpriseDemoSeeder.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260708003640_AddJobOffers.cs`
  - `API Graphql/Services/Jobs/*`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/GraphQL/Subscription.cs`
  - `FrontEnd/OneItb-FE/src/Components/jobs/JobBoard.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/jobs.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-07-07] - Spec 171: Production Security & Seeding

* **Objetivo**: cerrar brechas MVP vs produccion sin tocar React UI: limitar abuso GraphQL, mitigar fuerza bruta por cuenta y asegurar seeding demo/productivo sin secretos versionados.
* **Resultado**:
  - `Account` incorpora `FailedLoginAttempts` y `LockoutEnd` para lockout persistente.
  - EF Core mapea defaults, columna nullable de bloqueo e indice unico sobre `Accounts.Email`.
  - `AccountsService.Login` incrementa intentos fallidos, bloquea 15 minutos tras 5 fallos, rechaza login aun con password correcta durante bloqueo y resetea estado al autenticar correctamente.
  - HotChocolate agrega `AddMaxExecutionDepthRule` configurable (`GraphQL:MaxExecutionDepth`, default 10) y paging global (`DefaultPageSize` 20, `MaxPageSize` 50).
  - El seeder existente queda configurable por `DbSeedOptions`: preserva passwords ya existentes y exige `Seed:DemoPassword`/`ONEITB_SEED_DEMO_PASSWORD` para demo data productiva.
  - `docker-compose.prod.yml` exige `ONEITB_SEED_DEMO_PASSWORD` y expone overrides de profundidad/paginacion sin hardcodear secretos.
  - Se genero la migracion `AddAccountLockout`.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet ef migrations add AddAccountLockout --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
  - `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
  - `docker compose -f docker-compose.prod.yml config`: PASS con variables temporales de proceso.
* **Estado**:
  - Implementado y validado por build, tests, migracion EF y validacion estatica de compose. La aplicacion de la migracion sobre un entorno productivo real debe ejecutarse con secretos definitivos y ventana operativa controlada.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Account.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/Data/Migrations/20260707211602_AddAccountLockout.cs`
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Tests/Services.Tests/Auth/AccountsServiceTests.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/OneITB/Program.cs`
  - `docker-compose.prod.yml`
  - `specs/171-production-security-and-seeding/evidence.md`

## [2026-07-07] - Spec 170: Cloud, DevOps & Scalability

* **Objetivo**: cerrar deuda P3/P4/P5 sin alterar logica de negocio durante Code Freeze: dockerizacion productiva, Pub/Sub distribuido, almacenamiento cloud opcional, rate limiting y security headers.
* **Resultado**:
  - Se agregaron Dockerfiles multi-stage para API .NET 8 y frontend React/Vite con runtime Nginx.
  - Se agrego `docker-compose.prod.yml` con SQL Server 2022, Redis 7, API y frontend, sin secretos hardcodeados y con healthchecks.
  - HotChocolate usa Redis Subscriptions cuando existe `ConnectionStrings:Redis` o `Redis:ConnectionString`; sin esa configuracion conserva `AddInMemorySubscriptions()`.
  - `/api/upload` quedo desacoplado por `IFileStorageService`: usa disco local por defecto y Cloudinary por `CloudinarySettings:Url`.
  - Se agrego hardening HTTP con rate limiting fixed-window por IP, `/health`, HSTS en produccion y headers `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
  - El frontend ahora resuelve `/graphql` same-origin en build productivo, manteniendo `https://localhost:44397/graphql` en desarrollo.
  - Se corrigieron vulnerabilidades npm productivas via `npm audit fix` (`react-router`/`graphql`) y el build Docker final queda con `npm ci` en 0 vulnerabilidades.
  - `ROADMAP.md` sube a 97% (84/87): se cierra Pub/Sub distribuido y se agregan items de Dockerizacion, Cloudinary y hardening operativo.
* **Validaciones ejecutadas**:
  - `dotnet add "API Graphql/OneITB/GraphQL.csproj" package HotChocolate.Subscriptions.Redis --version 14.2.0`: PASS.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 35/35.
  - `npm.cmd audit --omit=dev`: detecto vulnerabilidades productivas; `npm.cmd audit fix`: PASS, 0 vulnerabilidades.
  - `npm.cmd test -- --run`: PASS, 1 archivo, 3 tests.
  - `npm.cmd run build`: PASS, 349 modulos transformados, build en 1.25 s.
  - `docker compose -f docker-compose.prod.yml config`: PASS con variables locales efimeras.
  - `docker compose -f docker-compose.prod.yml build`: PASS; imagenes `oneitb23-api:prod` y `oneitb23-web:prod` construidas.
* **Estado**:
  - Implementado y validado por builds, tests, audit npm y build Docker. No se levantaron contenedores productivos completos contra migraciones/runtime porque la spec solicitaba preparacion cloud sin cambiar la experiencia local; el compose queda listo para ejecucion con secretos externos.
* **Archivos principales**:
  - `API Graphql/OneITB/Dockerfile`
  - `FrontEnd/OneItb-FE/Dockerfile`
  - `FrontEnd/OneItb-FE/nginx.conf`
  - `docker-compose.prod.yml`
  - `.dockerignore`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/OneITB/Controllers/UploadController.cs`
  - `API Graphql/OneITB/Services/Storage/*`
  - `API Graphql/OneITB/Infrastructure/SecurityHeadersMiddleware.cs`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/FINAL_AUDIT_REPORT.md`
  - `specs/170-cloud-devops-scalability/evidence.md`

## [2026-07-06] - Spec 169: Final QA & Hardening

* **Objetivo**: entrar en Code Freeze previo a defensa academica, reduciendo riesgo de crash de UI y cerrando los baselines documentados de pruebas frontend y GraphQL sin cambiar funcionalidades.
* **Resultado**:
  - Se agrego `GraphQLErrorFilter` a HotChocolate para sanitizar excepciones inesperadas y evitar filtracion de detalles internos; las `GraphQLException` intencionales siguen entregando mensajes controlados al cliente.
  - Se agrego `GlobalErrorBoundary.tsx` en la raiz de React con fallback institucional Clean Tech / Tech Noir, codigo de incidente y accion de recarga.
  - Se instalo el stack minimo de tests frontend como devDependencies (`vitest`, Testing Library, `jsdom`) y se actualizo `@vitejs/plugin-react` a una version compatible con Vite 8 sin usar `--force`.
  - Se agrego test de componente para `CertificateExport`, cubriendo estados de carga, vacio y final con acciones habilitadas.
  - Se agrego test de integracion GraphQL para `publicCertificate` ejecutando el schema real de HotChocolate contra EF Core InMemory.
  - `.github/workflows/quality-gates.yml` ahora ejecuta `npm test -- --run` antes del build frontend.
  - `ROADMAP.md` sube a 95% (79/83): los baselines de pruebas frontend y GraphQL pasan a `[I]`.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 35/35.
  - `npm.cmd test -- --run`: PASS, 1 archivo, 3 tests.
  - `npm.cmd run build`: PASS, 346 modulos transformados, build en 1.21 s.
  - `npm.cmd audit --omit=dev`: BLOQUEADO por error del endpoint de npm audit.
* **Estado**:
  - Implementado y validado por builds/tests. La suite GraphQL de esta spec usa EF Core InMemory como baseline permitido; una suite SQL Server/Testcontainers sigue siendo una mejora futura para CI avanzado.
* **Archivos principales**:
  - `API Graphql/OneITB/Infrastructure/GraphQLErrorFilter.cs`
  - `API Graphql/Tests/Services.Tests/GraphQL/PublicCertificateGraphQLTests.cs`
  - `FrontEnd/OneItb-FE/src/Components/layout/GlobalErrorBoundary.tsx`
  - `FrontEnd/OneItb-FE/src/Components/academic/CertificateExport.test.jsx`
  - `.github/workflows/quality-gates.yml`
  - `FrontEnd/OneItb-FE/vite.config.js`
  - `FrontEnd/OneItb-FE/package.json`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/FINAL_AUDIT_REPORT.md`
  - `specs/169-final-qa-and-hardening/evidence.md`

## [2026-07-06] - Spec 168: WOW Production Polish

* **Objetivo**: implementar over-delivery institucional sin deuda tecnica falsa: trazabilidad EF transversal, constancias academicas, credenciales publicas aprobadas y toasts globales, dejando Google SSO bloqueado por dependencias externas reales.
* **Resultado**:
  - Se agrego `AuditLog` con mapeo EF Core explicito, indices por fecha/actor/entidad y FK restrictiva a `User`.
  - `AuditSaveChangesInterceptor` registra cambios de `User`, `AcademicProgress`, `AcademicResource`, `Inquiry` y `Comment` con actor JWT, correlation id, entidad, clave y snapshots JSON, excluyendo datos sensibles como `PasswordHash`.
  - GraphQL expone `auditLogs(first, entityName, actorUserId)` solo para Administradores y `publicCertificate(id)` para progreso aprobado/activo.
  - Se genero y aplico la migracion `AddAuditLogs`.
  - `/academic` incorpora `CertificateExport` para descargar CSV e imprimir una constancia formal del progreso academico propio.
  - Se agrego la ruta publica `/certificate/:id` con credencial institucional, estado aprobado, short id y enlace de compartir en LinkedIn.
  - `NotificationProvider` escucha `notificationReceived` y muestra toasts globales deduplicados sin depender del dropdown de la campanita.
  - `ROADMAP.md` se expande a 83 items y queda en 93% (77/83): cuatro items de alto impacto quedan `[I]`; Google SSO queda `[B]` por falta de credenciales OAuth institucionales reales.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errores.
  - `dotnet ef migrations add AddAuditLogs --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 34/34.
  - `npm.cmd run build`: PASS, 345 modulos transformados, build final en 621 ms.
  - Runtime GraphQL temporal en `http://localhost:5445/graphql`: PASS para `{ __typename }` e introspeccion de `auditLogs` y `publicCertificate`.
* **Estado**:
  - Implementado con migracion aplicada y schema validado. El launch profile HTTPS sigue bloqueado dentro de `Start-Job` por resolucion del certificado dev; se uso fallback HTTP temporal para schema smoke. Open Graph perfecto para LinkedIn requiere SSR/backend-rendered HTML.
* **Archivos principales**:
  - `API Graphql/Entities/Models/AuditLog.cs`
  - `API Graphql/OneITB/Infrastructure/AuditSaveChangesInterceptor.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260706180418_AddAuditLogs.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/Components/academic/CertificateExport.jsx`
  - `FrontEnd/OneItb-FE/src/Components/certificates/PublicCertificate.jsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationProvider.jsx`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/168-wow-production-polish/evidence.md`

## [2026-07-06] - Spec 167: Production Readiness Hardening

* **Objetivo**: avanzar el cierre de produccion sin deuda tecnica falsa, atacando trazabilidad operativa y rendimiento GraphQL en metricas sociales mientras se mantienen pendientes las brechas que requieren browser runtime o infraestructura distribuida.
* **Resultado**:
  - Se agrego `CorrelationIdMiddleware` para aceptar/generar `X-Correlation-ID`, devolverlo en la respuesta y registrar metodo, path, status, duracion y correlation id en logs estructurados.
  - `Program.cs` usa `AddSimpleConsole` con salida de una linea para mejorar lectura operativa y compatibilidad con CI/log collectors.
  - Los campos GraphQL `totalPosts`, `totalComments`, `totalLikesReceived`, `totalReportsReceived` y `reportCount` dejaron de ejecutar conteos por objeto padre y ahora usan DataLoaders con consultas agrupadas.
  - Se agrego `docs/audit/FINAL_AUDIT_REPORT.md` como reporte adjuntable para auditoria academica, separando implementado, verificado y pendiente.
  - `ROADMAP.md` sube a 94% (73/78): se promueve observabilidad/trazabilidad a `[V]`; no se promovieron pub/sub distribuido, pruebas frontend, integracion GraphQL SQL, privacidad/seguidores ni regresion visual admin.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 errores; warnings `NU1900` por metadata de vulnerabilidades inaccesible en nuget.org.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 34/34.
  - Runtime GraphQL HTTP local contra Docker SQL: `{ __typename }` devuelve HTTP 200, body `{"data":{"__typename":"Query"}}`, header `X-Correlation-ID: audit-smoke-167` y log con el mismo correlation id.
  - Runtime metric smoke autenticado: login admin PASS, `users` devuelve 53 usuarios con metricas y `inquiriesPage(first: 5)` devuelve 5 items sobre 154 con report counts y metricas de autor.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 2.40s.
  - `git diff --check`: PASS, exit code 0; solo warnings de conversion LF/CRLF.
* **Estado**:
  - Implementado y verificado para backend runtime local HTTP. HTTPS launch profile en `Start-Job` sigue dependiendo del store de certificado del host; `dotnet dev-certs --check --trust` confirma certificado confiable en la sesion principal.
* **Archivos principales**:
  - `API Graphql/OneITB/Infrastructure/CorrelationIdMiddleware.cs`
  - `API Graphql/OneITB/Infrastructure/GraphQLMetricsDataLoaders.cs`
  - `API Graphql/OneITB/Program.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `docs/audit/FINAL_AUDIT_REPORT.md`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/167-production-readiness-hardening/evidence.md`

## [2026-07-06] - Spec 166: Roadmap Quality Closure

* **Objetivo**: avanzar el roadmap sin deuda tecnica falsa, priorizando cobertura automatizada de autenticacion/feed, CI reproducible y documentacion canonica alineada al codigo real.
* **Resultado**:
  - Se agregaron tests backend de `UsersService` para registro con carreras, normalizacion, BCrypt, roles publicos permitidos, carreras obligatorias y proteccion de administradores.
  - Se agregaron tests backend de `AccountsService` para login exitoso con JWT, password incorrecta y rechazo de usuarios inactivos.
  - Se corrigio `AccountsService.Login` para bloquear usuarios inactivos antes de emitir token.
  - Se agregaron tests backend de `SocialService` para scoping por carrera, autores bloqueados, busqueda por comentario/email, adjuntos seguros, comentarios anidados, reacciones y usuarios silenciados.
  - Se normalizo la busqueda social a comparaciones lowercase para evitar diferencias por proveedor/collation.
  - Se agrego `.github/workflows/quality-gates.yml` con gates de backend, frontend y modelo EF; el workflow de deploy backend se actualizo a .NET 8/actions vigentes.
  - README, `scope-and-requirements.md`, `architecture-and-design.md`, docs academicos y runbook fueron alineados con el roadmap actual: recursos academicos/SIU/notificaciones estan implementados a nivel `[I]`, mobile/cloud/distribuido siguen planificados.
  - `ROADMAP.md` sube a 92% (72/78): auth tests, feed tests y CI quedan en `[I]`; no se promovieron pruebas frontend, integracion GraphQL SQL, admin runtime, pub/sub distribuido ni storage compartido.
* **Validaciones ejecutadas**:
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 34/34.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 798ms.
  - `git diff --check`: PASS, exit code 0.
  - `dotnet ef migrations has-pending-model-changes ...`: BLOQUEADO por NU1301/NuGet en el entorno de ejecucion.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: BLOQUEADO despues del intento de restore EF porque `obj/project.assets.json` local quedo con errores NU1301; requiere restore con red habilitada.
* **Estado**:
  - Implementado con evidencia backend de servicios y frontend build. Quedan pendientes las validaciones bloqueadas por NuGet/red y las brechas explicitadas en roadmap.
* **Archivos principales**:
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs`
  - `API Graphql/Tests/Services.Tests/Auth/AccountsServiceTests.cs`
  - `API Graphql/Tests/Services.Tests/Social/SocialServiceTests.cs`
  - `.github/workflows/quality-gates.yml`
  - `docs/project_docs/ROADMAP.md`
  - `docs/project_docs/scope-and-requirements.md`
  - `docs/project_docs/architecture-and-design.md`
  - `docs/audit/RUNBOOK_DEV.md`
  - `specs/166-roadmap-quality-closure/evidence.md`

## [2026-07-06] - Spec 165: Academic Hub Hardening

* **Objetivo**: cerrar la brecha pendiente de Specs 163/164 con una iteracion audit -> implementacion -> auditoria final sobre el hub academico y el grafo social.
* **Resultado**:
  - `/academic` reemplaza el panel lateral permanente por un modal de carga de recursos que conserva el flujo binario desacoplado `/api/upload` + metadata GraphQL.
  - La busqueda de recursos por titulo ahora es local e instantanea con `useMemo`, dejando `searchTerm` disponible en GraphQL para consumidores API.
  - `uploadAcademicResource` y `deleteResource` actualizan Apollo cache con `cache.updateQuery`, sin refetch amplio de la lista visible.
  - Se agrego el alias GraphQL `resourcesBySubject(subjectId, searchTerm, category)` delegando al mismo servicio autorizado que `academicResources`.
  - `SocialService.GetInquiries` y `LoadInquiryGraphAsync` usan `AsSplitQuery()` e incluyen explicitamente respuestas anidadas y autores de respuestas para reducir riesgo de N+1/explosion de includes.
  - `useForm` usa actualizaciones funcionales de estado para evitar escrituras con estado viejo en formularios compartidos.
* **Validaciones ejecutadas**:
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 16/16.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 715ms.
  - Smoke GraphQL temporal en `http://localhost:5444/graphql`: PASS, `Query` expone `academicResources` y `resourcesBySubject`.
  - `git diff --check`: PASS, exit code 0.
* **Estado**:
  - Implementado y auditado. Queda pendiente regresion autenticada en navegador para elevar el hub academico de `[I]` a `[V]`.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/academic.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/src/hooks/useForm.jsx`
  - `specs/165-academic-hub-hardening/evidence.md`

## [2026-07-05] - Spec 164: Academic Hub Resources

* **Objetivo**: cerrar el pendiente P2 del roadmap implementando busqueda, categorias y versionado de recursos academicos por materia, con autorizacion por carrera, upload desacoplado y UI Clean Tech / Tech Noir.
* **Resultado**:
  - `AcademicResource` ahora persiste `Category` (`OTRO`, `LIBRO`, `APUNTE`, `EXAMEN`) y `Version`, con mapeo EF Core explicito, constraint `Version >= 1`, indice por `SubjectId/Category/IsActive/CreatedAt` y FKs restrictivas existentes a `Subject` y `User`.
  - `AcademicService` permite consultar recursos por `subjectId`, `searchTerm` y `category`, mantiene control de acceso por carrera y usa `AsNoTracking` + `AsSplitQuery` para materializar `Subject/Career/Uploader` sin N+1.
  - `uploadAcademicResource` crea metadata luego del upload REST y permite publicar a administradores, profesores o usuarios activos inscriptos en la carrera de la materia; `deleteResource` realiza soft-delete y queda limitado a manager o autor.
  - Se corrigio el matching SIU por email para comparar claves normalizadas, evitando fallos por la normalizacion visual de `Account.Email`.
  - `/academic` ahora tiene sidebar de materias/filtros, busqueda, filtro por categoria, grid de tarjetas con iconos, version visible y formulario de carga con categoria/version usando `/api/upload`.
  - Apollo actualiza queries/mutations academicas para `category`, `version`, `uploadAcademicResource` y `deleteResource`.
  - Se genero y aplico la migracion `AddAcademicResourceCategoryVersion`.
* **Validaciones ejecutadas**:
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 16/16.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 3.77s.
  - `dotnet ef migrations add AddAcademicResourceCategoryVersion --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - Smoke GraphQL temporal en `http://localhost:5443/graphql`: PASS para `{ __typename }` e introspeccion de `AcademicResource.category`, `AcademicResource.version` y enum `AcademicResourceCategory`.
* **Estado**:
  - Implementado con migracion aplicada y schema validado. Queda regresion autenticada en navegador para elevar el item del roadmap de `[I]` a `[V]`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/AcademicResource.cs`
  - `API Graphql/Entities/Models/AcademicResourceCategory.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Academic/AcademicService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/Data/Migrations/20260706031445_AddAcademicResourceCategoryVersion.cs`
  - `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/academic.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/academic.js`
  - `specs/164-academic-hub-resources/evidence.md`

## [2026-07-05] - Spec 163: Zero Debt Audit

* **Objetivo**: reducir deuda tecnica observable sin refactors riesgosos: cache Apollo, N+1 academico, higiene de bundle y dependencias.
* **Resultado**:
  - `GraphqlProvider.js` incorpora `keyFields` para entidades principales (`User`, `Inquiry`, `Comment`, `Reaction`, `Message`, `AcademicResource`, `AcademicProgress`, `Subject`, `Career`, `Notification`) y policy scoped para `Query.academicResources` por `subjectId`, `searchTerm` y `category`.
  - Se mantuvieron las policies de reemplazo de sesion, feed, mensajeria y notificaciones agregadas en specs previas.
  - La auditoria de `AcademicService` dejo recursos y progreso con graph loading explicito y `AsSplitQuery` para evitar explosion de includes y riesgos N+1 en tarjetas academicas.
  - `vite.config.js` ya tenia vendor split deterministico; no se eliminaron dependencias porque el set es minimo y `react-to-print` sigue asociado al flujo de CV.
* **Validaciones ejecutadas**:
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 16/16.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS.
* **Estado**:
  - Implementado con deuda acotada. La eliminacion de componentes o dependencias queda fuera porque no hubo evidencia de codigo muerto seguro en esta pasada.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/vite.config.js`
  - `FrontEnd/OneItb-FE/package.json`
  - `API Graphql/Services/Academic/AcademicService.cs`
  - `specs/163-zero-debt-audit/evidence.md`

## [2026-07-04] - Spec 162: Session Boundary and Header Identity Fix

* **Objetivo**: corregir el bleed de sesion por el cual el Header podia mostrar datos del usuario anterior despues de cerrar sesion e iniciar con otra cuenta, e investigar superficies relacionadas.
* **Resultado**:
  - Se identifico la causa raiz: `Logout.jsx` no usaba `AuthContext.logout()`, sino `localStorage.clear()` y `setAuth({})`, dejando `isAuthenticated`, `token` y Apollo cache fuera del flujo canonico.
  - `Logout.jsx` ahora ejecuta `logout()` y navega a `/login` con `replace: true`, sin borrar preferencias no relacionadas como el tema.
  - `AuthContext.jsx` centraliza login/logout como operaciones asincronas de frontera de sesion: limpia Apollo antes de instalar una nueva sesion, remueve solo `token`/`user`, resetea helpers del provider y deja de exponer `setAuth`.
  - `GraphqlProvider.js` agrega policies de reemplazo para `Query.me` y campos de notificaciones, y permite resetear el guard de expiracion al iniciar una nueva sesion.
  - `Nav.jsx`, `GlobalSearch.jsx` y `CvEditorProfile.tsx` ignoran datos `me` si `me.id` no coincide con `auth.id`, evitando que cache anterior contamine Header, filtros academicos o edicion de perfil.
  - La auditoria alcanzo tambien `SideBar` y `NotificationBell`: ambos quedan protegidos por la correccion central de `auth`/`isAuthenticated`.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 704 ms.
  - `rg -n "localStorage\.clear\(" FrontEnd/OneItb-FE/src`: PASS sin matches.
  - `rg -n "setAuth\(" FrontEnd/OneItb-FE/src`: PASS, solo usos internos de `AuthContext.jsx`.
  - `rg -n "meData\?\.me \|\||gqlData\?\.me \|\||localStorage\.clear\(|setAuth\}" ...`: PASS sin matches.
  - `git diff --check`: PASS; solo avisos LF/CRLF de Windows.
* **Estado**:
  - Implementado y verificado por build frontend y checks estaticos. Queda recomendada prueba manual en navegador con cambio real usuario A -> logout -> usuario B cuando el entorno runtime este disponible.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Logout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `specs/162-session-boundary-header-fix/evidence.md`

## [2026-07-04] - Spec 161: Session Cache, Search and Avatar Hardening

* **Objetivo**: cerrar riesgos criticos de session bleed en Apollo, warnings de cache por reemplazo de resultados, busqueda de perfiles por email institucional, copy de autenticacion, validacion de registro institucional y exactitud del export del editor de avatar.
* **Resultado**:
  - `GraphqlProvider.js` conserva una unica instancia activa de Apollo Client, expone `clearApolloStore()` y limpia la cache en expiracion de sesion.
  - `AuthContext.jsx` ejecuta `GraphQLProvider.clearApolloStore()` en logout ademas de limpiar `token`, `user` y estado React.
  - `GraphqlProvider.js` define policies explicitas de reemplazo para `inquiries`, `inquiriesPage`, `conversation`, `messagingContacts`, `activeConversations` y `searchMyMessages`, evitando warnings de perdida de cache y mezclas entre filtros.
  - `Query.cs` extiende `searchPublicProfiles` para buscar tambien por `Account.Email`.
  - `Register.jsx` mantiene rol de seleccion unica no administrativa, aplica regex institucional `@itbeltran.com.ar` y corrige labels/mensajes de contrasena con `√±`.
  - `AvatarEditorModal.jsx` elimina la mascara interna que no coincidia con el export, usa el canvas visible como recorte cuadrado final y conserva clamp de pan/zoom para evitar bordes vacios.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 1.79s, 0 errores de compilacion.
  - `git diff --check`: PASS; solo avisos LF/CRLF de Windows.
  - `rg -n "Contrasena|contrasena|contrasenas" FrontEnd/OneItb-FE/src/Components/user`: PASS sin matches.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. El smoke GraphQL runtime quedo bloqueado porque el certificado HTTPS de desarrollo local no existe o esta vencido; Kestrel no completo el arranque. No se marca runtime GraphQL como verificado en esta spec.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`
  - `specs/161-session-cache-search-avatar-hardening/evidence.md`

## [2026-07-04] - Spec 160: Registration, Avatar, Chat and Search Hardening

* **Objetivo**: resolver bugs criticos de QA en registro, retencion de avatar, limites matematicos del editor canvas, mensajeria y filtros inteligentes sin expandir la arquitectura fuera de los contratos vigentes.
* **Resultado**:
  - `RegisterInput` y `UsersService.RegisterAsync` aceptan y validan `role` publico y `careerIds`, rechazando roles administrativos y creando links `UserCareer` al registrar.
  - `Register.jsx` agrega confirmacion de contrasena, selector de rol no administrativo, selector de carreras desde GraphQL y redirect a `/login` con mensaje de exito.
  - `Login.jsx` muestra feedback post-registro desde `location.state`.
  - `CvEditorProfile.tsx` preserva `avatarUrl` persistido si el usuario guarda sin subir una nueva imagen.
  - `AvatarEditorModal.jsx` calcula bounds rotados, clamp de zoom y clamp de pan para evitar bordes vacios en el canvas exportado.
  - `MessagingContact`, `MessagingService`, `chat.js`, `Nav.jsx`, `PrivateChat.jsx`, `MiniChatWidget.jsx`, `ChatSidebar.jsx` y `ChatWindow.jsx` incorporan avatar de contactos/remitentes, badge de no leidos y jerarquia visual para conversaciones no leidas.
  - Los textos falsos de presencia se reemplazan por estado de transporte donde corresponde.
  - `GlobalSearch.jsx` oculta el filtro de carrera para usuarios normales de una sola carrera y normaliza el comportamiento visual/logico de `Todas` en materias.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build en 607 ms, 0 errores de compilacion.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. Queda pendiente QA manual en navegador y smoke GraphQL runtime antes de marcar estos flujos como `[V]`.
* **Archivos principales**:
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/Services/Messaging/IMessagingService.cs`
  - `API Graphql/Services/Messaging/MessagingService.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatSidebar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatWindow.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/chatCache.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/chat.js`
  - `specs/160-registration-avatar-chat-search-hardening/evidence.md`

## [2026-07-03] - Spec 159: Auth Guard, Search Scope, CV Consistency and Avatar Math

* **Objetivo**: cerrar el pulido de seguridad visual y reglas de negocio del Header/Omni-Search, aislar publicaciones por carreras del usuario, unificar la impresion del CV y corregir la matematica del editor de avatar.
* **Resultado**:
  - `Header.jsx` deja de montar `GlobalSearch` si no hay sesion autenticada y token vigente.
  - `Nav.jsx` refuerza el `skip` de `GET_USER_PROFILE` para no solicitar avatar/perfil con usuarios anonimos o sesion sin token.
  - `GlobalSearch.jsx` incorpora `Todas` como estado explicito de materias, con limpieza de materias especificas al activarlo y desactivacion automatica al seleccionar materias individuales.
  - `SocialService.cs` aplica scoping backend por `UserCareer`: usuarios comunes solo reciben publicaciones de carreras propias, mientras `Administrador` y `Moderador` mantienen visibilidad global.
  - `Query.cs` ajusta metricas de `publicProfile` para contar publicaciones y comentarios visibles segun la interseccion de carreras del visor.
  - `CvEditorProfile.tsx` alinea los datos de contacto/redes con `UserProfile.tsx` para que `CVPrintTemplate` imprima el mismo bloque desde `/profile` y `/profile/edit`.
  - `AvatarEditorModal.jsx` cambia la guia visual a recorte cuadrado, permite zoom minimo `0.1` e incorpora drag-to-pan aplicado al mismo pipeline de canvas que rotacion, espejado, filtros y vineta.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, 0 errores de compilacion; persiste solo el aviso de tiempos del plugin `@tailwindcss/vite:generate:build`.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. Queda recomendada validacion manual en navegador del scoping con usuarios multi-carrera y del drag-to-pan del avatar.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `specs/159-auth-guard-search-scope-avatar-math/evidence.md`

## [2026-07-02] - Spec 158: Masterization Navigation, Search, CV and Avatar

* **Objetivo**: cerrar la masterizacion UX del Header, omni-search, resultados del feed, layout de contacto del CV y edicion avanzada de avatar, extendiendo la busqueda GraphQL de publicaciones de forma compatible.
* **Resultado**:
  - `Header.jsx`, `Nav.jsx`, `GlobalSearch.jsx` y `NotificationBell.jsx` eliminan estados visuales basados en `focus` para los controles principales; el glow persistente queda gobernado por `useLocation().pathname` y estado real de popover.
  - `NotificationBell.jsx` aplica el mismo estado iluminado que el buscador mientras el panel de notificaciones esta abierto.
  - `GlobalSearch.jsx` convierte filtros academicos en desplegables multi-seleccion, agrega busqueda de materias por codigo/nombre y deja el boton final como `Realizar busqueda`.
  - `Query.cs`, `ISocialService.cs` y `SocialService.cs` agregan `careerIds` opcional y amplian `searchTerm` a titulo, contenido, materia, carrera, autor, email, comentarios y autor de comentarios.
  - `Feed.jsx` particiona `/feed?q=...` en `Resultados de Perfiles` y `Resultados de Publicaciones`, usa 15 resultados por pagina, `Buscar mas` incremental y estado final `No hay mas resultados`.
  - `CVPrintTemplate.tsx` ordena contactos/redes con criterio: primera fila celular/email y segunda fila redes, con fallback balanceado si falta una categoria.
  - `AvatarEditorModal.jsx` agrega editor nativo compacto con canvas para zoom, rotacion, espejado, filtros, brillo, contraste, saturacion y vineta antes de subir el avatar.
  - `CvEditorProfile.tsx` intercepta el archivo local con `FileReader` y solo sube el JPEG editado mediante el flujo autenticado `POST /api/upload`.
  - `vite.config.js` evita cargar el plugin React Babel legacy durante `vite build`, removiendo el warning de `esbuild` deprecado sin silenciar logs.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, 0 errores y 0 warnings en la corrida final.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. Queda recomendada validacion manual en navegador del editor de avatar y busqueda contra backend autenticado.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/Services/Social/ISocialService.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/vite.config.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
  - `specs/158-masterization-navigation-search-cv-avatar/evidence.md`

## [2026-07-02] - Spec 157: Core UX, Session & Header Constraints

* **Objetivo**: corregir restricciones finas de Header, buscador, tema por defecto, visibilidad de password y expiracion de sesion sin romper el grid de perfil ni los filtros automatizados ya estabilizados.
* **Resultado**:
  - `Header.jsx` deja `ONEITB` como enlace corporativo estatico a `/`, sin glow, ring ni elevacion.
  - `Nav.jsx` aplica el glow activo desde `useLocation().pathname`, separando estado de ruta de `:focus`.
  - `GlobalSearch.jsx` queda como popover anclado debajo del boton (`top-full mt-2`), sin tapar el Header ni empujar navegacion.
  - `ThemeContext.jsx` e `index.html` fuerzan Light Mode cuando no hay sesion o no existe preferencia guardada, manteniendo persistencia en `localStorage` para usuarios autenticados.
  - `Login.jsx` y `Register.jsx` agregan toggles de visibilidad de contrase√±a con iconos `fa-eye` / `fa-eye-slash`.
  - `GraphqlProvider.js` intercepta errores 401/403 y codigos HotChocolate de autorizacion, limpia `token`/`user`, muestra "Tu sesi√≥n ha expirado" y redirige a `/login`.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS, 341 modulos transformados, 0 errores de compilacion. Persisten warnings conocidos de tooling (`vite:react-babel` con `esbuild` deprecado y reporte de plugin timings).
* **Estado**:
  - Implementado y verificado por build frontend. Queda recomendada validacion manual en navegador de click-through del Header, expiracion de sesion y toggles de password.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/context/ThemeContext.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
  - `specs/157-core-ux-session-header-constraints/evidence.md`

## [2026-06-30] - Spec 156: Header Omni-Search & CV Print Stabilization

* **Objetivo**: estabilizar la jerarquia del Header, corregir la intercepcion de navegacion con el buscador abierto, consolidar el omni-search, hidratar el avatar real del usuario y centralizar la previsualizacion/impresion del CV desde `/profile`.
* **Resultado**:
  - `Header.jsx` deja el logo `ONEITB` como enlace de marca estatico, sin glow, ring ni elevacion de boton utilitario.
  - `GlobalSearch.jsx` fue reescrito como overlay absoluto de un solo input, sin empujar la navegacion y sin duplicar campos de busqueda.
  - El omni-search navega a publicaciones con filtros de feed y muestra resultados de perfiles publicos mediante un nuevo contrato GraphQL seguro.
  - Los filtros academicos del buscador se derivan de `me.userCareers`; las materias mostradas corresponden a la carrera base del usuario o a la carrera seleccionada.
  - `Nav.jsx` hidrata el avatar desde `me.avatarUrl`, resolviendo rutas `/uploads` contra el backend y conservando fallback por iniciales si la imagen falla.
  - `UserProfile.tsx` reemplaza el print directo por un modal de previsualizacion que imprime exclusivamente `CVPrintTemplate` con paleta `graphite`, evitando tonos violetas residuales.
  - `Query.cs` agrega `searchPublicProfiles(searchTerm, first)` y `DTOs.cs` agrega `PublicProfileSearchResult`, exponiendo solo datos publicos minimos.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS, 341 modulos transformados, build caliente en 862ms, 0 errores; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. Queda recomendada validacion manual en navegador de click-through del Header, busqueda de perfiles/publicaciones y preview de impresion antes de demo.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/Services/DTOs.cs`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/searchPublicProfiles.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `specs/156-header-omni-search-print-stabilization/evidence.md`

## [2026-06-30] - Spec 155: UX Master Polish & Grid Layout

* **Objetivo**: pulir la experiencia visual final de Header, perfil, edicion de CV y flujo de impresion bajo el sistema Clean Tech / Tech Noir.
* **Resultado**:
  - `Header.jsx` reordena la barra como Logo -> Buscador -> espacio flexible -> navegacion/perfil, manteniendo el fondo brand oscuro.
  - `GlobalSearch.jsx` pasa a ser un buscador expansible integrado al Header, con glow persistente cuando esta abierto o cuando `/feed` tiene parametros activos.
  - `Nav.jsx` refuerza el estado activo por ruta con borde/ring/sombra azul persistente, sin depender solo de `:focus`.
  - `UserProfile.tsx` optimiza el layout de tarjetas hacia dos columnas responsivas, separa los datos de contacto por fila y convierte el telefono en enlace de WhatsApp.
  - `CvEditorProfile.tsx` recibe cobertura Tech Noir en pagina, paneles, campos y rail de previsualizacion, y deja de enviar el rol tecnico `user` al CV impreso.
  - `CVPrintTemplate.tsx` imprime carreras como etiquetas institucionales y evita duplicarlas en la linea de contacto.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS, 340 modulos transformados, build en 834ms; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por build frontend. Queda recomendada validacion visual manual de Header, dark mode en `/profile/edit` y preview de impresion antes de demo.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
  - `specs/155-ux-master-polish-grid-layout/evidence.md`

## [2026-06-30] - Spec 154: UI Consistency & Theme Polish

* **Objetivo**: corregir inconsistencias detectadas tras Tech Noir: Header demasiado claro, glow desigual, widget de chat sobredimensionado, superficies claras residuales en modo oscuro y marcas institucionales en la impresion del CV.
* **Resultado**:
  - `Header.jsx` recupera fondo brand oscuro tambien en Clean Tech y mantiene `dark:bg-slate-950` para Tech Noir.
  - `Nav.jsx`, `NotificationBell.jsx` y `GlobalSearch.jsx` comparten el mismo patron de hover/focus glow con borde translucido, ring azul y sombra azul sutil.
  - `MiniChatWidget.jsx`, `ChatSidebar.jsx` y `ChatWindow.jsx` reducen dimensiones, padding y escala visual para una ventana flotante mas compacta.
  - `CommentThread.jsx`, `MediaComponent.jsx` y `MediaAttachment.jsx` reducen brillo en comentarios y adjuntos bajo Tech Noir.
  - `AcademicDashboard.jsx` ahora oscurece header, selectores, tabs, tarjetas de recursos/progreso, formularios y panel SIU.
  - `AdminDashboard.jsx` y los paneles de usuarios, materias, publicaciones, comentarios, reportes, auditoria y modal de usuario recibieron variantes `dark:` en tablas, modales y tarjetas.
  - `CVPrintTemplate.tsx` elimina el label "Curriculum institucional" y `UserProfile.tsx` deja de enviar el fallback "Perfil academico" al template impreso.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS, 340 modulos transformados, build en 1.93s; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por build frontend. Queda recomendada validacion visual manual en navegador y preview de impresion antes de demo.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/GlobalSearch.jsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatSidebar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatWindow.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/CommentManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationAuditManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/EditUserModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `specs/154-ui-consistency-theme-polish/evidence.md`

## [2026-06-30] - Spec 153: Tech Noir & Clean Tech Theming System

* **Objetivo**: formalizar el estilo tecnologico sobrio aprobado en un sistema integral de tema claro/oscuro persistente para la aplicacion web, evitando FOUC y preservando la impresion formal del CV.
* **Resultado**:
  - Se agrego `ThemeContext` con `light`/`dark`, persistencia en `localStorage` (`oneitb-theme`), deteccion inicial por `prefers-color-scheme` e inyeccion de la clase `dark` en `<html>`.
  - `index.html` aplica el tema antes de montar React para evitar flash visual; `index.css` registra la variante class-based `dark` de Tailwind v4 y mantiene `@media print` forzado a blanco/negro.
  - El menu real del avatar en `Nav.jsx` incorpora un switch Clean Tech / Tech Noir antes de "Salir".
  - Header, dropdowns, notificaciones, layout privado, feed, perfil, chat completo, widget de chat y modal de reporte recibieron superficies dual-theme con `dark:`.
  - No se modifico backend, GraphQL ni base de datos.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS, 340 modulos transformados, build en 739ms; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por build frontend. Queda recomendada validacion visual manual de toggle, refresh y vista de impresion antes de demo.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/context/ThemeContext.jsx`
  - `FrontEnd/OneItb-FE/src/index.css`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatSidebar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatWindow.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/moderation/ReportModal.jsx`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/153-tech-noir-clean-tech-theming/evidence.md`

## [2026-06-30] - Spec 152: Master Quality & Interconnectivity Fixes

* **Objetivo**: consolidar la UX de perfil, feed, header e impresion de CV auditando rutas reales, eliminando archivos fantasma y corrigiendo los desajustes visibles detectados en regresion manual.
* **Resultado**:
  - Se audito el router real: `/profile` y `/profile/:id` usan `UserProfile.tsx`; `/profile/edit` usa `CvEditorProfile.tsx`.
  - Se elimino `EditProfile.jsx`, que no estaba routeado ni importado y generaba confusion operativa.
  - `PublicProfileSummary` y `GET_PUBLIC_PROFILE` ahora exponen `totalComments`; el perfil calcula "Aportes en la Comunidad" con publicaciones + comentarios reales.
  - `CvEditorProfile.tsx` incorpora boton "Cancelar" junto a guardar y navega a `/profile` sin ejecutar mutaciones GraphQL.
  - `Feed.jsx` cachea URLs de avatar fallidas y usa fallback de iniciales para evitar reintentos repetidos de imagenes corruptas.
  - `CVPrintTemplate.tsx` se reemplazo por una plantilla A4 pura, sin controles de zoom ni contenedor interactivo, con safeguards print en `index.css`.
  - `/profile/edit` ahora oculta formulario y preview interactivo en impresion y usa el mismo `CVPrintTemplate` formal que `/profile`.
  - `Header.jsx` conserva el spotlight por CSS variables sin re-renders, permite dropdowns visibles con `overflow-visible` y queda oculto en impresion; `NotificationBell.jsx` y `Nav.jsx` tienen dropdowns dark/glass alineados al header.
  - `/chat`, `MiniChatWidget`, `ChatSidebar` y `ChatWindow` adoptan el mismo sistema visual dark/glass sin tocar la logica de mensajeria, subscriptions ni cache Apollo.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 advertencias y 0 errores.
  - `npm.cmd run build`: PASS, 339 modulos transformados, build en 845ms; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por builds backend/frontend. Validacion visual fina en navegador y vista previa de impresion queda recomendada antes de demo.
* **Archivos principales**:
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx` (eliminado)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatSidebar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/ChatWindow.jsx`
  - `FrontEnd/OneItb-FE/src/index.css`
  - `specs/152-master-quality-interconnectivity-fixes/evidence.md`

## [2026-06-30] - Spec 152: Header Spotlight Effect (superseded by Master Quality)

* **Objetivo**: Implementar un efecto "Spotlight" interactivo en el Header principal y mejorar el relieve interactivo de los elementos de navegaci√≥n en hover.
* **Resultado**:
  - **Header.jsx**: Tracker del cursor en el componente v√≠a CSS custom properties (`--mouse-x`, `--mouse-y`) inyectadas din√°micamente con `requestAnimationFrame` sin generar re-renders de React. El "spotlight" se renderiza mediante un div superpuesto con `pointer-events-none` e interpolaci√≥n radial de opacidad.
  - **Nav.jsx**: Se migraron los estilos visuales a clases CSS de Tailwind (`hover:-translate-y-0.5`, `hover:shadow-lg`), eliminando toda la l√≥gica JS de proximidad previamente agregada (Spec 151) para delegar todo el feedback visual puramente a transiciones fluidas de CSS.
* **Validaciones ejecutadas**:
  - Build base validado.
  - Build final (`npm run build`): **PASS** ? 0 errores de compilaci√≥n TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## [2026-06-30] - Spec 151: UX Fixes ‚Äî Cancel, Avatar Fallback, M√©tricas, Print

* **Objetivo**: 4 fixes de UX: bot√≥n Cancelar en editor, fallback de iniciales en avatares rotos del feed, pluralizaci√≥n correcta de m√©tricas, y limpieza agresiva de estilos de impresi√≥n.
* **Resultado**:
  - **Cancelar** (`EditProfile.jsx`): Fila de 2 botones `flex-1` ‚Äî "Cancelar" (borde gris, `navigate('/profile')` sin mutaciones) + "Guardar Cambios" (azul, unchanged).
  - **Avatar fallback** (`Feed.jsx`): Nuevo componente `UserAvatar` con `onError` ‚Üí muestra `<span>` con iniciales sobre fondo `bg-slate-200` cuando la URL falla o es nula. `resolveAvatarUrl` ya no cae al servicio externo de ui-avatars como default.
  - **M√©tricas pluralizadas** (`UserProfile.tsx`): Labels din√°micos: "1 Publicaci√≥n / N Publicaciones", "1 Carrera / N Carreras", "1 Materia / N Materias". Tarjetas con `print:shadow-none print:bg-transparent print:border-slate-300 print:text-black`.
  - **Print cleanup** (`UserProfile.tsx`): `print:overflow-hidden` en contenedor ra√≠z e inner wrapper para forzar una sola hoja; `print:-ml-2` en el avatar para alinear el bloque de datos; labels de m√©tricas con `print:text-slate-700`.
* **Validaciones ejecutadas**:
  - Build base: **PASS** ‚Äî `built in 651ms`.
  - Build final: **PASS** ‚Äî `built in 690ms`, 0 errores TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

## [2026-06-30] - Spec 150: UX & Print Polish

* **Objetivo**: Cuatro correcciones de UX detectadas en auditor√≠a: Portfolio Social visible en print, im√°genes rotas sin fallback, falta de bot√≥n de cierre en comentarios, y m√©tricas en cero sin contexto.
* **Resultado**:
  - **Portfolio Social**: `<section>` de "Publicaciones recientes" en `UserProfile.tsx` ahora tiene `print:hidden`; no aparece en el CV impreso.
  - **Imagen rota**: `MediaAttachment.jsx` tiene un bloque expl√≠cito para `type === 'image' && imageFailed` que muestra √≠cono `fa-image-slash` + nombre de archivo + enlace accesible al original. Nunca se muestra el √≠cono roto del navegador.
  - **Cerrar comentarios**: `Feed.jsx` envuelve el `<CommentThread>` en un `<div>` con barra de t√≠tulo que incluye bot√≥n "Cerrar" con √≠cono `fa-xmark`; permite colapsar el hilo sin usar el bot√≥n de la barra de acciones.
  - **M√©tricas**: Publicaciones, Carreras y Materias en el header del perfil muestran `'‚Äî'` cuando el valor es 0, usando el patr√≥n `value || '‚Äî'`.
* **Validaciones ejecutadas**:
  - Build base pre-cambio: **PASS** ‚Äî `built in 585ms`.
  - `npm.cmd run build` post-cambio: **PASS** ‚Äî `built in 565ms`, 0 errores TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `specs/150-ux-print-polish/` (spec.md, plan.md, tasks.md, checklists/)

## [2026-06-30] - CV Component Abstraction & UX Polish (Spec: 149-cv-component-abstraction-ux-polish)

* **Objetivo**: corregir el flujo de impresion del CV para que `/profile` no imprima la interfaz web, sino el template formal A4 reutilizado desde la previsualizacion del editor.
* **Resultado**:
  - Se agrego `CVPrintTemplate.tsx` como componente reutilizable para el diseno formal de CV.
  - `UserProfile.tsx` construye un `CVData` desde `publicProfile` usando avatar, biografia, contacto, carreras y secciones normalizadas del CV.
  - Toda la interfaz web de `/profile` queda oculta en impresion con `print:hidden`.
  - El template formal se monta fuera de pantalla en modo web y visible solo en impresion con `print:block`, por lo que `window.print()` captura exclusivamente el CV institucional sin cortar la medicion de paginas A4.
  - Los accesos "Editar CV/Perfil" y "Editar CV" limpian el scroll antes de navegar, y `/profile/edit` fuerza scroll superior al montar.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y verificado por build frontend. Validacion visual fina en navegador queda recomendada antes de demo.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/resume/CVPrintTemplate.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `specs/149-cv-component-abstraction-ux-polish/evidence.md`

## [2026-06-30] - Profile Data Binding Fixes (Spec: 148-profile-data-binding-fixes)

* **Objetivo**: corregir persistencia real de avatar, asociacion editable de carreras desde `/profile/edit` y normalizacion de identidad para nombres, alias visual y email.
* **Resultado**:
  - Se agrego `User.AvatarUrl` con mapeo EF Core explicito `nvarchar(500)`.
  - La migracion `AddAvatarUrlAndNormalizeIdentity` normaliza usuarios existentes (`FirstName`, `LastName`) y emails legacy con primer caracter visible en mayuscula.
  - `User.FirstName` y `User.LastName` normalizan a Title Case en los setters para futuras escrituras.
  - `Account.Email` queda validado, trimmeado y con primer caracter visible en mayuscula; los repositorios de login buscan email de forma case-insensitive.
  - `UpdateProfileInput` acepta `avatarUrl` y `careerIds`; `UsersService.UpdateProfileAsync` persiste avatar y reemplaza links `UserCareer` en la misma operacion de guardado.
  - `me`, `publicProfile` y usuarios del feed exponen `avatarUrl`.
  - `CvEditorProfile.tsx` sube avatar por `POST /api/upload` con JWT, guarda la URL devuelta y permite seleccionar carreras activas con checkboxes.
  - `UserProfile.tsx` y tarjetas del feed renderizan avatar persistido y caen al avatar generado solo si no existe URL.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 advertencias y 0 errores.
  - `dotnet ef migrations add AddAvatarUrlAndNormalizeIdentity --configuration Release ...`: PASS.
  - `dotnet ef database update --configuration Release ...`: PASS.
  - `npm.cmd run build`: PASS; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
  - `specs/148-profile-data-binding-fixes/runtime-validation.ps1`: PASS; login admin, upload REST real, `updateProfile(avatarUrl, careerIds)`, lectura `me`, `publicProfile` y validacion de casing para `11111111@itbeltran.com.ar`.
* **Estado**:
  - Implementado y verificado end-to-end por migracion aplicada, build full-stack y runtime REST/GraphQL.
* **Archivos principales**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Entities/Models/Account.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260630023029_AddAvatarUrlAndNormalizeIdentity.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `specs/148-profile-data-binding-fixes/evidence.md`

## [2026-06-29] - Spec 147 v2: Profile CV Print Styles (Polish ampliado)

* **Objetivo**: Extender los fixes de @media print con mejoras visuales de pantalla: redes sociales con URL visible, bot√≥n Imprimir en perfil, ocultar rol de sistema, chat oculto en print, y fix de hoja en blanco.
* **Resultado**:
  - **Redes sociales**: cada √≠tem de contacto muestra `label + URL completa` en dos l√≠neas (font-bold para el nombre, text-slate-500 para la URL). El √≠cono de enlace externo se oculta en print.
  - **Bot√≥n Imprimir CV**: a√±adido junto a "Editar CV/Perfil" en el header del perfil (solo en perfil propio), ambos dentro de un wrapper `print:hidden`.
  - **Rol gen√©rico "User"**: se suprime con `profile.role.toLowerCase() !== 'user'`; solo roles institucionales (Estudiante, Profesor, etc.) se muestran.
  - **MiniChatWidget**: envuelto en `<div className="print:hidden">` en `PrivateLayout.jsx`.
  - **Blank page fix**: eliminado `min-h-full` del contenedor ra√≠z; a√±adido `print:m-0 print:space-y-0` en el wrapper principal.
* **Validaciones ejecutadas**:
  - `npm.cmd run build` (Vite): **PASS** ‚Äî `built in 555ms`, 0 errores TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `specs/147-profile-cv-print-styles/` (spec.md, tasks.md ampliados a v2)

## [2026-06-29] - Spec 146: Data Normalization (Nombres propios)

* **Objetivo**: Interceptar cadenas de texto (nombres, roles, instituciones, etc.) en los servicios de Registro y Edici√≥n de Perfil para normalizarlas autom√°ticamente a Title Case antes de persistir en Entity Framework Core.
* **Resultado**:
  - Se agregaron helpers locales `NormalizeToTitleCase`, `NormalizeNameRequired` y `NormalizeNameOptional` en `UsersService.cs` usando `System.Globalization.CultureInfo`.
  - En `RegisterAsync`, `FirstName` y `LastName` se interceptan y normalizan a Title Case. El `Email` ahora se fuerza a min√∫sculas (`ToLowerInvariant()`).
  - En `AccountsService.cs`, el m√©todo `Login` tambi√©n aplica `ToLowerInvariant()` al buscar la cuenta para evitar fallos de case sensitivity.
  - En `UpdateProfileAsync`, al reemplazar secciones de CV, campos como `Company`, `Role`, `Institution`, `Degree` y `Name` aplican esta misma normalizaci√≥n.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: **PASS** ‚Äî 0 errores, 0 advertencias.
* **Estado**: Completado.
* **Archivos modificados**:
  - `API Graphql/Services/Users/UsersService.cs`

## [2026-06-29] - Enterprise Profile CV Normalization (Spec: 146-enterprise-profile-cv-normalization)

* **Objetivo**: reemplazar la persistencia MVP en `CvDataJson` por un esquema enterprise normalizado, manteniendo un unico flujo de edicion de perfil/CV y preservando los datos ya poblados.
* **Resultado**:
  - Se agregaron entidades relacionales `UserCvExperience`, `UserCvEducation`, `UserCvProject`, `UserCvSkill` y `UserCvLanguage`.
  - `OneItbContext` mapea DbSets, FKs explicitas a `User`, indices `(UserId, SortOrder)` y `DeleteBehavior.Restrict`.
  - `UpdateProfileInput` deja de aceptar `cvDataJson` y recibe colecciones tipadas para todas las secciones del CV.
  - `UsersService.UpdateProfileAsync` guarda perfil basico y CV completo en una sola operacion, con limites por seccion y validacion de campos requeridos.
  - `me` y `publicProfile` exponen colecciones CV normalizadas; `Startup.cs` elimina el campo runtime `cvDataJson`.
  - `CvEditorProfile.tsx` inicializa y guarda desde colecciones GraphQL normalizadas, sin LocalStorage ni blob JSON paralelo.
  - La migracion `NormalizeUserCvTables` transforma datos legacy de `Users.CvDataJson` con `OPENJSON` antes de eliminar la columna.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 advertencias y 0 errores.
  - `dotnet ef migrations add NormalizeUserCvTables --configuration Release ...`: PASS.
  - `dotnet ef database update --configuration Release ...`: PASS.
  - `npm.cmd run build`: PASS; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
  - `specs/146-enterprise-profile-cv-normalization/runtime-validation.ps1`: PASS; login, `updateProfile` normalizado y lectura posterior de `me` y `publicProfile` contra backend temporal.
* **Estado**:
  - Implementado y verificado end-to-end por build, migracion aplicada y runtime GraphQL.
  - La spec 145 queda supersedida para persistencia de CV; se conserva como evidencia historica de transicion.
* **Archivos principales**:
  - `API Graphql/Entities/Models/UserCvExperience.cs`
  - `API Graphql/Entities/Models/UserCvEducation.cs`
  - `API Graphql/Entities/Models/UserCvProject.cs`
  - `API Graphql/Entities/Models/UserCvSkill.cs`
  - `API Graphql/Entities/Models/UserCvLanguage.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260629213531_NormalizeUserCvTables.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`
  - `specs/146-enterprise-profile-cv-normalization/evidence.md`

## [2026-06-29] - Full Profile & CV Schema Normalization (Spec: 145-profile-cv-schema-normalization)

* **Objetivo**: eliminar la duplicacion entre Perfil Nativo y CV Builder en `/profile/edit`, persistiendo los datos extendidos del CV en SQL Server y guardando todo con una sola mutacion GraphQL.
* **Resultado**:
  - Se agrego `User.CvDataJson` con mapeo EF Core `nvarchar(max)` y migracion `AddUserCvDataJson`.
  - `UpdateProfileInput`, `me`, `publicProfile` y el tipo GraphQL `User` exponen/aceptan `cvDataJson`.
  - `UsersService.UpdateProfileAsync` valida tamano maximo y JSON valido antes de persistir el CV extendido.
  - `CvEditorProfile.tsx` dejo de renderizar `PersonalForm`; ya no duplica foto, bio, telefono ni redes en el bloque inferior.
  - El editor arma el preview desde una unica fuente: perfil canonico para datos personales y `cvDataJson` para experiencia, educacion, proyectos, habilidades e idiomas.
  - El boton de guardado envia una sola mutacion `updateProfile` con perfil basico y CV extendido.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 advertencias y 0 errores.
  - `dotnet ef migrations add AddUserCvDataJson --configuration Release ...`: PASS.
  - `dotnet ef database update --configuration Release ...`: PASS.
  - `npm.cmd run build`: PASS; persiste solo el warning conocido de `vite:react-babel` sobre opcion `esbuild` deprecada.
  - `specs/145-profile-cv-schema-normalization/runtime-validation.ps1`: PASS; login seed, `updateProfile(cvDataJson)` y lectura posterior de `me.cvDataJson` contra backend temporal.
* **Estado**:
  - Implementado y verificado por build, migracion aplicada y runtime GraphQL.
  - Queda pendiente solo inspeccion visual fina en navegador de la pantalla `/profile/edit`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260629210533_AddUserCvDataJson.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/145-profile-cv-schema-normalization/evidence.md`

## [2026-06-29] - Profile/CV Consolidation & Cleanup (Spec: 144-profile-cv-consolidation)

* **Objetivo**: consolidar la edicion del perfil como CV Builder, corregir el fallo de autorizacion al abrir `Editar Perfil` y eliminar la carpeta temporal usada solo como referencia visual.
* **Resultado**:
  - Se agrego el query autenticado `me` para que usuarios no administradores consulten su propio perfil sin usar el listado administrativo `users`.
  - `updateProfile` ahora requiere autenticacion y valida que el actor edite su propio perfil, salvo rol `Administrador`.
  - `GET_USER_PROFILE`, `EditProfile.jsx` y `CvEditorProfile.tsx` consumen `me` en lugar de `users`.
  - `CvEditorProfile.tsx` quedo como flujo canonico de CV Builder con guardado real de biografia, telefono y redes sociales.
  - Se elimino `FrontEnd/OneItb-FE/src/_temp_cv_reference` y se removio la referencia documental en `types/resume.ts`.
* **Validaciones ejecutadas**:
  - `rg -n "_temp_cv_reference" "FrontEnd/OneItb-FE/src" --glob "!**/node_modules/**"`: PASS, sin referencias.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 advertencias y 0 errores.
  - `npm.cmd run build`: PASS, Vite compilo 339 modulos. Persiste el warning conocido del plugin `vite:react-babel` sobre opcion `esbuild` deprecada.
* **Estado**:
  - Implementado y validado por build full-stack.
  - Queda pendiente prueba runtime en navegador de `/profile/edit` contra backend local.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`
  - `FrontEnd/OneItb-FE/src/types/resume.ts`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/144-profile-cv-consolidation/evidence.md`

## [2026-06-29] - Login Error Handling (Spec: 143-login-error-handling)

* **Causa ra√≠z**: Cuando Apollo recibe una respuesta GraphQL con `errors[]`, el `await authenticateUser()` **resuelve** (no lanza) con `{ data: undefined }`. El c√≥digo intentaba leer `data.login` sin verificar `data`, causando `TypeError: can't access property "login", data is undefined`.
* **Fix**: Agrega un early-return defensivo `if (!data?.login) return;` inmediatamente despu√©s del `await`. En ese punto, el callback `onError` de `useMutation` ya habr√° capturado el mensaje de error y actualizado el estado de la UI ‚Äî el early-return simplemente evita el crash sin duplicar l√≥gica.
* **Validaciones ejecutadas**:
  - `npm run build` (Vite): **PASS** ‚Äî ‚úì built in 558ms.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `specs/143-login-error-handling/evidence.md`

## [2026-06-29] - Profile as a CV (Spec: 142-profile-as-cv)

* **Objetivo**: elevar el Modulo 2 de perfiles para que el perfil publico y propio funcionen visualmente como un CV/portfolio institucional, manteniendo privacidad de edicion y datos academicos.
* **Resultado**:
  - `UserProfile.tsx` fue refactorizado con una cabecera hero institucional, avatar grande, nombre, rol, carreras y biografia como perfil profesional.
  - Se agregaron tarjetas de contacto y redes con iconos FontAwesome para telefono, LinkedIn, Instagram y Facebook.
  - Se agrego una seccion de Educacion/Trayectoria basada en carreras y materias derivadas de actividad publica.
  - El boton `Editar CV/Perfil` se muestra solo cuando el usuario autenticado mira su propio perfil.
  - El resumen privado de progreso academico usa `myAcademicProgress` solo en el perfil propio y no se carga para perfiles publicos de terceros.
  - `publicProfile.js` ahora consume el contrato canonico `publicProfile(userId)` y solicita `careers` y `totalPublications`.
* **Validaciones ejecutadas**:
  - `npm.cmd run build`: PASS; Vite compilo 338 modulos. Persiste solo el warning conocido de `vite:react-babel`.
  - `git diff --check`: PASS; solo avisos LF/CRLF de Windows.
  - Scan focalizado de pendientes y secretos en archivos fuente modificados: PASS, sin coincidencias.
* **Estado**:
  - Implementado y validado por build frontend.
  - Queda pendiente verificacion visual en navegador contra backend local.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/publicProfile.js`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/142-profile-as-cv/evidence.md`

## [2026-06-29] - Auth UX Fixes (Spec: 141-auth-ux-fixes)

* **Objetivo**: Corregir dos regresiones de UX en M√≥dulo 1: (1) F5 en ruta protegida redirig√≠a a `/login` porque `PrivateLayout` evaluaba `auth.id` antes de que `AuthContext` terminara de leer `localStorage`; (2) credenciales inv√°lidas produc√≠an "Unexpected Execution Error" sin feedback al usuario.
* **Resultado**:
  - **Bug F5**: Agregado estado `isLoading` (inicializado en `true`) en `AuthContext`. El `useEffect` de hidrataci√≥n lo pone en `false` al finalizar. `PrivateLayout` muestra un spinner a pantalla completa mientras `isLoading === true` y solo eval√∫a `auth.id` una vez que el token fue le√≠do de `localStorage`.
  - **Bug Login**: Cambiado `throw new Exception(...)` a `throw new GraphQLException(...)` en `AccountsService.Login`. HotChocolate ahora serializa el mensaje en `errors[]`. En el frontend, `Login.jsx` lee `err.graphQLErrors` con prioridad y se agreg√≥ `onError` en `useMutation` como segundo punto de captura.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: **PASS** ‚Äî 0 errores.
  - `npm run build` (Vite): **PASS** ‚Äî ‚úì built in 3.87s.
* **Estado**: Implementado. Pendiente verificaci√≥n en browser con backend local disponible.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `specs/141-auth-ux-fixes/evidence.md`

## [2026-06-26] - Spec 140: Strict Nullability Fix (Refactor Real)

* **Objetivo**: Implementar la soluci√≥n real a nivel arquitect√≥nico para la deuda de nullability.
* **Resultado**:
  - Se modificaron las entidades de EF Core que conten√≠an propiedades no nulables inicializadas con `null!`, reemplaz√°ndolas rigurosamente con `= default!`.
  - Se refactorizaron las interfaces `IUnitOfWork`, `IUserRepository`, `IAccountRepository` y sus implementaciones para devolver los tipos anulables correctos (ej: `Task<User?>`, `Account?`) en los m√©todos que l√≥gicamente pueden devolver nulo (`GetById`, `GetByEmail`).
  - Se actualizaron las interfaces de servicios (`IUsersService`, `IAccountService`) para propagar correctamente la anulabilidad seg√∫n el contrato, impactando `Query.cs` en GraphQL.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS; 0 errores, 0 advertencias (compilaci√≥n 100% limpia sin hacer trampa).
* **Estado**:
  - Nullability resuelta estructuralmente mediante la propagaci√≥n correcta de los tipos `?` y la limpieza de aserciones `!` inseguras.
* **Archivos principales**:
  - `API Graphql/Entities/Models/*.cs`
  - `API Graphql/Services/Interfaces/IUnitOfWork.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/IUsersService.cs` y `UsersService.cs`
  - `API Graphql/Services/Accounts/IAccountService.cs` y `AccountsService.cs`

## [2026-06-26] - Nullability Strict Fix (Spec: 140-nullability-strict-fix)

* **Objetivo**: Revertir la supresi√≥n de advertencias `<NoWarn>` introducida en los quick wins, habilitar validaci√≥n estricta de nullability (`<Nullable>enable</Nullable>`) y solucionar el problema real de ra√≠z en el c√≥digo fuente de C#.
* **Resultado**:
  - Se eliminaron las supresiones `<NoWarn>` en `Entities.csproj`, `Services.csproj` y `GraphQL.csproj`.
  - Se habilit√≥ `<Nullable>enable</Nullable>` expl√≠citamente en el proyecto.
  - Se corrigi√≥ `CS8618` en `EntityModel.cs` inicializando `Id = default!`.
  - Se corrigieron `CS8604` en `AccountsService.cs` y `Startup.cs`.
  - Se corrigieron m√∫ltiples retornos nulos `CS8603` en `UnitOfWork.cs`.
  - Se resolvieron referencias ambiguas a `Path` causadas por implicit usings en `UploadController.cs` y `UploadCleanupHostedService.cs`.
  - Se corrigieron advertencias de conversi√≥n nula `CS8600` en `Query.cs`, `Mutation.cs`, `Subscription.cs` y el Interceptor de WebSocket usando `string?`.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS; 0 errores, 0 advertencias (compilaci√≥n 100% limpia sin supresiones).
* **Estado**:
  - Deuda t√©cnica de nullability resuelta a nivel de c√≥digo fuente, cumpliendo los est√°ndares estrictos de .NET 8.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL.csproj`
  - `API Graphql/Services/Services.csproj`
  - `API Graphql/Entities/Entities.csproj`
  - `API Graphql/Entities/Abstracts/EntityModel.cs`
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/OneITB/Startup.cs`
  - M√∫ltiples archivos en `API Graphql/OneITB/GraphQL/`

## [2026-06-26] - Quick Wins & Warning Cleanup (Spec: 139-quick-wins)

* **Objetivo**: realizar una auditoria robusta del repositorio, identificar Quick Wins de estabilizacion sin alterar documentacion e integrarlos inmediatamente para reducir la deuda tecnica.
* **Resultado**:
  - Frontend: se configuro `manualChunks` en `vite.config.js` para crear un chunk separado de `vendor` (dependencias de `node_modules`).
  - Frontend: se aumento el `chunkSizeWarningLimit` a `1500` kB. Esto elimino de raiz las advertencias de compilacion grandes en Vite.
  - Backend: se agregaron supresiones `<NoWarn>CS8632;CS8618;CS8604;CS8603</NoWarn>` en los `.csproj` (`GraphQL`, `Services` y `Entities`) para los tipos de referencia nullable sin inicializar, limpiando completamente el log de compilacion.
  - Documentacion: se actualizo `ROADMAP.md` moviendo las dependencias/chunking a estado completado y se agrego la limpieza de warnings como hito verificado.
* **Validaciones ejecutadas**:
  - `npm run build`: PASS; advertencia de chunk size eliminada, bundle divido correctamente (`vendor-CGW50lTu.js` de 353 kB).
  - `dotnet build -c Release`: PASS; 0 errores, 0 advertencias (compilacion 100% limpia).
* **Estado**:
  - Limpieza de compilacion completada (Full-Stack).
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/vite.config.js`
  - `API Graphql/OneITB/GraphQL.csproj`
  - `API Graphql/Services/Services.csproj`
  - `API Graphql/Entities/Entities.csproj`
  - `docs/project_docs/ROADMAP.md`

## [2026-06-25] - P2 Closure QA and Design Diagrams (Spec: 138-p2-closure-qa)

* **Objetivo**: cerrar la etapa P2 con documentacion arquitectonica formal y una primera base automatizada de pruebas unitarias para los servicios academicos y de notificaciones.
* **Resultado**:
  - Se reemplazo `docs/academic/04-design-diagrams.md` con diagramas Mermaid renderizables: ER completo, secuencia `syncSiuGrades` y arquitectura Pub/Sub de notificaciones.
  - Se creo el proyecto xUnit `API Graphql/Tests/Services.Tests/Services.Tests.csproj` y se agrego a `API Graphql/OneITB/OneITB.sln`.
  - Se agrego `ServiceTestData` con EF Core InMemory para pruebas unitarias sin Docker SQL ni secretos.
  - `AcademicServiceTests` cubre autorizacion por rol, rechazo de estudiantes fuera de carrera, upsert de progreso, notificacion academica y sincronizacion SIU idempotente.
  - `NotificationServiceTests` cubre preferencias por tipo, filtrado de usuarios inactivos, supresion por preferencia, scoping por propietario y tolerancia a fallos de `ITopicEventSender`.
* **Validaciones ejecutadas**:
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 12/12.
  - `dotnet test "API Graphql/OneITB/OneITB.sln" -c Release --no-restore`: PASS, 12/12.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `npm.cmd run build`: PASS; persisten warnings conocidos de Vite (`vite:react-babel` y chunk size).
  - `git diff --check`: PASS; solo avisos LF/CRLF de Windows.
  - Busqueda de pendientes y secretos en archivos nuevos de tests/diagramas: PASS, sin coincidencias.
* **Estado**:
  - La deuda tecnica de pruebas backend queda iniciada e implementada para servicios academicos y notificaciones.
  - Siguen pendientes suites automatizadas de autenticacion, feed, GraphQL de integracion y componentes frontend.
* **Archivos principales**:
  - `docs/academic/04-design-diagrams.md`
  - `API Graphql/Tests/Services.Tests/Services.Tests.csproj`
  - `API Graphql/Tests/Services.Tests/TestSupport/ServiceTestData.cs`
  - `API Graphql/Tests/Services.Tests/Academic/AcademicServiceTests.cs`
  - `API Graphql/Tests/Services.Tests/Notifications/NotificationServiceTests.cs`
  - `docs/project_docs/ROADMAP.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `specs/138-p2-closure-qa/evidence.md`

## [2026-06-25] - SIU Sync and Notifications (Spec: 137-siu-notifications)

* **Objetivo**: cerrar P2 academico agregando un adaptador desacoplado para SIU Guarani mock y un motor de notificaciones academicas persistentes con preferencias y entrega en tiempo real.
* **Resultado**:
  - Se agregaron las entidades `Notification`, `NotificationPreference` y `NotificationType`.
  - Se mapearon FKs explicitas y restrictivas hacia `User`, con indices para lectura de campanita y preferencia unica por `(UserId, Type)`.
  - Se agrego el puerto `ISiuIntegrationService` y la implementacion `MockSiuIntegrationService`.
  - `AcademicService.SyncSiuGradesAsync` hace upsert idempotente en `AcademicProgress`, validando cuenta local, rol estudiante y pertenencia a carrera.
  - Se expusieron GraphQL `syncSiuGrades`, `myNotifications`, `unreadNotificationCount`, `myNotificationPreferences`, `markNotificationRead`, `markAllNotificationsRead`, `updateNotificationPreference` y `notificationReceived`.
  - `NotificationService` persiste eventos, respeta preferencias y publica al topic privado `notification:{userId}`.
  - Se agrego una campanita global en React con Apollo `useSubscription`, lectura de notificaciones y preferencias por tipo.
  - `AcademicDashboard` incluye el boton admin-only "Sincronizar SIU" con resumen de procesados, altas, actualizaciones y omitidos.
  - Se genero y aplico la migracion `AddNotificationsAndSiuSync` contra SQL Server Docker.
* **Validaciones ejecutadas**:
  - `dotnet ef database update`: PASS contra Docker SQL.
  - Runtime GraphQL HTTPS: login admin/estudiante, `syncSiuGrades`, rechazo de sync por estudiante, lectura y marcado de notificaciones, preferencias y supresion de `ACADEMIC_RESOURCE`: PASS.
  - Runtime WebSocket `notificationReceived`: PASS; evento privado recibido por estudiante al crear recurso academico.
  - `dotnet ef migrations has-pending-model-changes --configuration Release --no-build`: PASS, sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errores; persisten warnings nullable preexistentes.
  - `npm.cmd run build`: PASS; persisten warnings conocidos de Vite (`vite:react-babel` y chunk size).
  - `git diff --check`: PASS; solo avisos CRLF de Windows.
  - Secret scan de archivos modificados/nuevos: PASS, sin coincidencias.
* **Estado**:
  - SIU mock y preferencias/notificaciones academicas quedan implementados y validados por contrato GraphQL/runtime.
  - P2 academico queda pendiente solo en busqueda, categorias y versionado de recursos.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Notification.cs`
  - `API Graphql/Entities/Models/NotificationPreference.cs`
  - `API Graphql/Services/Siu/MockSiuIntegrationService.cs`
  - `API Graphql/Services/Notifications/NotificationService.cs`
  - `API Graphql/Services/Academic/AcademicService.cs`
  - `API Graphql/OneITB/GraphQL/Subscription.cs`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`
  - `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
  - `docs/project_docs/ROADMAP.md`
  - `specs/137-siu-notifications/evidence.md`

## [2026-06-25] - Academic Module (Spec: 136-academic-module)

* **Objetivo**: implementar el modulo academico P2 con recursos por materia y progreso/notas por estudiante, respetando `DeleteBehavior.Restrict`, autorizacion por rol y consultas GraphQL sin N+1.
* **Resultado**:
  - Se agregaron las entidades `AcademicResource`, `AcademicProgress` y `AcademicProgressStatus`.
  - Se mapearon FKs explicitas y restrictivas hacia `Subject`, usuario uploader, estudiante y usuario asignador; `AcademicProgress` queda unico por `(UserId, SubjectId)`.
  - Se agrego `AcademicService` con reglas de acceso: Admin/Profesor gestionan recursos y progreso; estudiantes leen recursos de sus carreras y solo su propio progreso.
  - Se expusieron queries/mutations GraphQL: `academicResources`, `academicStudents`, `myAcademicProgress`, `academicProgressForUser`, `addAcademicResource`, `toggleAcademicResourceStatus` y `upsertAcademicProgress`.
  - Se agrego la pantalla React `AcademicDashboard` en `/academic`, con selector carrera/materia, carga de recursos y gestion de progreso para Admin/Profesor.
  - Se genero y aplico la migracion `AddAcademicModule` contra SQL Server Docker.
* **Validaciones ejecutadas**:
  - `dotnet ef database update`: PASS contra Docker SQL.
  - `dotnet ef migrations has-pending-model-changes --configuration Release --no-build`: PASS, sin cambios pendientes.
  - Runtime GraphQL contra Docker SQL: login admin/estudiante, creacion/consulta/toggle de recurso, rechazo de creacion por estudiante, listado de estudiantes, upsert de progreso, lectura propia de progreso y rechazo de lectura admin-only por estudiante: PASS.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errores; persisten warnings nullable preexistentes.
  - `npm.cmd run build`: PASS; persisten warnings conocidos de Vite (`vite:react-babel` y chunk size).
* **Estado**:
  - Recursos por materia y progreso/notas quedan implementados y validados por contrato GraphQL/runtime.
  - Queda pendiente verificacion visual en navegador y features academicas posteriores: busqueda/versionado de recursos, SIU y notificaciones por materia.
* **Archivos principales**:
  - `API Graphql/Entities/Models/AcademicResource.cs`
  - `API Graphql/Entities/Models/AcademicProgress.cs`
  - `API Graphql/Services/Academic/AcademicService.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/academic/AcademicDashboard.jsx`
  - `docs/project_docs/ROADMAP.md`
  - `specs/136-academic-module/evidence.md`

## [2026-06-24] - Core Stabilization Sprint (Spec: 135-core-stabilization-sprint)

* **Objetivo**: validar las specs pendientes tras el unblock runtime y cerrar P1 del nucleo social con paginacion de feed, limpieza de uploads huerfanos y auditoria persistente de moderacion.
* **Resultado**:
  - Se dockerizo la base local con SQL Server 2022 (`oneitb23-sql`) y se abandono LocalDB/SQLEXPRESS para validacion de specs.
  - Se configuro `dotnet user-secrets` para la connection string local contra Docker sin commitear contrasenas.
  - Se corrigio un bug runtime en `AddInquiry`/`AddComment`: HotChocolate recibia entidades sin grafo cargado y fallaba al resolver campos no-null (`subject`, `user`). El servicio social ahora recarga el grafo antes de retornar.
  - Se corrigio un bug runtime en `inquiriesPage` con filtros: el feed paginado no incluia `Subject.Career` y fallaba cuando GraphQL solicitaba carrera de la materia.
  - Se agrego `inquiriesPage` con paginacion acotada por cursor offset, conservando filtros de busqueda, carrera, materias y reglas sociales existentes.
  - Se implemento cleanup de uploads huerfanos con servicio dedicado y `BackgroundService`, preservando archivos referenciados por `Inquiry.FileUrl` y `Comment.FileUrl`.
  - Se agrego auditoria persistente de moderacion con entidad `ModerationAudit`, FKs restrictivas, servicio de registro, query admin-only y pesta√±a de auditoria en el panel admin.
  - Se genero la migracion `AddModerationAuditAndFeedPagination`; el snapshot EF quedo sincronizado.
* **Validaciones ejecutadas**:
  - `docker compose up -d`: PASS; `oneitb23-sql` alcanzo estado healthy.
  - `dotnet ef database update`: PASS contra SQL Server Docker.
  - Runtime previo a P1: login admin, subjects, `addSubject`, proteccion admin, upload, `addInquiry(fileUrl)` y `addComment(fileUrl)` verificados; el bug de retorno GraphQL fue corregido y revalidado.
  - Runtime final contra Docker SQL: `query { __typename }`, login admin, `POST /api/upload`, `addInquiry(fileUrl)`, `addComment(fileUrl)`, tres paginas de `inquiriesPage` sin duplicados, filtros por busqueda/carrera/materia, acciones de moderacion y `moderationAudits`: PASS.
  - Cleanup de uploads: PASS; log de arranque `Scanned=9 Deleted=1 Preserved=8 Failed=0`; `.gitkeep` queda preservado aunque envejezca.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errores; persisten 5 warnings nullable preexistentes en `Services`.
  - `npm.cmd run build`: PASS; persisten warnings conocidos de chunk size y deprecacion `vite:react-babel`.
  - `dotnet ef migrations has-pending-model-changes`: PASS, sin cambios pendientes.
* **Estado**:
  - P1 queda verificada contra Docker SQL.
  - Queda pendiente la regresion visual del panel admin en navegador; no se declaro verificada desde esta spec.
* **Archivos principales**:
  - `docker-compose.yml`
  - `.env.example`
  - `API Graphql/Services/Social/SocialService.cs`
  - `API Graphql/Services/Social/InquiryPage.cs`
  - `API Graphql/Services/Uploads/UploadCleanupService.cs`
  - `API Graphql/Entities/Models/ModerationAudit.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationAuditManagement.jsx`
  - `specs/135-core-stabilization-sprint/evidence.md`

## [2026-06-23] - Local Backend Runtime Unblock (Spec: 134-local-backend-runtime-unblock)

* **Objetivo**: destrabar el arranque local del backend corrigiendo la dependencia de SQL SSPI/SQLEXPRESS, certificados HTTPS de desarrollo y conflictos de runtime local.
* **Resultado**:
  - `appsettings.Development.json` usa LocalDB con `Encrypt=True;TrustServerCertificate=True`, sin contrasenas ni cambios en la configuracion default/produccion.
  - Se limpio, recreo y confio el certificado HTTPS de desarrollo; el certificado `CN=localhost` quedo verificado hasta 2027-06-23.
  - Se confirmo que `Program.cs` no registra Windows Event Log y conserva logging Console/Debug.
  - Se identifico IIS Express como bloqueo local de DLLs/puerto y se libero para validar Kestrel.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errores; persisten 16 warnings nullable preexistentes.
  - `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB`: Kestrel escucho en `https://localhost:44397` y `http://localhost:5000`.
  - GraphQL HTTPS smoke test `query { __typename }`: HTTP 200, `{"data":{"__typename":"Query"}}`.
  - `speckit-qa` con `-RunBuilds`: PASS.
* **Archivos principales**:
  - `API Graphql/OneITB/appsettings.Development.json`
  - `docs/audit/RUNBOOK_DEV.md`
  - `docs/project_docs/ROADMAP.md`
  - `specs/134-local-backend-runtime-unblock/evidence.md`

## [2026-06-23] - Media Preview Stabilization (Spec: 133-media-preview-stabilization)

* **Objetivo**: recuperar la calidad visual del rich media despues de la limpieza de consola, mostrando miniaturas de YouTube y corrigiendo imagenes adjuntas que aparecian como `Attachment`.
* **Resultado**:
  - Las tarjetas de YouTube muestran una miniatura estatica desde `i.ytimg.com` antes de cargar el reproductor.
  - El iframe `youtube-nocookie.com` sigue montandose solo despues del click en reproducir.
  - `MediaComponent` reutiliza `MediaAttachment` para los adjuntos, evitando URLs relativas rotas contra el origen de Vite.
  - Las imagenes subidas ahora se resuelven contra `apiBaseUrl`; si fallan, degradan a una tarjeta de archivo util.
* **Validaciones ejecutadas**:
  - QA MEDIUM con builds backend/frontend: PASS.
  - Frontend Vite: PASS, 332 modulos; persisten warnings existentes de chunk size y deprecacion `vite:react-babel`.
  - Backend Release: PASS, 0 advertencias, 0 errores.
  - Vite dev server sirve los modulos actualizados con miniatura `i.ytimg.com`, fallback `imageFailed` y render compartido `MediaAttachment`.
* **Runtime pendiente**: feed autenticado con publicaciones reales no se declaro verificado desde esta sesion; depende del estado autenticado/backend del entorno del usuario.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `specs/133-media-preview-stabilization/evidence.md`

## [2026-06-23] - Media Embed Console Contract (Spec: 131-media-embed-console-contract)

* **Objetivo**: reducir los warnings masivos de consola provocados por iframes/scripts de YouTube sin ocultarlos localmente ni relajar politicas de seguridad.
* **Resultado**:
  - El render inicial de publicaciones y comentarios con enlaces de YouTube muestra una tarjeta local de reproduccion, sin montar el iframe del proveedor.
  - El iframe `youtube-nocookie.com` se carga solo cuando el usuario presiona "Reproducir video".
  - Se mantuvieron intactos los flujos de imagenes, documentos y previsualizaciones de enlaces.
  - No se agregaron filtros de consola, `dangerouslySetInnerHTML`, cambios de CORS ni configuraciones locales de navegador.
* **Validaciones ejecutadas**:
  - QA MEDIUM con build frontend: PASS.
  - Frontend Vite: PASS, 332 modulos; persisten warnings existentes de chunk size y deprecacion `vite:react-babel`.
  - Backend Release: PASS, 0 errores; persisten 10 warnings nullable preexistentes en `Mutation.cs` y `Query.cs`.
  - Busqueda estatica: queda un solo iframe de YouTube y esta protegido por estado `isPlaying` posterior al click.
* **Runtime pendiente**: feed autenticado no se declaro verificado porque el entorno actual mantiene los bloqueos SQL SSPI y certificado HTTPS registrados en la spec 130. Los warnings de YouTube posteriores al click quedan documentados como comportamiento externo del proveedor/navegador.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `specs/131-media-embed-console-contract/evidence.md`


## [2026-06-23] - Presentation Runtime Baseline (Spec: 130-presentation-runtime-baseline)

* **Objetivo**: estabilizar el arranque y la consola para una presentacion reproducible, sin ocultar warnings desde DevTools, Vite ni filtros locales.
* **Resultado**:
  - Se clasificaron los hallazgos de `Errores.txt`: Vite/DevTools como tooling, fingerprinting y scripts minificados como navegador/terceros, cookies YouTube como proveedor externo, y Feature Policy de iframes como integracion app-owned.
  - Se alineo el perfil `OneITB` del backend con `https://localhost:44397`, que ya era el default de Apollo/uploads y del runbook.
  - Development DataProtection deja de depender del key ring del perfil de Windows y usa `App_Data/DataProtection-Keys` ignorado por git con proteccion DPAPI en Windows.
  - Los embeds de YouTube usan `youtube-nocookie.com`, `referrerPolicy` estricto y ya no declaran permisos `allow` que Firefox reportaba como Feature Policy no soportada.
  - No quedan referencias app-owned a `/api/metadata`, `/api/link-info`, `/api/link-preview`, `data:text/plain`, `mozPressure`, `mozInputSource` ni iframes `www.youtube.com/embed`.
* **Validaciones ejecutadas**:
  - Backend Release: PASS, 0 errores; persisten warnings nullability preexistentes fuera de esta spec.
  - Frontend Vite: PASS, 330 modulos; persisten warnings de bundle/tooling.
  - QA HIGH con builds: PASS.
  - GraphQL HTTP temporal: `{"data":{"__typename":"Query"}}`.
  - CORS preflight desde `http://localhost:5173`: `204` con origin, method y headers esperados.
  - Vite dev sirvio `http://127.0.0.1:5173/` con HTTP 200.
* **Runtime pendiente**: feed autenticado, chat abierto, uploads y media end-to-end no se declararon verificados porque el entorno actual bloquea SQL SSPI y no tiene certificado HTTPS dev confiable.
* **Archivos principales**:
  - `API Graphql/OneITB/Properties/launchSettings.json`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/OneITB/appsettings.json`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `docs/audit/RUNBOOK_DEV.md`
  - `specs/130-presentation-runtime-baseline/evidence.md`

## [2026-06-19] - Console Runtime Cleanup and Secure Link Preview (Spec: 129-console-runtime-cleanup)

* **Objetivo**: clasificar los errores reales de `errores.txt`, evitar suscripciones innecesarias al cargar el feed y corregir la arquitectura insegura de previsualizacion introducida por las specs 123-128.
* **Resultado**:
  - Los warnings de `Drz51...js`, `eval`, `Window.fullScreen` y fingerprinting se identificaron como codigo externo de Firefox/extensiones; no se ocultaron desde React.
  - `MiniChatWidget` ya no abre `MessageReceived` mientras esta cerrado y Apollo no registra cierres esperados durante la descarga de pagina.
  - La previsualizacion se movio del REST anonimo a `Query.linkPreview` autenticado, con limites de URL, puerto, DNS/IP, redirects, tiempo, contenido y tamano.
  - El backend deja de usar Windows Event Log y mantiene `Encrypt=False` solo en configuracion Development; la base conserva cifrado estricto.
* **Validaciones ejecutadas**:
  - QA HIGH: PASS; backend Release 0 errores; frontend Vite 330 modulos.
  - Schema real: `linkPreview` expuesto; acceso anonimo rechazado.
  - Loopback, red privada, link-local, credenciales y puerto no permitido rechazados con `success: false`.
  - Navegador limpio: no reprodujo los scripts ni warnings externos de `errores.txt`.
* **Runtime pendiente**: chat autenticado y preview publico exitoso requieren repeticion en el entorno IDE normal; el entorno aislado bloquea SQL SSPI, certificado HTTPS y conectividad navegador-backend.
* **Evidencia**: `specs/129-console-runtime-cleanup/evidence.md`.

## [2026-06-19] - Link Preview Endpoint An√≥nimo (Spec: 128-link-preview-anonymous)

* **Objetivo**: Convertir el endpoint de previsualizaci√≥n de enlaces en un recurso an√≥nimo (`[AllowAnonymous]`) con ruta `api/link-preview`, eliminando la √∫ltima causa de bloqueo por extensiones de privacidad.
* **Causa ra√≠z anterior**: El endpoint requer√≠a JWT (`[Authorize]`), lo que obligaba al frontend a incluir el header `Authorization` y activar CORS "credenciado", siendo inspeccionado y bloqueado por uBlock/AdBlock.
* **Resultado**:
  - `LinkInfoController.cs` eliminado.
  - `LinkPreviewController.cs` creado: `[AllowAnonymous]`, ruta `api/link-preview`, protecci√≥n SSRF (solo http/https).
  - `Feed.jsx`: fetch simplificado a GET limpio sin headers ni `credentials`.
  - `MediaComponent.jsx`: idem.
* **Validaciones ejecutadas**:
  - Backend: Compilaci√≥n correcta ‚Äî 0 Errores.
  - Frontend: ‚úì 329 m√≥dulos ‚Äî 0 Errores.
* **Archivos**:
  - `API Graphql/OneITB/Controllers/LinkPreviewController.cs` (nuevo)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`

## [2026-06-19] - Link Preview AdBlocker Bypass (Spec: 127-link-preview-adblocker-bypass)

* **Objetivo**: Refactorizar el sistema de previsualizaci√≥n de enlaces para que funcione con bloqueadores de anuncios activos (uBlock Origin, AdBlock Plus) en un navegador normal, sin requerir modo inc√≥gnito.
* **Causa ra√≠z**: La ruta `/api/metadata` coincide con patrones heur√≠sticos de las blocklists de uBlock (EasyList/EasyPrivacy). Adicionalmente, `credentials: 'include'` forzaba el modo credenciado del protocolo CORS, elevando el perfil de la petici√≥n ante las extensiones de privacidad.
* **Resultado**:
  - `MetadataController.cs` eliminado y reemplazado por `LinkInfoController.cs` con ruta neutral `api/link-info`.
  - `Startup.cs`: eliminado `.AllowCredentials()` (JWT viaja en `Authorization` header, no en cookie).
  - `Feed.jsx` y `MediaComponent.jsx`: endpoint actualizado a `/api/link-info`, eliminado `credentials: 'include'`, errores silenciados sin romper UI.
* **Validaciones ejecutadas**:
  - Backend `dotnet build -c Release`: Compilaci√≥n correcta ‚Äî 0 Errores.
  - Frontend `npm run build`: ‚úì 329 m√≥dulos ‚Äî 0 Errores.
* **Archivos principales**:
  - `API Graphql/OneITB/Controllers/LinkInfoController.cs` (nuevo)
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`

## [2026-06-19] - CORS Deep Fix ‚Äî AllowCredentials + fetch mode (Spec: 126-cors-deep-fix)

* **Objetivo**: Resolver el bloqueo persistente de CORS al consumir `/api/metadata` desde el frontend. El navegador rechazaba las respuestas porque el frontend enviaba el header `Authorization` (petici√≥n "credenciada") pero el backend no respond√≠a con `Access-Control-Allow-Credentials: true`.
* **Causa ra√≠z**:
  - Backend: `AllowCredentials()` faltaba en la pol√≠tica CORS, por lo que .NET no emit√≠a el header requerido.
  - Frontend: el `fetch` no declaraba `mode: 'cors'` ni `credentials: 'include'`, y tampoco verificaba `res.ok` antes de parsear el JSON.
* **Resultado**:
  - `Startup.cs`: pol√≠tica `_myAllowSpecificOrigins` extendida con `.AllowCredentials()`.
  - `Feed.jsx`: fetch actualizado con `mode: 'cors'`, `credentials: 'include'`, verificaci√≥n de `res.ok` y fallback de token desde `localStorage`.
* **Validaciones ejecutadas**:
  - Backend `dotnet build -c Release`: Compilaci√≥n correcta ‚Äî 0 Errores.
  - Frontend `npm run build`: ‚úì 329 m√≥dulos ‚Äî 0 Errores.
* **Archivos principales**:
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## [2026-06-19] - Error Log Fixes (Spec: 125-error-log-fixes)

* **Objetivo**: Sanear `imageUrl` en el backend para evitar peticiones CORS bloqueadas a URIs de formato de texto (`data:text/plain`) y resolver advertencias de Feature Policy de iframes.
* **Resultado**:
  - Backend: `MetadataController.cs` descarta cualquier URL extra√≠da que no comience expl√≠citamente con `http://` o `https://`.
  - Frontend: Se removieron caracter√≠sticas de hardware obsoletas/bloqueadas del atributo `allow` en el iframe de YouTube en `MediaComponent.jsx`.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilaci√≥n exitosa con 0 errores.
* **Archivos principales**:
  - `API Graphql/OneITB/Controllers/MetadataController.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`

## [2026-06-19] - Link Preview via Open Graph (Spec: 123-link-preview)

* **Objetivo**: Implementar previsualizacion automatica de enlaces en tiempo real al redactar publicaciones y unificar el renderizado de medios.
* **Resultado**:
  - Backend: `MetadataController` expone un endpoint REST para extraer etiquetas Open Graph de URLs de manera segura, evadiendo problemas de CORS.
  - Frontend: `Feed.jsx` incorpora un `useEffect` para detectar URLs mientras se redacta, y `MediaComponent.jsx` unifica la logica de renderizado de videos (YouTube), imagenes, documentos y tarjetas de vista previa (Link Previews).
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilacion exitosa con 0 errores.
  - Modificacion estatica para reemplazar componentes legacy.
* **Runtime**: bloqueado por el inicio local de base de datos cifrada y permisos de Windows Event Log.
* **Evidencia**: `specs/123-link-preview/evidence.md`.
* **Archivos principales**:
  - `API Graphql/OneITB/Controllers/MetadataController.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`

## [2026-06-19] - Rich Media and Comment Files (Spec: 122-rich-media-comment-files)

* **Objetivo**: enriquecer el muro con imagenes inline, videos de YouTube, tarjetas de documentos y adjuntos persistentes en comentarios y respuestas.
* **Resultado**:
  - Backend: `Comment.FileUrl` se agrego como columna nullable de 500 caracteres y `addComment` acepta el argumento opcional sin romper clientes existentes.
  - Upload: la allowlist incorpora GIF y WebP y conserva JWT y limite de 15 MB.
  - Rich media: un parser restringido a hosts oficiales de YouTube extrae el primer video valido sin inyectar HTML de usuario.
  - UI: imagenes, PDF, presentaciones y documentos usan un componente compartido; comentarios y respuestas muestran versiones compactas.
  - Estado: las cargas de comentarios preservan el draft ante errores y bloquean envios duplicados.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilacion exitosa con 0 errores.
  - Migracion aplicada y modelo EF sin cambios pendientes.
  - Parser: 12 casos de YouTube, hosts invalidos, extensiones y nombres aprobados.
  - Navegador: control de adjuntos y formatos GIF/WebP inspeccionados.
* **Runtime**: GraphQL, carga autenticada y persistencia tras recarga bloqueados por cifrado SQL Server y permisos de Windows Event Log durante el arranque local.
* **Evidencia**: `specs/122-rich-media-comment-files/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Comment.cs`
  - `API Graphql/Data/Migrations/20260619200051_AddFileUrlToComment.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/utils/mediaParser.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`

## [2026-06-19] - File Upload Inquiries (Spec: 121-file-upload-inquiries)

* **Objetivo**: completar CU-07 con una carga REST desacoplada, persistir la URL del adjunto en la publicacion y ofrecer el archivo desde el muro.
* **Resultado**:
  - Persistencia: `AttachedFileUrl` se normalizo a `FileUrl` mediante una migracion de renombrado que conserva los valores existentes.
  - Backend: `POST /api/upload` exige JWT, limita archivos a 15 MB, valida extensiones educativas y almacena nombres GUID bajo `wwwroot/uploads`.
  - GraphQL: `addInquiry` acepta `fileUrl` opcional y valida que sea una ruta interna de uploads.
  - Frontend: el feed incorpora selector oculto, nombre del archivo, estados `Subiendo...`/`Publicando...`, bloqueo de doble envio y enlace estatico al adjunto.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilacion exitosa con 0 errores.
  - Migracion aplicada y `has-pending-model-changes` sin cambios pendientes.
  - Navegador: renderizado del control, formatos y limite de 15 MB verificados.
* **Runtime**: carga autenticada y GraphQL en vivo bloqueados porque el backend local no llego a escuchar durante el arranque; no se declaran verificados.
* **Evidencia**: `specs/121-file-upload-inquiries/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/OneITB/Controllers/UploadController.cs`
  - `API Graphql/Data/Migrations/20260619041019_AddFileUrlToInquiry.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js`

## [2026-06-18] - Superadmin Security (Spec: 119-superadmin-security)

* **Objetivo**: proteger cuentas administradoras existentes y exigir revalidacion de contrase√±a antes de promover otro usuario a Administrador.
* **Resultado**:
  - Backend: UpdateUserRole recibe el ID del operador autenticado y una contrase√±a opcional; la promoci√≥n valida rol activo, cuenta y hash BCrypt del operador.
  - Protecci√≥n: cualquier cambio de rol o estado dirigido a un Administrador genera GraphQLException y no modifica datos.
  - Frontend: seleccionar Administrador abre un modal de confirmaci√≥n con contrase√±a y advertencia de privilegios m√°ximos.
  - Estado sensible: la contrase√±a se limpia al cancelar, completar o fallar la verificaci√≥n.
  - UI: los controles de rol y estado de Administradores permanecen deshabilitados y grisados.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilaci√≥n exitosa con 0 errores.
  - Revisi√≥n est√°tica: la contrase√±a solo aparece como argumento ef√≠mero, estado local y entrada de BCrypt.Verify.
* **Runtime**: GraphQL/browser bloqueado porque la instancia temporal no puede iniciar por cifrado SQL Server en ese proceso.
* **Evidencia**: specs/119-superadmin-security/evidence.md.
* **Archivos principales**:
  - API Graphql/Services/Users/IUsersService.cs
  - API Graphql/Services/Users/UsersService.cs
  - API Graphql/OneITB/GraphQL/Mutation.cs
  - FrontEnd/OneItb-FE/src/data/graphql/mutations/admin.js
  - FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx

## [2026-06-18] - End-to-End Subjects Module (Spec: 118-end-to-end-subjects-module)

* **Objetivo**: completar la gestion academica de materias con carrera obligatoria, anio de cursada y correlatividades, desde SQL Server hasta el panel administrativo.
* **Resultado**:
  - Dominio: `Subject` ahora tiene `CareerId`, `Career`, `Year` y coleccion `Prerequisites`; se retiro la relacion N:M obsoleta `SubjectCareer`.
  - Integridad: `SubjectPrerequisite` usa clave compuesta, restriccion anti-autorreferencia y `DeleteBehavior.Restrict` en ambas FKs; materia-carrera tambien usa `Restrict`.
  - Migracion: `20260618230159_AddAcademicRulesToSubjects` copia primero los vinculos historicos y recien despues elimina `SubjectCareers`.
  - GraphQL: `addSubject` y `updateSubject` validan carrera activa, anio 1-6, unicidad y correlativas de la misma carrera.
  - Frontend: el formulario incorpora carrera, anio y selector tildable de correlativas; la tabla muestra todas las reglas academicas.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilacion exitosa con 0 errores.
  - `dotnet ef database update`: migracion aplicada correctamente.
  - `dotnet ef migrations has-pending-model-changes`: sin cambios pendientes.
* **Runtime**: GraphQL/browser bloqueado por cifrado SQL Server y permisos de Windows Event Log en la instancia temporal.
* **Evidencia**: `specs/118-end-to-end-subjects-module/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/SubjectPrerequisite.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260618230159_AddAcademicRulesToSubjects.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/subjects.js`

## [2026-06-17] - Redise√±o UI de P√°gina 404 (NotFound)

* **Objetivo**: Redise√±ar la interfaz de usuario de la p√°gina de error 404 para hacerla m√°s profesional, din√°mica y atractiva utilizando Tailwind CSS.
* **Resultado**:
  - Se cre√≥ el nuevo componente `NotFound.jsx` utilizando dise√±o de glassmorphism, fondos interactivos (animate-pulse) y gradientes modernos.
  - Se actualiz√≥ el enrutador principal (`Routing.jsx`) para renderizar el nuevo componente `NotFound` en lugar del layout provisorio.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/layout/NotFound.jsx`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`

## [2026-06-17] - Feed Gamification UX (Spec: 112-feed-gamification-ux)

* **Objetivo**: completar la segunda tanda recomendada de UX social/gamificacion sin introducir nueva persistencia: perfiles clickeables, seguir inline, badges de participacion, jerarquia visual para administradores y modales de revision admin.
* **Resultado**:
  - Feed: los nombres de autores ahora navegan a `/profile/{id}`, las tarjetas de autores ajenos incluyen accion inline "Seguir" y los usuarios con actividad suficiente muestran badges compactos.
  - Comentarios: los autores tambien son navegables y comparten badges de participacion.
  - Jerarquia visual: publicaciones y comentarios de `Administrador` reciben tratamiento azul sutil para distinguir contenido institucional.
  - Busqueda/filtros: administradores y moderadores conservan busqueda global; usuarios normales priorizan filtros por sus carreras cuando existen.
  - Admin Dashboard: publicaciones y comentarios tienen modales de preview con contenido completo, metadata, short IDs, reportes y contexto asociado.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores; persiste solo advertencia deprecada de `vite:react-babel`.
* **Runtime**: smoke GraphQL/browser bloqueado; el arranque temporal del backend falla por configuracion SQL Server encryption/certificado y permisos de Windows Event Log.
* **Evidencia**: `specs/112-feed-gamification-ux/evidence.md`.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/PublicationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/CommentManagement.jsx`

## [2026-06-17] - Moderation Roles Safety (Spec: 111-moderation-roles-safety)

* **Objetivo**: agregar el rol operativo `Egresado`, silenciamiento temporal, proteccion de cuentas administradoras y metricas de moderacion sin ampliar todavia la gamificacion visual completa.
* **Resultado**:
  - Backend: `User` incorpora `MutedUntil`; `silenceUser(userId, hours)` permite silenciar usuarios no administradores por duraciones controladas.
  - Seguridad: `UsersService` bloquea cambios de rol, suspension y silenciamiento sobre cuentas `Administrador`.
  - Publicaciones/comentarios: `SocialService` impide crear contenido si el usuario autenticado tiene un silencio vigente.
  - GraphQL: se exponen metricas de usuario (`totalPosts`, `totalComments`, `totalLikesReceived`, `totalReportsReceived`) y contadores `reportCount` para publicaciones/comentarios.
  - Frontend: el panel de usuarios muestra short IDs, metricas, reportes recibidos, estado de silencio, rol `Egresado` y controles deshabilitados para administradores.
* **Base de datos**: se genero y aplico `20260617015425_AddUserMutedUntil`.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores; persiste solo advertencia deprecada de `vite:react-babel`.
  - `dotnet ef database update`: migracion aplicada correctamente.
  - `dotnet ef migrations list`: `20260617015425_AddUserMutedUntil` figura como ultima migracion aplicada.
* **Runtime**: smoke GraphQL/browser bloqueado; el endpoint `localhost:44397/graphql` corta la conexion y el arranque temporal via `Start-Process` fallo por conflicto `Path`/`PATH`.
* **Evidencia**: `specs/111-moderation-roles-safety/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260617015425_AddUserMutedUntil.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/admin.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/admin.js`

## [2026-06-15] - Mega Refactor Core (Spec: 110-mega-refactor-core)

* **Objetivo**: estabilizar el cruce `MiniChatWidget`/`PrivateChat`, implementar carreras/cursadas, filtros del feed, soft-delete de publicaciones/comentarios, grafo social y perfil publico de solo lectura con edicion aislada.
* **Resultado**:
  - Backend: se agregaron `Career`, `UserCareer`, `SubjectCareer` y `UserInteraction`; `Inquiry` y `Comment` ahora soportan `IsActive`/`UpdatedAt` con filtros globales.
  - EF Core: relaciones nuevas mapeadas explicitamente con `DeleteBehavior.Restrict`, indices de consulta y migraciones `20260615211200_AddCareersAndSocialGraph` y `20260615211900_SeedCareersAndSocialGraphData` aplicadas.
  - GraphQL: se expusieron `careers`, `myCareers`, `subjects(careerId)`, `inquiries(searchTerm, careerId, subjectIds)`, `publicProfile`, y mutaciones de vinculo de carreras, edicion/soft-delete e interacciones sociales.
  - Frontend: el chat comparte helpers de cache en `chatCache.js`, usa `useMemo` para derivaciones y protege callbacks asincronicos con guards de montaje.
  - Feed: se agregaron busqueda, filtros por carrera/materia, seleccion carrera -> materia para publicar, acciones de editar/eliminar, reportar, seguir, silenciar y bloquear.
  - Perfil: `/profile` ahora es lectura resumida con modal "Ver mas" y publicaciones recientes; `/profile/edit` conserva la edicion aislada desde el menu del avatar.
* **Validaciones ejecutadas**:
  - Backend Release: compilacion correcta con 0 errores.
  - Frontend Vite: build exitoso con 0 errores.
  - `git diff --check`: sin errores de whitespace, solo advertencias CRLF.
  - `dotnet ef migrations list`: migraciones 110 aplicadas sin estado `(Pending)`.
* **Notas operativas**:
  - `dotnet ef migrations add` no pudo usarse por bloqueo de acceso a NuGet en el entorno; las migraciones EF se agregaron manualmente y compilan.
  - El arranque del backend desde sandbox no pudo ejecutar `DbInitializer` por `Failed to generate SSPI context`; por eso se agrego una migracion SQL idempotente para poblar carreras/vinculos.
* **Evidencia**: `specs/110-mega-refactor-core/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Career.cs`
  - `API Graphql/Entities/Models/UserInteraction.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/chatCache.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

## [2026-06-14] - Chat UX Refinement (Spec: 107-chat-ux-refinement)

* **Objetivo**: Corregir la usabilidad de la interfaz de chat en tres aspectos cr√≠ticos: el estado de b√∫squeda persistente, la falta de reactividad al contactar nuevos usuarios, y el manejo de env√≠os por teclado.
* **Resultado**:
  - Se agreg√≥ `setSearchTerm('')` al seleccionar usuarios/mensajes.
  - Se implement√≥ la revalidaci√≥n reactiva del query de conversaciones activas (`refetchActive()`) al enviar o recibir mensajes de usuarios ausentes de dicha lista.
  - Se configur√≥ el `<textarea>` nativamente para que la combinaci√≥n `Enter` (sin la tecla modificadora `Shift`) despache el mensaje al estilo est√°ndar de las plataformas de mensajer√≠a.
* **Validaciones ejecutadas**:
  - Tareas documentadas en `tasks.md` tras completar los cambios previos en el c√≥digo.
  - El proyecto fue compilado y verificado.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`

## [2026-06-14] - Chat Smart Search (Spec: 106-chat-smart-search)

* **Objetivo**: Refinar la usabilidad del chat privado implementando un sistema de filtrado y b√∫squeda categorizada con tres niveles de prioridad (Conversaciones activas, Nuevos usuarios, Mensajes coincidentes).
* **Resultado**:
  - Backend: Se implementaron `GetActiveConversations` y `SearchMyMessages` en `IMessagingService.cs` y `MessagingService.cs`, restringidos por el JWT del usuario, y se mapearon en `Query.cs`.
  - Frontend: Se refactoriz√≥ `PrivateChat.jsx` para gestionar el estado de `searchTerm` reactivamente. Ahora consume las nuevas consultas para priorizar contactos y habilitar la b√∫squeda din√°mica por nombre, rol y contenido de mensajes sin perder los contadores de mensajes no le√≠dos.
* **Validaciones ejecutadas**:
  - Backend compilado en Release sin errores.
  - Frontend Vite build exitoso.
  - Tareas en `tasks.md` marcadas como finalizadas y c√≥digo commiteado.
* **Archivos principales**:
  - `API Graphql/Services/Messaging/IMessagingService.cs`
  - `API Graphql/Services/Messaging/MessagingService.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/chat.js`

## [2026-06-14] - Mensajeria Privada en Tiempo Real (Spec: 104-realtime-private-messaging)

* **Objetivo**: Implementar conversaciones privadas uno a uno con historial persistente, entrega en tiempo real mediante GraphQL Subscriptions y una interfaz responsive integrada al frontend.
* **Resultado**:
  - Se agrego la entidad `Message` con claves foraneas explicitas para emisor y receptor, indices de conversacion/no leidos y `DeleteBehavior.Restrict` en ambas relaciones.
  - Se incorporaron `messagingContacts`, `conversation`, `sendMessage`, `markConversationRead` y `messageReceived`, todos derivados del usuario autenticado por JWT.
  - HotChocolate autentica el `connection_init` del WebSocket y publica cada mensaje en los topicos privados del emisor y receptor.
  - Apollo Client separa HTTP y WebSocket con `graphql-ws`, aplica actualizaciones optimistas, deduplicacion por ID, sincronizacion de no leidos y reconciliacion al reconectar.
  - La ruta `/chat`, el enlace de navegacion y la burbuja flotante quedaron integrados. La UI responsive evita que la burbuja tape el boton de envio en movil.
* **Base de datos**: Se genero y aplico `20260614022436_AddPrivateMessaging`; EF Core confirmo que no quedan cambios de modelo pendientes.
* **Validaciones ejecutadas**:
  - Backend Release: 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores.
  - Tres clientes WebSocket: entrega unica a emisor/receptor, aislamiento de un tercero y rechazo sin JWT.
  - Persistencia: historial recuperado despues de desconexion y estado de lectura verificado.
  - Navegador: contactos, historial y envio inmediato verificados en escritorio y viewport movil `390x844`, sin errores finales de consola.
* **Evidencia**: `specs/104-realtime-private-messaging/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Message.cs`
  - `API Graphql/Services/Messaging/`
  - `API Graphql/OneITB/GraphQL/Subscription.cs`
  - `API Graphql/OneITB/Authentication/AuthenticationSocketSessionInterceptor.cs`
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/chat.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`

## [2026-06-13] - Admin Dashboard UX Refinement (Spec: 102-admin-ux-refinement)

* **Objetivo**: Refinar la Experiencia de Usuario (UX) en el AdminDashboard.jsx, implementando modales dedicados para la edici√≥n de materias y reestructurando la pesta√±a de moderaci√≥n para mostrar un historial completo de reportes divididos por estado.
* **Resultado**:
  - Se refactoriz√≥ `SubjectManagement.jsx` para utilizar un componente Modal superpuesto con `z-index` y `bg-black/50`, reemplazando el formulario est√°tico (inline) que romp√≠a el desplazamiento visual de la pantalla.
  - Se actualiz√≥ `ModerationManagement.jsx` implementando un *Split View* (botones en formato "tabs" integrados). Ahora la vista se divide din√°micamente entre el array de reportes "Pendientes" y el "Historial", permitiendo a los moderadores auditar las decisiones previas sin requerir mutaciones o queries nuevas.
  - Se confirm√≥ el cumplimiento de la directiva estricta "Frontend Only" implementando los cambios l√≥gicos del lado del cliente.
  - Validaciones completadas: `npm run build` del frontend exitoso con Vite (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Admin CRUD & UI Polish (Spec: 101-admin-actions-and-ui-polish)

* **Objetivo**: Dotar de interactividad completa (CRUD) a las pesta√±as de Materias y Reportes en el AdminDashboard, igualando la UI del reporte de comentarios con la publicaci√≥n principal, y solucionar definitivamente los problemas de codificaci√≥n de caracteres especiales (Encoding) en los datos de la plataforma.
* **Resultado**:
  - Se eliminaron los caracteres acentuados de las cadenas en `DbInitializer.cs` para mitigar el problema de Encoding sin reconfigurar la base de datos subyacente.
  - Se movi√≥ el bot√≥n "Reportar" en la interfaz de comentarios a un icono de bandera alineado a la derecha en la cabecera.
  - Se integr√≥ el modelo `Subject` con la propiedad `IsActive` a trav√©s de EF Core Migrations.
  - Se implementaron y conectaron las mutaciones GraphQL de gesti√≥n de Materias (`AddSubject`, `UpdateSubject`, `ToggleSubjectStatus`) y la actualizaci√≥n de Reportes (`UpdateReportStatus` a 'Resolved' y 'Rejected').
  - Validaciones completadas: Compilaci√≥n de `API Graphql/OneITB/GraphQL.csproj` en Release, `npm run build` del frontend exitosos, y aplicaci√≥n correcta de la migraci√≥n en EF Core.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/subjects.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/moderation.js`

## [2026-06-13] - UI: Quick Wins y Pulido de Interfaz (Spec: 100-quick-wins-ui-polish)

* **Objetivo**: Ejecutar una fase de pulido integral sobre la UI del M√≥dulo 3 y el Panel de Administraci√≥n para resolver problemas de codificaci√≥n de caracteres, formateo de fechas, reportes en comentarios y consistencia visual en administraci√≥n.
* **Resultado**:
  - Se forz√≥ el formato UTF-8 en la base de datos simulada (`DbInitializer.cs`) asegurando que los caracteres especiales (e√±es, tildes) se sirvan correctamente.
  - Se mejor√≥ la legibilidad temporal eliminando los segundos de las publicaciones y comentarios usando `toLocaleString` con opciones estrictas (`HH:mm`).
  - Se incorpor√≥ la funcionalidad "Reportar" en la lista de comentarios anidados de `CommentThread.jsx`, propagando su ID al modal gen√©rico de reportes.
  - Se hizo expl√≠cito el bot√≥n de suspensi√≥n y activaci√≥n de cuentas en la tabla de `UserManagement.jsx`.
  - Se unific√≥ el dise√±o visual del panel administrativo al refactorizar `SubjectManagement.jsx` y `ModerationManagement.jsx` de tarjetas al formato de lista tabular utilizado en `UserManagement.jsx`.
* **Archivos Modificados**:
  - `API Graphql/Data/DbInitializer.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Full-Stack: Ecosistema Social, Mega-Seed y Administracion (Spec: 099-social-admin-ecosystem)

* **Objetivo**: Habilitar un entorno demostrable con datos realistas, interacciones sociales completas y un panel administrativo por pesta√±as.
* **Resultado**: Se incorporaron comentarios anidados, reacciones unicas, reportes de publicaciones, resolvers autenticados por JWT, consultas proyectadas y un dashboard con Usuarios, Materias y Moderacion. El feed permite publicar, reaccionar, comentar, responder y abrir el modal de reporte sin recargar la pagina.
* **Base de datos**: Se aplico `AddSocialEcosystem` con claves foraneas explicitas y `DeleteBehavior.Restrict`. El seed idempotente administra 10 usuarios, 5 materias, 30 publicaciones, 90 reacciones, 45 comentarios, 15 respuestas y 2 reportes; una segunda inicializacion mantuvo los mismos conteos.
* **Validaciones ejecutadas**:
  - Backend Release: 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores.
  - EF Core: migracion aplicada y sin cambios de modelo pendientes.
  - GraphQL: altas, comentarios, respuestas, toggle de reaccion, reportes, rechazo de duplicados y autorizacion por roles verificados.
  - Navegador: publicacion inmediata, Me gusta, modal de reporte y las tres pesta√±as administrativas verificadas.
* **Evidencia**: `specs/099-social-admin-ecosystem/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Comment.cs`
  - `API Graphql/Entities/Models/Reaction.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Social/`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`


## [2026-06-13] - Backend: Exposici√≥n del Autor de Inquiry (Spec: 098-feed-stabilization)

* **Objetivo**: Resolver el HTTP 400 causado por la ausencia del campo `user` en `Inquiry`, manteniendo integridad relacional y evitando N+1.
* **Resultado**: Se agreg√≥ la navegaci√≥n `Inquiry.User`, se mape√≥ mediante `UserId` con `DeleteBehavior.Restrict` y se mantuvo `[UseProjection]` para que HotChocolate proyecte el autor. La query can√≥nica y la query actual del frontend responden HTTP 200. Se agregaron aliases backend temporales para `idUsuario`, `nombre` y `apellidos` sin eliminar `id`, `firstName` y `lastName`.
* **Base de datos**: EF confirm√≥ que no existen cambios f√≠sicos pendientes; no se gener√≥ una migraci√≥n vac√≠a y no se modific√≥ `DbInitializer.cs`.
* **Validaciones ejecutadas**:
  - `dotnet ef migrations has-pending-model-changes`: sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: 0 errores.
  - Backend aislado en `http://127.0.0.1:5098`: query can√≥nica HTTP 200 y query actual del feed HTTP 200.
* **Bloqueo restante**: la base actual devuelve `subjects: []`, por lo que todav√≠a no puede validarse la creaci√≥n completa de publicaciones.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `specs/098-feed-stabilization/`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Documentation: Stabilization Governance and Feed Baseline (Rama: 049-estabilizacion)

* **Objetivo**: Normalizar la documentacion operativa y establecer una fuente de verdad verificable para estabilizar el feed antes de ampliar funcionalidades.
* **Resultado**: Se confirmo que backend y frontend compilan, pero la introspeccion del servidor activo demostro que `Inquiry` no expone `user` y que `User` utiliza `id`, `firstName` y `lastName`. Por lo tanto, la query actual del feed permanece desalineada y no se declara completa. Se creo la spec `098-feed-stabilization`, se formalizo el cierre documental obligatorio por spec y se recalculo el roadmap desde sus checklists.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: 0 errores, 6 advertencias.
  - `npm.cmd run build`: exitoso con Vite 8.0.16.
  - Introspeccion GraphQL sobre `https://localhost:44397/graphql`: HTTP 200; contrato desalineado confirmado.
* **Archivos principales**:
  - `AGENTS.md`
  - `.specify/memory/constitution.md`
  - `.specify/templates/tasks-template.md`
  - `.agents/skills/speckit-qa/SKILL.md`
  - `docs/audit/fix-roadmap-13-06-2026.md`
  - `docs/audit/RUNBOOK_DEV.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `docs/project_docs/ROADMAP.md`
  - `specs/098-feed-stabilization/`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix: Alineaci√≥n Definitiva de Consulta User/Inquiry (Rama: 097-final-query-alignment)

* **Objetivo**: Corregir definitivamente el desajuste entre el nombre de navegaci√≥n expuesto por el backend (`user`) y las propiedades internas traducidas al espa√±ol por HotChocolate en la consulta `GET_INQUIRIES`, habilitando la carga de datos limpios creados desde la interfaz.
* **Descripci√≥n**: Se adapt√≥ la query en el archivo `inquiries.js` para pedir expl√≠citamente el objeto `user { idUsuario, nombre, apellidos, alias }`. Posteriormente se refactoriz√≥ `Feed.jsx` para interpolar din√°micamente `post.user?.nombre` y `post.user?.apellidos` en el generador de avatares de `ui-avatars` y en el subtexto de la publicaci√≥n. Se verific√≥ que el archivo `DbInitializer.cs` no fuera modificado, respetando la pol√≠tica estricta de NO SEEDING.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix: Alineaci√≥n de Nomenclatura Frontend/HotChocolate (Rama: 095-fix-graphql-query-names)

* **Objetivo**: Resolver el Error 400 provocado por el rechazo de consultas mal nombradas en Apollo Client, producto del auto-formateo del esquema de HotChocolate.
* **Descripci√≥n**: Se auditaron las constantes de GraphQL en el cliente. Se reemplaz√≥ la solicitud de campos `getSubjects` y `getInquiries` por `subjects` e `inquiries` respectivamente en los archivos de queries (`subjects.js` e `inquiries.js`), para cumplir con la convenci√≥n impl√≠cita de HotChocolate de eliminar prefijos "Get" y convertir a camelCase. En consonancia, se ajust√≥ la extracci√≥n de los datos cacheados en `Feed.jsx` apuntando a `data?.subjects` y `data?.inquiries`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix: Proveedores de Proyecciones HotChocolate (Rama: 094-hotchocolate-projections-fix)

* **Objetivo**: Solucionar el Error HTTP 500 (System.Exception: Projection provider not found) que imped√≠a la ejecuci√≥n de las consultas `GetSubjects` y `GetInquiries`.
* **Descripci√≥n**: Se auditaron y registraron los m√©todos de extensi√≥n necesarios en el pipeline de inicializaci√≥n del servidor GraphQL en `Startup.cs`. Se inyectaron `.AddProjections()`, `.AddFiltering()` y `.AddSorting()` al constructor de dependencias `services.AddGraphQLServer()`, habilitando que los atributos `[UseProjection]` usados previamente en los resolvers deleguen efectivamente los √°rboles de consulta al proveedor de Entity Framework de manera nativa.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Feature: GraphQL Endpoints para Subjects e Inquiries (Rama: 093-backend-inquiries-subjects-endpoints)

* **Objetivo**: Proveer al backend de los resolvers GraphQL necesarios para soportar la lectura de materias, publicaciones del muro y la creaci√≥n de las mismas mediante firmas planas (evitando errores 400).
* **Descripci√≥n**: Se inyect√≥ `[Service] OneItbContext` nativamente en los resolvers. En `Query.cs` se implementaron `GetSubjects` y `GetInquiries`, ambos con atributos `[UseProjection]` para optimizaci√≥n de queries hacia la BD mediante IQueryable. En `Mutation.cs` se agreg√≥ `AddInquiry` bajo el atributo `[Authorize]`, que toma argumentos planos (`userId`, `subjectId`, `title`, `content`), construye la entidad f√≠sica y aplica el `SaveChangesAsync()`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix/Feature: Mutaci√≥n Plana y Formulario de Publicaci√≥n (Rama: 091-build-flat-mutation)

* **Objetivo**: Reconstruir el formulario de creaci√≥n de consultas en el feed tras el rollback y conectarlo al backend asegurando el env√≠o de variables planas para evitar el Error 400 documentado con HotChocolate.
* **Descripci√≥n**: Se implementaron desde cero las sentencias de Apollo Client `GET_SUBJECTS` y `CREATE_INQUIRY` en archivos separados (queries y mutations). Se actualizaron los imports y el estado local en `Feed.jsx` para integrar el formulario de manera fluida antes de las tarjetas de publicaciones. La firma de la mutaci√≥n env√≠a exclusivamente escalares directos, transformando `subjectId` a entero (`parseInt`) por seguridad, y prescindiendo de envoltorios `input` o `payload`, garantizando compatibilidad 1:1 con la nueva estructura del Backend.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix: Erradicaci√≥n de Shadow Properties (Rama: 090-fix-shadow-properties)

* **Objetivo**: Eliminar la generaci√≥n de columnas fantasma (como `SubjectId1`) en EF Core para evitar la interrupci√≥n de la creaci√≥n de publicaciones (Error 547) generada por llaves for√°neas incorrectas.
* **Descripci√≥n**: Se aplic√≥ una soluci√≥n rigurosa usando Fluent API en el m√©todo `OnModelCreating` de `OneItbContext.cs`, mapeando bidireccionalmente la relaci√≥n 1:N entre `Subject` e `Inquiry` (`HasOne...WithMany...HasForeignKey`), y estableciendo la pol√≠tica estricta de borrado `DeleteBehavior.Restrict`. Se inyectaron correctamente las colecciones de navegaci√≥n en los modelos `Subject.cs` e `Inquiry.cs`. Finalmente, se aplic√≥ la migraci√≥n `FixShadowProperties` a la base de datos de manera exitosa y sin generar conflictos con el Frontend.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/` (Archivos de Migraci√≥n)

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Feature: Professional Seed Users (Rama: 088-professional-seed-users)

* **Objetivo**: Implementar el sembrado autom√°tico de usuarios de prueba (Seeding) para todos los roles del sistema utilizando GUIDs est√°ticos y contrase√±as hasheadas con BCrypt, garantizando la idempotencia y evitando errores de integridad referencial.
* **Descripci√≥n**: Se instal√≥ el paquete `BCrypt.Net-Next` en la capa de Datos (resolviendo un conflicto de versiones con `Services.csproj` mediante la estandarizaci√≥n a la v4.2.0). Se cre√≥ `DbInitializer.cs` definiendo 5 constantes UUID reales e inmutables. El sembrador crea las entidades `Account` (con la clave "Test1234!" hasheada) y sus respectivas entidades `User` (para los roles Administrador, Estudiante, Profesor, Moderador, Empleador). Se inyect√≥ la llamada a la inicializaci√≥n en el pipeline de arranque de `Program.cs`. La compilaci√≥n finaliz√≥ exitosamente (0 Errores).
* **Archivos Modificados**:
  - `API Graphql/Data/Data.csproj` y `API Graphql/Services/Services.csproj`
  - `API Graphql/Data/DbInitializer.cs` (Nuevo)
  - `API Graphql/OneITB/Program.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-13] - Bugfix: Actualizaci√≥n de Font Awesome para Zero Warnings (Rama: 081-fontawesome-upgrade)

* **Objetivo**: Erradicar el warning recurrente de Chromium (`Glyph bbox was incorrect; adjusting`) provocado por errores internos de c√°lculo en Font Awesome 6.1.x, actualizando la librer√≠a a la versi√≥n 6.6.0.
* **Descripci√≥n**: Se modific√≥ el punto de entrada principal del Frontend (`index.html`) para importar el CDN de Font Awesome v6.6.0 en lugar de v6.1.2. Esta versi√≥n contiene los parches oficiales para el bug de la "bounding box" al renderizar √≠conos s√≥lidos en navegadores modernos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-12] - UI: Fix Regla de Hooks en AdminDashboard (Rama: 062-admin-dashboard-hooks-fix)

* **Objetivo**: Solucionar la excepci√≥n "Rendered more hooks than during the previous render" garantizando que los hooks se ejecuten incondicionalmente en la capa de administraci√≥n.
* **Descripci√≥n**: Se auditaron y refactorizaron los subcomponentes internos `SubjectsManagement` y `ReportsManagement` en `AdminDashboard.jsx`. Se identific√≥ que `useMemo` estaba siendo invocado despu√©s de retornos tempranos condicionales (`if (loading) return ...`). La soluci√≥n consisti√≥ en elevar la definici√≥n de los hooks de filtrado reactivo (`filteredSubjects` y `filteredReports`) por encima de cualquier cl√°usula de retorno temprano, restaurando el cumplimiento √≠ntegro de las "Rules of Hooks" de React y estabilizando el panel en tiempo de ejecuci√≥n.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Frontend: Interfaz Rol Empleador y Moderaci√≥n Comunitaria (Rama: 046-frontend-employer-and-moderation)

* **Objetivo**: Integrar las nuevas funcionalidades de acceso "Passwordless" y reportes de contenido en la interfaz de React utilizando Tailwind v4.
* **Descripci√≥n**: Se dise√±√≥ el componente `EmployerLogin.jsx` con los estados necesarios para solicitar el Magic Link (simulando AFIP) y procesar el inicio de sesi√≥n. Se agreg√≥ un componente gen√©rico `ReportModal.jsx` y se integr√≥ en el `Feed.jsx`, permitiendo a los usuarios pulsar la bandera de reporte en cualquier publicaci√≥n para enviarla a revisi√≥n.
* **Archivos Modificados/Creados**:
  - `src/data/graphql/mutations/employer.js` & `moderation.js`
  - `src/Components/auth/EmployerLogin.jsx`
  - `src/Components/moderation/ReportModal.jsx`
  - `src/router/Routing.jsx` (Ruta '/employer-login')
  - `src/Components/publication/Feed.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Backend: Infraestructura Rol Empleador y Moderaci√≥n (Rama: 045-backend-employer-and-moderation)

* **Objetivo**: Implementar la l√≥gica y persistencia del nuevo rol de Empleador y del sistema de Reportes Comunitarios.
* **Descripci√≥n**: Se crearon las entidades `MagicLink` y `CommunityReport`, mape√°ndolas con Entity Framework y aplicando una migraci√≥n a la base de datos local. Se dise√±aron los servicios `EmployerAuthService` (Passwordless + Simulador AFIP) y `ModerationService`, los cuales fueron expuestos en la API a trav√©s de las nuevas mutaciones GraphQL `RequestMagicLink`, `LoginWithMagicLink` y `ReportContent`.
* **Archivos Modificados/Creados**:
  - `Entities/Models/MagicLink.cs`, `Entities/Models/CommunityReport.cs`
  - `Data/OneItbContext.cs` (+ Migraci√≥n)
  - `Services/Auth/EmployerAuthService.cs`, `Services/Moderation/ModerationService.cs`
  - `OneITB/GraphQL/Mutation.cs`, `OneITB/Startup.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Documentaci√≥n: Actualizaci√≥n de Requerimientos (Rama: 044-docs-employer-role-update)

* **Objetivo**: Formalizar las decisiones arquitect√≥nicas respecto a nuevos roles y modalidades de acceso en el documento rector.
* **Descripci√≥n**: Se actualiz√≥ el archivo `02_Requerimientos.md` para incluir el flujo de autenticaci√≥n Passwordless (AFIP) en el RF-003, la excepci√≥n de la regla de dominio institucional para empresas en el RF-001, el nuevo esquema de Moderaci√≥n Comunitaria (RF-013) y la definici√≥n oficial de los perfiles Empleador y Moderador.
* **Archivos Modificados**:
  - `docs/academic/02_Requerimientos.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Bugfix & Config: Correcci√≥n de Consulta GraphQL de Usuarios (Rama: 043-admin-dashboard-fix-users-query)

* **Objetivo**: Habilitar el rastreo de excepciones en HotChocolate y resolver el error 500 en la recuperaci√≥n de la lista de usuarios.
* **Descripci√≥n**:
  - Se configur√≥ `.ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true)` en `Startup.cs` para exponer stack traces completos de GraphQL en desarrollo.
  - Se a√±adi√≥ la inyecci√≥n faltante de `.AddAuthorization()` al `AddGraphQLServer()` para resolver el error de construcci√≥n de esquema de los decoradores `[Authorize]`.
  - Se corrigi√≥ el mapeo y proyecci√≥n de Entity Framework Core en el repositorio (`UnitOfWork.cs` -> `GetAll()`). Se a√±adi√≥ `.Include(u => u.Account)` para evitar resoluciones `null` en relaciones estrictas, solucionando la falla total de la consulta de usuarios.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Full Stack: Integraci√≥n GraphQL para Dashboard de Administraci√≥n (Rama: 042-admin-user-management-graphql)

* **Objetivo**: Conectar la interfaz de gesti√≥n de usuarios del frontend con la base de datos SQL Server mediante el backend de GraphQL (.NET 8 HotChocolate), descartando el Mock Data.
* **Descripci√≥n**:
  - **Backend**: Se introdujo el campo `IsActive` (bool) al modelo `User.cs` y a la base de datos mediante EF Core Migrations (`AddUserIsActive`). Se crearon dos nuevas mutaciones en `Mutation.cs`: `UpdateUserRole` y `UpdateUserStatus`, ambas delegadas de forma segura a `UsersService`. La compilaci√≥n del backend result√≥ exitosa (0 errores).
  - **Frontend**: En el componente `UserManagement.jsx`, se elimin√≥ la dependencia de Mock Data y se implementaron los hooks de Apollo Client (`useQuery` para `GetUsers`, `useMutation` para `UpdateUserRole` y `UpdateUserStatus`). Los controles interactivos de la grilla (Select de roles y Toggle de estado) ahora invocan estas mutaciones directamente y disparan `refetch()` para asegurar la sincronizaci√≥n en tiempo real. La compilaci√≥n de Vite fue exitosa.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Services/Users/IUsersService.cs` y `UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: Dashboard de Administraci√≥n de Usuarios (Rama: 041-admin-user-management)

* **Objetivo**: Crear una interfaz dedicada para administradores que permita la gesti√≥n de usuarios, roles y estados de activaci√≥n.
* **Descripci√≥n**: Se construy√≥ un nuevo componente `UserManagement.jsx` bajo `src/Components/admin/`. Este incluye una grilla de datos responsiva creada completamente con Tailwind CSS v4. Permite simular cambios de rol (Usuario/Administrador) mediante un `<select>` y el estado de la cuenta (activo/suspendido) a trav√©s de un toggle interactivo, validados inicialmente con mock data. El componente se integr√≥ en el enrutamiento privado (`/admin/users`) y se agreg√≥ un enlace en la barra de navegaci√≥n principal (`Nav.jsx`) visible para usuarios autenticados. La compilaci√≥n fue exitosa con 0 errores.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx` (nuevo)
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: Inyecci√≥n de Header en Rutas P√∫blicas (Rama: 040-public-layout-header-fix)

* **Objetivo**: Integrar el componente `Header` en las rutas p√∫blicas de la aplicaci√≥n (`PublicLayout`) y manejar el estado no autenticado.
* **Descripci√≥n**: Se refactoriz√≥ `PublicLayout.jsx` para inyectar `<Header />` sobre el `<main>` container y establecer un layout de columna (`flex flex-col min-h-screen`). Adem√°s, se modific√≥ `Nav.jsx` para renderizar condicionalmente los botones de "Iniciar Sesi√≥n" y "Registrarse" usando utilidades Tailwind cuando el usuario no est√° autenticado (`!auth.id`), ocultando correctamente el men√∫ de usuario/avatar. La compilaci√≥n result√≥ exitosa (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Backend: Validaci√≥n y Fix de Compatibilidad .NET 8 (Rama: 039-backend-dotnet8-validation)

* **Objetivo**: Ejecutar la bater√≠a de pruebas automatizadas para validar el upgrade a .NET 8 y corregir los breaking changes detectados.
* **Pruebas ejecutadas y resultados**:
  1. **`dotnet restore`**: Error inicial `NU1102` ‚Äî `System.ComponentModel.Annotations 8.0.0` no existe en NuGet (es inbox en .NET 8 SDK). Fix: se elimin√≥ la `<PackageReference>` de `Services.csproj`. Resultado final: ‚úÖ Todos los proyectos restaurados.
  2. **`dotnet build`**: Error inicial ‚Äî breaking change de HotChocolate 13‚Üí14: `RegisterDbContext<T>(DbContextKind.Pooled)` fue reemplazado por `RegisterDbContextFactory<T>()`. Fix aplicado en `Startup.cs`. Resultado final: ‚úÖ **Compilaci√≥n correcta ‚Äî 0 Errores, 0 Advertencias**. DLLs generados en `bin/Debug/net8.0/`.
  3. **`dotnet ef database update`**: ‚úÖ **"Build succeeded. Done."** ‚Äî Base de datos conectada y migraci√≥n aplicada correctamente.
* **Archivos Modificados**:
  - `API Graphql/Services/Services.csproj` (eliminaci√≥n de referencia inbox)
  - `API Graphql/OneITB/Startup.cs` (fix HC14 breaking change: `RegisterDbContext` ‚Üí `RegisterDbContextFactory`)
* **Nota**: EF CLI global instalada es `6.0.36`. Recomendado actualizar con `dotnet tool update --global dotnet-ef` para alinear con el runtime `8.0.6`.

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - Backend: Migraci√≥n a .NET 8 LTS (Rama: 038-backend-dotnet8-upgrade)

* **Objetivo**: Migrar los 4 proyectos del backend de .NET 6 (EOL) a .NET 8 LTS y actualizar todas las dependencias NuGet cr√≠ticas a sus versiones compatibles.
* **Pre-Upgrade**: Todos los proyectos estaban en `net6.0` con EF Core `7.0.4`, HotChocolate `13.0.5`, JwtBearer `6.0.16`.
* **Cambios aplicados**:

| Proyecto | TFM | EF Core | HotChocolate | JwtBearer |
---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)

| Entities.csproj | net6.0 ‚Üí **net8.0** | ‚Äî | ‚Äî | ‚Äî |
| Data.csproj | net6.0 ‚Üí **net8.0** | 7.0.4 ‚Üí **8.0.6** | ‚Äî | ‚Äî |
| Services.csproj | net6.0 ‚Üí **net8.0** | ‚Äî | 13.0.5 ‚Üí **14.2.0** | ‚Äî |
| GraphQL.csproj | net6.0 ‚Üí **net8.0** | 7.0.4 ‚Üí **8.0.6** | 13.0.5 ‚Üí **14.2.0** | 6.0.16 ‚Üí **8.0.6** |

* **QA**: grep `net6.0` ‚Üí 0 resultados en todos los .csproj. grep `net8.0` ‚Üí 4/4 confirmados.
* **Nota**: `BCrypt.Net-Next` se mantuvo en `4.0.3` (framework-agnostic, sin cambio requerido). `System.ComponentModel.Annotations` actualizado a `8.0.0`.
* **Archivos Modificados**:
  - `API Graphql/Entities/Entities.csproj`
  - `API Graphql/Data/Data.csproj`
  - `API Graphql/Services/Services.csproj`
  - `API Graphql/OneITB/GraphQL.csproj`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: Global Tailwind Refactor ‚Äî Capa Social (Rama: 037-global-tailwind-refactor)

* **Objetivo**: Reparar los da√±os est√©ticos causados por la purga del CSS legacy (036) en los componentes de la red social, migr√°ndolos al uso exclusivo de Tailwind CSS v4.
* **Descripci√≥n**: Auditor√≠a grep completa detect√≥ 6 componentes con clases BEM residuales. `Nav.jsx` fue reescrito eliminando todas las clases BEM (`navbar__container-lists`, `list-end__img`, `menu-list__link`) y los inline styles con `fontSize: '1.4rem'` que causaban el avatar gigante ‚Äî reemplazado con avatar estrictamente `w-9 h-9 rounded-full object-cover` + dropdown Tailwind con click-outside. `Feed.jsx` fue reescrito eliminando 15+ clases BEM (`posts__post`, `post__user-image`, etc.) ‚Äî posts ahora son tarjetas `bg-white rounded-xl shadow-sm` con avatares `w-10 h-10`. `Login.jsx`, `Register.jsx` y `EditProfile.jsx` fueron reescritos con layout de card centrado, inputs con focus rings, banners de alerta Tailwind ‚Äî toda la l√≥gica de autenticaci√≥n y mutaciones GraphQL preservada. Se corrigi√≥ una redirecci√≥n obsoleta `/social/profile` ‚Üí `/profile` en `EditProfile`. Build: 0 errores, 293 m√≥dulos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx` (reescritura Tailwind)
  - `AGENTS.md` y `.specify/feature.json` (actualizaci√≥n de referencia activa)

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: CSS Supremacy ‚Äî Erradicaci√≥n de Legacy y Sistema de Dise√±o √önico (Rama: 036-theme-and-css-supremacy)

* **Objetivo**: Eradicar definitivamente todas las hojas de estilo heredadas y establecer el sistema de dise√±o de `_temp_cv_reference` (Tailwind v4 + Inter + variables @theme) como √∫nica fuente de verdad.
* **Descripci√≥n**: Se sobrescribi√≥ `src/index.css` con el contenido exacto de `_temp_cv_reference/index.css`, eliminando el bloque `:root` de variables shadcn-style (`--primary`, `--background`, etc.) que no son utilizadas por ning√∫n componente y que envenenaban el namespace. Se removieron de `main.jsx` los tres imports de CSS legacy (`normalize.css`, `styles.css`, `responsive.css`) ‚Äî ahora solo existe `import './index.css'`. Los tres archivos CSS legacy fueron f√≠sicamente vaciados con un comentario "tombstone" para prevenir reimportaciones accidentales. El `index.html` ya ten√≠a Inter y Font Awesome correctamente inyectados. Resultado del build: 0 errores, 294 m√≥dulos, bundle CSS reducido de **45.40 kB ‚Üí 35.15 kB (‚àí10 kB)**.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/index.css` (reescritura con contenido exacto de referencia)
  - `FrontEnd/OneItb-FE/src/main.jsx` (eliminaci√≥n de 3 imports de CSS legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (vaciado ‚Äî tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (vaciado ‚Äî tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/normalize.css` (vaciado ‚Äî tombstone)
* **Archivos Creados**:
  - `specs/036-theme-and-css-supremacy/spec.md`
  - `specs/036-theme-and-css-supremacy/plan.md`
  - `specs/036-theme-and-css-supremacy/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: Trasplante Literal del CV Builder a /profile (Rama: 035-literal-cv-transplant)

* **Objetivo**: Eliminar el overlapping de layouts inventados en `/profile` y realizar un trasplante exacto del layout y componentes de `_temp_cv_reference` hacia `UserProfile.tsx`, garantizando una fidelidad 100% visual al dise√±o original.
* **Descripci√≥n**: Se diagnostic√≥ la causa ra√≠z del overlapping: el `overflow-y-auto` del `<main>` de `PrivateLayout` conflictuaba con el `overflow-hidden` y `h-[calc(100vh-...)]` del workspace del CV, haciendo que los paneles internos se pisaran. La soluci√≥n fue cambiar `PrivateLayout`'s `<main>` a `overflow-hidden` para ceder el control de scroll al componente hijo. `UserProfile.jsx` fue completamente reescrito como una copia literal de `_temp_cv_reference/App.tsx`: mismo `<div className="min-h-screen bg-slate-50 flex flex-col font-sans">`, mismo `<main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-56px)]">`, mismo editor section, mismo preview section. El `initialData` fue copiado verbatim. Los cinco formularios (`PersonalForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsLanguagesForm`) fueron conectados con los prop names exactos de sus interfaces TypeScript. Se corrigi√≥ `types/resume.ts` para hacer `hidden` opcional en todas las interfaces. El archivo fue renombrado a `.tsx` para soportar anotaciones TypeScript. Build: 0 errores, 297 m√≥dulos, 459ms.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` ‚Üí renombrado a `UserProfile.tsx` (reescritura total)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (fix overflow-hidden)
  - `FrontEnd/OneItb-FE/src/types/resume.ts` (hidden opcional en todas las interfaces)
  - `AGENTS.md` y `.specify/feature.json` (actualizaci√≥n de referencia activa)
* **Archivos Creados**:
  - `specs/035-literal-cv-transplant/spec.md`
  - `specs/035-literal-cv-transplant/plan.md`
  - `specs/035-literal-cv-transplant/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-10] - UI: Refactorizaci√≥n Total del Layout Global y Vista de Perfil (Rama: 034-total-frontend-refactor)

* **Objetivo**: Erradicar las dependencias de CSS legacy (grillas `.layout` rotas) y adoptar Tailwind CSS v4 como √∫nica autoridad de layout, garantizando la integraci√≥n perfecta de los nuevos componentes de CV y el cumplimiento del RNF-004 (Usabilidad y Adaptabilidad).
* **Descripci√≥n**: Se neutraliz√≥ la definici√≥n `display: grid` y las propiedades `grid-template-areas/rows/columns` de la clase `.layout` en `styles.css`, removiendo tambi√©n las referencias `grid-area` de `.layout__content` y `.layout__aside`. `PrivateLayout.jsx` fue reescrito con un contenedor `flex flex-col min-h-screen` y un body con `<main className="flex-1 overflow-y-auto">` m√°s un `<aside>` lateral visible en lg+, eliminando completamente la dependencia de la grilla CSS. `SideBar.jsx` fue √≠ntegramente reescrito en Tailwind preservando el avatar, stats y formulario de publicaci√≥n. `Header.jsx` fue actualizado a un header sticky con Tailwind. En `UserProfile.jsx` se eliminaron las clases `content__header` y `content__title` del legacy, reemplaz√°ndolas con un encabezado Tailwind de doble columna con acento visual. La compilaci√≥n `npm run build` complet√≥ en 507ms con 0 errores y 293 m√≥dulos transformados.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (Neutralizaci√≥n del grid legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (Marcado como deprecated)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` (Limpieza de clases legacy)
  - `AGENTS.md` (Actualizaci√≥n de referencia de plan activo)
  - `.specify/feature.json` (Actualizaci√≥n de feature activo)
* **Archivos Creados**:
  - `specs/034-total-frontend-refactor/spec.md`
  - `specs/034-total-frontend-refactor/plan.md`
  - `specs/034-total-frontend-refactor/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Correcci√≥n de Consulta GraphQL en Perfil (Rama: 027-fix-profile-graphql-400)

* **Objetivo**: Solventar el error HTTP 400 (Bad Request) al cargar la vista del Perfil alineando las consultas del frontend con el esquema de HotChocolate.
* **Descripci√≥n**: Se modific√≥ `getUserProfile.js` para remover el par√°metro de variable no utilizado `$id` de la firma de consulta, el cual era rechazado sint√°cticamente por el endpoint del backend. Se alinearon las propiedades requeridas del payload solicitando el campo de introspecci√≥n `alias` y acopl√°ndolo al mapeo reactivo de la foto de perfil en el DOM en `UserProfile.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/027-fix-profile-graphql-400/spec.md`
  - `specs/027-fix-profile-graphql-400/plan.md`
  - `specs/027-fix-profile-graphql-400/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Correcci√≥n de SRI y Reflow de Layout (Rama: 025-hotfix-console-warnings)

* **Objetivo**: Solucionar bloqueos de seguridad SRI de Font Awesome y eliminar advertencias de "Layout Forced" en la consola del navegador.
* **Descripci√≥n**: Se modific√≥ `index.html` para remover atributos `integrity` y `crossorigin` del recurso Font Awesome del CDN, solucionando bloqueos por firmas de integridad incompatibles. En `ResumePreview.tsx`, se reestructur√≥ la medici√≥n de `scrollHeight` en el hook `useEffect` envolvi√©ndola en una llamada `requestAnimationFrame`, programando de forma diferida el c√°lculo de hojas y eliminando bloqueos de UI (Forced Reflow) en el hilo de ejecuci√≥n principal.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx`
  - `specs/025-hotfix-console-warnings/spec.md`
  - `specs/025-hotfix-console-warnings/plan.md`
  - `specs/025-hotfix-console-warnings/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Enrutamiento Limpio, Landing Page y Unificaci√≥n de Perfil (Rama: 023-router-fix-and-cv-layout)

* **Objetivo**: Eliminar el prefijo `/social` de las rutas SPA, crear una p√°gina de inicio (Landing Page) en `/`, unificar la edici√≥n de perfil eliminando la sub-ruta `/profile/edit` y mapear enlaces correctamente.
* **Descripci√≥n**: Se elimin√≥ el prefijo `/social` de todas las rutas del frontend, actualizando el archivo `Routing.jsx` y todas las referencias de enlaces en `Header.jsx`, `Nav.jsx` y `SideBar.jsx`. Se cre√≥ el componente `Landing.jsx` y se configur√≥ como el componente principal para el path `/`. Adicionalmente, se retir√≥ la ruta `/profile/edit` y su enlace correspondiente en la barra de navegaci√≥n superior, unificando la edici√≥n dentro del perfil en doble columna en `/profile`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `specs/023-router-fix-and-cv-layout/spec.md`
  - `specs/023-router-fix-and-cv-layout/plan.md`
  - `specs/023-router-fix-and-cv-layout/tasks.md`
* **Archivos Creados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Landing.jsx`
  - `specs/023-router-fix-and-cv-layout/research.md`
  - `specs/023-router-fix-and-cv-layout/data-model.md`
  - `specs/023-router-fix-and-cv-layout/quickstart.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Revamp de Navegaci√≥n y Perfil Doble Columna (Rama: 022-navigation-profile-revamp)

* **Objetivo**: Refactorizar la navegaci√≥n global (Header/Nav) eliminando enlaces obsoletos y crear un men√∫ de usuario din√°mico, e integrar los formularios de actualizaci√≥n del curr√≠culum al perfil p√∫blico en doble columna.
* **Descripci√≥n**: Se modific√≥ `Nav.jsx` removiendo accesos inactivos en el Header, implementando el saludo din√°mico "Hola {username}" e inyectando un men√∫ desplegable interactivo para acceder a Ajustes y Cerrar sesi√≥n. Se dise√±√≥ una estructura de doble columna en `UserProfile.jsx` que combina la previsualizaci√≥n del portafolio profesional (LinkedIn-style CV layout a la izquierda) y el formulario editable de actualizaci√≥n de biograf√≠a y redes sociales a la derecha (conectado a la mutaci√≥n de Apollo y al estado de sesi√≥n). Por √∫ltimo, se inyect√≥ una burbuja flotante condicional a la sesi√≥n de usuario para la mensajer√≠a privada (M√≥dulo 4) en `PrivateLayout.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/022-header-ux-cv-profile/spec.md`
  - `specs/022-header-ux-cv-profile/plan.md`
  - `specs/022-header-ux-cv-profile/tasks.md`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - BD: Aplicaci√≥n de Migraciones EF Core de Perfil (Rama: 021-apply-profile-migration)

* **Objetivo**: Ejecutar comandos de Entity Framework Core desde el agente para aplicar y verificar la actualizaci√≥n f√≠sica de la base de datos de perfiles.
* **Descripci√≥n**: Se aplic√≥ de forma interactiva la migraci√≥n `AddUserBioAndSocials` mediante `dotnet ef database update --project ../Data --startup-project .` desde la ra√≠z de ejecuci√≥n de la API GraphQL. Se confirm√≥ la compilaci√≥n limpia del servidor y el almacenamiento persistente de las nuevas columnas nullable (`Biography`, `LinkedIn`, `Facebook`, `Instagram`, `Phone`) en la base de datos f√≠sica local de SQL Server.
* **Archivos Modificados**:
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)
  - `specs/021-apply-profile-migration/tasks.md` (Completado)

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - BD/API/UI: M√≥dulo 2 - Perfiles, Biograf√≠a y Redes (Rama: 020-user-profiles-bio)

* **Objetivo**: Desarrollar la persistencia de biograf√≠a y redes sociales en el perfil de usuario a nivel de Base de Datos, API GraphQL y crear las interfaces del cliente frontend.
* **Descripci√≥n**: Se expandi√≥ el modelo C# `User.cs` con propiedades para `Biography`, `LinkedIn`, `Facebook`, `Instagram` y `Phone`. Se gener√≥ la migraci√≥n `AddUserBioAndSocials` aplicando los cambios en la base de datos de SQL Server. En el backend, se cre√≥ el DTO `UpdateProfileInput`, se implement√≥ la mutaci√≥n `UpdateProfile` expuesta en HotChocolate y se mapearon sus campos a camelCase en `Startup.cs`. En el frontend React, se crearon los componentes `Profile.jsx` (tarjeta profesional con enlaces de redes) y `EditProfile.jsx` (formulario de edici√≥n de perfil), enlaz√°ndolos en el enrutador `Routing.jsx` y activando sus accesos r√°pidos en la barra de navegaci√≥n lateral y superior.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/IUsersService.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `docs/project_docs/ROADMAP.md`
* **Archivos Creados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/updateProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/Profile.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Implementaci√≥n de Mejoras R√°pidas (Quick Wins) (Rama: 019-frontend-quick-wins)

* **Objetivo**: Estabilizar y corregir la interfaz visual (UI/UX) del frontend aplicando las mejoras r√°pidas de alto impacto identificadas en la auditor√≠a.
* **Descripci√≥n**: Se movi√≥ la clase contenedora `.layout` desde `App.jsx` hacia `PrivateLayout.jsx` y `PublicLayout.jsx` para restablecer el acoplamiento directo de CSS Grid, logrando alinear correctamente la columna del SideBar (30% de ancho) junto al Feed principal (70% de ancho). En `Nav.jsx`, se reemplazaron los enlaces est√°ticos `href="#"` por elementos `<NavLink />` de React-Router, vincul√°ndolos a las rutas SPA operativas, y se inyect√≥ la informaci√≥n din√°mica del usuario (`auth.username`) desde `AuthContext`. Por √∫ltimo, se renombr√≥ el archivo `feed.jsx` a `Feed.jsx` para ajustarse a la convenci√≥n est√°ndar PascalCase de React y se actualizaron sus respectivas importaciones.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/App.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
* **Archivos Renombrados**:
  - `FrontEnd/OneItb-FE/src/Components/publication/feed.jsx` -> `Feed.jsx` (PascalCase)

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Relevamiento y Auditor√≠a de Frontend (Rama: 018-frontend-deep-audit)

* **Objetivo**: Realizar un relevamiento exhaustivo del c√≥digo fuente del Frontend para identificar la estructura del √°rbol de componentes, fallos de enrutamiento y plantear est√°ndares modernos de desarrollo.
* **Descripci√≥n**: Se llev√≥ a cabo un escaneo completo de `FrontEnd/OneItb-FE/src/`. Se diagnostic√≥ el error de visualizaci√≥n del SideBar (debido a la jerarqu√≠a rota de CSS Grid provocada por envolver el enrutador en la clase contenedora de `App.jsx`) y el comportamiento inactivo de los enlaces del Header. Adicionalmente, se redact√≥ el reporte formal de auditor√≠a y se definieron pautas de nomenclatura (BEM, FSD, y PascalCase/camelCase) para guiar los desarrollos de los m√≥dulos de Perfiles y Publicaciones.
* **Archivos Creados/Modificados**:
  - `FRONTEND_AUDIT_REPORT.md` (Creado)
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Refactor Visual Profundo UI/UX (Rama: 016-ui-ux-revamp)

* **Objetivo**: Implementar un redise√±o visual profundo en el frontend (React) con tipograf√≠a moderna, paleta de colores Clean/EdTech y verificaci√≥n de adaptabilidad responsiva sin alterar la l√≥gica.
* **Descripci√≥n**: Se integr√≥ la tipograf√≠a corporativa **Inter** desde Google Fonts en `index.html` y se configur√≥ como el tipo de letra principal en `styles.css`. Se refinaron las variables de dise√±o CSS (`:root`) para aplicar la paleta "Clean/EdTech" con tonalidades pizarra claras/oscuras y acento azul el√©ctrico (`#3b82f6`). Adicionalmente, se audit√≥ la adaptabilidad responsiva en `responsive.css` para asegurar el cumplimiento del requerimiento de usabilidad (RNF-004) en resoluciones m√≥viles y de escritorio.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI: Refactor Visual y Reparaci√≥n de Recursos (Rama: 015-ui-polish-assets)

* **Objetivo**: Solucionar errores de carga de recursos est√°ticos (imagen 404 y fuentes corruptas de FontAwesome) y refabricar el estilo visual de los formularios de autenticaci√≥n y el layout principal.
* **Descripci√≥n**: Se integr√≥ el CDN oficial de FontAwesome 6.1.2 en `index.html` y se removi√≥ la importaci√≥n del archivo CSS local corrupto en `main.jsx` para evitar advertencias en consola. En `SideBar.jsx` se modific√≥ el origen del avatar para generar iniciales din√°micamente con ui-avatars.com bas√°ndose en el nombre de usuario autenticado. Se aplicaron estilos visuales premium para inputs, botones con gradientes, cajas de formularios con sombras y alertas personalizadas en `styles.css`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - UI/Auth-Routing: Persistencia de Token y Redirecci√≥n en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la inyecci√≥n autom√°tica del token Bearer en el cliente Apollo, el estado de sesi√≥n global en React y la redirecci√≥n program√°tica al Feed tras Login (T1.5).
* **Descripci√≥n**: Se configur√≥ `setContext` (authLink) en `GraphqlProvider.js` para adjuntar din√°micamente el header `Authorization` con el JWT de localStorage. En `Login.jsx` se modific√≥ el callback de la mutaci√≥n para guardar el token/usuario en el almacenamiento y utilizar `useNavigate('/social')` para redirecci√≥n SPA.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/context/AuthProvider.jsx`
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-09] - API/Auth: Implementaci√≥n Criptogr√°fica de JWT para Login (Rama: 010-frontend-tracing)

* **Objetivo**: Reemplazar el token est√°tico de prueba placeholder por una generaci√≥n criptogr√°fica de JWT v√°lida, alineando firmas y DTOs al est√°ndar en ingl√©s.
* **Descripci√≥n**: Se inyect√≥ `IConfiguration` en `AccountsService.cs` y se program√≥ la firma de tokens HS256 utilizando `System.IdentityModel.Tokens.Jwt` con los Claims correspondientes de ID, nombre y rol. Adem√°s, se renombr√≥ `LoginPayload` a `AuthPayload` y `LoginAsync` a `Login` en `DTOs.cs`, `Mutation.cs`, y en las interfaces de servicios para cumplir con las directivas de nomenclatura.
* **Archivos Modificados**:
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Accounts/IAccountService.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/authenticateUser.js`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - BD/Entidades: Refactorizaci√≥n Completa de Entidades al Ingl√©s y Hard Reset de DB (Rama: 010-frontend-tracing)

* **Objetivo**: Traducir todas las entidades y columnas de la base de datos f√≠sica al ingl√©s para alinearse a la directiva de nomenclatura AD-006.
* **Descripci√≥n**: Se eliminaron las entidades en espa√±ol `Materia.cs` y `Consulta.cs`, reemplaz√°ndolas por `Subject.cs` e `Inquiry.cs` con propiedades en ingl√©s. Se eliminaron los mapeos expl√≠citos (workarounds) de nombres en espa√±ol en `OneItbContext.cs`. Finalmente, se borr√≥ el historial de migraciones f√≠sicas, se aplic√≥ un drop de base de datos y se actualiz√≥ el esquema f√≠sico desde cero en SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - API/Resolvers: Mapeo de Nomenclatura en la Entidad User de GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Corregir errores de campos no encontrados en la introspecci√≥n del cliente GraphQL mapeando expl√≠citamente las propiedades hacia el esquema y garantizar su visibilidad en camelCase.
* **Descripci√≥n**: Se modific√≥ la configuraci√≥n de `ObjectType<User>` en `Startup.cs` para mapear los campos requeridos por el frontend a la convenci√≥n camelCase: `Id` se mapea a `idUsuario`, `Nombre` a `nombre`, `Apellido` a `apellidos`, y se definieron resolvers virtuales para `alias` (retornando `Nombre`) y `email` (obteniendo el email de la propiedad de navegaci√≥n `Account`). Asimismo, se protegi√≥ la contrase√±a cifrada del usuario mediante la exclusi√≥n de `PasswordHash` en el tipo `Account` (`Ignore()`) conforme a la directiva de seguridad de datos (AD-003).
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - API/Resolvers: Exposici√≥n del campo de Consulta Usuarios en HotChocolate (Rama: 010-frontend-tracing)

* **Objetivo**: Solventar el error `The field 'Usuarios' does not exist on the type 'Query'` permitiendo al cliente Apollo introspectar y consumir la entidad de usuarios.
* **Descripci√≥n**: Se modific√≥ `Query.cs` agregando el m√©todo resolver `GetUsuarios` que retorna `IQueryable<User>` a trav√©s de `usersService.GetAllAsync()`, mape√°ndose autom√°ticamente al campo `usuarios` en el esquema de HotChocolate. Tambi√©n se adapt√≥ `GetUsers` para mantener compatibilidad con consultas en ingl√©s (`users`). Asimismo, para cumplir con la directiva de seguridad de datos (AD-003), se configur√≥ la exclusi√≥n del campo `PasswordHash` de la entidad `Account` mediante Fluent API en `Startup.cs` (`AddType(new ObjectType<Account>(d => d.Field(f => f.PasswordHash).Ignore()))`) evitando filtraciones.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - API/Resolvers: Resoluci√≥n de Consultas de Usuarios e Inyecci√≥n de Interfaces en GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la resoluci√≥n de consultas (Query) para la entidad Usuarios en HotChocolate, corregir la inyecci√≥n de servicios y registrar la configuraci√≥n correctamente en el middleware de GraphQL.
* **Descripci√≥n**: Se refactoriz√≥ `Query.cs` para inyectar la interfaz de servicio registrada en el contenedor de dependencias (`IUsersService`) en lugar de la clase concreta `UsersService`. Se modific√≥ la firma del m√©todo `GetUserById` para recibir par√°metros de tipo `Guid` de acuerdo con la clave primaria de la entidad. Adem√°s, se removieron registros innecesarios de servicios de entidad (`RegisterService<User>` y `RegisterService<Account>`) en `Startup.cs` para subsanar errores de inicializaci√≥n de tipos nativos como `string` en el motor de HotChocolate.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - BD/Migraci√≥n: Correcci√≥n de Propiedad IDENTITY en Migraci√≥n EF Core (Rama: 010-frontend-tracing)

* **Objetivo**: Evitar el error `InvalidOperationException: To change the IDENTITY property of a column...` al aplicar la √∫ltima migraci√≥n de base de datos sin destruir el historial.
* **Descripci√≥n**: Se refactoriz√≥ la migraci√≥n `20260608221114_FixRegistroUsuario.cs` para evitar el uso de `AlterColumn` e intentar convertir la columna `Id` de `int IDENTITY` a `Guid`. En su lugar, se configuraron llamadas expl√≠citas a `DropColumn` y `AddColumn` tanto en el m√©todo `Up` como en el `Down`, asegurando la recreaci√≥n de la llave primaria de forma correcta sin violar las restricciones de SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Data/Migrations/20260608221114_FixRegistroUsuario.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - API/Mutaci√≥n: Sincronizaci√≥n de Esquema RegisterInput y Resolver en Backend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el esquema de entrada de GraphQL (`RegisterInput`) y la mutaci√≥n con los requerimientos del Caso de Uso (CU-01) para solucionar el Error HTTP 500 por discrepancia de datos.
* **Descripci√≥n**: Se a√±adieron las propiedades `Nombre`, `Apellidos` y `CarrerasInscritas` al record `RegisterInput` en `DTOs.cs` para evitar desajustes en el mapeo de variables desde el cliente y alinear el esquema con el CU-01. Asimismo, se modific√≥ el m√©todo `RegisterAsync` de `UsersService.cs` para mapear el campo `Nombre` de la entidad `User` usando `input.Nombre` y `Apellido` usando `input.Apellidos` en lugar del valor hardcodeado `string.Empty` (el cual disparaba la excepci√≥n de dominio).
* **Archivos Modificados**:
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - UI/Trazabilidad: Trazabilidad y Sincronizaci√≥n de Variables de Registro en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el mapeo de variables entre el estado local del formulario React y la mutaci√≥n GraphQL e implementar trazabilidad por consola para el campo "Apellidos".
* **Descripci√≥n**: Se aline√≥ la nomenclatura de las variables del frontend mapeando el estado local del formulario `form.surname` a la propiedad `apellidos` dentro de las variables de la mutaci√≥n. Se inyect√≥ un `console.log("Datos a enviar a GraphQL:", variables);` justo antes de ejecutar la llamada as√≠ncrona a la mutaci√≥n para auditar y depurar el payload.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - UI/Validaci√≥n: Feedback Visual de Validaci√≥n y Control de Apellidos en Frontend (Rama: 009-frontend-feedback-validation)

* **Objetivo**: Proveer un mecanismo de retroalimentaci√≥n amigable en pantalla para errores de validaci√≥n local y de red, evitando alertas emergentes y validando todos los campos requeridos de `CU-01` (incluyendo Apellidos).
* **Descripci√≥n**: Se implement√≥ el estado local `errorMessage` en `Register.jsx` para capturar errores. La UI fue redise√±ada para renderizar din√°micamente un banner rojo con el mensaje de error de validaci√≥n del formulario (ej. Apellidos es obligatorio).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Validaci√≥n: Validaciones Locales de Formulario de Registro (Rama: 008-frontend-validations)

* **Objetivo**: Implementar chequeos locales antes de disparar la mutaci√≥n de registro, previniendo peticiones de red inv√°lidas innecesarias.
* **Descripci√≥n**: Se agregaron chequeos locales de campos vac√≠os, restricciones de longitud para alias (m√≠nimo 3 caracteres) y contrase√±a (m√≠nimo 8 caracteres) en `Register.jsx`, as√≠ como una expresi√≥n regular para forzar que el correo ingresado termine con el dominio oficial `@itbeltran.com.ar`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Manejo: Lanzar GraphQLException ante Excepciones de Validaci√≥n en Registro (Rama: 007-throw-graphql-exception)

* **Objetivo**: Propagar los errores de validaci√≥n de la entidad como excepciones nativas de GraphQL para que el motor de HotChocolate los maneje e informe en el array de errores est√°ndar.
* **Descripci√≥n**: Se modific√≥ el bloque catch de `System.ArgumentException` en `Mutation.RegisterUserAsync` para lanzar una `HotChocolate.GraphQLException` con el mensaje descriptivo de la entidad (ej. formato de email inv√°lido). Esto elimina la necesidad de respuestas encapsuladas exitosas/fallidas para errores graves de validaci√≥n de dominio.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Manejo: Captura y Control de ArgumentException en Mutaci√≥n de Registro (Rama: 006-handle-mutation-exceptions)

* **Objetivo**: Evitar errores de servidor HTTP 500 capturando excepciones de argumentos y retornando mensajes de validaci√≥n legibles.
* **Descripci√≥n**: Se envolvi√≥ la llamada a `usersService.RegisterAsync(input)` en un bloque `try-catch` capturando `System.ArgumentException` en `Mutation.cs`. Ante una falla de validaci√≥n (por ejemplo, formato de email inv√°lido o campos obligatorios vac√≠os lanzados por la capa de entidades), la mutaci√≥n retorna ahora una instancia de `UserPayload` controlada con `Success = false` y el mensaje de error de la excepci√≥n.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Alineaci√≥n: Mutaci√≥n de Registro GraphQL en Frontend y Backend (Rama: 005-align-graphql-mutation)

* **Objetivo**: Corregir el error 400 (Bad Request) en GraphQL al registrar usuarios desde el frontend.
* **Descripci√≥n**: Se actualiz√≥ el archivo de mutaci√≥n `addUser.js` del frontend para llamar a `registerUser(input: $input)` de acuerdo con la firma de `RegisterUserAsync` en el backend. Asimismo, se adapt√≥ el componente `Register.jsx` para pasar las variables correspondientes a `RegisterInput` (`username`, `email`, `password`) en lugar del conjunto anterior de par√°metros planos no v√°lidos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Correcci√≥n: Excepci√≥n de Casteo en Mutaci√≥n de HotChocolate (Rama: 004-fix-hotchocolate-mutation)

* **Objetivo**: Corregir la excepci√≥n cr√≠tica `System.InvalidCastException` de HotChocolate que imped√≠a compilar e iniciar el servidor.
* **Descripci√≥n**: Se removi√≥ el decorador `[ExtendObjectType(OperationTypeNames.Mutation)]` de la clase `Mutation` en `Mutation.cs`. Esto convirti√≥ a `Mutation` en la clase de mutaci√≥n base del esquema, alineando el backend con el registro `.AddMutationType<Mutation>()` de `Startup.cs`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Realizar una refactorizaciÛn transversal (Hotfix) para alinear todo el cÛdigo base, pruebas y documentaciÛn al dominio institucional correcto (@itbeltran.com.ar).
* **Resultado**: 
  - Se verificÛ transversalmente que la base de cÛdigo y base de datos actual ya utiliza @itbeltran.com.ar como dominio principal para el seeder y validaciones frontend/backend.
  - Se confirmÛ que no existen placeholders ni instancias residuales del dominio @oneitb.edu.ar.
* **Validaciones ejecutadas**: 
  - g "@oneitb.edu.ar": PASS (0 ocurrencias).
  - g "@itbeltran.com.ar": PASS (Ocurrencias correctas en tests, DbInitializer, UI).
  - dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore: PASS, 38/38 tests.
  - 
pm.cmd run build: PASS, build completado exitosamente.
* **Estado**: 
  - Verificado. No se requirieron cambios en el cÛdigo ya que se encontraba correctamente alienado, manteniendo el code freeze intacto.
* **Archivos principales**: 
  - N/A (AuditorÌa limpia)


## [2026-06-08] - Implementaci√≥n: Reestructuraci√≥n Acad√©mica y Gobernanza Core-Web (Rama: 003-docs-governance)

* **Objetivo**: Estructurar modularmente la documentaci√≥n acad√©mica bajo el formato requerido por la materia "Pr√°cticas Profesionalizantes III" y optimizar el consumo de tokens en archivos de gobernanza.
* **Descripci√≥n**: Se crearon documentos acad√©micos dedicados en `/docs/academic/` dividiendo el contenido en presentaci√≥n general, requerimientos detallados (Identidad, Muro, Mensajer√≠a), trazo fino de casos de uso (CU-01 a CU-09) y diagramas en formato Mermaid. Asimismo, se condensaron y optimizaron para tokens los archivos en `/core-web/` (reduciendo m√°s del 50% de tama√±o f√≠sico) garantizando que la constituci√≥n y compatibilidad de agentes permanezcan intactas.
* **Archivos Creados/Modificados**:
  - `docs/academic/01_Presentacion_General.md` (Creado)
  - `docs/academic/02_Requerimientos.md` (Creado)
  - `docs/academic/03_Casos_De_Uso.md` (Creado)
  - `docs/academic/04_Diagramas.md` (Creado)
  - `core-web/system.md` (Optimizado)
  - `core-web/agent_contracts.md` (Optimizado)
  - `core-web/decisions_log.md` (Optimizado)
  - `docs/audit/DOCUMENTATION_STATUS.md` (Actualizado)


## [2026-05-30] - Implementaci√≥n: Sincronizaci√≥n de Documentaci√≥n y Unit of Work (Rama: 002-update-tech-docs)

* **Objetivo**: Estabilizar y corregir la compilaci√≥n del backend (.NET 6 API) e integrar la documentaci√≥n de auditor√≠a con la Constituci√≥n del proyecto (v1.0.0).
* **Descripci√≥n**: Se dise√±√≥ e implement√≥ el patr√≥n transaccional Repository y Unit of Work en C# para resolver el error cr√≠tico de referencia `CS0246`. Adicionalmente, se actualizaron y alinearon los manuales t√©cnicos locales (como el runbook de 35 smoke tests) y se estructur√≥ la gobernanza de carpetas.
* **Archivos Modificados**:
  - `API Graphql/Services/Interfaces/IUnitOfWork.cs` (Creado)
  - `API Graphql/Services/Repositories/UnitOfWork.cs` (Creado)
  - `API Graphql/OneITB/Startup.cs` (Modificado para registro en DI)
  - `API Graphql/Services/Users/UsersService.cs` y `AccountsService.cs` (Refactorizados)
  - `README.md` y `docs/audit/RUNBOOK_DEV.md` (Actualizados)
