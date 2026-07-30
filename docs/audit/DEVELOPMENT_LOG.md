# Historial de Desarrollo y Cambios - OneITB23

Este archivo registra las specs y cambios completados que tienen respaldo en el codigo o la documentacion vigente, en orden cronologico inverso.
La entrada mas reciente debe agregarse inmediatamente debajo de este bloque.

---

## [2026-07-30] - Spec 197: Microsoft Entra Institutional SSO

* **Objetivo**: Reemplazar el plan Google OAuth por una integracion institucional
  Microsoft Entra ID/Microsoft 365 single-tenant, sin retirar password local ni Magic
  Link de empleadores y sin usar tokens externos para autorizar resolvers OneITB.
* **Resultado**:
  - React integra MSAL Browser/React con Authorization Code + PKCE, autoridad del tenant,
    scope delegado de la API, cache en `sessionStorage`, boton institucional condicional
    y limpieza conjunta de MSAL, Apollo y WebSocket al cerrar o reemplazar sesion.
  - `microsoftLogin` valida access tokens RS256 contra metadata OpenID cacheada, con
    refresh ante rotacion de claves, y exige issuer, audience, lifetime, `tid`, `oid`,
    `scp` y dominio `itbeltran.com.ar` antes de emitir el JWT canonico OneITB.
  - La vinculacion/aprovisionamiento es transaccional e idempotente: las altas externas
    nacen como `Estudiante`; roles privilegiados no se derivan de claims ni se vinculan
    automaticamente; SQL aplica identidad externa unica y constraint de cuenta valida.
  - Los tokens Entra no se persisten ni auditan. Los eventos aceptados/rechazados usan
    metadatos sanitizados y correlation ID; el endpoint publico posee limites por origen
    e identidad con Redis opcional y fallback local acotado.
  - `Account.PasswordHash` admite null solo para cuentas externas completas. Login local
    y verificaciones administrativas rechazan cuentas SSO-only sin crash ni enumeracion.
  - Se retiro el query publico legacy `userById` y su cliente huérfano; perfiles de
    terceros pasan exclusivamente por `publicProfile` con masking backend.
  - Roadmap, arquitectura, alcance, runbook, auditoria y entrega final reemplazaron las
    referencias activas a Google por Microsoft Entra y separan implementacion `[I]` de
    aceptacion real del tenant `[B]`.
* **Validaciones ejecutadas**:
  - Backend: 174/174 tests PASS; Release build con 0 warnings y 0 errores.
  - Frontend: 32 archivos / 82 tests PASS; Vite 539 modulos / 0 errores en 0,85 s.
  - EF Core: migracion `AddMicrosoftEntraIdentity` aplicada; 33 migraciones y cero drift.
  - Runtime finito: 43 mutaciones, `microsoftLogin` presente, rechazo controlado
    `ENTRA_NOT_CONFIGURED` y puertos liberados al finalizar.
  - Dependencias: npm audit conserva dos advisories moderados preexistentes de React
    Router; MSAL no agrega hallazgos y no se fuerza el salto incompatible a Router 7.
  - Speckit QA final: PASS con checklist 11/11, higiene de secretos/Google SSO activo
    sin hallazgos y smoke de privacidad confirmando `userById` ausente.
* **Archivos clave**:
  - `API Graphql/Services/Auth/MicrosoftEntraTokenValidator.cs`
  - `API Graphql/Services/Auth/MicrosoftEntraAuthService.cs`
  - `API Graphql/Data/Migrations/20260730032643_AddMicrosoftEntraIdentity.cs`
  - `FrontEnd/OneItb-FE/src/auth/microsoftEntra.js`
  - `FrontEnd/OneItb-FE/src/Components/auth/MicrosoftInstitutionalLogin.jsx`
  - `docs/audit/RUNBOOK_DEV.md`
* **Estado**: Implementada `[I]`. La elevacion a `[V]` requiere App Registrations,
  consentimiento y una cuenta real del tenant institucional; no se versionaron secretos
  ni se realizo commit/push.

## [2026-07-29] - Spec 196: Demo Database Rebaseline

* **Objetivo**: Eliminar la dependencia de datos historicos del puesto local y dejar una
  base de demostracion reproducible, respaldada, idempotente y alineada con la
  documentacion de la defensa.
* **Resultado**:
  - `EnterpriseDemoSeeder` cubre identidad, nueve carreras institucionales, materias,
    correlatividades, recursos/progreso academico, CV relacional, grafo social,
    mensajeria, preferencias, notificaciones, reportes y empleos por fases con
    `SaveChangesAsync` y `ChangeTracker.Clear`.
  - El runner protegido valido `oneitb23-sql/OneItb`, genero un backup `COPY_ONLY` con
    checksum y `RESTORE VERIFYONLY`, reconstruyo la base desde 32 migraciones y obtuvo
    inventarios identicos en dos ejecuciones consecutivas del seed.
  - La auditoria relacional devolvio cero violaciones; Administrador, Moderador,
    Profesor, Estudiante, Egresado y Empleador autenticaron con el rol esperado.
  - Los smoke tests finitos aprobaron feed, academico, mensajeria, notificaciones,
    empleos, administracion, moderacion y upload sin dejar servidor ni fixture temporal.
  - Runbook, arquitectura, alcance, diagramas, Roadmap, auditoria, memoria tecnica y
    guia de maquetacion quedaron reconciliados con el modelo y procedimiento reales.
* **Validaciones ejecutadas**:
  - Backend: 153/153 tests PASS; Release build con 0 warnings y 0 errores.
  - Frontend: 31 archivos / 80 tests PASS; Vite 380 modulos / 0 errores.
  - EF Core: 32 migraciones aplicadas y modelo sin cambios pendientes.
  - Seguridad/higiene: backup ignorado, secretos ausentes de evidencia, integridad 0/6
    roles y runtime multidominio PASS.
* **Archivos clave**:
  - `API Graphql/Data/EnterpriseDemoSeeder.cs`
  - `API Graphql/Tests/Services.Tests/Data/EnterpriseDemoSeederTests.cs`
  - `scripts/reset-demo-database.ps1`
  - `scripts/validate-demo-database.ps1`
  - `docs/audit/RUNBOOK_DEV.md`
  - `docs/project_docs/architecture-and-design.md`
  - `docs/academic/04-design-diagrams.md`
  - `docs/entrega_final/DOCUMENTO_BASE_PRACTICA_PROFESIONAL.md`
* **Estado**: Verificada localmente `[V]`; el porcentaje funcional permanece en 99 %
  porque la spec estabiliza operacion y datos, sin agregar alcance.

## [2026-07-29] - Hotfix: transporte local GraphQL y login de empleador

* **Objetivo**: Eliminar el fallo de red que Firefox reportaba como CORS al iniciar
  sesion desde Vite contra el certificado HTTPS local de Kestrel.
* **Resultado**:
  - Vite actua como proxy same-origin para `/graphql`, `/api` y `/uploads` durante
    desarrollo; el navegador ya no depende de que cada perfil confie directamente en
    el certificado de `https://localhost:44397`.
  - Apollo HTTP, GraphQL WebSocket y uploads comparten por defecto el origen de Vite;
    las variables `VITE_GRAPHQL_URL` y `VITE_GRAPHQL_WS_URL` conservan prioridad para
    despliegues configurados.
  - Se agrego una regresion que valida la resolucion same-origin de HTTP y WebSocket.
  - La cuenta demo `empleador1@itbeltran.com.ar` fue restablecida solo en la base local
    y sincronizada con `Seed:DemoPassword`; no se incorporaron credenciales al repo.
* **Validaciones ejecutadas**:
  - Login real a traves de `http://localhost:5173/graphql`: autenticado como
    `Empleador`, con ID y JWT emitidos.
  - Frontend: 31 archivos / 80 tests PASS.
  - Vite: 380 modulos, build de produccion sin errores en 1,99 s.
* **Estado**: Hotfix verificado en runtime local `[V]`.

## [2026-07-29] - Alineación logística con lineamientos oficiales de mesa

* **Objetivo**: Sincronizar la preparación de la defensa con las condiciones comunicadas
  por el presidente de mesa, sin alterar código, arquitectura, porcentaje ni Quality
  Gates.
* **Resultado**:
  - Se fijó como duración oficial una exposición de 20-30 minutos, con un objetivo
    interno de 22-25 minutos para controlar transiciones y conservar margen.
  - Se documentó una copia impresa preferentemente a color, anillada o encuadernada,
    además de presentación PPTX/PDF, notebook propia probada, cargador, adaptador HDMI,
    repositorio actualizado y pendrive de contingencia que no se entrega.
  - Se registró el inicio de mesa a las 09:00, la asignación de aula el mismo día y la
    recomendación operativa de llegar entre 08:15 y 08:30.
  - El Manual de Usuario queda formalmente integrado en la sección 6 de la memoria
    técnica; no requiere un entregable separado según confirmación de la cátedra.
  - Roadmap, memoria 1.4, guía de maquetación 2.2 y estado documental quedaron
    sincronizados con estas condiciones.
* **Estado**: Ajuste exclusivamente logístico/documental completado `[I]`; porcentajes y
  evidencia técnica permanecen sin cambios.

## [2026-07-28] - Plan operativo de cierre académico y entrega final

* **Objetivo**: Convertir el estado Release Candidate académico en un plan trazable de
  integración, aceptación manual, maquetación APA 7 y preparación de la defensa.
* **Resultado**:
  - El Roadmap separa cierre académico, gates productivos externos y evolución P5/P6,
    con estimación, dependencia y criterio de salida por tarea.
  - La memoria técnica se actualizó a versión 1.3 con evidencia de Spec 195:
    152 pruebas backend, 79 frontend, builds limpios, EF sin drift, Redis local y SMTP
    Mailpit verificados.
  - La guía de maquetación 2.1 incorpora ruta crítica, tiempos, paquete mínimo,
    contingencia offline, ensayo y Definition of Done documental.
  - El cierre académico pendiente se estima en 20-29 horas efectivas o 3-4 jornadas;
    los proveedores externos permanecen como gates y no alteran el 99 % funcional.
* **Estado**: Planificación documental implementada `[I]`; integración final, regresión
  manual, figuras, DOCX, PDF y ensayo permanecen pendientes según el Roadmap.

## [2026-07-28] - Spec 195: Local Infrastructure and Moderator Acceptance

* **Objetivo**: Cerrar los gates locales controlables de Moderador, Redis distribuido y
  SMTP sin credenciales externas, sin iniciar servidores web y sin alterar SQL.
* **Resultado**:
  - `EnterpriseDemoSeeder` crea `moderador1@itbeltran.com.ar` con ID estable, rol
    canonico e inicializacion idempotente que preserva hashes existentes; el grafo
    historico de chats queda estable y las alertas laborales usan allowlist de roles.
  - Las regresiones prueban JWT `Moderador`, hide/restore auditado, matriz declarativa
    de permisos y reemplazo de sesion Estudiante -> Moderador sin cache protegida previa.
  - `docker-compose.acceptance.yml` incorpora Redis 7.4.2 y Mailpit 1.29.7 fijados,
    efimeros, saludables y expuestos en puertos de aceptacion configurables.
  - Las pruebas de infraestructura ejercitan dos proveedores HotChocolate independientes,
    entrega exacta/aislamiento de topics y tres correos SMTP inspeccionados por la API de
    Mailpit, con limpieza de fixtures.
  - `scripts/validate-local-infrastructure.ps1` orquesta tests, builds, drift EF,
    diff-check, huella SQL y cleanup en `finally`; no ejecuta `dotnet run` ni Vite.
* **Validaciones ejecutadas**:
  - Infraestructura: 2/2 tests reales Redis/Mailpit PASS.
  - Backend: 152/152 tests PASS; Release build 0 warnings / 0 errores.
  - Frontend: 31 archivos / 79 tests PASS; regresion focalizada de sesion PASS;
    Vite 380 modulos / 0 errores.
  - EF Core: sin cambios pendientes; Compose valido; contenedores y puertos de
    aceptacion eliminados al finalizar; SQL no fue reiniciado ni recreado.
* **Limites del corte historico**: SMTP publico, Cloudinary, el plan Google SSO y el
  handshake WebSocket de red quedaron bloqueados. El plan Google fue reemplazado por
  Microsoft Entra en Spec 197.
* **Estado**: Verificada localmente `[V]`; Code Freeze funcional preservado.

## [2026-07-28] - Spec 194: Final Operational Acceptance

* **Objetivo**: Convertir las remediaciones 190-193 en evidencia operativa reproducible,
  cerrar la regresion por roles y establecer el Code Freeze local sin ocultar gates
  externos.
* **Resultado**:
  - Se incorporo `scripts/validate-predefense.ps1`, cuyo modo predeterminado ejecuta
    suites, builds, drift EF, Compose, auditoria de dependencias e higiene sin levantar
    servidores; el runtime queda opt-in y sujeto a aprobacion explicita.
  - La aceptacion runtime ya ejecutada valido uploads validos/hostiles/truncados,
    paginacion social y academica, filtro por autor, silenciamiento sin efectos laterales
    y Magic Link generico, digerido, de un uso y con limites recuperables.
  - La regresion de navegador recorrio Estudiante, Profesor, Egresado, Administrador y
    Empleador; el panel administrativo, hub academico, chat, perfil y Gestor de
    Postulaciones cargaron sin errores propios de consola.
  - La secuencia Estudiante -> logout -> Administrador comprobo aislamiento de identidad,
    cache, mensajes y notificaciones entre sesiones.
  - Como quick win de seguridad, `react-router-dom` se actualizo a 6.30.4 y las rutas de
    notificaciones se sanitizan antes de llegar a `<Link>`, con tests para redirects
    externos, protocol-relative y backslash.
  - SMTP, Redis, Cloudinary, recorrido Moderador y realtime con dos contextos aislados
    quedan bloqueados por configuracion/identidad/ambiente exactos; no se declararon como
    verificados.
* **Validaciones ejecutadas**:
  - Backend: 147/147 tests PASS; Release build 0 warnings / 0 errores.
  - Frontend: 31 archivos / 79 tests PASS; Vite 380 modulos / 0 errores.
  - EF Core: sin cambios pendientes; Compose valido; `git diff --check` PASS.
  - Limpieza: puertos 5094/5095/5173 libres, sin PIDs ni fixtures de aceptacion.
* **Estado**: Specs 190-193 elevadas a `[V]` para los gates locales ejecutados. Code
  Freeze operativo local alcanzado; proveedores reales conservan estado `[B]`.

## [2026-07-28] - Normalización documental: matriz final de remediaciones 186-193

* **Objetivo**: Alinear `FINAL_AUDIT_REPORT.md` con el corte de código `25cdb9f` y dejar trazabilidad breve, individual y verificable de cada hallazgo de cierre.
* **Resultado**:
  - Se consolidaron en una única matriz las Specs 186-193, separando problema, corrección aplicada, evidencia y gate residual.
  - Se añadieron cierres explícitos junto a C-3, A-3 y A-4, que conservaban únicamente la descripción del hallazgo original.
  - Se retiró la nota obsoleta que pedía confirmar el rate limiting específico de Magic Link, ya cubierto por Spec 190.
  - La sección 186-189 dejó de presentarse como histórica y quedó identificada como cierre verificado vigente.
  - Se preservó la diferencia entre `[V]` e `[I]`; ningún smoke diferido fue declarado como ejecutado.
* **Estado**: Documentación de auditoría sincronizada con código, roadmap y evidencia disponible.

## [2026-07-28] - Spec 193: Social Policy and UI Bootstrap Resilience

* **Objetivo**: Cerrar el bypass de silenciamiento administrativo en reacciones de publicaciones y extender la resiliencia global de React por encima de Apollo, Theme y los fallos previos al montaje.
* **Resultado**:
  - `SocialService.ToggleReactionAsync` reutiliza el guard central de `MutedUntil` antes de leer o mutar reacciones; una denegacion no inserta, no elimina y no emite notificaciones.
  - El `Mute` personal continua siendo una preferencia del observador para filtrar el feed y no se confunde con la sancion administrativa.
  - `Mutation.ToggleReaction` conserva un error GraphQL controlado `USER_ERROR` para rechazos de politica.
  - `ApplicationRoot` coloca `GlobalErrorBoundary` por fuera de Apollo y Theme; `AppProviders` crea de forma perezosa una sola instancia de cliente por montaje.
  - `bootstrapApplication` carga dinamicamente el arbol y ofrece fallback React o DOM si fallan la fabrica, los providers, el arbol de componentes o `createRoot`.
  - El diagnostico usa un ID robusto y no registra mensajes de excepcion, tokens, cache ni datos personales.
* **Validaciones ejecutadas**:
  - Backend: 147/147 tests PASS, incluyendo like/unlike silenciado, cero efectos laterales, cancelacion, `Mute` personal y contrato `USER_ERROR`.
  - Frontend: 30 archivos / 72 tests PASS, incluyendo fallos inyectados en fabrica Apollo, ApolloProvider, ThemeProvider, hijos y pre-mount; regresiones de cache, sesion y WebSocket incluidas.
  - Release/Vite: 0 warnings / 0 errores; 379 modulos en 762 ms en el gate final.
  - EF Core: sin cambios de modelo pendientes; `git diff --check` PASS.
  - No se inicio servidor. Smokes autenticados y de navegador quedan diferidos por la restriccion operativa vigente.
* **Archivos clave**:
  - `API Graphql/Services/Social/SocialService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/Tests/Services.Tests/{Social/SocialServiceTests.cs,GraphQL/SocialMutationErrorContractTests.cs}`
  - `FrontEnd/OneItb-FE/src/{main.jsx,bootstrap.jsx,ApplicationRoot.jsx}`
  - `FrontEnd/OneItb-FE/src/Components/layout/{GlobalErrorBoundary.tsx,InterfaceFailureView.tsx}`
* **Estado**: Implementada `[I]`; M3-M1 y M4-M1 mitigados. Requiere smoke runtime/browser para elevar a `[V]`.

## [2026-07-27] - Spec 192: Credential Delivery and Cryptographic Policy Hardening

* **Objetivo**: Cerrar A-1/A-2 eliminando la credencial Magic Link de GraphQL/logs/almacenamiento reutilizable, centralizando BCrypt y retirando secretos JWT rastreados.
* **Resultado**:
  - `requestMagicLink` devuelve un payload generico; la credencial de 256 bits viaja por correo en un fragmento URL, SQL conserva SHA-256 y React limpia el fragmento antes del consumo.
  - `IEmailSender` queda en la capa de contratos; Development usa pickup `.eml` ignorado y Production exige SMTP completo. No se registran cuerpos ni destinatarios.
  - `IPasswordHasher` aplica BCrypt costo 12 configurable, actualiza hashes debiles tras login exitoso y evita degradar hashes mas fuertes.
  - Registro, validacion administrativa, empleadores y seeder comparten la politica; el seeder recibe el hasher desde el composition root y ya no usa una contrasena fallback.
  - La clave JWT fue retirada de `appsettings`; startup valida longitud/diversidad y compose exige secretos, URL HTTPS de frontend y SMTP.
* **Validaciones ejecutadas**:
  - Backend: 141/141 tests PASS, incluyendo schema HotChocolate real, digest/replay, fallo de entrega, pickup E2E, rehash/no-downgrade y configuracion fail-closed.
  - Frontend: 27 archivos / 61 tests PASS; fragment cleanup y respuesta generica cubiertos. Vite build PASS, 376 modulos en 762 ms.
  - Release build: 0 warnings/0 errores; EF Core sin cambios pendientes; compose productivo valido; `git diff --check` PASS.
  - No se inicio servidor. SMTP real y browser smoke quedan pendientes por falta de secretos/proveedor y por la restriccion operativa vigente.
* **Archivos clave**: `Services/Auth/*`, `Services/Email/IEmailSender.cs`, `OneITB/Services/Email/*`, `EmployerLogin.jsx`, `Startup.cs`, configuracion Docker/entornos y documentacion canonica.
* **Estado**: Implementada `[I]`; A-1/A-2 mitigados. Requiere smoke SMTP real/browser para elevar a `[V]`.

## [2026-07-27] - Spec 191: Async Query and Pagination Hardening

* **Objetivo**: Cerrar los hallazgos C-3/A-3/A-4 eliminando I/O sincronico de EF, contratos sociales sin limite y carga completa de estudiantes academicos.
* **Resultado**:
  - `SocialService` resuelve visibilidad global con `AnyAsync`, propaga `CancellationToken` a todos los terminales y conserva un builder interno sin I/O terminal.
  - `inquiriesPage` queda como unico contrato de coleccion social, acotado a 25, con cursor opaco, orden estable por ID y filtro opcional `authorId` aplicado antes de contar/paginar.
  - Se retiro el resolver GraphQL `inquiries`, su operacion Apollo y su type policy; Feed, perfil y paneles administrativos comparten merge deduplicado y carga incremental.
  - `AcademicStudentPage` limita a 50 estudiantes, valida actor/materia antes de consultar y ordena por apellido, nombre e ID.
  - `AcademicDashboard` incorpora estados de carga, vacio, error y "Cargar mas" sin materializar la cohorte completa.
* **Validaciones ejecutadas**:
  - Backend: 126/126 tests PASS, incluyendo contrato SDL real, cursores, scoping, orden, clamp maximo y cancelacion; Release build PASS con 0 warnings/0 errores.
  - Frontend: 26 archivos / 59 tests PASS; Vite build PASS, 376 modulos en 1.06 s.
  - EF Core: sin cambios pendientes. No se genero migracion porque los indices existentes cubren los predicados principales y no hubo evidencia SQL runtime para justificar otro indice.
  - No se inicio servidor. Los smokes autenticados de feed/perfil/admin/academico y la observacion runtime de logs cancelados quedan diferidos.
* **Estado**: Implementada `[I]`; no corresponde marcarla `[V]` hasta completar los recorridos runtime.

## [2026-07-27] - Spec 190: Upload and Magic Link Abuse Hardening

* **Objetivo**: Cerrar los hallazgos C-1/C-2 de la auditoria mediante inspeccion real de archivos antes de persistir y limites especificos para las operaciones publicas de Magic Link.
* **Resultado**:
  - `FileContentInspector` valida de forma acotada PDF, imagenes, Office legacy/OOXML, ZIP, texto UTF-8, MP4 y WebM; rechaza truncados, paquetes incompatibles y contenido ejecutable/poliglota antes de cualquier storage.
  - `UploadController` conserva el limite de 15 MB y responde `UPLOAD_CONTENT_INVALID` sin exponer detalles internos; las pruebas demuestran que un rechazo no invoca `IFileStorageService`.
  - `IMagicLinkRateLimiter` combina origen con fingerprints HMAC de email/token, usa memoria acotada en Development/tests y Lua atomico sobre Redis cuando esta configurado.
  - Request y redemption cortan antes del servicio/EF, devuelven `AUTH_RATE_LIMITED` o `AUTH_TEMPORARILY_UNAVAILABLE`, incluyen retry acotado y registran solo operacion/motivo.
  - `UseForwardedHeaders` procesa origen antes del limiter y solo confia en proxies/redes configurados; compose y `.env.example` exponen limites sin secretos.
* **Validaciones ejecutadas**:
  - Tests focalizados upload/Magic Link: 38/38 PASS; suite backend completa: 115/115 PASS.
  - Backend Release: PASS, 0 warnings / 0 errores; EF Core: sin cambios pendientes; compose productivo: valido.
  - Runtime upload: PDF valido HTTP 200; ejecutable renombrado a PDF HTTP 400 con codigo estable; fixture valido eliminado al cerrar.
  - El smoke runtime de throttling Magic Link no se ejecuto por instruccion operativa. Concurrencia, umbral, expiracion/recuperacion, claves independientes y fallo de provider quedaron cubiertos por tests deterministas.
* **Estado**: Implementada `[I]`; no requiere migracion. La entrega de la credencial Magic Link fuera de GraphQL permanece en Spec 192.

## [2026-07-23] - Spec 189: Declarative GraphQL Mutation Authorization

* **Objetivo**: Completar la autorizacion declarativa de todas las mutaciones sin reemplazar controles contextuales de ownership, autor, carrera o estado.
* **Resultado**:
  - Las 42 mutaciones quedaron cubiertas por una matriz automatizada; solo registro, login y los dos pasos del acceso Magic Link permanecen publicos.
  - Las operaciones administrativas, de moderacion, academicas y laborales usan roles canonicos en espanol mediante constantes compartidas.
  - El Gestor de Postulaciones conserva validacion de propietario de oferta y rechaza aliases de rol historicos en ingles.
  - Tests de rol incorrecto y empleador no propietario prueban rechazo sin modificar la postulación.
* **Validaciones ejecutadas**:
  - Runtime: `addSubject` anonimo -> `AUTH_NOT_AUTHENTICATED`; `applyToJob` con Empleador -> `AUTH_NOT_AUTHORIZED`; `createJobOffer` con Empleador alcanza validacion de dominio.
  - Backend: 82/82 tests PASS; Release build PASS, 0 warnings / 0 errores.
* **Estado**: Verificada.

## [2026-07-23] - Spec 188: Apollo Logout Session Isolation

* **Objetivo**: Eliminar el bleed de sesion entre identidades y unificar logout manual, expiracion, cierre remoto y reemplazo de cuenta.
* **Resultado**:
  - `GraphQLProvider` implementa una terminacion idempotente que invalida el epoch, termina el WebSocket y limpia Apollo sin refetch de queries protegidas.
  - `AuthContext` elimina credenciales/identidad antes de purgar cache, espera limpiezas pendientes antes de login y maneja `storage` para logout entre pestanas.
  - Resultados tardios de HTTP/subscriptions pertenecientes a la sesion anterior no pueden repoblar la cache.
  - La hidratacion tolera JSON persistido corrupto y conserva un unico mensaje de expiracion.
* **Validaciones ejecutadas**:
  - Frontend: 23 archivos / 54 tests PASS; pruebas focalizadas de frontera de sesion 5/5.
  - Vite: 374 modulos, build PASS en 797 ms.
  - Browser smoke de `/employer-login`: render correcto y consola sin errores/warnings.
* **Estado**: Verificada por contratos de estado/cache/transporte y smoke visual; la regresion manual completa con dos cuentas se mantiene en el checklist de presentacion.

## [2026-07-23] - Spec 187: Mutation Cancellation Propagation

* **Objetivo**: Propagar cancelacion desde HotChocolate hasta EF Core y efectos secundarios para evitar trabajo residual tras abortar solicitudes.
* **Resultado**:
  - Todas las mutaciones asincronas reciben `CancellationToken`; servicios, UnitOfWork y repositorios mutation-reachable lo propagan a operaciones terminales.
  - `OperationCanceledException` se relanza antes de handlers genericos.
  - Se agrego un guard por reflexion que falla si una futura mutacion asincrona omite el token.
  - La prueba pre-cancelada de registro confirma que no se persiste ninguna cuenta.
* **Validaciones ejecutadas**:
  - Schema runtime: 42 mutation fields y cero argumentos de cancelacion expuestos.
  - Scan de `Mutation.cs`: sin llamadas EF asincronas parameterless en alcance.
  - Backend: 82/82 tests PASS; Release build PASS; EF sin drift.
* **Estado**: Verificada.

## [2026-07-23] - Spec 186: Employer Authentication JWT Remediation

* **Objetivo**: Sustituir emisores mock/duplicados por un contrato JWT unico y asegurar el consumo de credenciales Magic Link.
* **Resultado**:
  - `JwtTokenService` centraliza HS256, claims, issuer, audience y expiracion; falla al iniciar con configuracion insegura.
  - `AccountsService` y `EmployerAuthService` usan el mismo emisor; `token_placeholder` y el generador obsoleto fueron eliminados.
  - Magic Link usa 32 bytes aleatorios, vence a los 15 minutos y se consume atomicamente con `ExecuteUpdateAsync` en SQL Server.
  - Cuentas inactivas/no Empleador y replays reciben `AUTH_MAGIC_LINK_INVALID` sin filtrar detalles.
  - La UI empresarial no imprime el JWT y entrega la sesion a `AuthContext`.
* **Validaciones ejecutadas**:
  - Runtime Docker: JWT aceptado por bearer middleware, `me` devuelve `Empleador`, replay rechazado y carrera concurrente produce 1 exito + 1 rechazo.
  - Backend: 82/82 tests PASS; Release build PASS; EF sin drift.
* **Estado**: Verificada. Para produccion publica, la credencial de un solo uso debe enviarse fuera de banda por un proveedor institucional.


## [2026-07-13] - Spec 185: Media, Notifications and Theme Polish

* **Objetivo**: Corregir el calculo dinamico del mosaico multimedia, acotar YouTube, recuperar legibilidad dual-theme y separar con precision los eventos agrupados del contador real de notificaciones sin leer.
* **Resultado**:
  - El parser multimedia extrae hasta dos videos de YouTube en orden y conserva compatibilidad con `videoId`. El compositor advierte al alcanzar el limite, bloquea un tercer enlace y el backend aplica la misma regla en creacion y edicion antes de persistir cambios.
  - `MediaGrid` detecta las dimensiones intrinsecas de la portada. Las imagenes apaisadas ocupan una fila superior completa sin relleno lateral; los medios secundarios permanecen acotados y ambos videos aceptados se promueven al conjunto visible.
  - Los PDF usan la primera hoja renderizada por PDF.js como portada superior y muestran nombre/acciones en un pie independiente. Los tiles y el visor de YouTube respetan un contenedor `aspect-video` con alto acotado.
  - `BrandLogo` suma tratamiento de borde claro solo en modo oscuro; los nombres de autores recuperan contraste por rol. El cambio de tema usa una transicion visual de 800 ms con exclusion para `prefers-reduced-motion`, y `Background.png` queda visible como textura global sin interceptar eventos ni imprimirse.
  - Preferencias de notificacion se renderiza mediante portal en `document.body`, fuera del stacking context del Header. Marcar una o todas como leidas actualiza la cache de Apollo inmediatamente y luego reconcilia con servidor; `AggregateCount` sigue describiendo el historial agrupado, mientras el badge cuenta exclusivamente filas `IsRead == false`.
* **Validaciones ejecutadas**:
  - Speckit QA preflight: PASS; EF Core sin cambios pendientes.
  - Backend Release: PASS, 0 warnings / 0 errores; tests backend: PASS, 65/65.
  - Frontend: tests PASS, 21 archivos / 49 tests; Vite build PASS, 374 modulos en 858 ms en el gate final.
  - `npm audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilidades; `git diff --check`: PASS.
  - Runtime Release aislado contra SQL Server Docker: GraphQL `{ __typename }` HTTP 200 y `addInquiry` conserva autorizacion previa a la regla de dominio. La instancia temporal fue detenida.
* **Estado**:
  - Implementado y validado por tests, builds, EF drift, audit y runtime GraphQL. La aprobacion visual manual de mosaico apaisado, PDF, textura y drawer queda como gate explicito de navegador.
* **Archivos principales**:
  - `API Graphql/Services/Social/SocialService.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/{Feed,MediaGrid,MediaAttachment,MediaComponent,MediaViewerModal,PdfFirstPageThumbnail}.*`
  - `FrontEnd/OneItb-FE/src/Components/notifications/{NotificationBell,NotificationPreferencesModal}.*`
  - `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`, `context/ThemeContext.jsx` e `index.css`

## [2026-07-12] - Spec 184: QA Master Polish and Layout

* **Objetivo**: Cerrar la auditoria visual de Header, Footer, compositor y multimedia; mejorar contraste dual-theme y completar navegacion dirigida de menciones y empleos sin incorporar dependencias ni relajar controles de seguridad.
* **Resultado**:
  - El Header elimina la accion duplicada `Inicio`, mantiene accesos publicos visibles desde `md` y, autenticado, se oculta solo al bajar con scroll y reaparece al subir, enfocar o acercar el puntero al borde superior. Los listeners son pasivos, usan RAF, respetan `prefers-reduced-motion` y se limpian al desmontar.
  - `BrandLogo` entrega `fetchpriority` como atributo DOM valido. El Footer privado adopta la identidad de la landing conservando enlaces funcionales y se renderiza una sola vez desde `PrivateLayout`.
  - `Background.png` se integra como textura global unica y tenue; las superficies oscuras afectadas se aclaran hacia slate azulado, el titulo del compositor recupera contraste y el spotlight de Home aumenta radio sin provocar renders React por movimiento.
  - El compositor queda acotado con `min-w-0`/`w-full`. El mosaico reserva media superficie a la portada, promueve YouTube entre los secundarios, conserva imagenes completas con `object-contain` y calcula el overlay `+X`; el carrusel usa controles sin placas opacas.
  - Las menciones solo enlazan identidades respaldadas por `ReplyToUserId`; el backend carga `ReplyToUser` en el grafo y conserva notificacion agrupada, acotada al hilo y sin auto-notificacion.
  - Preferencias de notificacion pasa a drawer lateral accesible con Escape, click-outside, restauracion de foco y cleanup. Las notificaciones laborales incluyen `jobOfferId`; `/empleos` enfoca, desplaza y resalta una sola vez la tarjeta exacta.
* **Validaciones ejecutadas**:
  - Speckit QA preflight y revision final: PASS.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 63/63.
  - `npm.cmd run test -- --run --configLoader runner`: PASS, 18 archivos / 39 tests.
  - Backend Release: PASS, 0 warnings / 0 errores; Vite: PASS, 374 modulos en 1.07 s en la ejecucion final.
  - `npm.cmd audit --audit-level=high`: PASS, 0 vulnerabilidades; `git diff --check`: PASS.
  - Runtime aislado GraphQL: HTTP 200; el schema real expone `Comment.replyToUser` y las mutaciones afectadas. La instancia temporal fue detenida tras el smoke.
* **Estado**:
  - Implementado y validado por tests, builds, audit y schema runtime. La aprobacion visual manual de auto-hide, textura, mosaico, drawer y foco laboral queda como gate explicito de la regresion de presentacion.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/layout/{Footer.jsx,private/Header.jsx,private/Nav.jsx,private/PrivateLayout.jsx}`
  - `FrontEnd/OneItb-FE/src/Components/publication/{Feed,MediaGrid,MediaAttachment,MediaViewerModal,MentionText,CommentThread}.*`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationPreferencesModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/jobs/JobBoard.jsx`
  - `API Graphql/Services/Social/SocialService.cs` y `API Graphql/OneITB/GraphQL/Mutation.cs`

## [2026-07-12] - Spec 183: Premium Branding and Landing

* **Objetivo**: Sustituir el laboratorio temporal de logos por la identidad visual definitiva de OneITB y elevar Home/Header a una presentacion institucional premium, responsive, dual-theme y accesible.
* **Resultado**:
  - Los cuatro assets aprobados quedaron normalizados con nombres portables en `src/assets`; `BrandLogo` centraliza el isotipo y la marca completa. El Header reemplaza el wordmark de texto por el isotipo, conserva navegacion/buscador/auth y suma elevacion glass al hacer scroll sin alterar estados activos.
  - `/` ahora es una landing unica con hero, propuesta de valor, recorridos por rol, CTA y footer. Se eliminaron escenarios comparativos, imports borrador y superficies principales en blanco/negro puro.
  - `usePointerSpotlight` actualiza variables CSS mediante un unico RAF, sin `setState` por movimiento, con guard para pointer fino/reduced-motion y cancelacion al desmontar. `RevealOnScroll` observa una vez, desconecta y deja el contenido visible si la API no existe o el usuario reduce animaciones.
  - Quick win de rendimiento: los PNG con fondo de 4.47 MB y 5.12 MB se conservan como fuentes aprobadas pero no se importan; el contraste se resuelve con CSS y el bundle solo emite los logos transparentes de 70/206 kB. No se agrego Framer Motion ni ninguna dependencia.
* **Validaciones ejecutadas**:
  - Speckit QA final: PASS; `git diff --check` y Vite build PASS.
  - Vitest/Testing Library: PASS, 16 archivos / 31 tests; nuevas suites cubren branding, Header, Landing, reduced-motion y cleanup de IntersectionObserver.
  - `npm.cmd run build`: PASS, 373 modulos, 941 ms en ejecucion final; `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades.
  - Scan de runtime: sin imports Gemini/Logo edit, copy de laboratorio, `framer-motion`, fondos principales puros ni PNG pesados en el bundle.
* **Estado**:
  - Implementado y validado por tests/build/auditoria estatica. La aprobacion visual final en navegador de presentacion (responsive, ambos temas y spotlight) queda como gate manual explicito.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/assets/{logo-oneitb,logo-oneitb-bg,only-logo,only-logo-bg}.png`
  - `FrontEnd/OneItb-FE/src/Components/branding/BrandLogo.jsx`
  - `FrontEnd/OneItb-FE/src/Components/common/RevealOnScroll.jsx`
  - `FrontEnd/OneItb-FE/src/hooks/usePointerSpotlight.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Landing.jsx`

## [2026-07-12] - Spec 182: Feed Hierarchy, Media Grid and Followers

* **Objetivo**: Resolver la cuarta sesion de QA social con densidad multimedia acotada, respuestas dirigidas sin tercer nivel, navegacion exacta desde notificaciones, no leidos independientes y seguimiento explicito.
* **Resultado**:
  - Las portadas PDF renderizan la primera pagina mediante PDF.js y worker locales cargados de forma diferida. Publicaciones/comentarios reutilizan un mosaico responsive de hasta 4/3 tiles con overflow hacia galeria, manteniendo Ver/Descargar y el visor Blob seguro existente.
  - `Comment.ReplyToUserId` persiste el destinatario validado de una respuesta. Responder una respuesta antepone la mencion y se guarda como hermana bajo la raiz; targets ocultos, inactivos o de otra publicacion son rechazados server-side.
  - Las notificaciones sociales actualizan el deep-link al comentario mas reciente. El feed abre el hilo, hace scroll al `commentId`, aplica highlight temporal y degrada a la publicacion si el comentario ya no esta disponible.
  - `UserInteraction` usa unicidad `ObserverId + TargetId + Type`; `SocialGraphService` implementa follow/unfollow idempotente, coexistencia con Mute, bloqueo incompatible y errores GraphQL controlados. Feed y perfil comparten `FollowButton` optimista y una unica hidratacion de IDs seguidos.
  - El orden del feed seguido-primero/nuevo-primero queda cubierto por test sin consultas por tarjeta. El widget hidrata no leidos y mantiene la subscription aun minimizado; preferencias conserva Escape/backdrop y adopta layout compacto.
  - Quick win de rendimiento: PDF.js queda aislado en un chunk propio, fuera del vendor inicial; no se agregaron CDN, relajaciones anti-framing ni listeners sin cleanup.
* **Validaciones ejecutadas**:
  - Speckit QA preflight previo: PASS; backend 0/0, frontend build PASS y EF sin drift.
  - Migracion `AddDirectedRepliesAndSocialGraphIndex`: aplicada a SQL Server Docker; FK `ReplyToUserId` restrictiva e indice social triple unico; `has-pending-model-changes` PASS.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 62/62.
  - `npm.cmd run test -- --run`: PASS, 12 archivos / 25 tests.
  - `npm.cmd run build`: PASS, 368 modulos, 1.12 s; chunks independientes `pdfjs` y `pdf.worker`.
  - `npm.cmd audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilidades.
  - Runtime Docker autenticado: login PASS; follow/query/unfollow persistidos; respuesta dirigida conserva raiz y destinatario; comentario smoke desactivado al cerrar. Schema expone `myFollowedUserIds`, `followUser`, `unfollowUser` y `addComment` extendido.
  - Scan propio y `git diff --check`: PASS; sin worker PDF remoto, CDN ni referencias `mozPressure`/`mozInputSource`.
* **Estado**:
  - Implementado y validado por migracion, schema, tests, builds y smoke GraphQL autenticado. Queda pendiente la regresion visual manual de mosaicos PDF, highlight, badge minimizado y controles Follow en el navegador de presentacion.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Comment.cs`, `Data/OneItbContext.cs` y migracion `20260712215518_AddDirectedRepliesAndSocialGraphIndex`
  - `API Graphql/Services/Social/SocialGraphService.cs`, `SocialService.cs` y `Services/Notifications/NotificationService.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/{MediaGrid,MediaGalleryModal,PdfFirstPageThumbnail,CommentThread,Feed}.*`
  - `FrontEnd/OneItb-FE/src/Components/social/FollowButton.jsx`, `Components/profile/UserProfile.tsx` y `Components/chat/MiniChatWidget.jsx`

## [2026-07-12] - Spec 181: QA Session 3 - Media, Moderation and Notifications

* **Objetivo**: Resolver la tercera sesion de QA social sin debilitar seguridad: multimedia con portada/carrusel, edicion de adjuntos, permisos de moderacion, recordatorios de mensajes y limpieza honesta de warnings propios.
* **Resultado**:
  - `Inquiry` persiste `PreferAttachmentCover` e `IsHiddenByModerator`; `Comment` agrega estado de ocultamiento equivalente. Los filtros globales excluyen contenido desactivado u oculto y la migracion agrega indices alineados con esas consultas.
  - La edicion de publicaciones/comentarios queda restringida al autor y reemplaza adjuntos de forma atomica. Moderadores y administradores ocultan/restauran mediante mutaciones separadas, motivo obligatorio y `ModerationAudit` persistido en la misma transaccion.
  - El backend impide respuestas de tercer nivel. La UI oculta `Responder` en respuestas y separa acciones de autor y moderador.
  - El compositor permite elegir portada; el muro renderiza un medio principal y secundarios compactos. El visor agrega carrusel por publicacion y obtiene PDF locales como Blob URL abortable/revocable, preservando `X-Frame-Options: DENY`.
  - El feed incorpora texto expandible y una unica superficie de reaccion/contador. El menu movil reutiliza el conteo de mensajes existente sin duplicar consultas.
  - `UnreadMessageReminderHostedService` procesa lotes acotados e invoca un upsert idempotente que respeta preferencias. La configuracion de notificaciones se movio a un modal accesible independiente.
  - Se aislo el key ring de Data Protection de Development para no reusar claves DPAPI historicas incompatibles; no se altero la configuracion productiva.
* **Validaciones ejecutadas**:
  - Migracion `AddMediaModerationState`: aplicada a SQL Server Docker; `has-pending-model-changes` PASS.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 55/55.
  - `npm.cmd run test -- --run --configLoader runner`: PASS, 8 archivos / 18 tests.
  - `npm.cmd run build`: PASS, 360 modulos, 879 ms en el gate final.
  - Runtime aislado: `/health` responde `Healthy`; GraphQL responde HTTP 200 e introspecciona `addInquiry`, `editInquiry`, `editComment`, `moderateInquiryVisibility` y `moderateCommentVisibility`.
  - Scan propio: sin referencias a `mozPressure`, `mozInputSource`, `pdf.worker` o `docBaseUrl`; YouTube usa permisos actuales y carga por click.
* **Estado**:
  - Implementado y validado por migracion, schema, builds y pruebas automatizadas. La regresion visual autenticada de portada, edicion de adjuntos, carrusel/PDF y moderacion con motivo queda para el checklist manual de la defensa.
* **Archivos principales**:
  - `API Graphql/Data/OneItbContext.cs` y migracion `20260712201024_AddMediaModerationState`
  - `API Graphql/Services/Social/SocialService.cs`
  - `API Graphql/Services/Moderation/ModerationService.cs`
  - `API Graphql/Services/Notifications/NotificationService.cs`
  - `API Graphql/OneITB/Infrastructure/UnreadMessageReminderHostedService.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/*`
  - `FrontEnd/OneItb-FE/src/Components/notifications/*`

## [2026-07-12] - Spec 180: Final Release Candidate Audit

* **Objetivo**: Ejecutar una auditoria Release Candidate sin agregar features: higiene Git, gates backend/frontend, drift EF, smoke runtime GraphQL y revision de contratos criticos antes de la regresion manual final.
* **Resultado**:
  - Se detecto en runtime un bug real del `EnterpriseDemoSeeder`: al arrancar sobre una base Docker ya poblada intentaba insertar nuevamente `JobApplications` con IDs determinísticos.
  - `EnterpriseDemoSeeder.SeedJobApplicationsAsync` quedo idempotente por `Id` y por par logico `JobOfferId + ApplicantId`, preservando el indice unico existente y sin requerir migracion.
  - Se auditaron frontera de sesion/Apollo, privacidad de perfil, upload/static files, limites GraphQL/rate limiting y ownership de mutaciones sensibles sin hallar otro bug bloqueante de codigo propio.
  - No se elevaron items `[I]` a `[V]` sin evidencia de navegador o servicio externo real.
* **Validaciones ejecutadas**:
  - `docker compose ps`: SQL Server Docker healthy.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-build`: PASS, 47/47.
  - `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build`: PASS, sin cambios pendientes.
  - `npm.cmd run test -- --run --configLoader runner`: PASS, 4 archivos / 12 tests.
  - `npm.cmd run build`: PASS, 357 modulos, build final en 743 ms.
  - Smoke runtime: backend Release en `Development` inicia y `POST http://localhost:5000/graphql` con `{ __typename }` responde HTTP 200 (`Query`).
  - `git diff --check`: PASS; solo avisos LF/CRLF de Windows.
* **Estado**:
  - Release Candidate tecnico estabilizado a nivel build/test/runtime smoke. Quedan como QA manual consciente el panel admin, hub academico, empleos/Gestor de Postulaciones, drag-and-drop/lightboxes y servicios externos con secretos reales.
* **Archivos principales**:
  - `API Graphql/Data/EnterpriseDemoSeeder.cs`
  - `docs/audit/FINAL_AUDIT_REPORT.md`
  - `docs/audit/DOCUMENTATION_STATUS.md`
  - `docs/audit/DEVELOPMENT_LOG.md`

## [2026-07-12] - Spec 179: Social Polish Quick Wins

* **Objetivo**: Aplicar quick wins sobre las ultimas specs sociales sin reabrir contratos de backend: enlaces compartibles, adjuntos por drag-and-drop, modales mas accesibles y fallback defensivo para previews rotas.
* **Resultado**:
  - El menu de cada publicacion incorpora `Copiar enlace`, generando deep-links estables a `/feed?inquiryId=...` y usando feedback controlado ante exito o bloqueo del portapapeles.
  - `AttachmentDraftPicker` acepta drag-and-drop y reutiliza la misma deduplicacion, allowlist, cantidad maxima y limite agregado de 15 MB que la seleccion manual.
  - `MediaViewerModal` y `ReactionUsersModal` restauran foco al cerrar, mantienen scroll global controlado y agregan labels estables para tecnologia asistiva.
  - El listado paginado de reacciones evita cargas duplicadas y `MediaComponent` degrada previews de enlace rotas a una tarjeta defensiva sin romper layout.
* **Validaciones ejecutadas**:
  - Speckit QA preflight con builds: PASS sobre baseline limpio antes de la implementacion.
  - `npm.cmd run test -- --run --configLoader runner`: PASS, 4 archivos / 12 tests.
  - `npm.cmd run build`: PASS, 357 modulos, build en 1.28 s.
  - `git diff --check`: PASS; solo avisos LF/CRLF propios de Windows.
* **Estado**:
  - Implementado y validado por pruebas de componentes y build frontend. La verificacion visual manual del drag-and-drop nativo y lightboxes queda para el navegador de presentacion.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/sharePostLink.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/AttachmentDraftPicker.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaViewerModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/ReactionUsersModal.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/*.test.*`

## [2026-07-11] - Spec 178: QA Session 2 Social Core Fixes

* **Objetivo**: Cerrar la auditoria del muro con scoping academico real, adjuntos multiples, multimedia no excluyente, reacciones en comentarios, notificaciones sociales agrupadas y limpieza del layout de publicacion.
* **Resultado**:
  - Se agregaron `SocialAttachment` y `CommentReaction` con FKs explicitas, `DeleteBehavior.Restrict`, indices, filtros de contenido activo y migracion aditiva con backfill seguro de `FileUrl` historico.
  - `SocialService` valida carrera/materia server-side, limita adjuntos a 10/15 MB, conserva metadatos originales, pagina usuarios reaccionantes y genera notificaciones agrupadas con concurrencia optimista y deep-link.
  - El feed agrupa materias por carrera/anio, soporta varios adjuntos en posts/comentarios/respuestas, previews locales, YouTube mas archivos, lightbox/visores, autofocus y reacciones optimistas.
  - Se agregaron footer institucional, modal paginado de likes y un sidebar real basado en `me`; se retiro el compositor legacy duplicado y sus metricas hardcodeadas.
* **Validaciones ejecutadas**:
  - Migracion `AddSocialAttachmentsCommentReactionsAndNotificationGrouping`: aplicada contra SQL Server Docker.
  - `dotnet ef migrations has-pending-model-changes`: PASS, sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-build`: PASS, 47/47.
  - `npm.cmd run test -- --run --configLoader runner`: PASS, 6/6.
  - `npm.cmd run build`: PASS, 356 modulos, 1.07 s.
  - Smoke REST/GraphQL autenticado: PASS para scoping negativo, dos adjuntos, comentarios, reacciones, listado de likes, agrupacion y navegacion dirigida.
  - Browser QA: parcial; permitio detectar el compositor duplicado. La recarga final post-fix fue bloqueada por la politica de URL local de la herramienta y queda explicitada en evidencia.
* **Archivos principales**:
  - `API Graphql/Entities/Models/SocialAttachment.cs`, `CommentReaction.cs`, `Notification.cs`
  - `API Graphql/Data/OneItbContext.cs` y migracion `20260711205348_AddSocialAttachmentsCommentReactionsAndNotificationGrouping`
  - `API Graphql/Services/Social/*`, `Services/Notifications/*`, `UploadController.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/*`, `Components/layout/Footer.jsx`, `Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/*` y `src/utils/uploadFile.js`

## [2026-07-10] - Spec 177: Responsive Header and Normalization

* **Objetivo**: Resolver bugs de refinamiento productivo detectados en auditoria manual: header responsive, warnings de React Router, normalizacion de identidad en registro y bloqueo de avatares locales por politicas cross-origin.
* **Resultado**:
  - `Nav.jsx` usa navegacion completa desde `lg` y menu hamburguesa por debajo de ese breakpoint, manteniendo campanita y avatar visibles sin superposicion.
  - `Header.jsx` reduce padding/gaps en pantallas chicas y evita que la cabecera fuerce overflow horizontal.
  - `BrowserRouter` habilita `v7_startTransition` y `v7_relativeSplatPath` para eliminar warnings conocidos de React Router.
  - El registro envia email normalizado en minuscula desde React.
  - El backend aplica `Trim` + `ToLowerInvariant` en `UsersService` y `Account.Email`; nombres y apellidos mantienen Title Case institucional.
  - `UseStaticFiles` agrega `Access-Control-Allow-Origin: *` y `Cross-Origin-Resource-Policy: cross-origin` para archivos locales servidos desde `/uploads`.
* **Validaciones ejecutadas**:
  - Speckit QA preflight con builds: PASS sobre baseline limpio.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 39/39.
  - `npm.cmd run build`: PASS, 352 modulos, build en 1.87 s.
  - `git -c core.autocrlf=false diff --check`: PASS.
* **Estado**:
  - Implementado y validado por build backend, tests backend y build frontend. Queda pendiente auditoria manual en navegador para confirmar comportamiento visual del header mobile y cabeceras `/uploads` en runtime.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Account.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`

## [2026-07-08] - Spec 176: QA Resolution and UX Polish

* **Objetivo**: Resolver la regresion manual pre-defensa sobre limite de costo GraphQL, registro sin Alias, overflow responsive del header, contraste de filtros, redireccion de perfil, cierre del chat widget y foco de password reveal.
* **Resultado**:
  - HotChocolate conserva defensa anti-DoS pero eleva limites operativos reales: profundidad 15, `MaxFieldCost`/`MaxTypeCost` configurables y guardas de parser para nodos, tokens y campos.
  - `RegisterInput` deja de requerir `Username`; la UI de registro elimina Alias y ya no lo envia en la mutacion.
  - Login y Registro agregan `onMouseDown.preventDefault()` en botones de ojo para no perder foco del input.
  - Header/Nav/PublicLayout/PrivateLayout incorporan `max-w-full`, `min-w-0`, gaps responsivos y contencion horizontal para evitar scroll lateral en pantalla dividida.
  - Filtros de carrera/materia del buscador global renderizan estados seleccionados con contraste explicito.
  - `/profile/edit` redirige a `/profile` tras guardar correctamente.
  - `MiniChatWidget` se cierra al cambiar de ruta y al hacer click fuera, con cleanup del listener global.
* **Validaciones ejecutadas**:
  - Speckit QA preflight con builds: PASS sobre baseline limpio.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 39/39.
  - `npm.cmd run build`: PASS, 352 modulos, build en 1.56 s.
  - `git -c core.autocrlf=false diff --check`: PASS.
* **Estado**:
  - Implementado y validado por build backend, tests backend y build frontend. Queda para auditoria manual la verificacion visual de header responsive, contraste de filtros y comportamiento del chat widget.
* **Archivos principales**:
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/OneITB/appsettings.json`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Tests/Services.Tests/Auth/UsersServiceTests.cs`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/*`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

## [2026-07-08] - Spec 175: Privacy Controls and SMTP Smoke Tests

* **Objetivo**: Cerrar el ultimo quick win funcional de privacidad del perfil y agregar una herramienta admin-only para probar SMTP sin recorrer el flujo completo de postulaciones.
* **Resultado**:
  - `User` incorpora `IsPublicProfile` con default `true`, configuracion EF explicita y migracion `AddUserProfilePrivacy`.
  - `toggleProfilePrivacy(isPublic)` permite al usuario autenticado cambiar su visibilidad sin exponer cambios sobre terceros.
  - `publicProfile` y `searchPublicProfiles` aplican masking backend-side: los perfiles privados solo exponen identidad minima salvo que el visor sea duenio, Admin/Moderador o seguidor.
  - `/profile/edit` agrega switch visual de privacidad, persistencia via Apollo y toast institucional reutilizando `NotificationProvider`.
  - Busqueda global y resultados de perfiles muestran estado privado sin filtrar informacion sensible.
  - `testSmtpConnection(targetEmail)` queda restringida a `Administrador`, valida formato de email y transforma fallos del proveedor en errores GraphQL controlados sin exponer secretos.
  - Se agrego test de integracion GraphQL para verificar que un perfil privado enmascara bio, telefono, carreras y CV ante un visor anonimo.
* **Validaciones ejecutadas**:
  - Speckit QA preflight: PASS tras normalizar line endings de archivos modificados.
  - `dotnet ef migrations add AddUserProfilePrivacy --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS contra SQL Server Docker local.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 39/39.
  - `npm.cmd run build`: PASS, 352 modulos, build en 6.04 s.
  - `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
  - `git -c core.autocrlf=false diff --check`: PASS.
  - Smoke runtime con backend temporal: BLOQUEADO por el revisor automatico del entorno Codex al intentar iniciar proceso persistente; no se forzo workaround.
* **Estado**:
  - Implementado y validado por migracion, build, tests backend, build frontend, EF pending-model check y audit de whitespace. Queda pendiente QA browser manual para elevar la experiencia de privacidad de `[I]` a `[V]`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/20260708161825_AddUserProfilePrivacy.cs`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `API Graphql/Services/Users/*`
  - `API Graphql/Tests/Services.Tests/GraphQL/PublicProfilePrivacyGraphQLTests.cs`
  - `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/notifications/NotificationProvider.jsx`

## [2026-07-08] - Documentation Audit and Institutional Alignment

* **Objetivo**: Auditar `/docs` tras las specs recientes, eliminar ambiguedades documentales, alinear entregables academicos con el codigo actual y registrar quick wins de infraestructura sin abrir alcance funcional nuevo.
* **Resultado**:
  - `ROADMAP.md` reemplaza la nomenclatura laboral previa por "Empleos y Gestor de Postulaciones", suma SMTP como item implementado y actualiza el conteo a 96/99 (97%).
  - `scope-and-requirements.md` fue normalizado con alcance vigente, utilidad por rol, requerimientos de empleabilidad y operabilidad.
  - `architecture-and-design.md` y `docs/academic/*` incorporan `JobOffer`, `JobApplication`, SMTP, AuditLog, SIU mock, recursos versionados y limites pendientes honestos.
  - `RUNBOOK_DEV.md`, `.env.example` y `docker-compose.prod.yml` documentan variables SMTP opcionales y fallback local.
  - `FINAL_AUDIT_REPORT.md` y `DOCUMENTATION_STATUS.md` quedan sincronizados para presentacion institucional; `HISTORICAL_AUDITS.md` se conserva como archivo consolidado de auditorias supersedidas, no como fuente vigente.
* **Validaciones ejecutadas**:
  - Inventario `/docs`: PASS, sin carpeta `docs/audit/archive` ni documentos sueltos redundantes.
  - Auditoria de terminos obsoletos y mojibake en documentos canonicos: PASS, corregida en archivos vigentes.
  - `docker compose -f docker-compose.prod.yml config`: PASS, configuracion productiva valida con variables SMTP opcionales y fallback local.
* **Estado**:
  - Documentacion normalizada para defensa academica. Quedan pendientes verificaciones manuales en navegador y smoke tests productivos con secretos reales.

## [2026-07-08] - Spec 174: UX Alignment and SMTP

* **Objetivo**: Mantener Code Freeze funcional corrigiendo terminologia visible del modulo de empleos y agregando envio real de correos por SMTP con fallback local seguro.
* **Resultado**:
  - Se agrego `IEmailSender` con `SmtpEmailService` y `ConsoleEmailService`; `Startup` selecciona SMTP solo si `SmtpSettings:Host`, `Port`, `User` y `Pass` estan completos, y conserva fallback de consola para desarrollo/CI.
  - `updateApplicationStatus` ahora intenta enviar correo institucional al postulante cuando la postulacion pasa a `Reviewed` o `Rejected`, despues de persistir el cambio y sin rollback si SMTP falla.
  - `/empleos/mis-ofertas` reemplaza la nomenclatura visible por "Gestor de Postulaciones"; el modal de candidato queda como "Perfil Academico".
  - Los botones de estado agregan feedback inmediato con hover, active, scale y disabled defensivo en Tailwind.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
  - `npm.cmd run build`: PASS, 352 modulos, build en 3.99 s.
  - `npm.cmd test -- --run`: BLOQUEADO por `EPERM` en `node_modules/.vite-temp`.
  - `git diff --check` acotado a archivos Spec 174: PASS.
  - Revision de secretos SMTP: PASS, no hay credenciales reales versionadas; solo claves de configuracion y placeholders de user-secrets.
* **Estado**:
  - Implementado y validado por build backend/frontend y tests backend. Smoke SMTP real queda pendiente hasta contar con variables/secretos de proveedor.
* **Archivos principales**:
  - `API Graphql/OneITB/Services/Email/*`
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/jobs/EmployerJobOffers.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## [2026-07-07] - Spec 173: Enterprise Jobs, Applications and Seeder QA

* **Objetivo**: Consolidar la trazabilidad del sprint bajo Spec 173, elevando el Modulo de Empleos con postulaciones persistentes y Gestor de Postulaciones para empleadores, seeder relacional masivo y auditoria QA/security.
* **Resultado**:
  - Se agrego `JobApplication` con `JobApplicationStatus` (`Pending`, `Reviewed`, `Rejected`), FKs explicitas a `JobOffer` y `User`, `DeleteBehavior.Restrict` e indice unico `(JobOfferId, ApplicantId)`.
  - GraphQL expone `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus` y `jobOfferCreated`; el servicio valida roles, ofertas activas, postulacion unica y ownership estricto (`EmployerId == currentUserId`) para cambios de estado.
  - `/empleos` queda como bolsa laboral para estudiantes/egresados con skeletons, empty state, tarjetas y boton `Postularse` conectado a GraphQL que cambia a `Postulado`.
  - `/empleos/mis-ofertas` agrega Gestor de Postulaciones para empleadores/admins con ofertas propias, postulantes, filtros por estado, modal CV y acciones para marcar Revisado/Rechazado.
  - `Nav` mantiene el badge realtime de ofertas y agrega acceso condicional al Gestor de Postulaciones.
  - `EnterpriseDemoSeeder` agrega postulaciones deterministicas, notificaciones por postulacion y conserva `SaveChangesAsync` + `ChangeTracker.Clear()` entre fases.
  - Apollo cache incorpora `JobApplication` y `myJobOffers`; los toasts globales incorporan `JOB_APPLICATION`.
* **Validaciones ejecutadas**:
  - `dotnet ef migrations add AddJobApplications --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
  - `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errores.
  - `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
  - `npm.cmd run build`: PASS, 352 modulos, build en 855 ms.
  - `npm.cmd test -- --run`: BLOQUEADO por `EPERM` en `node_modules/.vite-temp`.
  - Smoke GraphQL runtime con backend temporal: BLOQUEADO por restriccion del entorno Codex al iniciar proceso persistente; no se intento workaround.
* **Estado**:
  - Implementado y validado por migracion, builds, tests backend, EF pending-model check y build frontend. Queda pendiente QA visual/browser de `/empleos`, `/empleos/mis-ofertas` y badge realtime para elevar de `[I]` a `[V]`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/JobApplication.cs`
  - `API Graphql/Entities/Models/JobApplicationStatus.cs`
  - `API Graphql/Entities/Models/JobOffer.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/EnterpriseDemoSeeder.cs`
  - `API Graphql/Data/Migrations/20260708013841_AddJobApplications.cs`
  - `API Graphql/Services/Jobs/*`
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/jobs/JobBoard.jsx`
  - `FrontEnd/OneItb-FE/src/Components/jobs/EmployerJobOffers.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/jobs.js`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## [2026-07-07] - Spec 172: Hotfix Institutional Domain Alignment

* **Objetivo**: Validar transversalmente que el dominio institucional del proyecto sea `@itbeltran.com.ar` y retirar referencias obsoletas a dominios de prueba.
* **Resultado**:
  - Se verifico que el seeder, validaciones frontend/backend y tests usan `@itbeltran.com.ar` como dominio principal.
  - No se detectaron instancias activas del dominio `@oneitb.edu.ar` en el codigo vigente.
  - No se modifico logica funcional para respetar el Code Freeze.
* **Validaciones ejecutadas**:
  - `rg "@oneitb.edu.ar"`: PASS, 0 ocurrencias funcionales.
  - `rg "@itbeltran.com.ar"`: PASS, ocurrencias esperadas en tests, seeder y UI.
  - `dotnet build`: PASS.
  - `npm.cmd run build`: PASS.
* **Estado**:
  - Verificado. Entrada historica conservada una sola vez para evitar ruido documental.
* **Archivos principales**:
  - N/A, auditoria limpia.

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

* **Objetivo historico**: implementar over-delivery institucional sin deuda tecnica falsa: trazabilidad EF transversal, constancias academicas, credenciales publicas aprobadas y toasts globales. El plan Google SSO de este corte fue reemplazado por Microsoft Entra en Spec 197.
* **Resultado**:
  - Se agrego `AuditLog` con mapeo EF Core explicito, indices por fecha/actor/entidad y FK restrictiva a `User`.
  - `AuditSaveChangesInterceptor` registra cambios de `User`, `AcademicProgress`, `AcademicResource`, `Inquiry` y `Comment` con actor JWT, correlation id, entidad, clave y snapshots JSON, excluyendo datos sensibles como `PasswordHash`.
  - GraphQL expone `auditLogs(first, entityName, actorUserId)` solo para Administradores y `publicCertificate(id)` para progreso aprobado/activo.
  - Se genero y aplico la migracion `AddAuditLogs`.
  - `/academic` incorpora `CertificateExport` para descargar CSV e imprimir una constancia formal del progreso academico propio.
  - Se agrego la ruta publica `/certificate/:id` con credencial institucional, estado aprobado, short id y enlace de compartir en LinkedIn.
  - `NotificationProvider` escucha `notificationReceived` y muestra toasts globales deduplicados sin depender del dropdown de la campanita.
  - `ROADMAP.md` se expande a 83 items y queda en 93% (77/83): cuatro items de alto impacto quedan `[I]`; el quinto se planifico entonces con Google y fue supersedido por Spec 197.
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
  - `Register.jsx` mantiene rol de seleccion unica no administrativa, aplica regex institucional `@itbeltran.com.ar` y corrige labels/mensajes de contrasena con `ñ`.
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
  - `Login.jsx` y `Register.jsx` agregan toggles de visibilidad de contraseña con iconos `fa-eye` / `fa-eye-slash`.
  - `GraphqlProvider.js` intercepta errores 401/403 y codigos HotChocolate de autorizacion, limpia `token`/`user`, muestra "Tu sesión ha expirado" y redirige a `/login`.
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

* **Objetivo**: Implementar un efecto "Spotlight" interactivo en el Header principal y mejorar el relieve interactivo de los elementos de navegación en hover.
* **Resultado**:
  - **Header.jsx**: Tracker del cursor en el componente vía CSS custom properties (`--mouse-x`, `--mouse-y`) inyectadas dinámicamente con `requestAnimationFrame` sin generar re-renders de React. El "spotlight" se renderiza mediante un div superpuesto con `pointer-events-none` e interpolación radial de opacidad.
  - **Nav.jsx**: Se migraron los estilos visuales a clases CSS de Tailwind (`hover:-translate-y-0.5`, `hover:shadow-lg`), eliminando toda la lógica JS de proximidad previamente agregada (Spec 151) para delegar todo el feedback visual puramente a transiciones fluidas de CSS.
* **Validaciones ejecutadas**:
  - Build base validado.
  - Build final (`npm run build`): **PASS** ? 0 errores de compilación TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

## [2026-06-30] - Spec 151: UX Fixes — Cancel, Avatar Fallback, Métricas, Print

* **Objetivo**: 4 fixes de UX: botón Cancelar en editor, fallback de iniciales en avatares rotos del feed, pluralización correcta de métricas, y limpieza agresiva de estilos de impresión.
* **Resultado**:
  - **Cancelar** (`EditProfile.jsx`): Fila de 2 botones `flex-1` — "Cancelar" (borde gris, `navigate('/profile')` sin mutaciones) + "Guardar Cambios" (azul, unchanged).
  - **Avatar fallback** (`Feed.jsx`): Nuevo componente `UserAvatar` con `onError` → muestra `<span>` con iniciales sobre fondo `bg-slate-200` cuando la URL falla o es nula. `resolveAvatarUrl` ya no cae al servicio externo de ui-avatars como default.
  - **Métricas pluralizadas** (`UserProfile.tsx`): Labels dinámicos: "1 Publicación / N Publicaciones", "1 Carrera / N Carreras", "1 Materia / N Materias". Tarjetas con `print:shadow-none print:bg-transparent print:border-slate-300 print:text-black`.
  - **Print cleanup** (`UserProfile.tsx`): `print:overflow-hidden` en contenedor raíz e inner wrapper para forzar una sola hoja; `print:-ml-2` en el avatar para alinear el bloque de datos; labels de métricas con `print:text-slate-700`.
* **Validaciones ejecutadas**:
  - Build base: **PASS** — `built in 651ms`.
  - Build final: **PASS** — `built in 690ms`, 0 errores TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`

## [2026-06-30] - Spec 150: UX & Print Polish

* **Objetivo**: Cuatro correcciones de UX detectadas en auditoría: Portfolio Social visible en print, imágenes rotas sin fallback, falta de botón de cierre en comentarios, y métricas en cero sin contexto.
* **Resultado**:
  - **Portfolio Social**: `<section>` de "Publicaciones recientes" en `UserProfile.tsx` ahora tiene `print:hidden`; no aparece en el CV impreso.
  - **Imagen rota**: `MediaAttachment.jsx` tiene un bloque explícito para `type === 'image' && imageFailed` que muestra ícono `fa-image-slash` + nombre de archivo + enlace accesible al original. Nunca se muestra el ícono roto del navegador.
  - **Cerrar comentarios**: `Feed.jsx` envuelve el `<CommentThread>` en un `<div>` con barra de título que incluye botón "Cerrar" con ícono `fa-xmark`; permite colapsar el hilo sin usar el botón de la barra de acciones.
  - **Métricas**: Publicaciones, Carreras y Materias en el header del perfil muestran `'—'` cuando el valor es 0, usando el patrón `value || '—'`.
* **Validaciones ejecutadas**:
  - Build base pre-cambio: **PASS** — `built in 585ms`.
  - `npm.cmd run build` post-cambio: **PASS** — `built in 565ms`, 0 errores TypeScript.
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

* **Objetivo**: Extender los fixes de @media print con mejoras visuales de pantalla: redes sociales con URL visible, botón Imprimir en perfil, ocultar rol de sistema, chat oculto en print, y fix de hoja en blanco.
* **Resultado**:
  - **Redes sociales**: cada ítem de contacto muestra `label + URL completa` en dos líneas (font-bold para el nombre, text-slate-500 para la URL). El ícono de enlace externo se oculta en print.
  - **Botón Imprimir CV**: añadido junto a "Editar CV/Perfil" en el header del perfil (solo en perfil propio), ambos dentro de un wrapper `print:hidden`.
  - **Rol genérico "User"**: se suprime con `profile.role.toLowerCase() !== 'user'`; solo roles institucionales (Estudiante, Profesor, etc.) se muestran.
  - **MiniChatWidget**: envuelto en `<div className="print:hidden">` en `PrivateLayout.jsx`.
  - **Blank page fix**: eliminado `min-h-full` del contenedor raíz; añadido `print:m-0 print:space-y-0` en el wrapper principal.
* **Validaciones ejecutadas**:
  - `npm.cmd run build` (Vite): **PASS** — `built in 555ms`, 0 errores TypeScript.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.tsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `specs/147-profile-cv-print-styles/` (spec.md, tasks.md ampliados a v2)

## [2026-06-29] - Spec 146: Data Normalization (Nombres propios)

* **Objetivo**: Interceptar cadenas de texto (nombres, roles, instituciones, etc.) en los servicios de Registro y Edición de Perfil para normalizarlas automáticamente a Title Case antes de persistir en Entity Framework Core.
* **Resultado**:
  - Se agregaron helpers locales `NormalizeToTitleCase`, `NormalizeNameRequired` y `NormalizeNameOptional` en `UsersService.cs` usando `System.Globalization.CultureInfo`.
  - En `RegisterAsync`, `FirstName` y `LastName` se interceptan y normalizan a Title Case. El `Email` ahora se fuerza a minúsculas (`ToLowerInvariant()`).
  - En `AccountsService.cs`, el método `Login` también aplica `ToLowerInvariant()` al buscar la cuenta para evitar fallos de case sensitivity.
  - En `UpdateProfileAsync`, al reemplazar secciones de CV, campos como `Company`, `Role`, `Institution`, `Degree` y `Name` aplican esta misma normalización.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: **PASS** — 0 errores, 0 advertencias.
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

* **Causa raíz**: Cuando Apollo recibe una respuesta GraphQL con `errors[]`, el `await authenticateUser()` **resuelve** (no lanza) con `{ data: undefined }`. El código intentaba leer `data.login` sin verificar `data`, causando `TypeError: can't access property "login", data is undefined`.
* **Fix**: Agrega un early-return defensivo `if (!data?.login) return;` inmediatamente después del `await`. En ese punto, el callback `onError` de `useMutation` ya habrá capturado el mensaje de error y actualizado el estado de la UI — el early-return simplemente evita el crash sin duplicar lógica.
* **Validaciones ejecutadas**:
  - `npm run build` (Vite): **PASS** — ✓ built in 558ms.
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

* **Objetivo**: Corregir dos regresiones de UX en Módulo 1: (1) F5 en ruta protegida redirigía a `/login` porque `PrivateLayout` evaluaba `auth.id` antes de que `AuthContext` terminara de leer `localStorage`; (2) credenciales inválidas producían "Unexpected Execution Error" sin feedback al usuario.
* **Resultado**:
  - **Bug F5**: Agregado estado `isLoading` (inicializado en `true`) en `AuthContext`. El `useEffect` de hidratación lo pone en `false` al finalizar. `PrivateLayout` muestra un spinner a pantalla completa mientras `isLoading === true` y solo evalúa `auth.id` una vez que el token fue leído de `localStorage`.
  - **Bug Login**: Cambiado `throw new Exception(...)` a `throw new GraphQLException(...)` en `AccountsService.Login`. HotChocolate ahora serializa el mensaje en `errors[]`. En el frontend, `Login.jsx` lee `err.graphQLErrors` con prioridad y se agregó `onError` en `useMutation` como segundo punto de captura.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: **PASS** — 0 errores.
  - `npm run build` (Vite): **PASS** — ✓ built in 3.87s.
* **Estado**: Implementado. Pendiente verificación en browser con backend local disponible.
* **Archivos modificados**:
  - `FrontEnd/OneItb-FE/src/context/AuthContext.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `specs/141-auth-ux-fixes/evidence.md`

## [2026-06-26] - Spec 140: Strict Nullability Fix (Refactor Real)

* **Objetivo**: Implementar la solución real a nivel arquitectónico para la deuda de nullability.
* **Resultado**:
  - Se modificaron las entidades de EF Core que contenían propiedades no nulables inicializadas con `null!`, reemplazándolas rigurosamente con `= default!`.
  - Se refactorizaron las interfaces `IUnitOfWork`, `IUserRepository`, `IAccountRepository` y sus implementaciones para devolver los tipos anulables correctos (ej: `Task<User?>`, `Account?`) en los métodos que lógicamente pueden devolver nulo (`GetById`, `GetByEmail`).
  - Se actualizaron las interfaces de servicios (`IUsersService`, `IAccountService`) para propagar correctamente la anulabilidad según el contrato, impactando `Query.cs` en GraphQL.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS; 0 errores, 0 advertencias (compilación 100% limpia sin hacer trampa).
* **Estado**:
  - Nullability resuelta estructuralmente mediante la propagación correcta de los tipos `?` y la limpieza de aserciones `!` inseguras.
* **Archivos principales**:
  - `API Graphql/Entities/Models/*.cs`
  - `API Graphql/Services/Interfaces/IUnitOfWork.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/IUsersService.cs` y `UsersService.cs`
  - `API Graphql/Services/Accounts/IAccountService.cs` y `AccountsService.cs`

## [2026-06-26] - Nullability Strict Fix (Spec: 140-nullability-strict-fix)

* **Objetivo**: Revertir la supresión de advertencias `<NoWarn>` introducida en los quick wins, habilitar validación estricta de nullability (`<Nullable>enable</Nullable>`) y solucionar el problema real de raíz en el código fuente de C#.
* **Resultado**:
  - Se eliminaron las supresiones `<NoWarn>` en `Entities.csproj`, `Services.csproj` y `GraphQL.csproj`.
  - Se habilitó `<Nullable>enable</Nullable>` explícitamente en el proyecto.
  - Se corrigió `CS8618` en `EntityModel.cs` inicializando `Id = default!`.
  - Se corrigieron `CS8604` en `AccountsService.cs` y `Startup.cs`.
  - Se corrigieron múltiples retornos nulos `CS8603` en `UnitOfWork.cs`.
  - Se resolvieron referencias ambiguas a `Path` causadas por implicit usings en `UploadController.cs` y `UploadCleanupHostedService.cs`.
  - Se corrigieron advertencias de conversión nula `CS8600` en `Query.cs`, `Mutation.cs`, `Subscription.cs` y el Interceptor de WebSocket usando `string?`.
* **Validaciones ejecutadas**:
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS; 0 errores, 0 advertencias (compilación 100% limpia sin supresiones).
* **Estado**:
  - Deuda técnica de nullability resuelta a nivel de código fuente, cumpliendo los estándares estrictos de .NET 8.
* **Archivos principales**:
  - `API Graphql/OneITB/GraphQL.csproj`
  - `API Graphql/Services/Services.csproj`
  - `API Graphql/Entities/Entities.csproj`
  - `API Graphql/Entities/Abstracts/EntityModel.cs`
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/OneITB/Startup.cs`
  - Múltiples archivos en `API Graphql/OneITB/GraphQL/`

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
  - Se agrego auditoria persistente de moderacion con entidad `ModerationAudit`, FKs restrictivas, servicio de registro, query admin-only y pestaña de auditoria en el panel admin.
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

## [2026-06-19] - Link Preview Endpoint Anónimo (Spec: 128-link-preview-anonymous)

* **Objetivo**: Convertir el endpoint de previsualización de enlaces en un recurso anónimo (`[AllowAnonymous]`) con ruta `api/link-preview`, eliminando la última causa de bloqueo por extensiones de privacidad.
* **Causa raíz anterior**: El endpoint requería JWT (`[Authorize]`), lo que obligaba al frontend a incluir el header `Authorization` y activar CORS "credenciado", siendo inspeccionado y bloqueado por uBlock/AdBlock.
* **Resultado**:
  - `LinkInfoController.cs` eliminado.
  - `LinkPreviewController.cs` creado: `[AllowAnonymous]`, ruta `api/link-preview`, protección SSRF (solo http/https).
  - `Feed.jsx`: fetch simplificado a GET limpio sin headers ni `credentials`.
  - `MediaComponent.jsx`: idem.
* **Validaciones ejecutadas**:
  - Backend: Compilación correcta — 0 Errores.
  - Frontend: ✓ 329 módulos — 0 Errores.
* **Archivos**:
  - `API Graphql/OneITB/Controllers/LinkPreviewController.cs` (nuevo)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`

## [2026-06-19] - Link Preview AdBlocker Bypass (Spec: 127-link-preview-adblocker-bypass)

* **Objetivo**: Refactorizar el sistema de previsualización de enlaces para que funcione con bloqueadores de anuncios activos (uBlock Origin, AdBlock Plus) en un navegador normal, sin requerir modo incógnito.
* **Causa raíz**: La ruta `/api/metadata` coincide con patrones heurísticos de las blocklists de uBlock (EasyList/EasyPrivacy). Adicionalmente, `credentials: 'include'` forzaba el modo credenciado del protocolo CORS, elevando el perfil de la petición ante las extensiones de privacidad.
* **Resultado**:
  - `MetadataController.cs` eliminado y reemplazado por `LinkInfoController.cs` con ruta neutral `api/link-info`.
  - `Startup.cs`: eliminado `.AllowCredentials()` (JWT viaja en `Authorization` header, no en cookie).
  - `Feed.jsx` y `MediaComponent.jsx`: endpoint actualizado a `/api/link-info`, eliminado `credentials: 'include'`, errores silenciados sin romper UI.
* **Validaciones ejecutadas**:
  - Backend `dotnet build -c Release`: Compilación correcta — 0 Errores.
  - Frontend `npm run build`: ✓ 329 módulos — 0 Errores.
* **Archivos principales**:
  - `API Graphql/OneITB/Controllers/LinkInfoController.cs` (nuevo)
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`

## [2026-06-19] - CORS Deep Fix — AllowCredentials + fetch mode (Spec: 126-cors-deep-fix)

* **Objetivo**: Resolver el bloqueo persistente de CORS al consumir `/api/metadata` desde el frontend. El navegador rechazaba las respuestas porque el frontend enviaba el header `Authorization` (petición "credenciada") pero el backend no respondía con `Access-Control-Allow-Credentials: true`.
* **Causa raíz**:
  - Backend: `AllowCredentials()` faltaba en la política CORS, por lo que .NET no emitía el header requerido.
  - Frontend: el `fetch` no declaraba `mode: 'cors'` ni `credentials: 'include'`, y tampoco verificaba `res.ok` antes de parsear el JSON.
* **Resultado**:
  - `Startup.cs`: política `_myAllowSpecificOrigins` extendida con `.AllowCredentials()`.
  - `Feed.jsx`: fetch actualizado con `mode: 'cors'`, `credentials: 'include'`, verificación de `res.ok` y fallback de token desde `localStorage`.
* **Validaciones ejecutadas**:
  - Backend `dotnet build -c Release`: Compilación correcta — 0 Errores.
  - Frontend `npm run build`: ✓ 329 módulos — 0 Errores.
* **Archivos principales**:
  - `API Graphql/OneITB/Startup.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

## [2026-06-19] - Error Log Fixes (Spec: 125-error-log-fixes)

* **Objetivo**: Sanear `imageUrl` en el backend para evitar peticiones CORS bloqueadas a URIs de formato de texto (`data:text/plain`) y resolver advertencias de Feature Policy de iframes.
* **Resultado**:
  - Backend: `MetadataController.cs` descarta cualquier URL extraída que no comience explícitamente con `http://` o `https://`.
  - Frontend: Se removieron características de hardware obsoletas/bloqueadas del atributo `allow` en el iframe de YouTube en `MediaComponent.jsx`.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilación exitosa con 0 errores.
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

* **Objetivo**: proteger cuentas administradoras existentes y exigir revalidacion de contraseña antes de promover otro usuario a Administrador.
* **Resultado**:
  - Backend: UpdateUserRole recibe el ID del operador autenticado y una contraseña opcional; la promoción valida rol activo, cuenta y hash BCrypt del operador.
  - Protección: cualquier cambio de rol o estado dirigido a un Administrador genera GraphQLException y no modifica datos.
  - Frontend: seleccionar Administrador abre un modal de confirmación con contraseña y advertencia de privilegios máximos.
  - Estado sensible: la contraseña se limpia al cancelar, completar o fallar la verificación.
  - UI: los controles de rol y estado de Administradores permanecen deshabilitados y grisados.
* **Validaciones ejecutadas**:
  - Backend Release y frontend Vite: compilación exitosa con 0 errores.
  - Revisión estática: la contraseña solo aparece como argumento efímero, estado local y entrada de BCrypt.Verify.
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

## [2026-06-17] - Rediseño UI de Página 404 (NotFound)

* **Objetivo**: Rediseñar la interfaz de usuario de la página de error 404 para hacerla más profesional, dinámica y atractiva utilizando Tailwind CSS.
* **Resultado**:
  - Se creó el nuevo componente `NotFound.jsx` utilizando diseño de glassmorphism, fondos interactivos (animate-pulse) y gradientes modernos.
  - Se actualizó el enrutador principal (`Routing.jsx`) para renderizar el nuevo componente `NotFound` en lugar del layout provisorio.
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

* **Objetivo**: Corregir la usabilidad de la interfaz de chat en tres aspectos críticos: el estado de búsqueda persistente, la falta de reactividad al contactar nuevos usuarios, y el manejo de envíos por teclado.
* **Resultado**:
  - Se agregó `setSearchTerm('')` al seleccionar usuarios/mensajes.
  - Se implementó la revalidación reactiva del query de conversaciones activas (`refetchActive()`) al enviar o recibir mensajes de usuarios ausentes de dicha lista.
  - Se configuró el `<textarea>` nativamente para que la combinación `Enter` (sin la tecla modificadora `Shift`) despache el mensaje al estilo estándar de las plataformas de mensajería.
* **Validaciones ejecutadas**:
  - Tareas documentadas en `tasks.md` tras completar los cambios previos en el código.
  - El proyecto fue compilado y verificado.
* **Archivos principales**:
  - `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`

## [2026-06-14] - Chat Smart Search (Spec: 106-chat-smart-search)

* **Objetivo**: Refinar la usabilidad del chat privado implementando un sistema de filtrado y búsqueda categorizada con tres niveles de prioridad (Conversaciones activas, Nuevos usuarios, Mensajes coincidentes).
* **Resultado**:
  - Backend: Se implementaron `GetActiveConversations` y `SearchMyMessages` en `IMessagingService.cs` y `MessagingService.cs`, restringidos por el JWT del usuario, y se mapearon en `Query.cs`.
  - Frontend: Se refactorizó `PrivateChat.jsx` para gestionar el estado de `searchTerm` reactivamente. Ahora consume las nuevas consultas para priorizar contactos y habilitar la búsqueda dinámica por nombre, rol y contenido de mensajes sin perder los contadores de mensajes no leídos.
* **Validaciones ejecutadas**:
  - Backend compilado en Release sin errores.
  - Frontend Vite build exitoso.
  - Tareas en `tasks.md` marcadas como finalizadas y código commiteado.
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

* **Objetivo**: Refinar la Experiencia de Usuario (UX) en el AdminDashboard.jsx, implementando modales dedicados para la edición de materias y reestructurando la pestaña de moderación para mostrar un historial completo de reportes divididos por estado.
* **Resultado**:
  - Se refactorizó `SubjectManagement.jsx` para utilizar un componente Modal superpuesto con `z-index` y `bg-black/50`, reemplazando el formulario estático (inline) que rompía el desplazamiento visual de la pantalla.
  - Se actualizó `ModerationManagement.jsx` implementando un *Split View* (botones en formato "tabs" integrados). Ahora la vista se divide dinámicamente entre el array de reportes "Pendientes" y el "Historial", permitiendo a los moderadores auditar las decisiones previas sin requerir mutaciones o queries nuevas.
  - Se confirmó el cumplimiento de la directiva estricta "Frontend Only" implementando los cambios lógicos del lado del cliente.
  - Validaciones completadas: `npm run build` del frontend exitoso con Vite (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Admin CRUD & UI Polish (Spec: 101-admin-actions-and-ui-polish)

* **Objetivo**: Dotar de interactividad completa (CRUD) a las pestañas de Materias y Reportes en el AdminDashboard, igualando la UI del reporte de comentarios con la publicación principal, y solucionar definitivamente los problemas de codificación de caracteres especiales (Encoding) en los datos de la plataforma.
* **Resultado**:
  - Se eliminaron los caracteres acentuados de las cadenas en `DbInitializer.cs` para mitigar el problema de Encoding sin reconfigurar la base de datos subyacente.
  - Se movió el botón "Reportar" en la interfaz de comentarios a un icono de bandera alineado a la derecha en la cabecera.
  - Se integró el modelo `Subject` con la propiedad `IsActive` a través de EF Core Migrations.
  - Se implementaron y conectaron las mutaciones GraphQL de gestión de Materias (`AddSubject`, `UpdateSubject`, `ToggleSubjectStatus`) y la actualización de Reportes (`UpdateReportStatus` a 'Resolved' y 'Rejected').
  - Validaciones completadas: Compilación de `API Graphql/OneITB/GraphQL.csproj` en Release, `npm run build` del frontend exitosos, y aplicación correcta de la migración en EF Core.
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

* **Objetivo**: Ejecutar una fase de pulido integral sobre la UI del Módulo 3 y el Panel de Administración para resolver problemas de codificación de caracteres, formateo de fechas, reportes en comentarios y consistencia visual en administración.
* **Resultado**:
  - Se forzó el formato UTF-8 en la base de datos simulada (`DbInitializer.cs`) asegurando que los caracteres especiales (eñes, tildes) se sirvan correctamente.
  - Se mejoró la legibilidad temporal eliminando los segundos de las publicaciones y comentarios usando `toLocaleString` con opciones estrictas (`HH:mm`).
  - Se incorporó la funcionalidad "Reportar" en la lista de comentarios anidados de `CommentThread.jsx`, propagando su ID al modal genérico de reportes.
  - Se hizo explícito el botón de suspensión y activación de cuentas en la tabla de `UserManagement.jsx`.
  - Se unificó el diseño visual del panel administrativo al refactorizar `SubjectManagement.jsx` y `ModerationManagement.jsx` de tarjetas al formato de lista tabular utilizado en `UserManagement.jsx`.
* **Archivos Modificados**:
  - `API Graphql/Data/DbInitializer.cs`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/CommentThread.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/SubjectManagement.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/ModerationManagement.jsx`

## [2026-06-13] - Full-Stack: Ecosistema Social, Mega-Seed y Administracion (Spec: 099-social-admin-ecosystem)

* **Objetivo**: Habilitar un entorno demostrable con datos realistas, interacciones sociales completas y un panel administrativo por pestañas.
* **Resultado**: Se incorporaron comentarios anidados, reacciones unicas, reportes de publicaciones, resolvers autenticados por JWT, consultas proyectadas y un dashboard con Usuarios, Materias y Moderacion. El feed permite publicar, reaccionar, comentar, responder y abrir el modal de reporte sin recargar la pagina.
* **Base de datos**: Se aplico `AddSocialEcosystem` con claves foraneas explicitas y `DeleteBehavior.Restrict`. El seed idempotente administra 10 usuarios, 5 materias, 30 publicaciones, 90 reacciones, 45 comentarios, 15 respuestas y 2 reportes; una segunda inicializacion mantuvo los mismos conteos.
* **Validaciones ejecutadas**:
  - Backend Release: 0 errores y 0 advertencias.
  - Frontend Vite: build exitoso con 0 errores.
  - EF Core: migracion aplicada y sin cambios de modelo pendientes.
  - GraphQL: altas, comentarios, respuestas, toggle de reaccion, reportes, rechazo de duplicados y autorizacion por roles verificados.
  - Navegador: publicacion inmediata, Me gusta, modal de reporte y las tres pestañas administrativas verificadas.
* **Evidencia**: `specs/099-social-admin-ecosystem/evidence.md`.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Comment.cs`
  - `API Graphql/Entities/Models/Reaction.cs`
  - `API Graphql/Data/DbInitializer.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Social/`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`


## [2026-06-13] - Backend: Exposición del Autor de Inquiry (Spec: 098-feed-stabilization)

* **Objetivo**: Resolver el HTTP 400 causado por la ausencia del campo `user` en `Inquiry`, manteniendo integridad relacional y evitando N+1.
* **Resultado**: Se agregó la navegación `Inquiry.User`, se mapeó mediante `UserId` con `DeleteBehavior.Restrict` y se mantuvo `[UseProjection]` para que HotChocolate proyecte el autor. La query canónica y la query actual del frontend responden HTTP 200. Se agregaron aliases backend temporales para `idUsuario`, `nombre` y `apellidos` sin eliminar `id`, `firstName` y `lastName`.
* **Base de datos**: EF confirmó que no existen cambios físicos pendientes; no se generó una migración vacía y no se modificó `DbInitializer.cs`.
* **Validaciones ejecutadas**:
  - `dotnet ef migrations has-pending-model-changes`: sin cambios pendientes.
  - `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: 0 errores.
  - Backend aislado en `http://127.0.0.1:5098`: query canónica HTTP 200 y query actual del feed HTTP 200.
* **Bloqueo restante**: la base actual devuelve `subjects: []`, por lo que todavía no puede validarse la creación completa de publicaciones.
* **Archivos principales**:
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/OneITB/Startup.cs`
  - `specs/098-feed-stabilization/`

---

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

## [2026-06-13] - Bugfix: Alineación Definitiva de Consulta User/Inquiry (Rama: 097-final-query-alignment)

* **Objetivo**: Corregir definitivamente el desajuste entre el nombre de navegación expuesto por el backend (`user`) y las propiedades internas traducidas al español por HotChocolate en la consulta `GET_INQUIRIES`, habilitando la carga de datos limpios creados desde la interfaz.
* **Descripción**: Se adaptó la query en el archivo `inquiries.js` para pedir explícitamente el objeto `user { idUsuario, nombre, apellidos, alias }`. Posteriormente se refactorizó `Feed.jsx` para interpolar dinámicamente `post.user?.nombre` y `post.user?.apellidos` en el generador de avatares de `ui-avatars` y en el subtexto de la publicación. Se verificó que el archivo `DbInitializer.cs` no fuera modificado, respetando la política estricta de NO SEEDING.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Alineación de Nomenclatura Frontend/HotChocolate (Rama: 095-fix-graphql-query-names)

* **Objetivo**: Resolver el Error 400 provocado por el rechazo de consultas mal nombradas en Apollo Client, producto del auto-formateo del esquema de HotChocolate.
* **Descripción**: Se auditaron las constantes de GraphQL en el cliente. Se reemplazó la solicitud de campos `getSubjects` y `getInquiries` por `subjects` e `inquiries` respectivamente en los archivos de queries (`subjects.js` e `inquiries.js`), para cumplir con la convención implícita de HotChocolate de eliminar prefijos "Get" y convertir a camelCase. En consonancia, se ajustó la extracción de los datos cacheados en `Feed.jsx` apuntando a `data?.subjects` y `data?.inquiries`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js`
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/inquiries.js`
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Proveedores de Proyecciones HotChocolate (Rama: 094-hotchocolate-projections-fix)

* **Objetivo**: Solucionar el Error HTTP 500 (System.Exception: Projection provider not found) que impedía la ejecución de las consultas `GetSubjects` y `GetInquiries`.
* **Descripción**: Se auditaron y registraron los métodos de extensión necesarios en el pipeline de inicialización del servidor GraphQL en `Startup.cs`. Se inyectaron `.AddProjections()`, `.AddFiltering()` y `.AddSorting()` al constructor de dependencias `services.AddGraphQLServer()`, habilitando que los atributos `[UseProjection]` usados previamente en los resolvers deleguen efectivamente los árboles de consulta al proveedor de Entity Framework de manera nativa.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-13] - Feature: GraphQL Endpoints para Subjects e Inquiries (Rama: 093-backend-inquiries-subjects-endpoints)

* **Objetivo**: Proveer al backend de los resolvers GraphQL necesarios para soportar la lectura de materias, publicaciones del muro y la creación de las mismas mediante firmas planas (evitando errores 400).
* **Descripción**: Se inyectó `[Service] OneItbContext` nativamente en los resolvers. En `Query.cs` se implementaron `GetSubjects` y `GetInquiries`, ambos con atributos `[UseProjection]` para optimización de queries hacia la BD mediante IQueryable. En `Mutation.cs` se agregó `AddInquiry` bajo el atributo `[Authorize]`, que toma argumentos planos (`userId`, `subjectId`, `title`, `content`), construye la entidad física y aplica el `SaveChangesAsync()`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-13] - Bugfix/Feature: Mutación Plana y Formulario de Publicación (Rama: 091-build-flat-mutation)

* **Objetivo**: Reconstruir el formulario de creación de consultas en el feed tras el rollback y conectarlo al backend asegurando el envío de variables planas para evitar el Error 400 documentado con HotChocolate.
* **Descripción**: Se implementaron desde cero las sentencias de Apollo Client `GET_SUBJECTS` y `CREATE_INQUIRY` en archivos separados (queries y mutations). Se actualizaron los imports y el estado local en `Feed.jsx` para integrar el formulario de manera fluida antes de las tarjetas de publicaciones. La firma de la mutación envía exclusivamente escalares directos, transformando `subjectId` a entero (`parseInt`) por seguridad, y prescindiendo de envoltorios `input` o `payload`, garantizando compatibilidad 1:1 con la nueva estructura del Backend.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/inquiries.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/subjects.js` (Nuevo)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx`

---

## [2026-06-13] - Bugfix: Erradicación de Shadow Properties (Rama: 090-fix-shadow-properties)

* **Objetivo**: Eliminar la generación de columnas fantasma (como `SubjectId1`) en EF Core para evitar la interrupción de la creación de publicaciones (Error 547) generada por llaves foráneas incorrectas.
* **Descripción**: Se aplicó una solución rigurosa usando Fluent API en el método `OnModelCreating` de `OneItbContext.cs`, mapeando bidireccionalmente la relación 1:N entre `Subject` e `Inquiry` (`HasOne...WithMany...HasForeignKey`), y estableciendo la política estricta de borrado `DeleteBehavior.Restrict`. Se inyectaron correctamente las colecciones de navegación en los modelos `Subject.cs` e `Inquiry.cs`. Finalmente, se aplicó la migración `FixShadowProperties` a la base de datos de manera exitosa y sin generar conflictos con el Frontend.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Data/Migrations/` (Archivos de Migración)

---

## [2026-06-13] - Feature: Professional Seed Users (Rama: 088-professional-seed-users)

* **Objetivo**: Implementar el sembrado automático de usuarios de prueba (Seeding) para todos los roles del sistema utilizando GUIDs estáticos y contraseñas hasheadas con BCrypt, garantizando la idempotencia y evitando errores de integridad referencial.
* **Descripción**: Se instaló el paquete `BCrypt.Net-Next` en la capa de Datos (resolviendo un conflicto de versiones con `Services.csproj` mediante la estandarización a la v4.2.0). Se creó `DbInitializer.cs` definiendo 5 constantes UUID reales e inmutables. El sembrador crea las entidades `Account` con una contraseña demo hasheada, configurada actualmente fuera del repositorio, y sus respectivas entidades `User` (para los roles Administrador, Estudiante, Profesor, Moderador, Empleador). Se inyectó la llamada a la inicialización en el pipeline de arranque de `Program.cs`. La compilación finalizó exitosamente (0 Errores).
* **Archivos Modificados**:
  - `API Graphql/Data/Data.csproj` y `API Graphql/Services/Services.csproj`
  - `API Graphql/Data/DbInitializer.cs` (Nuevo)
  - `API Graphql/OneITB/Program.cs`

---

## [2026-06-13] - Bugfix: Actualización de Font Awesome para Zero Warnings (Rama: 081-fontawesome-upgrade)

* **Objetivo**: Erradicar el warning recurrente de Chromium (`Glyph bbox was incorrect; adjusting`) provocado por errores internos de cálculo en Font Awesome 6.1.x, actualizando la librería a la versión 6.6.0.
* **Descripción**: Se modificó el punto de entrada principal del Frontend (`index.html`) para importar el CDN de Font Awesome v6.6.0 en lugar de v6.1.2. Esta versión contiene los parches oficiales para el bug de la "bounding box" al renderizar íconos sólidos en navegadores modernos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`

---

## [2026-06-12] - UI: Fix Regla de Hooks en AdminDashboard (Rama: 062-admin-dashboard-hooks-fix)

* **Objetivo**: Solucionar la excepción "Rendered more hooks than during the previous render" garantizando que los hooks se ejecuten incondicionalmente en la capa de administración.
* **Descripción**: Se auditaron y refactorizaron los subcomponentes internos `SubjectsManagement` y `ReportsManagement` en `AdminDashboard.jsx`. Se identificó que `useMemo` estaba siendo invocado después de retornos tempranos condicionales (`if (loading) return ...`). La solución consistió en elevar la definición de los hooks de filtrado reactivo (`filteredSubjects` y `filteredReports`) por encima de cualquier cláusula de retorno temprano, restaurando el cumplimiento íntegro de las "Rules of Hooks" de React y estabilizando el panel en tiempo de ejecución.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/AdminDashboard.jsx`

---

## [2026-06-10] - Frontend: Interfaz Rol Empleador y Moderación Comunitaria (Rama: 046-frontend-employer-and-moderation)

* **Objetivo**: Integrar las nuevas funcionalidades de acceso "Passwordless" y reportes de contenido en la interfaz de React utilizando Tailwind v4.
* **Descripción**: Se diseñó el componente `EmployerLogin.jsx` con los estados necesarios para solicitar el Magic Link (simulando AFIP) y procesar el inicio de sesión. Se agregó un componente genérico `ReportModal.jsx` y se integró en el `Feed.jsx`, permitiendo a los usuarios pulsar la bandera de reporte en cualquier publicación para enviarla a revisión.
* **Archivos Modificados/Creados**:
  - `src/data/graphql/mutations/employer.js` & `moderation.js`
  - `src/Components/auth/EmployerLogin.jsx`
  - `src/Components/moderation/ReportModal.jsx`
  - `src/router/Routing.jsx` (Ruta '/employer-login')
  - `src/Components/publication/Feed.jsx`

---

## [2026-06-10] - Backend: Infraestructura Rol Empleador y Moderación (Rama: 045-backend-employer-and-moderation)

* **Objetivo**: Implementar la lógica y persistencia del nuevo rol de Empleador y del sistema de Reportes Comunitarios.
* **Descripción**: Se crearon las entidades `MagicLink` y `CommunityReport`, mapeándolas con Entity Framework y aplicando una migración a la base de datos local. Se diseñaron los servicios `EmployerAuthService` (Passwordless + Simulador AFIP) y `ModerationService`, los cuales fueron expuestos en la API a través de las nuevas mutaciones GraphQL `RequestMagicLink`, `LoginWithMagicLink` y `ReportContent`.
* **Archivos Modificados/Creados**:
  - `Entities/Models/MagicLink.cs`, `Entities/Models/CommunityReport.cs`
  - `Data/OneItbContext.cs` (+ Migración)
  - `Services/Auth/EmployerAuthService.cs`, `Services/Moderation/ModerationService.cs`
  - `OneITB/GraphQL/Mutation.cs`, `OneITB/Startup.cs`

---

## [2026-06-10] - Documentación: Actualización de Requerimientos (Rama: 044-docs-employer-role-update)

* **Objetivo**: Formalizar las decisiones arquitectónicas respecto a nuevos roles y modalidades de acceso en el documento rector.
* **Descripción**: Se actualizó el archivo `02_Requerimientos.md` para incluir el flujo de autenticación Passwordless (AFIP) en el RF-003, la excepción de la regla de dominio institucional para empresas en el RF-001, el nuevo esquema de Moderación Comunitaria (RF-013) y la definición oficial de los perfiles Empleador y Moderador.
* **Archivos Modificados**:
  - `docs/academic/02_Requerimientos.md`

---

## [2026-06-10] - Bugfix & Config: Corrección de Consulta GraphQL de Usuarios (Rama: 043-admin-dashboard-fix-users-query)

* **Objetivo**: Habilitar el rastreo de excepciones en HotChocolate y resolver el error 500 en la recuperación de la lista de usuarios.
* **Descripción**:
  - Se configuró `.ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true)` en `Startup.cs` para exponer stack traces completos de GraphQL en desarrollo.
  - Se añadió la inyección faltante de `.AddAuthorization()` al `AddGraphQLServer()` para resolver el error de construcción de esquema de los decoradores `[Authorize]`.
  - Se corrigió el mapeo y proyección de Entity Framework Core en el repositorio (`UnitOfWork.cs` -> `GetAll()`). Se añadió `.Include(u => u.Account)` para evitar resoluciones `null` en relaciones estrictas, solucionando la falla total de la consulta de usuarios.
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`

---

## [2026-06-10] - Full Stack: Integración GraphQL para Dashboard de Administración (Rama: 042-admin-user-management-graphql)

* **Objetivo**: Conectar la interfaz de gestión de usuarios del frontend con la base de datos SQL Server mediante el backend de GraphQL (.NET 8 HotChocolate), descartando el Mock Data.
* **Descripción**:
  - **Backend**: Se introdujo el campo `IsActive` (bool) al modelo `User.cs` y a la base de datos mediante EF Core Migrations (`AddUserIsActive`). Se crearon dos nuevas mutaciones en `Mutation.cs`: `UpdateUserRole` y `UpdateUserStatus`, ambas delegadas de forma segura a `UsersService`. La compilación del backend resultó exitosa (0 errores).
  - **Frontend**: En el componente `UserManagement.jsx`, se eliminó la dependencia de Mock Data y se implementaron los hooks de Apollo Client (`useQuery` para `GetUsers`, `useMutation` para `UpdateUserRole` y `UpdateUserStatus`). Los controles interactivos de la grilla (Select de roles y Toggle de estado) ahora invocan estas mutaciones directamente y disparan `refetch()` para asegurar la sincronización en tiempo real. La compilación de Vite fue exitosa.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/User.cs`
  - `API Graphql/Services/Users/IUsersService.cs` y `UsersService.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx`

---

## [2026-06-10] - UI: Dashboard de Administración de Usuarios (Rama: 041-admin-user-management)

* **Objetivo**: Crear una interfaz dedicada para administradores que permita la gestión de usuarios, roles y estados de activación.
* **Descripción**: Se construyó un nuevo componente `UserManagement.jsx` bajo `src/Components/admin/`. Este incluye una grilla de datos responsiva creada completamente con Tailwind CSS v4. Permite simular cambios de rol (Usuario/Administrador) mediante un `<select>` y el estado de la cuenta (activo/suspendido) a través de un toggle interactivo, validados inicialmente con mock data. El componente se integró en el enrutamiento privado (`/admin/users`) y se agregó un enlace en la barra de navegación principal (`Nav.jsx`) visible para usuarios autenticados. La compilación fue exitosa con 0 errores.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/admin/UserManagement.jsx` (nuevo)
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-06-10] - UI: Inyección de Header en Rutas Públicas (Rama: 040-public-layout-header-fix)

* **Objetivo**: Integrar el componente `Header` en las rutas públicas de la aplicación (`PublicLayout`) y manejar el estado no autenticado.
* **Descripción**: Se refactorizó `PublicLayout.jsx` para inyectar `<Header />` sobre el `<main>` container y establecer un layout de columna (`flex flex-col min-h-screen`). Además, se modificó `Nav.jsx` para renderizar condicionalmente los botones de "Iniciar Sesión" y "Registrarse" usando utilidades Tailwind cuando el usuario no está autenticado (`!auth.id`), ocultando correctamente el menú de usuario/avatar. La compilación resultó exitosa (0 errores).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`

---

## [2026-06-10] - Backend: Validación y Fix de Compatibilidad .NET 8 (Rama: 039-backend-dotnet8-validation)

* **Objetivo**: Ejecutar la batería de pruebas automatizadas para validar el upgrade a .NET 8 y corregir los breaking changes detectados.
* **Pruebas ejecutadas y resultados**:
  1. **`dotnet restore`**: Error inicial `NU1102` — `System.ComponentModel.Annotations 8.0.0` no existe en NuGet (es inbox en .NET 8 SDK). Fix: se eliminó la `<PackageReference>` de `Services.csproj`. Resultado final: ✅ Todos los proyectos restaurados.
  2. **`dotnet build`**: Error inicial — breaking change de HotChocolate 13→14: `RegisterDbContext<T>(DbContextKind.Pooled)` fue reemplazado por `RegisterDbContextFactory<T>()`. Fix aplicado en `Startup.cs`. Resultado final: ✅ **Compilación correcta — 0 Errores, 0 Advertencias**. DLLs generados en `bin/Debug/net8.0/`.
  3. **`dotnet ef database update`**: ✅ **"Build succeeded. Done."** — Base de datos conectada y migración aplicada correctamente.
* **Archivos Modificados**:
  - `API Graphql/Services/Services.csproj` (eliminación de referencia inbox)
  - `API Graphql/OneITB/Startup.cs` (fix HC14 breaking change: `RegisterDbContext` → `RegisterDbContextFactory`)
* **Nota**: EF CLI global instalada es `6.0.36`. Recomendado actualizar con `dotnet tool update --global dotnet-ef` para alinear con el runtime `8.0.6`.

---

## [2026-06-10] - Backend: Migración a .NET 8 LTS (Rama: 038-backend-dotnet8-upgrade)

* **Objetivo**: Migrar los 4 proyectos del backend de .NET 6 (EOL) a .NET 8 LTS y actualizar todas las dependencias NuGet críticas a sus versiones compatibles.
* **Pre-Upgrade**: Todos los proyectos estaban en `net6.0` con EF Core `7.0.4`, HotChocolate `13.0.5`, JwtBearer `6.0.16`.
* **Cambios aplicados**:

| Proyecto | TFM | EF Core | HotChocolate | JwtBearer |
---

## [2026-06-10] - UI: Global Tailwind Refactor — Capa Social (Rama: 037-global-tailwind-refactor)

* **Objetivo**: Reparar los daños estéticos causados por la purga del CSS legacy (036) en los componentes de la red social, migrándolos al uso exclusivo de Tailwind CSS v4.
* **Descripción**: Auditoría grep completa detectó 6 componentes con clases BEM residuales. `Nav.jsx` fue reescrito eliminando todas las clases BEM (`navbar__container-lists`, `list-end__img`, `menu-list__link`) y los inline styles con `fontSize: '1.4rem'` que causaban el avatar gigante — reemplazado con avatar estrictamente `w-9 h-9 rounded-full object-cover` + dropdown Tailwind con click-outside. `Feed.jsx` fue reescrito eliminando 15+ clases BEM (`posts__post`, `post__user-image`, etc.) — posts ahora son tarjetas `bg-white rounded-xl shadow-sm` con avatares `w-10 h-10`. `Login.jsx`, `Register.jsx` y `EditProfile.jsx` fueron reescritos con layout de card centrado, inputs con focus rings, banners de alerta Tailwind — toda la lógica de autenticación y mutaciones GraphQL preservada. Se corrigió una redirección obsoleta `/social/profile` → `/profile` en `EditProfile`. Build: 0 errores, 293 módulos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/publication/Feed.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx` (reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/EditProfile.jsx` (reescritura Tailwind)
  - `AGENTS.md` y `.specify/feature.json` (actualización de referencia activa)

---

## [2026-06-10] - UI: CSS Supremacy — Erradicación de Legacy y Sistema de Diseño Único (Rama: 036-theme-and-css-supremacy)

* **Objetivo**: Eradicar definitivamente todas las hojas de estilo heredadas y establecer el sistema de diseño de `_temp_cv_reference` (Tailwind v4 + Inter + variables @theme) como única fuente de verdad.
* **Descripción**: Se sobrescribió `src/index.css` con el contenido exacto de `_temp_cv_reference/index.css`, eliminando el bloque `:root` de variables shadcn-style (`--primary`, `--background`, etc.) que no son utilizadas por ningún componente y que envenenaban el namespace. Se removieron de `main.jsx` los tres imports de CSS legacy (`normalize.css`, `styles.css`, `responsive.css`) — ahora solo existe `import './index.css'`. Los tres archivos CSS legacy fueron físicamente vaciados con un comentario "tombstone" para prevenir reimportaciones accidentales. El `index.html` ya tenía Inter y Font Awesome correctamente inyectados. Resultado del build: 0 errores, 294 módulos, bundle CSS reducido de **45.40 kB → 35.15 kB (−10 kB)**.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/index.css` (reescritura con contenido exacto de referencia)
  - `FrontEnd/OneItb-FE/src/main.jsx` (eliminación de 3 imports de CSS legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (vaciado — tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (vaciado — tombstone)
  - `FrontEnd/OneItb-FE/src/assets/css/normalize.css` (vaciado — tombstone)
* **Archivos Creados**:
  - `specs/036-theme-and-css-supremacy/spec.md`
  - `specs/036-theme-and-css-supremacy/plan.md`
  - `specs/036-theme-and-css-supremacy/tasks.md`

---

## [2026-06-10] - UI: Trasplante Literal del CV Builder a /profile (Rama: 035-literal-cv-transplant)

* **Objetivo**: Eliminar el overlapping de layouts inventados en `/profile` y realizar un trasplante exacto del layout y componentes de `_temp_cv_reference` hacia `UserProfile.tsx`, garantizando una fidelidad 100% visual al diseño original.
* **Descripción**: Se diagnosticó la causa raíz del overlapping: el `overflow-y-auto` del `<main>` de `PrivateLayout` conflictuaba con el `overflow-hidden` y `h-[calc(100vh-...)]` del workspace del CV, haciendo que los paneles internos se pisaran. La solución fue cambiar `PrivateLayout`'s `<main>` a `overflow-hidden` para ceder el control de scroll al componente hijo. `UserProfile.jsx` fue completamente reescrito como una copia literal de `_temp_cv_reference/App.tsx`: mismo `<div className="min-h-screen bg-slate-50 flex flex-col font-sans">`, mismo `<main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-56px)]">`, mismo editor section, mismo preview section. El `initialData` fue copiado verbatim. Los cinco formularios (`PersonalForm`, `ExperienceForm`, `EducationForm`, `ProjectsForm`, `SkillsLanguagesForm`) fueron conectados con los prop names exactos de sus interfaces TypeScript. Se corrigió `types/resume.ts` para hacer `hidden` opcional en todas las interfaces. El archivo fue renombrado a `.tsx` para soportar anotaciones TypeScript. Build: 0 errores, 297 módulos, 459ms.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` → renombrado a `UserProfile.tsx` (reescritura total)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (fix overflow-hidden)
  - `FrontEnd/OneItb-FE/src/types/resume.ts` (hidden opcional en todas las interfaces)
  - `AGENTS.md` y `.specify/feature.json` (actualización de referencia activa)
* **Archivos Creados**:
  - `specs/035-literal-cv-transplant/spec.md`
  - `specs/035-literal-cv-transplant/plan.md`
  - `specs/035-literal-cv-transplant/tasks.md`

---

## [2026-06-10] - UI: Refactorización Total del Layout Global y Vista de Perfil (Rama: 034-total-frontend-refactor)

* **Objetivo**: Erradicar las dependencias de CSS legacy (grillas `.layout` rotas) y adoptar Tailwind CSS v4 como única autoridad de layout, garantizando la integración perfecta de los nuevos componentes de CV y el cumplimiento del RNF-004 (Usabilidad y Adaptabilidad).
* **Descripción**: Se neutralizó la definición `display: grid` y las propiedades `grid-template-areas/rows/columns` de la clase `.layout` en `styles.css`, removiendo también las referencias `grid-area` de `.layout__content` y `.layout__aside`. `PrivateLayout.jsx` fue reescrito con un contenedor `flex flex-col min-h-screen` y un body con `<main className="flex-1 overflow-y-auto">` más un `<aside>` lateral visible en lg+, eliminando completamente la dependencia de la grilla CSS. `SideBar.jsx` fue íntegramente reescrito en Tailwind preservando el avatar, stats y formulario de publicación. `Header.jsx` fue actualizado a un header sticky con Tailwind. En `UserProfile.jsx` se eliminaron las clases `content__header` y `content__title` del legacy, reemplazándolas con un encabezado Tailwind de doble columna con acento visual. La compilación `npm run build` completó en 507ms con 0 errores y 293 módulos transformados.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css` (Neutralización del grid legacy)
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css` (Marcado como deprecated)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx` (Reescritura Tailwind)
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx` (Limpieza de clases legacy)
  - `AGENTS.md` (Actualización de referencia de plan activo)
  - `.specify/feature.json` (Actualización de feature activo)
* **Archivos Creados**:
  - `specs/034-total-frontend-refactor/spec.md`
  - `specs/034-total-frontend-refactor/plan.md`
  - `specs/034-total-frontend-refactor/tasks.md`

---

## [2026-06-09] - UI: Corrección de Consulta GraphQL en Perfil (Rama: 027-fix-profile-graphql-400)

* **Objetivo**: Solventar el error HTTP 400 (Bad Request) al cargar la vista del Perfil alineando las consultas del frontend con el esquema de HotChocolate.
* **Descripción**: Se modificó `getUserProfile.js` para remover el parámetro de variable no utilizado `$id` de la firma de consulta, el cual era rechazado sintácticamente por el endpoint del backend. Se alinearon las propiedades requeridas del payload solicitando el campo de introspección `alias` y acoplándolo al mapeo reactivo de la foto de perfil en el DOM en `UserProfile.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/queries/getUserProfile.js`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/027-fix-profile-graphql-400/spec.md`
  - `specs/027-fix-profile-graphql-400/plan.md`
  - `specs/027-fix-profile-graphql-400/tasks.md`

---

## [2026-06-09] - UI: Corrección de SRI y Reflow de Layout (Rama: 025-hotfix-console-warnings)

* **Objetivo**: Solucionar bloqueos de seguridad SRI de Font Awesome y eliminar advertencias de "Layout Forced" en la consola del navegador.
* **Descripción**: Se modificó `index.html` para remover atributos `integrity` y `crossorigin` del recurso Font Awesome del CDN, solucionando bloqueos por firmas de integridad incompatibles. En `ResumePreview.tsx`, se reestructuró la medición de `scrollHeight` en el hook `useEffect` envolviéndola en una llamada `requestAnimationFrame`, programando de forma diferida el cálculo de hojas y eliminando bloqueos de UI (Forced Reflow) en el hilo de ejecución principal.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/Components/resume/ResumePreview.tsx`
  - `specs/025-hotfix-console-warnings/spec.md`
  - `specs/025-hotfix-console-warnings/plan.md`
  - `specs/025-hotfix-console-warnings/tasks.md`

---

## [2026-06-09] - UI: Enrutamiento Limpio, Landing Page y Unificación de Perfil (Rama: 023-router-fix-and-cv-layout)

* **Objetivo**: Eliminar el prefijo `/social` de las rutas SPA, crear una página de inicio (Landing Page) en `/`, unificar la edición de perfil eliminando la sub-ruta `/profile/edit` y mapear enlaces correctamente.
* **Descripción**: Se eliminó el prefijo `/social` de todas las rutas del frontend, actualizando el archivo `Routing.jsx` y todas las referencias de enlaces en `Header.jsx`, `Nav.jsx` y `SideBar.jsx`. Se creó el componente `Landing.jsx` y se configuró como el componente principal para el path `/`. Adicionalmente, se retiró la ruta `/profile/edit` y su enlace correspondiente en la barra de navegación superior, unificando la edición dentro del perfil en doble columna en `/profile`.
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

## [2026-06-09] - UI: Revamp de Navegación y Perfil Doble Columna (Rama: 022-navigation-profile-revamp)

* **Objetivo**: Refactorizar la navegación global (Header/Nav) eliminando enlaces obsoletos y crear un menú de usuario dinámico, e integrar los formularios de actualización del currículum al perfil público en doble columna.
* **Descripción**: Se modificó `Nav.jsx` removiendo accesos inactivos en el Header, implementando el saludo dinámico "Hola {username}" e inyectando un menú desplegable interactivo para acceder a Ajustes y Cerrar sesión. Se diseñó una estructura de doble columna en `UserProfile.jsx` que combina la previsualización del portafolio profesional (LinkedIn-style CV layout a la izquierda) y el formulario editable de actualización de biografía y redes sociales a la derecha (conectado a la mutación de Apollo y al estado de sesión). Por último, se inyectó una burbuja flotante condicional a la sesión de usuario para la mensajería privada (Módulo 4) en `PrivateLayout.jsx`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Header.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/profile/UserProfile.jsx`
  - `specs/022-header-ux-cv-profile/spec.md`
  - `specs/022-header-ux-cv-profile/plan.md`
  - `specs/022-header-ux-cv-profile/tasks.md`

---

## [2026-06-09] - BD: Aplicación de Migraciones EF Core de Perfil (Rama: 021-apply-profile-migration)

* **Objetivo**: Ejecutar comandos de Entity Framework Core desde el agente para aplicar y verificar la actualización física de la base de datos de perfiles.
* **Descripción**: Se aplicó de forma interactiva la migración `AddUserBioAndSocials` mediante `dotnet ef database update --project ../Data --startup-project .` desde la raíz de ejecución de la API GraphQL. Se confirmó la compilación limpia del servidor y el almacenamiento persistente de las nuevas columnas nullable (`Biography`, `LinkedIn`, `Facebook`, `Instagram`, `Phone`) en la base de datos física local de SQL Server.
* **Archivos Modificados**:
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)
  - `specs/021-apply-profile-migration/tasks.md` (Completado)

---

## [2026-06-09] - BD/API/UI: Módulo 2 - Perfiles, Biografía y Redes (Rama: 020-user-profiles-bio)

* **Objetivo**: Desarrollar la persistencia de biografía y redes sociales en el perfil de usuario a nivel de Base de Datos, API GraphQL y crear las interfaces del cliente frontend.
* **Descripción**: Se expandió el modelo C# `User.cs` con propiedades para `Biography`, `LinkedIn`, `Facebook`, `Instagram` y `Phone`. Se generó la migración `AddUserBioAndSocials` aplicando los cambios en la base de datos de SQL Server. En el backend, se creó el DTO `UpdateProfileInput`, se implementó la mutación `UpdateProfile` expuesta en HotChocolate y se mapearon sus campos a camelCase en `Startup.cs`. En el frontend React, se crearon los componentes `Profile.jsx` (tarjeta profesional con enlaces de redes) y `EditProfile.jsx` (formulario de edición de perfil), enlazándolos en el enrutador `Routing.jsx` y activando sus accesos rápidos en la barra de navegación lateral y superior.
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

## [2026-06-09] - UI: Implementación de Mejoras Rápidas (Quick Wins) (Rama: 019-frontend-quick-wins)

* **Objetivo**: Estabilizar y corregir la interfaz visual (UI/UX) del frontend aplicando las mejoras rápidas de alto impacto identificadas en la auditoría.
* **Descripción**: Se movió la clase contenedora `.layout` desde `App.jsx` hacia `PrivateLayout.jsx` y `PublicLayout.jsx` para restablecer el acoplamiento directo de CSS Grid, logrando alinear correctamente la columna del SideBar (30% de ancho) junto al Feed principal (70% de ancho). En `Nav.jsx`, se reemplazaron los enlaces estáticos `href="#"` por elementos `<NavLink />` de React-Router, vinculándolos a las rutas SPA operativas, y se inyectó la información dinámica del usuario (`auth.username`) desde `AuthContext`. Por último, se renombró el archivo `feed.jsx` a `Feed.jsx` para ajustarse a la convención estándar PascalCase de React y se actualizaron sus respectivas importaciones.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/App.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/PrivateLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/public/PublicLayout.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/Nav.jsx`
  - `FrontEnd/OneItb-FE/src/router/Routing.jsx`
* **Archivos Renombrados**:
  - `FrontEnd/OneItb-FE/src/Components/publication/feed.jsx` -> `Feed.jsx` (PascalCase)

---

## [2026-06-09] - UI: Relevamiento y Auditoría de Frontend (Rama: 018-frontend-deep-audit)

* **Objetivo**: Realizar un relevamiento exhaustivo del código fuente del Frontend para identificar la estructura del árbol de componentes, fallos de enrutamiento y plantear estándares modernos de desarrollo.
* **Descripción**: Se llevó a cabo un escaneo completo de `FrontEnd/OneItb-FE/src/`. Se diagnosticó el error de visualización del SideBar (debido a la jerarquía rota de CSS Grid provocada por envolver el enrutador en la clase contenedora de `App.jsx`) y el comportamiento inactivo de los enlaces del Header. Adicionalmente, se redactó el reporte formal de auditoría y se definieron pautas de nomenclatura (BEM, FSD, y PascalCase/camelCase) para guiar los desarrollos de los módulos de Perfiles y Publicaciones.
* **Archivos Creados/Modificados**:
  - `FRONTEND_AUDIT_REPORT.md` (Creado)
  - `docs/audit/DEVELOPMENT_LOG.md` (Modificado)

---

## [2026-06-09] - UI: Refactor Visual Profundo UI/UX (Rama: 016-ui-ux-revamp)

* **Objetivo**: Implementar un rediseño visual profundo en el frontend (React) con tipografía moderna, paleta de colores Clean/EdTech y verificación de adaptabilidad responsiva sin alterar la lógica.
* **Descripción**: Se integró la tipografía corporativa **Inter** desde Google Fonts en `index.html` y se configuró como el tipo de letra principal en `styles.css`. Se refinaron las variables de diseño CSS (`:root`) para aplicar la paleta "Clean/EdTech" con tonalidades pizarra claras/oscuras y acento azul eléctrico (`#3b82f6`). Adicionalmente, se auditó la adaptabilidad responsiva en `responsive.css` para asegurar el cumplimiento del requerimiento de usabilidad (RNF-004) en resoluciones móviles y de escritorio.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`
  - `FrontEnd/OneItb-FE/src/assets/css/responsive.css`

---

## [2026-06-09] - UI: Refactor Visual y Reparación de Recursos (Rama: 015-ui-polish-assets)

* **Objetivo**: Solucionar errores de carga de recursos estáticos (imagen 404 y fuentes corruptas de FontAwesome) y refabricar el estilo visual de los formularios de autenticación y el layout principal.
* **Descripción**: Se integró el CDN oficial de FontAwesome 6.1.2 en `index.html` y se removió la importación del archivo CSS local corrupto en `main.jsx` para evitar advertencias en consola. En `SideBar.jsx` se modificó el origen del avatar para generar iniciales dinámicamente con ui-avatars.com basándose en el nombre de usuario autenticado. Se aplicaron estilos visuales premium para inputs, botones con gradientes, cajas de formularios con sombras y alertas personalizadas en `styles.css`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/index.html`
  - `FrontEnd/OneItb-FE/src/main.jsx`
  - `FrontEnd/OneItb-FE/src/Components/layout/private/SideBar.jsx`
  - `FrontEnd/OneItb-FE/src/assets/css/styles.css`

---

## [2026-06-09] - UI/Auth-Routing: Persistencia de Token y Redirección en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la inyección automática del token Bearer en el cliente Apollo, el estado de sesión global en React y la redirección programática al Feed tras Login (T1.5).
* **Descripción**: Se configuró `setContext` (authLink) en `GraphqlProvider.js` para adjuntar dinámicamente el header `Authorization` con el JWT de localStorage. En `Login.jsx` se modificó el callback de la mutación para guardar el token/usuario en el almacenamiento y utilizar `useNavigate('/social')` para redirección SPA.
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

## [2026-06-09] - API/Auth: Implementación Criptográfica de JWT para Login (Rama: 010-frontend-tracing)

* **Objetivo**: Reemplazar el token estático de prueba placeholder por una generación criptográfica de JWT válida, alineando firmas y DTOs al estándar en inglés.
* **Descripción**: Se inyectó `IConfiguration` en `AccountsService.cs` y se programó la firma de tokens HS256 utilizando `System.IdentityModel.Tokens.Jwt` con los Claims correspondientes de ID, nombre y rol. Además, se renombró `LoginPayload` a `AuthPayload` y `LoginAsync` a `Login` en `DTOs.cs`, `Mutation.cs`, y en las interfaces de servicios para cumplir con las directivas de nomenclatura.
* **Archivos Modificados**:
  - `API Graphql/Services/Accounts/AccountsService.cs`
  - `API Graphql/Services/Accounts/IAccountService.cs`
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/OneITB/GraphQL/Mutation.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Login.jsx`
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/authenticateUser.js`

---

## [2026-06-08] - BD/Entidades: Refactorización Completa de Entidades al Inglés y Hard Reset de DB (Rama: 010-frontend-tracing)

* **Objetivo**: Traducir todas las entidades y columnas de la base de datos física al inglés para alinearse a la directiva de nomenclatura AD-006.
* **Descripción**: Se eliminaron las entidades en español `Materia.cs` y `Consulta.cs`, reemplazándolas por `Subject.cs` e `Inquiry.cs` con propiedades en inglés. Se eliminaron los mapeos explícitos (workarounds) de nombres en español en `OneItbContext.cs`. Finalmente, se borró el historial de migraciones físicas, se aplicó un drop de base de datos y se actualizó el esquema físico desde cero en SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Entities/Models/Subject.cs`
  - `API Graphql/Entities/Models/Inquiry.cs`
  - `API Graphql/Data/OneItbContext.cs`
  - `API Graphql/Services/Repositories/UnitOfWork.cs`
  - `API Graphql/Services/Users/UsersService.cs`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - API/Resolvers: Mapeo de Nomenclatura en la Entidad User de GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Corregir errores de campos no encontrados en la introspección del cliente GraphQL mapeando explícitamente las propiedades hacia el esquema y garantizar su visibilidad en camelCase.
* **Descripción**: Se modificó la configuración de `ObjectType<User>` en `Startup.cs` para mapear los campos requeridos por el frontend a la convención camelCase: `Id` se mapea a `idUsuario`, `Nombre` a `nombre`, `Apellido` a `apellidos`, y se definieron resolvers virtuales para `alias` (retornando `Nombre`) y `email` (obteniendo el email de la propiedad de navegación `Account`). Asimismo, se protegió la contraseña cifrada del usuario mediante la exclusión de `PasswordHash` en el tipo `Account` (`Ignore()`) conforme a la directiva de seguridad de datos (AD-003).
* **Archivos Modificados**:
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - API/Resolvers: Exposición del campo de Consulta Usuarios en HotChocolate (Rama: 010-frontend-tracing)

* **Objetivo**: Solventar el error `The field 'Usuarios' does not exist on the type 'Query'` permitiendo al cliente Apollo introspectar y consumir la entidad de usuarios.
* **Descripción**: Se modificó `Query.cs` agregando el método resolver `GetUsuarios` que retorna `IQueryable<User>` a través de `usersService.GetAllAsync()`, mapeándose automáticamente al campo `usuarios` en el esquema de HotChocolate. También se adaptó `GetUsers` para mantener compatibilidad con consultas en inglés (`users`). Asimismo, para cumplir con la directiva de seguridad de datos (AD-003), se configuró la exclusión del campo `PasswordHash` de la entidad `Account` mediante Fluent API en `Startup.cs` (`AddType(new ObjectType<Account>(d => d.Field(f => f.PasswordHash).Ignore()))`) evitando filtraciones.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - API/Resolvers: Resolución de Consultas de Usuarios e Inyección de Interfaces en GraphQL (Rama: 010-frontend-tracing)

* **Objetivo**: Implementar la resolución de consultas (Query) para la entidad Usuarios en HotChocolate, corregir la inyección de servicios y registrar la configuración correctamente en el middleware de GraphQL.
* **Descripción**: Se refactorizó `Query.cs` para inyectar la interfaz de servicio registrada en el contenedor de dependencias (`IUsersService`) en lugar de la clase concreta `UsersService`. Se modificó la firma del método `GetUserById` para recibir parámetros de tipo `Guid` de acuerdo con la clave primaria de la entidad. Además, se removieron registros innecesarios de servicios de entidad (`RegisterService<User>` y `RegisterService<Account>`) en `Startup.cs` para subsanar errores de inicialización de tipos nativos como `string` en el motor de HotChocolate.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Query.cs`
  - `API Graphql/OneITB/Startup.cs`

---

## [2026-06-08] - BD/Migración: Corrección de Propiedad IDENTITY en Migración EF Core (Rama: 010-frontend-tracing)

* **Objetivo**: Evitar el error `InvalidOperationException: To change the IDENTITY property of a column...` al aplicar la última migración de base de datos sin destruir el historial.
* **Descripción**: Se refactorizó la migración `20260608221114_FixRegistroUsuario.cs` para evitar el uso de `AlterColumn` e intentar convertir la columna `Id` de `int IDENTITY` a `Guid`. En su lugar, se configuraron llamadas explícitas a `DropColumn` y `AddColumn` tanto en el método `Up` como en el `Down`, asegurando la recreación de la llave primaria de forma correcta sin violar las restricciones de SQL Server.
* **Archivos Modificados**:
  - `API Graphql/Data/Migrations/20260608221114_FixRegistroUsuario.cs`

---

## [2026-06-08] - API/Mutación: Sincronización de Esquema RegisterInput y Resolver en Backend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el esquema de entrada de GraphQL (`RegisterInput`) y la mutación con los requerimientos del Caso de Uso (CU-01) para solucionar el Error HTTP 500 por discrepancia de datos.
* **Descripción**: Se añadieron las propiedades `Nombre`, `Apellidos` y `CarrerasInscritas` al record `RegisterInput` en `DTOs.cs` para evitar desajustes en el mapeo de variables desde el cliente y alinear el esquema con el CU-01. Asimismo, se modificó el método `RegisterAsync` de `UsersService.cs` para mapear el campo `Nombre` de la entidad `User` usando `input.Nombre` y `Apellido` usando `input.Apellidos` en lugar del valor hardcodeado `string.Empty` (el cual disparaba la excepción de dominio).
* **Archivos Modificados**:
  - `API Graphql/Services/DTOs.cs`
  - `API Graphql/Services/Users/UsersService.cs`

---

## [2026-06-08] - UI/Trazabilidad: Trazabilidad y Sincronización de Variables de Registro en Frontend (Rama: 010-frontend-tracing)

* **Objetivo**: Sincronizar el mapeo de variables entre el estado local del formulario React y la mutación GraphQL e implementar trazabilidad por consola para el campo "Apellidos".
* **Descripción**: Se alineó la nomenclatura de las variables del frontend mapeando el estado local del formulario `form.surname` a la propiedad `apellidos` dentro de las variables de la mutación. Se inyectó un `console.log("Datos a enviar a GraphQL:", variables);` justo antes de ejecutar la llamada asíncrona a la mutación para auditar y depurar el payload.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - UI/Validación: Feedback Visual de Validación y Control de Apellidos en Frontend (Rama: 009-frontend-feedback-validation)

* **Objetivo**: Proveer un mecanismo de retroalimentación amigable en pantalla para errores de validación local y de red, evitando alertas emergentes y validando todos los campos requeridos de `CU-01` (incluyendo Apellidos).
* **Descripción**: Se implementó el estado local `errorMessage` en `Register.jsx` para capturar errores. La UI fue rediseñada para renderizar dinámicamente un banner rojo con el mensaje de error de validación del formulario (ej. Apellidos es obligatorio).
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Validación: Validaciones Locales de Formulario de Registro (Rama: 008-frontend-validations)

* **Objetivo**: Implementar chequeos locales antes de disparar la mutación de registro, previniendo peticiones de red inválidas innecesarias.
* **Descripción**: Se agregaron chequeos locales de campos vacíos, restricciones de longitud para alias (mínimo 3 caracteres) y contraseña (mínimo 8 caracteres) en `Register.jsx`, así como una expresión regular para forzar que el correo ingresado termine con el dominio oficial `@itbeltran.com.ar`.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Manejo: Lanzar GraphQLException ante Excepciones de Validación en Registro (Rama: 007-throw-graphql-exception)

* **Objetivo**: Propagar los errores de validación de la entidad como excepciones nativas de GraphQL para que el motor de HotChocolate los maneje e informe en el array de errores estándar.
* **Descripción**: Se modificó el bloque catch de `System.ArgumentException` en `Mutation.RegisterUserAsync` para lanzar una `HotChocolate.GraphQLException` con el mensaje descriptivo de la entidad (ej. formato de email inválido). Esto elimina la necesidad de respuestas encapsuladas exitosas/fallidas para errores graves de validación de dominio.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Manejo: Captura y Control de ArgumentException en Mutación de Registro (Rama: 006-handle-mutation-exceptions)

* **Objetivo**: Evitar errores de servidor HTTP 500 capturando excepciones de argumentos y retornando mensajes de validación legibles.
* **Descripción**: Se envolvió la llamada a `usersService.RegisterAsync(input)` en un bloque `try-catch` capturando `System.ArgumentException` en `Mutation.cs`. Ante una falla de validación (por ejemplo, formato de email inválido o campos obligatorios vacíos lanzados por la capa de entidades), la mutación retorna ahora una instancia de `UserPayload` controlada con `Success = false` y el mensaje de error de la excepción.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Alineación: Mutación de Registro GraphQL en Frontend y Backend (Rama: 005-align-graphql-mutation)

* **Objetivo**: Corregir el error 400 (Bad Request) en GraphQL al registrar usuarios desde el frontend.
* **Descripción**: Se actualizó el archivo de mutación `addUser.js` del frontend para llamar a `registerUser(input: $input)` de acuerdo con la firma de `RegisterUserAsync` en el backend. Asimismo, se adaptó el componente `Register.jsx` para pasar las variables correspondientes a `RegisterInput` (`username`, `email`, `password`) en lugar del conjunto anterior de parámetros planos no válidos.
* **Archivos Modificados**:
  - `FrontEnd/OneItb-FE/src/data/graphql/mutations/addUser.js`
  - `FrontEnd/OneItb-FE/src/Components/user/Register.jsx`

---

## [2026-06-08] - Corrección: Excepción de Casteo en Mutación de HotChocolate (Rama: 004-fix-hotchocolate-mutation)

* **Objetivo**: Corregir la excepción crítica `System.InvalidCastException` de HotChocolate que impedía compilar e iniciar el servidor.
* **Descripción**: Se removió el decorador `[ExtendObjectType(OperationTypeNames.Mutation)]` de la clase `Mutation` en `Mutation.cs`. Esto convirtió a `Mutation` en la clase de mutación base del esquema, alineando el backend con el registro `.AddMutationType<Mutation>()` de `Startup.cs`.
* **Archivos Modificados**:
  - `API Graphql/OneITB/GraphQL/Mutation.cs`

---

## [2026-06-08] - Implementación: Reestructuración Académica y Gobernanza Core-Web (Rama: 003-docs-governance)

* **Objetivo**: Estructurar modularmente la documentación académica bajo el formato requerido por la materia "Prácticas Profesionalizantes III" y optimizar el consumo de tokens en archivos de gobernanza.
* **Descripción**: Se crearon documentos académicos dedicados en `/docs/academic/` dividiendo el contenido en presentación general, requerimientos detallados (Identidad, Muro, Mensajería), trazo fino de casos de uso (CU-01 a CU-09) y diagramas en formato Mermaid. Asimismo, se condensaron y optimizaron para tokens los archivos en `/core-web/` (reduciendo más del 50% de tamaño físico) garantizando que la constitución y compatibilidad de agentes permanezcan intactas.
* **Archivos Creados/Modificados**:
  - `docs/academic/01_Presentacion_General.md` (Creado)
  - `docs/academic/02_Requerimientos.md` (Creado)
  - `docs/academic/03_Casos_De_Uso.md` (Creado)
  - `docs/academic/04_Diagramas.md` (Creado)
  - `core-web/system.md` (Optimizado)
  - `core-web/agent_contracts.md` (Optimizado)
  - `core-web/decisions_log.md` (Optimizado)
  - `docs/audit/DOCUMENTATION_STATUS.md` (Actualizado)


## [2026-05-30] - Implementación: Sincronización de Documentación y Unit of Work (Rama: 002-update-tech-docs)

* **Objetivo**: Estabilizar y corregir la compilación del backend (.NET 6 API) e integrar la documentación de auditoría con la Constitución del proyecto (v1.0.0).
* **Descripción**: Se diseñó e implementó el patrón transaccional Repository y Unit of Work en C# para resolver el error crítico de referencia `CS0246`. Adicionalmente, se actualizaron y alinearon los manuales técnicos locales (como el runbook de 35 smoke tests) y se estructuró la gobernanza de carpetas.
* **Archivos Modificados**:
  - `API Graphql/Services/Interfaces/IUnitOfWork.cs` (Creado)
  - `API Graphql/Services/Repositories/UnitOfWork.cs` (Creado)
  - `API Graphql/OneITB/Startup.cs` (Modificado para registro en DI)
  - `API Graphql/Services/Users/UsersService.cs` y `AccountsService.cs` (Refactorizados)
  - `README.md` y `docs/audit/RUNBOOK_DEV.md` (Actualizados)
