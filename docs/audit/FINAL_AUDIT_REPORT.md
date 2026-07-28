# Reporte final de auditoría técnica y seguridad - OneITB23

**Fecha de corte**: 2026-07-28
**Alcance**: .NET 8, EF Core 8, HotChocolate 14, React 18, Apollo Client 3, SQL Server Docker
**Estado del roadmap**: 99% (115 de 116 items)
**Corte de código base**: `25cdb9f`; aceptación final ejecutada en `codex/194-final-operational-acceptance`
**Decisión técnica**: cierre de remediaciones 186-193 aprobado y Code Freeze operativo local alcanzado. Los proveedores reales y el SSO institucional permanecen como gates externos explícitos.

---

## 1. Tareas Pendientes (Post-Code Freeze / Producción)

Si bien la auditoría local puede darse por cerrada a nivel de código (Code Freeze operativo local alcanzado), quedan explícitamente registradas las siguientes tareas pendientes. Estas se encuentran bloqueadas por entorno, dependencias de secretos reales o validaciones institucionales, y son requisitos previos para el paso a producción pública:

1. **Smokes con Proveedores Reales `[B]`**: Validar SMTP, Redis administrado y Cloudinary en un ambiente seguro que cuente con secretos reales no versionados. La Spec 195 valida los adaptadores Redis/SMTP contra infraestructura Docker local, no contra proveedores públicos.
2. **Aprobación y Configuración de Google SSO**: Completar la aprobación institucional y configurar las credenciales y callbacks necesarios para habilitar el inicio de sesión.
3. **Validación Operativa de Criptografía `[I]`**: Medir el costo y rendimiento de `BCrypt` (Work Factor) sobre el hardware productivo objetivo antes del despliegue público (referencia A-2).
4. **Validaciones manuales o de red pendientes**:
   - **Rol Moderador**: La identidad, JWT, permisos y auditoría están automatizados; resta el recorrido visual manual previo a la defensa.
   - **Prueba Realtime**: Redis cross-provider y aislamiento de topic están verificados; resta el handshake WebSocket de red con dos navegadores aislados.
5. **Observabilidad en Producción**: Configurar las políticas de monitoreo para que el `UploadCleanupHostedService` eleve a nivel de error/alerta los fallos persistentes de I/O, que localmente se registran como warnings.
6. **Defensa en Profundidad Adicional**: Incorporar una solución de escaneo de antivirus/CDR externo para la subida de archivos, característica que quedó fuera del MVP pero es recomendada (referencia C-1).

---

## 2. Resumen Ejecutivo y Riesgos Residuales

### Matriz consolidada de cierre (Specs 186-193)

La matriz siguiente distingue la corrección implementada de su nivel de verificación.
Ningún hallazgo crítico o alto permanece en su condición vulnerable original. El único
estado `[I]` de seguridad conserva una medición operativa explícita y no se presenta como
validación de hardware productivo.

| Caso | Severidad | Resolución aplicada | Estado y evidencia | Gate residual |
|---|---|---|---|---|
| **Spec 186 - token mock/duplicidad de emisores JWT** | Crítico | Se eliminó `token_placeholder`; `JwtTokenService` centralizó firma HS256, claims, issuer, audience y expiración. Magic Link pasó a credencial criptográfica de un uso con consumo atómico. | **Verificado `[V]`**: 82/82 tests, build Release, EF sin drift y smoke SQL Docker con JWT válido, replay rechazado y concurrencia 1 éxito/1 rechazo. | La entrega fuera de banda fue endurecida posteriormente por Spec 192. |
| **Spec 187 - cancelación incompleta en mutaciones** | Alto | Todas las mutaciones asíncronas reciben `CancellationToken` y lo propagan por servicios, UnitOfWork, repositorios, EF Core y efectos compatibles; `OperationCanceledException` no se convierte en error de negocio. | **Verificado `[V]`**: guard por reflexión, prueba pre-cancelada sin escritura, 82/82 tests y schema runtime sin argumentos de infraestructura expuestos. | Sin gate funcional pendiente. |
| **Spec 188 - session bleed en Apollo/React/WebSocket** | Alto | Logout, expiración, cambio de identidad y cierre entre pestañas convergen en una terminación idempotente: borra identidad, limpia Apollo, termina WebSocket e invalida respuestas tardías mediante epoch. | **Verificado `[V]`**: 79 tests frontend, build Vite, navegador limpio y recorrido real Estudiante -> logout -> Administrador sin datos cruzados. | Sin gate local pendiente. |
| **Spec 189 - autorización mutacional incompleta** | Crítico | Se aplicó `[Authorize]` declarativo a toda mutación protegida, con roles canónicos; ownership, autoría e inscripción permanecen como controles contextuales en servicios. | **Verificado `[V]`**: matriz de 42 mutaciones, solo 4 públicas, tests de no-escritura y smokes anónimo/rol incorrecto. | Sin gate funcional pendiente. |
| **C-1 - upload validado solo por extensión/MIME** | Crítico | `FileContentInspector` valida firmas y estructura antes de cualquier storage y rechaza contenido incompatible con código estable sin filtrar detalles. | **Verificado por Specs 190/194 `[V]`**: PDF válido aceptado; ejecutable renombrado y PDF truncado rechazados sin fixture retenido. | Antivirus/CDR externo queda fuera del MVP. |
| **C-2 - Magic Link sin limitación específica** | Crítico | Se agregaron límites independientes por IP e identidad/credencial, fingerprints HMAC, memoria acotada en local y operación atómica Redis en producción. | **Verificado por Specs 190/194 `[V]`**: umbrales de solicitud/redención, recuperación, digest y single-use observados; tests deterministas cubren concurrencia/fail-closed. | El gate Redis distribuido requiere configuración externa. |
| **C-3 - I/O síncrono en carga del feed** | Crítico | La consulta de visibilidad usa `AnyAsync` cancelable y el builder del feed no ejecuta I/O terminal síncrono. | **Verificado por Specs 191/194 `[V]`**: suite de cancelación y recorrido runtime paginado sin regresión. | Sin gate local pendiente. |
| **A-3 - contrato social sin límite** | Alto | Se retiró el campo `inquiries` ilimitado; `inquiriesPage` quedó como contrato único, con máximo 25, cursor opaco, orden estable y filtro de autor previo al conteo. | **Verificado por Specs 191/194 `[V]`**: schema, límite, orden, deduplicación, next page y filtro de autor ejecutados. | Sin gate local pendiente. |
| **A-4 - estudiantes académicos sin paginación** | Alto | `AcademicStudentPage` limita a 50, proyecta el selector necesario, preserva autorización y aplica orden determinista. | **Verificado por Specs 191/194 `[V]`**: límite, orden, next page y denegación ejecutados; hub recorrido con Estudiante/Profesor. | Sin gate local pendiente. |
| **A-1 - credencial Magic Link expuesta por GraphQL** | Alto | La mutación devuelve confirmación genérica; la credencial viaja fuera de banda, SQL guarda SHA-256 y React elimina el fragmento URL antes del consumo. | **Verificado localmente por Specs 192/194 `[V]`**: respuesta genérica, pickup, digest, consumo y replay ejecutados. | SMTP real requiere secretos no versionados. |
| **A-2 - BCrypt sin política explícita** | Alto | `IPasswordHasher` centraliza costo 12 configurable, eleva hashes débiles tras login y nunca degrada hashes más fuertes. | **Mitigado por Spec 192 `[I]`**: registro, administración, empleadores y seeder cubiertos; tests de rehash/no-downgrade PASS. | Medición operativa del costo por hardware antes del despliegue público. |
| **M3-M1 - bypass de silenciamiento en reacciones** | Medio | `ToggleReactionAsync` ejecuta el guard de `MutedUntil` antes de leer o mutar; el rechazo no altera reacciones ni emite notificación y retorna `USER_ERROR`. | **Verificado por Specs 193/194 `[V]`**: like/unlike autenticados rechazados con cero delta de reacción/notificación. | Sin gate local pendiente. |
| **M4-M1 - error boundary por debajo de providers** | Medio | `GlobalErrorBoundary` envuelve Apollo, Theme y App; el bootstrap asíncrono agrega fallback React/DOM incluso antes de `createRoot`. | **Verificado por Specs 193/194 `[V]`**: 79 tests frontend y recorridos de navegador sin errores/warnings propios. | Sin gate local pendiente. |

> **Nota Módulo 3**: La auditoría de lógica de negocio y moderación no arrojó hallazgos Críticos ni Altos. El hallazgo **MEDIO** M3-M1 fue mitigado por Spec 193; el detalle y su estado posterior se conservan en la sección §2.

> **Nota Módulo 4**: La auditoría de arquitectura frontend y React no arrojó hallazgos Críticos ni Altos. El hallazgo **MEDIO** M4-M1 fue mitigado por Spec 193; el detalle y su estado posterior se conservan en la sección §2.

### Medio

1. **M4-M1 — verificado `[V]`**: `GlobalErrorBoundary` cubre fábrica, providers,
   árbol React y pre-mount; los recorridos de navegador no produjeron errores propios.
2. **M3-M1 — verificado `[V]`**: el silenciamiento rechazó like/unlike sin modificar
   reacciones ni notificaciones.
3. **Entrega Magic Link local — verificada `[V]`**: respuesta genérica, pickup, digest,
   consumo único y replay se observaron. SMTP real permanece bloqueado por secretos
   externos y no invalida el fallback de Development.
4. **React Router — riesgo moderado aceptado**: 6.30.4 conserva dos avisos upstream,
   sin hallazgos altos/críticos. La aplicación no usa SSR y sanitiza las rutas internas
   provenientes de notificaciones. La actualización 7.x evaluada introducía hallazgos
   altos y fue descartada durante Code Freeze.

### Bajo/operativo

1. `UploadCleanupHostedService` registra fallos de limpieza como warning; en producción se recomienda elevar errores persistentes de I/O a error/alerta.
2. Redis y Cloudinary tienen fallback local. SMTP es obligatorio en Production y usa pickup local solo en Development; los tres requieren smoke con secretos reales en el ambiente de destino.
3. Google SSO continúa bloqueado por credenciales, callbacks y aprobación institucional.

### Recomendación de cierre

Se recomienda declarar **Code Freeze operativo local**, condicionado externamente:

1. No incorporar nuevas features.
2. Ejecutar `scripts/validate-predefense.ps1` y el gate finito
   `scripts/validate-local-infrastructure.ps1` antes de cada entrega relevante.
3. Validar SMTP, Redis y Cloudinary solo en un ambiente seguro con secretos no versionados.
4. Corregir únicamente defectos reproducibles y acompañarlos con prueba de regresión.
5. Mantener como criterio de salida: suites, builds, EF drift y regresión de sesión en verde.

Con estas condiciones, OneITB23 se encuentra estable para la defensa académica
controlada. El paso a producción pública requiere completar smokes con proveedores
reales, medir BCrypt sobre el hardware objetivo y aprobar SSO institucional, sin
modificar la lógica funcional ya congelada.

### Spec 194 - Aceptación operacional final

La aceptación ejecutó 147 pruebas backend y 79 frontend, builds Release/Vite, control de
drift EF, contratos paginados, upload hostil, política de silenciamiento y entrega local
Magic Link. En navegador se recorrieron Estudiante, Profesor, Egresado, Administrador y
Empleador; además se comprobó `A -> logout -> B` sin identidad, mensajes ni
notificaciones de la sesión anterior. El panel administrativo, el hub académico, chat,
perfil y Gestor de Postulaciones cargaron sin errores o warnings propios en consola.

La Spec 195 resolvió el bloqueo local de identidad Moderador y verificó Redis entre dos
proveedores independientes, SMTP contra Mailpit y la transición de sesión
Estudiante -> Moderador. Permanecen bloqueados por ambiente/configuración los proveedores
públicos SMTP/Redis/Cloudinary y el handshake WebSocket de red con dos navegadores. Estos
límites no alteran el cierre local y no se presentan como verificaciones realizadas.

### Spec 195 - Infraestructura local y aceptación Moderador

La aceptación incorporó una identidad Moderador estable sin reset de passwords, JWT con
rol canónico, operaciones hide/restore auditadas y denegaciones declarativas para
operaciones exclusivas de Administrador. Redis 7.4.2 entregó exactamente un evento entre
dos providers HotChocolate independientes y no lo filtró a un topic ajeno. Mailpit 1.29.7
capturó tres correos del adaptador SMTP, cuyos destinatarios, asuntos y contenidos fueron
inspeccionados sin encontrar secretos. El runner no inicia servidores web, conserva la
huella del contenedor SQL y elimina servicios, mensajes y puertos de aceptación.

---

## 3. Hallazgos de Auditoría Modular (Ordenados del más reciente al más antiguo)

Las descripciones de esta sección preservan la condición observada en el momento de cada auditoría. El campo **Estado posterior/actualizado** y la matriz de la sección 1 representan la situación vigente del código.

### Módulo 4 — Arquitectura Frontend y React (NUEVO — 2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Lead Frontend Architect / Especialista en Seguridad React (automatizado)
**Alcance**: `FrontEnd/OneItb-FE/src/` — Apollo Client, flujos de Autenticación/Logout, renderizado de contenido rico, Error Boundaries.

---

#### MEDIO-1: `GlobalErrorBoundary` ubicado dentro de los proveedores raíz (cobertura parcial)

| Campo | Detalle |
|---|---|
| **Archivo** | [`main.jsx`](file:///F:/React/OneITB23/FrontEnd/OneItb-FE/src/main.jsx#L15-L23) |
| **Líneas** | 15–23 |
| **Categoría** | Resiliencia de UI / Error Boundary |

**Descripción**: El `GlobalErrorBoundary` envuelve correctamente `<App/>`, pero en el árbol de renderizado se encuentra *dentro* de `<ApolloProvider>` y `<ThemeProvider>`:

```jsx
// main.jsx — orden actual
<ApolloProvider client={new GraphQLProvider().apolloInstance}>
  <ThemeProvider>
    <GlobalErrorBoundary>   {/* ← boundary aquí */}
      <App />
    </GlobalErrorBoundary>
  </ThemeProvider>
</ApolloProvider>
```

Esto significa que un error de renderizado que se origine en `ApolloProvider` o en `ThemeProvider` no será capturado por el boundary, y propagará hasta el root de React, produciendo una pantalla en blanco sin mensaje de error al usuario.

**Impacto**: Bajo en condiciones normales (esos proveedores rara vez lanzan excepciones de render), pero representa una brecha en la cobertura de la red de seguridad de UI. En producción, un fallo de configuración del cliente Apollo (por ejemplo, un `cache` inválido) dejaría la aplicación irrecuperable sin feedback.

**Remediación**: Mover `GlobalErrorBoundary` para que envuelva a todos los proveedores, o agregar un segundo boundary mínimo en el nivel raíz:

```jsx
// Opción recomendada: boundary como primer hijo de createRoot
<GlobalErrorBoundary>
  <ApolloProvider client={...}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ApolloProvider>
</GlobalErrorBoundary>
```

**Estado posterior (Specs 193/194)**: **VERIFICADO `[V]`**. `main.jsx` usa un bootstrap asincrónico que carga el árbol de aplicación dentro de `try/catch`; `GlobalErrorBoundary` queda por fuera de `AppProviders`, la fábrica Apollo se evalúa perezosamente una sola vez por montaje y un fallback DOM cubre incluso el fallo de `createRoot`. Las pruebas inyectan fallos en fábrica, Apollo, Theme, hijo y pre-mount; los recorridos de navegador finalizaron sin errores propios.

---

#### Aspectos verificados como SEGUROS

| Aspecto | Veredicto | Evidencia |
|---|---|---|
| **Fuga de caché Apollo en Logout (Cross-Account Data Leak)** | ✅ Seguro | `GraphqlProvider.js` línea 54: `clearActiveApolloStore` invoca `activeApolloClient.clearStore()`. Esta función es llamada en `invalidateSessionTransport()` (línea 317), que a su vez es invocada tanto en `terminateLocalSession` (`AuthContext.jsx` línea 58) como en el handler de terminación de sesión fallback (línea 343). La caché Apollo se limpia **antes** de que el nuevo usuario pueda autenticarse, ya que `login()` (línea 91) llama a `waitForSessionTermination()` y luego a `invalidateSessionTransport()`. El WebSocket también se termina (`graphQLWsClient.terminate()`, línea 314) y el `sessionEpoch` se incrementa, descartando respuestas tardías en vuelo. |
| **XSS vía `dangerouslySetInnerHTML`** | ✅ Seguro | Búsqueda exhaustiva en todo `src/`: **cero usos** de `dangerouslySetInnerHTML`. El contenido de publicaciones se renderiza como texto plano en JSX (`{post.content}`, `Feed.jsx` línea 1045); los comentarios usan `<MentionText>` que genera nodos `<Link>` y `<React.Fragment>` — nunca HTML crudo. No existe ningún renderer de Markdown ni de HTML en el árbol de componentes. |
| **Ausencia de DOMPurify (no requerida)** | ✅ Seguro | No se instaló `dompurify` ni ninguna biblioteca de sanitización de HTML (`package.json`). Esto es correcto porque la aplicación **no renderiza HTML de usuario**. El único `escapeHtml` encontrado está en `CertificateExport.jsx` (línea 15), que opera sobre datos propios del usuario en un contexto de exportación PDF controlado. |
| **GlobalErrorBoundary y bootstrap** | ✅ Seguro `[I]` | La frontera envuelve Apollo, Theme y App; el arranque dinámico captura fallos previos al montaje. El fallback no depende de providers, genera un ID robusto y el diagnóstico excluye mensajes, tokens, cache y datos personales. Once pruebas focalizadas cubren fábrica, providers, hijo, `createRoot`, correlación y singleton por montaje. |
| **Logout: limpieza de credenciales en localStorage** | ✅ Seguro | `terminateLocalSession` (`AuthContext.jsx` líneas 47–66) elimina `token` y `user` de `localStorage` **antes** de limpiar Apollo. El handler de storage cross-tab (líneas 72–84) detecta el logout remoto y propaga la terminación de sesión al tab sibling. |
| **Protección contra payloads tardíos (session epoch)** | ✅ Seguro | `sessionBoundaryLink` (`GraphqlProvider.js` líneas 102–122) captura el `sessionEpoch` al inicio de cada operación y descarta silenciosamente cualquier respuesta que llegue tras un cambio de epoch (logout/login). Previene que datos de una sesión anterior contaminen la UI de la sesión siguiente. |

---

### Módulo 3 — Lógica de Negocio y Moderación (2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Auditor de QA / Especialista en Lógica de Negocio (automatizado)
**Alcance**: `SocialService.cs`, `ModerationService.cs`, `AcademicService.cs`, `MockSiuIntegrationService.cs`, `OneItbContext.cs` (query filters)

---

#### MEDIO-1: Bypass de mute en `ToggleReactionAsync` (reacciones a publicaciones)

| Campo | Detalle |
|---|---|
| **Archivo** | [`SocialService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Social/SocialService.cs#L709-L772) |
| **Líneas** | 709–772 |
| **Categoría** | Bypass de moderación |

**Descripción**: El método `ToggleReactionAsync` verifica que el usuario exista y esté activo (líneas 722–725) pero **no invoca** `EnsureUserCanCreateContentAsync`, que es el guard centralizado que rechaza usuarios con `MutedUntil > DateTime.UtcNow`.

Las otras tres mutaciones de creación de contenido sí invocan esta validación:
- `AddInquiryAsync` (línea 219): `await EnsureUserCanCreateContentAsync(userId, "publicar", ...)`
- `AddCommentAsync` (línea 596): `await EnsureUserCanCreateContentAsync(userId, "comentar", ...)`
- `ToggleCommentReactionAsync` (línea 779): `await EnsureUserCanCreateContentAsync(userId, "reaccionar", ...)`

**Impacto**: Un usuario silenciado puede continuar generando reacciones (likes) en publicaciones durante el período de sanción. Esto no le permite crear contenido visible (publicaciones/comentarios), pero sí participar activamente en métricas de engagement que podrían ser visibles para el autor de la publicación.

**Remediación**: Agregar `await EnsureUserCanCreateContentAsync(userId, "reaccionar", cancellationToken);` al inicio de `ToggleReactionAsync`, inmediatamente antes de la verificación de existencia de la publicación (línea 714).

**Estado posterior (Specs 193/194)**: **VERIFICADO `[V]`**. El guard se ejecuta antes de toda lectura/escritura de reacción; tests y aceptación autenticada prueban que el like denegado no inserta, el unlike denegado no elimina, no se invoca notificación y la cancelación no deja efectos. `Mutation.ToggleReaction` transforma el rechazo en `USER_ERROR`.

---

#### Aspectos verificados como SEGUROS

| Aspecto | Veredicto | Evidencia |
|---|---|---|
| **Soft-delete en Inquiries** | ✅ Seguro | `OneItbContext.cs` línea 641: `entity.HasQueryFilter(e => e.IsActive && !e.IsHiddenByModerator)` — EF Core aplica el filtro global automáticamente a **todas** las consultas sobre `Inquiries` que no llamen `.IgnoreQueryFilters()`. Las consultas del feed (`GetInquiries`) operan sin `.IgnoreQueryFilters()`, por lo que los registros inactivos o moderados son invisibles de forma declarativa. Solo los métodos de edición propios (`EditInquiryAsync`, `ToggleInquiryStatusAsync`) y los métodos de moderación administrativa usan `.IgnoreQueryFilters()`, lo cual es correcto por diseño. |
| **Soft-delete en Comments** | ✅ Seguro | `OneItbContext.cs` línea 674: `entity.HasQueryFilter(e => e.IsActive && !e.IsHiddenByModerator)`. Mismo patrón que Inquiries. Los `Include(inquiry => inquiry.Comments)` en el feed heredan el filtro global automáticamente. |
| **Cascada de filtros en Reactions** | ✅ Seguro | `OneItbContext.cs` línea 714: `entity.HasQueryFilter(e => e.Inquiry.IsActive && !e.Inquiry.IsHiddenByModerator)` — las reacciones de publicaciones moderadas quedan excluidas automáticamente. |
| **Cascada de filtros en CommentReactions** | ✅ Seguro | `OneItbContext.cs` líneas 739–743: filtro compuesto que verifica `Comment.IsActive`, `!Comment.IsHiddenByModerator`, `Comment.Inquiry.IsActive` y `!Comment.Inquiry.IsHiddenByModerator`. Cobertura completa de la cadena de moderación. |
| **Mute enforcement social** | ✅ Seguro `[V]` | `EnsureUserCanCreateContentAsync` consulta `MutedUntil` y rechaza una sanción activa. Se aplica a publicaciones, comentarios, reacciones de comentarios y reacciones de publicaciones; pruebas y aceptación autenticada cubren insert, delete, notificación, cancelación y separación respecto del `Mute` personal. |
| **Moderación administrativa** | ✅ Seguro | `ModerationService.cs`: `EnsureModeratorAsync` valida rol "Administrador" o "Moderador" antes de permitir hide/restore. Todas las operaciones de moderación generan `ModerationAudit` con `ActorUserId`, `Action`, `Summary` y timestamp. |
| **SIU Mock: validación de notas** | ✅ Seguro | `AcademicService.cs` líneas 670–680: `ValidateScore` aplica `Math.Round(score, 2)` y rechaza con `ArgumentException` si `score < 0 || score > 10`. La sincronización SIU (`SyncSiuGradesAsync`, línea 372–381) envuelve cada registro en try/catch y registra el skip sin abortar el batch. Un mock que devolviera un 15 sería rechazado y registrado en `skippedItems`. |
| **SIU Mock: datos hardcodeados** | ✅ Seguro | `MockSiuIntegrationService.cs`: devuelve 3 registros fijos con notas 8.75, 7.50 y 6.00 — todos dentro del rango válido [0, 10]. El registro con email inexistente es correctamente descartado por `SyncSiuGradesAsync` ("sin cuenta local"). |
| **Exclusión de usuarios silenciados del feed** | ✅ Seguro | `GetInquiries` (líneas 149–153) excluye publicaciones de usuarios muteados o bloqueados **por el observador** vía `UserInteractions` (tipo `Mute`/`Block`). Esto es aislamiento social entre usuarios, distinto del mute administrativo (`MutedUntil`), y ambos mecanismos están correctamente implementados. |

---

### Módulo 2 — Rendimiento y Persistencia (2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Arquitecto de Software Senior / DB Performance Specialist (automatizado)
**Alcance**: `Query.cs`, `Mutation.cs`, `SocialService.cs`, `JobService.cs`, `AcademicService.cs`, `NotificationService.cs`, `GraphQLMetricsDataLoaders.cs`

---

#### CRÍTICO-3: Llamada síncrona bloqueante al hilo en `GetInquiries` (Thread-Pool Starvation)

| Campo | Detalle |
|---|---|
| **Archivo** | [`SocialService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Social/SocialService.cs#L136-L138) |
| **Líneas** | 136–138 |
| **Categoría** | Bloqueo de hilo / Concurrencia |

**Descripción**: El método `GetInquiries` retorna un `IQueryable<Inquiry>` (no es async), por lo que no puede hacer `await`. Sin embargo, en la línea 136 ejecuta `_context.Users.Any(...)` de forma **síncrona** — una llamada de red a SQL Server que bloquea el hilo del Thread Pool de ASP.NET Core mientras espera la respuesta de la base de datos.

```csharp
// SocialService.cs línea 136 — BLOQUEANTE
bool hasGlobalCareerVisibility = _context.Users.Any(user =>
    user.Id == observerId &&
    (user.Role == "Administrador" || user.Role == "Moderador"));
```

**Impacto**: Bajo carga concurrente (múltiples usuarios cargando el feed simultáneamente), los hilos del Thread Pool quedan bloqueados esperando I/O de red. ASP.NET Core no puede usar esos hilos para otras solicitudes. Puede provocar inanición del Thread Pool (thread starvation), degradando el throughput general del servidor y aumentando la latencia de todas las rutas de la aplicación.

**Remediación**: Refactorizar `GetInquiries` para ser `async Task<IQueryable<...>>` o materializar la subquery de roles como un parámetro booleano resuelto previamente por el resolver `Query.cs` (que sí puede usar `await`):
```csharp
// En Query.cs resolver (que ya es async):
bool hasGlobalVisibility = await context.Users.AnyAsync(u => u.Id == userId && (u.Role == "Administrador" || u.Role == "Moderador"), ct);
// Pasar hasGlobalVisibility como parámetro a GetInquiries(...)
```

**Estado posterior (Specs 191/194)**: **VERIFICADO `[V]`**. La visibilidad global se resuelve con `AnyAsync` y `CancellationToken`; el builder social quedó libre de I/O terminal. Tests de cancelación, schema y recorrido autenticado paginado pasan.

---

#### ALTO-3: `GetInquiries` retorna `IQueryable` sin paginación declarativa — feed potencialmente ilimitado

| Campo | Detalle |
|---|---|
| **Archivo** | [`Query.cs`](file:///F:/React/OneITB23/API%20Graphql/OneITB/GraphQL/Query.cs#L98-L110) |
| **Líneas** | 98–110 |
| **Categoría** | Paginación ineficiente |

**Descripción**: El resolver `GetInquiries` expone un `IQueryable<Inquiry>` con `[UseProjection]` pero **sin** `[UsePaging]` ni ninguna cláusula `Take(n)` aplicada al `IQueryable` devuelto. El resolver gemelo `GetInquiriesPage` (líneas 130–162) sí implementa paginación manual con cursor. Sin embargo, `GetInquiries` permanece como endpoint alternativo sin límite de resultados.

```csharp
// Query.cs línea 98 — SIN paginación
[UseProjection]
public IQueryable<Inquiry> GetInquiries(...) // devuelve todos los registros que pasen el filtro
```

**Impacto**: Un cliente puede ejecutar `getInquiries` sin filtros y forzar al servidor a materializar toda la tabla `Inquiries` (que crecerá indefinidamente). Las Inquiries tienen múltiples `Include` (`Comments`, `Reactions`, `Attachments`, etc.) vía `SocialService.GetInquiries`, lo que amplifica el volumen de datos transferidos de la BD.

**Remediación**: Agregar `[UsePaging(MaxPageSize = 25)]` al resolver `GetInquiries` o eliminarlo del schema y consolidar el uso en `GetInquiriesPage`.

**Estado posterior (Specs 191/194)**: **VERIFICADO `[V]`**. Se eliminó el campo ilimitado y `inquiriesPage` quedó como único contrato, con máximo 25, cursor opaco, orden estable, filtro de autor previo al conteo y consumidores Apollo migrados; límite, deduplicación, next page y filtro fueron ejecutados.

---

#### ALTO-4: `GetAcademicStudents` sin paginación en entidad de crecimiento lineal

| Campo | Detalle |
|---|---|
| **Archivo** | [`Query.cs`](file:///F:/React/OneITB23/API%20Graphql/OneITB/GraphQL/Query.cs#L560-L577) / [`AcademicService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Academic/AcademicService.cs#L197-L217) |
| **Líneas** | Query: 560–577 / Service: 207–216 |
| **Categoría** | Paginación ineficiente |

**Descripción**: `GetAcademicStudents` devuelve `IReadOnlyList<User>` con todos los estudiantes de una carrera sin límite. En instituciones con cientos de alumnos por carrera, esta consulta materializará y transmitirá la totalidad de los registros `User` (incluyendo todos sus campos) en una sola respuesta.

**Impacto**: Crecimiento de memoria proporcional al tamaño del plantel estudiantil. La entidad `User` incluye campos CV (experiencias, educación, proyectos, etc.) que no son necesarios en este listado académico.

**Remediación**: Introducir paginación (offset o cursor-based) y proyectar únicamente los campos necesarios (Id, FirstName, LastName, Email).

**Estado posterior (Specs 191/194)**: **VERIFICADO `[V]`**. `AcademicStudentPage` limita la página a 50, conserva autorización por actor/materia, ordena de forma determinista y alimenta un selector frontend con carga incremental; paginación, denegación y navegación académica fueron ejecutadas.

---

#### Aspectos verificados como SEGUROS

| Aspecto | Veredicto | Evidencia |
|---|---|---|
| **AsNoTracking en consultas de lectura** | ✅ Seguro | `GetInquiries`, `GetJobOffers`, `GetMe`, `GetPublicProfile`, `ResourceGraph()`, `ProgressGraph()`, `NotificationGraph()` — todas las rutas de solo lectura aplican `.AsNoTracking()`. Sin fugas de tracking en las rutas principales del feed. |
| **DataLoaders (anti-N+1)** | ✅ Seguro | `GraphQLMetricsDataLoaders.cs`: cinco DataLoaders (`UserPostCount`, `UserCommentCount`, `UserLikesReceived`, `UserReportsReceived`, `InquiryReportCount`) usando `BatchDataLoader<Guid, int>` con `IDbContextFactory` y `GroupBy` + `ToDictionaryAsync`. Patrón correcto para evitar N+1 en métricas de usuario. |
| **CancellationToken en SaveChangesAsync** | ✅ Seguro | Todos los `SaveChangesAsync` en `SocialService`, `JobService`, `AcademicService` y `NotificationService` reciben el `CancellationToken`. Sin bloqueos en escrituras. |
| **Paginación en Jobs** | ✅ Seguro | `GetJobOffers` y `GetMyJobOffers` usan `[UsePaging(MaxPageSize = 50)]` + `[UseFiltering]` + `[UseSorting]` (Query.cs líneas 580–603). Cursor-based pagination de HotChocolate correctamente aplicada. |
| **Paginación en Mensajería** | ✅ Seguro | `GetConversation`, `GetActiveConversations`, `GetMessagingContacts`, `SearchMyMessages` usan `[UsePaging(MaxPageSize = 50)]` (líneas 656–724). |
| **Paginación en Admin** | ✅ Seguro | `GetAuditLogs` aplica `Math.Clamp(first, 1, 200)` + `.Take(take)`. `GetNotificationsAsync` aplica `Math.Clamp(first, 1, 50)` + `.Take(take)`. Límites duros respetados. |
| **AsSplitQuery en grafos complejos** | ✅ Seguro | Consultas con múltiples `Include` anidados en `SocialService`, `JobService`, y `AcademicService` usan `.AsSplitQuery()`, evitando el producto cartesiano por joins múltiples. |
| **Manejo de concurrencia en notificaciones** | ✅ Seguro | `UpsertGroupedNotificationAsync` implementa retry loop (3 intentos) con captura de `DbUpdateConcurrencyException` y `DbUpdateException`, protegiéndose contra inserciones duplicadas concurrentes. |
| **SiuSyncGrades: batch insert** | ✅ Seguro | `SyncSiuGradesAsync` carga todas las cuentas, carreras elegibles y progresos existentes en memoria con consultas por lotes (`Contains(emails)`, `Contains(userIds)`) antes del bucle `foreach`, evitando N+1 en la sincronización masiva. |

---

### Módulo 1 — Seguridad & Auth (2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Red Team / Senior .NET Developer (automatizado)
**Alcance**: Auth services, JWT, UploadController, Mutation.cs (políticas de acceso)

#### CRÍTICO-1: Ausencia de validación por Magic Bytes en subida de archivos

**Estado actualizado (Specs 190/194)**: **VERIFICADO `[V]`**. `FileContentInspector` valida firmas y estructura antes de storage; pruebas y aceptación runtime confirman PDF válido, rechazo de ejecutable renombrado y PDF truncado, sin persistencia residual.

- **Archivo**: [`UploadController.cs`](file:///F:/React/OneITB23/API%20Graphql/OneITB/Controllers/UploadController.cs#L60-L66)
- **Líneas**: 60–66
- **Descripción**: La validación de archivos se basa exclusivamente en la **extensión del nombre de archivo** (línea 60) y en el **Content-Type HTTP** enviado por el cliente (línea 64–65). Ambos valores son controlados por el atacante y trivialmente falsificables.
- **No existe inspección de las firmas binarias (magic bytes)** del contenido real del archivo. Esto permite subir archivos políglotas (por ejemplo, un ejecutable renombrado a `.pdf` con `Content-Type: application/pdf`) que pasarían ambas validaciones.
- **Impacto**: Inyección de contenido malicioso en el almacenamiento. Un archivo `.html` disfrazado de imagen podría servirse a otros usuarios y ejecutar JavaScript en contexto de la aplicación (XSS almacenado). Un binario ejecutable disfrazado de documento podría usarse como vector de distribución de malware.
- **Remediación**: Leer los primeros N bytes del stream (`IFormFile.OpenReadStream()`) y compararlos contra las firmas binarias conocidas para cada tipo permitido antes de aceptar el archivo.

#### CRÍTICO-2: Mutaciones `RequestMagicLink` y `LoginWithMagicLink` expuestas sin rate limiting específico

**Estado actualizado (Specs 190/194)**: **VERIFICADO `[V]`**. Ambas operaciones aplican límites por origen e identidad/credencial antes del servicio, con fingerprints HMAC, provider en memoria/Redis y errores genéricos. Concurrencia/fail-closed están cubiertos por tests y umbral, expiración y recuperación cuentan con evidencia runtime previa que no fue reejecutada tras la restricción operativa.

- **Archivo**: [`Mutation.cs`](file:///F:/React/OneITB23/API%20Graphql/OneITB/GraphQL/Mutation.cs#L207-L222)
- **Líneas**: 207–222
- **Descripción**: Ambas mutaciones son **públicas** (sin `[Authorize]`), lo cual es correcto por diseño (pre-autenticación). Sin embargo, `RequestMagicLink` **crea usuarios automáticamente** si no existen (línea 49–71 de `EmployerAuthService.cs`), y `LoginWithMagicLink` permite intentos de fuerza bruta contra tokens activos.
- **Impacto**: Sin rate limiting dedicado, un atacante puede:
  1. Generar creación masiva de cuentas de empleador (DoS en la base de datos).
  2. Intentar fuerza bruta contra tokens de magic link de 64 caracteres hex (bajo riesgo práctico por entropía, pero el principio de defensa en profundidad exige limitación).
- **Nota de cierre**: El rate limiting global permanece como defensa adicional. El limiter específico anterior al servicio quedó cubierto por tests y evidencia runtime; el gate seguro de predefensa no vuelve a levantar servidores por defecto.

#### ALTO-1: Token de Magic Link devuelto en la respuesta GraphQL

- **Archivo**: [`EmployerAuthService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Auth/EmployerAuthService.cs#L95-L97)
- **Líneas**: 95–97
- **Descripción**: El método `RequestMagicLinkAsync` retorna el token directamente al cliente como valor de retorno de la mutación GraphQL. Este token es una **credencial de un solo uso** equivalente a una contraseña temporal.
- **Impacto**: Si los logs de GraphQL, APM o algún proxy intermedio registran payloads de respuesta, la credencial queda expuesta en texto plano. Además, cualquier actor con acceso a la respuesta HTTP (MITM sobre HTTP, extensiones de navegador, cache de proxy) obtiene la credencial.
- **Estado posterior (Specs 192/194)**: **VERIFICADO LOCALMENTE `[V]`**. `requestMagicLink` devuelve `MagicLinkRequestPayload`, el token se envía por pickup dentro de un fragmento, SQL guarda SHA-256 y React elimina el fragmento antes del consumo. Schema, tests y aceptación prueban ausencia de campos de credencial, digest y consumo único. SMTP real sigue bloqueado por configuración externa.

#### ALTO-2: BCrypt sin work factor explícito en flujos de producción

- **Archivos**:
  - [`UsersService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Users/UsersService.cs#L59) — línea 59
  - [`EmployerAuthService.cs`](file:///F:/React/OneITB23/API%20Graphql/Services/Auth/EmployerAuthService.cs#L54-L55) — línea 54
- **Descripción**: Las llamadas a `BCrypt.Net.BCrypt.HashPassword()` en registro de usuarios y creación de cuentas de empleador **no especifican explícitamente el work factor**. El valor por defecto de la biblioteca BCrypt.Net es 11, lo cual es aceptable hoy, pero:
  1. Una actualización de la biblioteca podría cambiar el default.
  2. No hay un estándar organizacional documentado ni centralizado.
- **Nota positiva**: El test data usa `workFactor: 4` solo en tests (apropiado para velocidad). El modelo `Account.cs` valida formato BCrypt (`$2*` y 60 chars) correctamente en la línea 43.
- **Impacto**: Riesgo de regresión silenciosa. Si el default baja, los hashes serían más débiles sin que nadie lo detecte.
- **Estado posterior (Spec 192)**: **MITIGADO `[I]`**. `IPasswordHasher` centraliza BCrypt con costo 12 configurable (rango 10-14), actualiza hashes de costo inferior tras login válido, preserva hashes más fuertes y cubre registro, validación administrativa, empleadores y seeder.

#### Aspectos verificados como SEGUROS

| Aspecto | Veredicto | Evidencia |
|---|---|---|
| **Emisión JWT** | ✅ Seguro | `JwtTokenService.cs`: firma HS256, clave ≥32 bytes validada, issuer/audience requeridos, lifetime acotado (1–1440 min), claims canónicos sin datos sensibles más allá de email/nombre/rol. No hay tokens mock ni hardcodeados. |
| **Validación JWT (opciones)** | ✅ Seguro | `JwtTokenOptions.cs`: falla cerrada si key <32 bytes o con baja diversidad, issuer vacío, audience vacío, o lifetime fuera de rango. La clave fue retirada de `appsettings` y debe llegar por secrets/environment. |
| **Consumo atómico de Magic Link** | ✅ Seguro | `EmployerAuthService.cs` líneas 137–168: `ExecuteUpdateAsync` con cláusula `WHERE !IsUsed AND ExpiresAt > utcNow` garantiza consumo atómico y previene replay. Fallback para providers no-relacionales también implementado. |
| **Token de Magic Link: entropía** | ✅ Seguro | 32 bytes de `RandomNumberGenerator` (256 bits de entropía). Expiración de 15 minutos. Inviable por fuerza bruta. |
| **Login: protección contra fuerza bruta** | ✅ Seguro | `AccountsService.cs`: lockout de 15 minutos tras 5 intentos fallidos. Contadores reseteados en login exitoso. Mensajes de error genéricos (`AUTH_INVALID_CREDENTIALS`). |
| **Autorización de mutaciones** | ✅ Seguro | 42 mutaciones verificadas: 4 públicas (register, login, requestMagicLink, loginWithMagicLink), todas las demás con `[Authorize]` o `[Authorize(Roles = ...)]` declarativo. Roles usan constantes canónicas en `GraphQlRoles`. No hay validación manual insegura de roles. |
| **Upload: autenticación** | ✅ Seguro | `UploadController.cs` línea 12: `[Authorize]` a nivel de clase. Límite de 15 MB por archivo, 16 MB por request. Nombre de archivo sanitizado. |
| **Upload: contenido real** | ✅ Mitigado `[I]` | Inspección binaria/estructural previa a storage para todos los formatos permitidos, con rechazo genérico y tests que prueban ausencia de escritura. |
| **Magic Link: abuso de operaciones públicas** | ✅ Mitigado `[I]` | Límites configurables por origen y fingerprint de identidad/credencial; memoria acotada en local y operación Lua atómica en Redis. |
| **Exposición de datos en JWT** | ✅ Seguro | Claims contienen: sub (userId), name, role, email. No hay datos financieros, CUIT, ni información sensible adicional. |

---

## 4. Cierre verificado de las Specs 186-189

### Auditoría de cierre (2026-07-23)

#### Resumen ejecutivo

La auditoría de cierre verificó las cuatro brechas críticas/altas que impedían declarar estable la frontera de autenticación, cancelación, sesión frontend y autorización GraphQL. La evaluación se respaldó con pruebas automatizadas, builds Release/Vite, revisión de modelo EF, schema GraphQL ejecutado y smokes contra SQL Server 2022 en Docker.

No se declara un despliegue cloud productivo ya validado. Permanecen fuera de este cierre las credenciales de proveedores externos, SSO institucional y la aprobación visual integral del panel administrativo. Esas condiciones están registradas en `ROADMAP.md` y no se contabilizan como verificadas.

#### Críticos resueltos

##### Emisión JWT y acceso de empleadores - RESUELTO

- Se eliminó el token mock y el `token_placeholder`.
- `JwtTokenService` centraliza firma HS256, issuer, audience, expiración y claims canónicos para cuentas y empleadores.
- La configuración falla de forma cerrada si la clave tiene menos de 32 bytes o faltan issuer/audience.
- La credencial Magic Link usa aleatoriedad criptográfica, expira en 15 minutos y se consume atómicamente.
- Runtime SQL Server: JWT aceptado, `me` autenticado como `Empleador`, replay rechazado y dos consumos simultáneos producen exactamente un éxito.

##### Autorización de mutaciones GraphQL - RESUELTO

- La matriz automatizada cubre los 42 campos de `Mutation`.
- Solo cuatro operaciones son públicas: registro, login, solicitud y consumo de Magic Link.
- Las operaciones por rol usan atributos declarativos con valores canónicos en español.
- Los controles contextuales de ownership, autor, inscripción y estado se conservaron dentro de servicios.
- Runtime: una mutación administrativa anónima y una postulación con rol incorrecto fueron rechazadas por middleware.

#### Altos resueltos

##### Propagación de `CancellationToken` - RESUELTO

- Todas las mutaciones asíncronas reciben el token de la solicitud.
- Servicios, UnitOfWork y repositorios alcanzados propagan el token hasta EF Core y efectos soportados.
- Un guard por reflexión impide regresiones futuras.
- Una prueba pre-cancelada demuestra ausencia de escritura.
- El schema runtime conserva el contrato externo: 42 mutaciones y cero argumentos de cancelación visibles.

##### Aislamiento de sesión Apollo/React/WebSocket - RESUELTO

- Logout manual, expiración, cierre remoto y cambio de identidad convergen en un coordinador idempotente.
- La identidad y credenciales se eliminan antes de limpiar Apollo.
- El WebSocket se termina y un epoch de sesión descarta respuestas tardías.
- Login espera cualquier limpieza pendiente antes de persistir al usuario siguiente.
- Las pruebas cubren purge de entidades privadas, concurrencia, A -> B y payloads tardíos.

#### Controles previamente verificados y sin regresión

- Proyecciones/DataLoaders y consultas agrupadas mitigan N+1 en grafos principales.
- Rate limiting, headers HTTP, healthcheck y límite de profundidad GraphQL permanecen activos.
- EF Core no presenta cambios de modelo pendientes.
- Los builds afectados terminan con cero warnings y cero errores.

#### Evidencia consolidada

| Gate | Resultado |
|---|---|
| Backend tests | PASS, 82/82 |
| Frontend tests | PASS, 23 archivos / 54 tests |
| Backend Release | PASS, 0 warnings / 0 errores |
| Frontend Vite | PASS, 374 módulos / 797 ms |
| EF model drift | PASS, sin cambios pendientes |
| GraphQL runtime | PASS, SQL Server Docker |
| Magic Link concurrente | PASS, 1 éxito / 1 replay rechazado |
| Browser smoke | PASS, `/employer-login` sin errores ni warnings |
| `npm audit` del corte | No reejecutado: el entorno rechazó transmitir metadata al registro npm; el último gate registrado fue 0 vulnerabilidades y no cambiaron dependencias |
