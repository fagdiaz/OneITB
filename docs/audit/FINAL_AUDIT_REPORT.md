# Reporte final de auditoría técnica y seguridad - OneITB23

| Dato de control | Valor |
|---|---|
| **Fecha de corte documental** | 2026-08-05 |
| **Stack auditado** | .NET 8, EF Core 8, HotChocolate 14, React 18, Apollo Client 3, SQL Server 2022 en Docker |
| **Estado funcional del roadmap** | 100%: 117/117 ítems, compuesto por 109 ítems funcionales/operativos y 8 remediaciones de auditoría |
| **Distribución de evidencia** | 46 ítems verificados `[V]` y 71 implementados `[I]` |
| **Corte técnico documentado** | Specs 186-218; Spec 218 ejecutó preflight conjunto sobre worktree, pero el gate integral debe repetirse o vincularse al SHA candidato de defensa |
| **Clasificación recomendada** | **Release Candidate académico, core Feature Complete y Code Freeze operativo local** |
| **Producción pública** | No certificada: conserva gates externos, operativos y de seguridad en profundidad |

Este informe es la fuente canónica para hallazgos técnicos, controles aplicados, riesgos
residuales y evidencia de aceptación. El porcentaje funcional se calcula exclusivamente
en `docs/project_docs/ROADMAP.md`; no se incrementa por agregar specs de aceptación,
documentación o hardening sobre una capacidad ya contabilizada.

---

## 1. Dictamen ejecutivo

### 1.1 Conclusión de la auditoría

La auditoría no mantiene hallazgos **Críticos** o **Altos** en su condición vulnerable
original dentro del código evaluado. Las Specs 186-193 corrigieron las brechas de JWT,
cancelación, aislamiento de sesión, autorización declarativa, validación de uploads,
abuso de Magic Link, paginación, I/O síncrono, política criptográfica, moderación y
resiliencia del bootstrap frontend. Las Specs 194-203 ampliaron la aceptación local,
reconstruyeron la base demo, incorporaron Microsoft Entra, formalizaron el onboarding
B2B y endurecieron el flujo de autenticación redirect. La Spec 202 acotó `AADSTS50011`
a la App Registration, validó el callback local exacto y prohibió HTTP fuera de loopback
sin debilitar CORS/CSP. La Spec 203 corrigió la limpieza prematura de MSAL y la carrera
entre canje, commit de sesión y guard privado. La Spec 201 cerró el registro
público privilegiado, el alcance académico cross-career y la excepción de privacidad por
Follow; además retiró el trust bypass SQL de la plantilla y agregó readiness de base.
Las Specs 204-211 cerraron cardinalidad académica, hidratación de perfil, navegación
adaptativa, recursos visuales locales, CV semántico, recuperación de schema activo,
composición de marca/tema e integridad reproducible de la fuente de iconos.

El sistema puede presentarse ante la mesa académica como un **Release Candidate estable
en un entorno controlado**, siempre que antes de la defensa se ejecute el gate integral
sobre un SHA inmutable y se complete la regresión manual por roles. No corresponde
declararlo listo para producción pública hasta validar proveedores reales, Microsoft
Entra con una cuenta organizacional, observabilidad de destino y controles adicionales
de archivos.

### 1.2 Qué significa y qué no significa el 100%

- **Sí significa** que los 117 ítems del alcance funcional y de remediación contabilizado
  están implementados y cuentan con el nivel de evidencia indicado en el roadmap.
- **No significa** que los 117 estén todos verificados en producción: 72 permanecen en
  estado `[I]`, mientras 45 poseen evidencia `[V]`.
- **No incluye** maquetación, impresión, presentación, ensayo, aprovisionamiento de
  proveedores ni evolución cloud/móvil.
- **No reemplaza** la aceptación final sobre el commit exacto que se presentará. Las
  métricas acumuladas pertenecen a cortes sucesivos y deben consolidarse nuevamente
  mediante `CF-03` y `CF-06` del roadmap.

### 1.3 Decisión por contexto de uso

| Contexto | Decisión | Condiciones |
|---|---|---|
| **Defensa académica controlada** | **Apto condicionado** | Gate integral verde, base demo reproducible, seis roles recorridos, consola limpia, realtime con dos sesiones y contingencia offline |
| **Piloto institucional cerrado** | **Apto condicionado reforzado** | Lo anterior, más aceptación Microsoft Entra, SMTP real, política de soporte, backups y monitoreo |
| **Producción pública** | **No aprobado todavía** | Completar `PR-01` a `PR-07`, pruebas de carga/seguridad de destino, operación y respuesta a incidentes |

---

## 2. Alcance, método y jerarquía de evidencia

### 2.1 Superficies evaluadas

1. **Identidad y autorización**: password local, Magic Link, JWT OneITB, Microsoft Entra,
   roles, ownership, lockout, sesión y cierre entre pestañas.
2. **API y persistencia**: schema HotChocolate, resolvers, servicios, EF Core, SQL Server,
   migraciones, concurrencia, cancelación, paginación y mitigación N+1.
3. **Frontend**: React, Apollo HTTP/WebSocket, caché, error boundaries, guards de rutas,
   estados asíncronos y separación entre identidades.
4. **Dominio**: muro social, moderación, mensajería, académico, empleos, postulaciones,
   onboarding empresarial, notificaciones y archivos.
5. **Infraestructura local**: Docker SQL, Redis, Mailpit/pickup SMTP, almacenamiento local,
   scripts finitos de aceptación y base demo canónica.
6. **Preparación operativa**: secretos, proveedores externos, observabilidad, respaldo,
   documentación y condiciones de defensa.

### 2.2 Método de evaluación

La evaluación combinó revisión estática, análisis de contratos, tests unitarios e
integración, builds, control de drift EF, inspección SQL, ejecución GraphQL, smokes
finitos y recorridos manuales registrados. Cada afirmación distingue explícitamente
entre implementación, verificación local, bloqueo externo y riesgo aceptado.

### 2.3 Precedencia de fuentes

Ante contradicciones se aplica este orden:

1. Código y configuración efectivamente versionados.
2. Schema GraphQL, modelo EF y migraciones ejecutadas.
3. Evidencia reproducible de la spec correspondiente.
4. Este informe de auditoría.
5. Roadmap y estado documental.
6. Development log e informes históricos.

Una tarea marcada en un documento no prueba por sí sola que el comportamiento funcione.
Los resultados de runtime prevalecen sobre descripciones históricas.

### 2.4 Estados empleados

| Estado | Interpretación de auditoría |
|---|---|
| `[V]` | Verificado con evidencia apropiada al riesgo y al entorno declarado |
| `[I]` | Implementado y cubierto parcialmente, pero conserva un gate de runtime, entorno o aceptación |
| `[B]` | Bloqueado por credenciales, proveedor, red, decisión institucional o ambiente externo |
| **Aceptado** | Riesgo conocido y documentado cuyo tratamiento se difiere sin ocultarlo |
| **Fuera del MVP** | Control valioso no comprometido en el alcance académico; necesario antes de ciertos escenarios productivos |

---

## 3. Registro vigente de riesgos y gates residuales

Ninguno de los siguientes puntos reabre una vulnerabilidad crítica/alta ya remediada.
Son condiciones pendientes para aceptación manual, piloto institucional o producción.

| ID | Riesgo o gate | Nivel actual | Estado | Tratamiento requerido | Roadmap | Bloquea defensa | Bloquea producción |
|---|---|---|---|---|---|---|---|
| `RR-01` | SMTP, Redis administrado y Cloudinary no probados con secretos/proveedores reales | Medio operativo | `[B]` | Ejecutar smokes en ambiente seguro, registrar endpoint/versión/resultado sin exponer secretos y probar fallback/fallo | `PR-01` a `PR-03` | No | Sí |
| `RR-02` | Microsoft Entra conserva casos pendientes de aceptación con cuenta Microsoft 365 real | Medio para SSO institucional | `[I]` | Éxito real hasta onboarding/muro verificado el 2026-08-04; completar cancelación/error, logout y aislamiento de segunda cuenta | `PR-04` | No | Sí, si SSO forma parte del despliegue |
| `RR-03` | Costo BCrypt 12 no medido sobre hardware productivo objetivo | Medio | `[I]` | Medir p50/p95 de registro/login, uso de CPU y concurrencia; ajustar dentro del rango aprobado sin degradar hashes existentes | `PR-05` | No | Sí |
| `RR-04` | Recorrido visual completo del rol Moderador pendiente | Bajo funcional | `[I]` | Validar hide/restore, mute, reportes, denegaciones Admin-only, auditoría y consola | `CF-04` | Sí | Sí |
| `RR-05` | Handshake WebSocket con dos navegadores/perfiles aislados pendiente | Medio funcional | `[I]` | Verificar conexión, reconexión, aislamiento de topics, badges, lectura y logout A -> B | `CF-05` | Sí | Sí |
| `RR-06` | Regresión visual B2B de solicitud y gestión empresarial pendiente | Bajo funcional | `[I]` | Recorrer `/empleos/solicitud`, aprobación/rechazo Admin, alta, entrega local y acceso Empleador | `CF-04` | Sí | Sí |
| `RR-07` | Fallos persistentes del cleanup de uploads solo producen warning local | Medio operativo | `[I]` | Configurar alerta, umbral, retención, dashboard y procedimiento de recuperación | `PR-06` | No | Sí |
| `RR-08` | Uploads sin antivirus/CDR externo | Medio de defensa en profundidad | Fuera del MVP | Seleccionar proveedor, política de cuarentena, privacidad, timeout, rechazo y reintento | `PR-07` | No | Sí para exposición pública amplia |
| `RR-09` | React Router 6.30.4 conserva advisories moderados upstream | Moderado aceptado | Aceptado | Mantener sanitización de destinos; reevaluar 7.x fuera del Code Freeze con suite completa | Evolución postdefensa | No | Revisión previa al despliegue |
| `RR-10` | Backend 234/234 y frontend 251/251 pasaron juntos en el preflight de Spec 218, pero no sobre un SHA candidato congelado | Medio de liberación | `[I]` | Resolver higiene, congelar el SHA, repetir o vincular gates integrales y registrar fecha, versiones y resultados | `CF-01`, `CF-03`, `CF-06` | Sí | Sí |
| `RR-11` | `/uploads` local entrega objetos por URL directa sin autorización por recurso | Alto para piloto abierto | Aceptado solo para demo controlada | Migrar a storage privado con URL firmada o endpoint autorizado según ownership/carrera antes de admitir usuarios externos | `PR-03` y evolución de storage | No | Sí |
| `RR-12` | TLS SQL, observabilidad y alertas no aceptados en un ambiente remoto | Alto operativo de destino | `[B]` | Inyectar cadena con certificado verificable, probar `/health/ready`, centralizar logs/métricas/traces y aprobar alertas/incident response | `PR-06` | No | Sí |
| `RR-13` | La cardinalidad académica de Estudiante requería selección única y reconciliación de datos heredados | Bajo de aceptación | `[I]` | Spec 204 cerró los bypasses de onboarding, registro, perfil y mutación legacy con servicio transaccional y pruebas; resta repetir el recorrido Microsoft/onboarding/feed en el runtime recompilado | Spec 204 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |
| `RR-14` | `/profile/edit` mostraba datos provisionales y no distinguía storage de asociación persistida | Bajo de aceptación | `[I]` | Specs 205/215 exigen snapshot completo, provider explícito, timeout/cancelación, avatar previo y 503 correlacionado; resta validar upload-save-refresh en navegador. Cloudinary real sigue separado en `PR-03` | Specs 205/215 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación y `PR-03` |
| `RR-15` | El header usaba un breakpoint fijo y el branding raster perdía contraste en dark mode | Bajo de aceptación visual | `[I]` | Spec 206 implementó overflow por ancho real, descriptores únicos y lockup sin bloom; ejecutar matriz por rol/ancho/tema/teclado | Spec 206 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |
| `RR-16` | Tipografía, iconos y avatares fallback dependían de hosts externos | Bajo de aceptación offline | `[I]` | Spec 207 eliminó Google Fonts/cdnjs/ui-avatars, validó WOFF2 locales y preimpresión CV; ejecutar rutas offline y diálogo nativo de impresión/PDF | Spec 207 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |
| `RR-17` | El CV usaba dos representaciones, altura A4 fija, overflow oculto y paginación DOM simulada | Bajo de interoperabilidad documental | `[I]` | Spec 208 unificó vista/edición en un documento semántico lineal, impresión aislada y analizador Poppler sin retención de PII. Ejecutar diálogo nativo y analizar un PDF real de dos páginas | Spec 208 / `CF-04` | Sí hasta aceptación del artefacto | Sí hasta aceptación del artefacto |
| `RR-18` | Un proceso backend antiguo podía servir un schema sin `confirmStudentCareer` | Bajo operativo local | `[I]` | Specs 209/213 agregaron introspección, build header y preflight fail-fast; contrato Release PASS. Resta confirmar Microsoft -> onboarding en navegador sobre el corte congelado | Specs 209/213 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |
| `RR-19` | El lockup duplicaba la `O` y onboarding podía heredar modo oscuro persistido | Bajo visual | `[I]` | Spec 210 cerró la herencia mediante override claro; Spec 212 sustituyó el lockup DOM por logo completo normal/oscuro y dejó el Header solo con isotipo. Suite 225/225 y Home claro PASS; ejecutar matriz dark/light 320/768/1440 px | Specs 210/212 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |
| `RR-20` | Font Awesome 6.1.2 vendorizado provocaba ajustes `glyf bbox` en Firefox | Cerrado | `[V]` | Spec 211 migró a paquete oficial 6.7.2 exacto con integridad SHA-512; Firefox nativo sobre `2f20bce` cargó el WOFF2 local y no emitió `download failed`, `glyf bbox` ni errores Font Awesome | Spec 211 / evidencia 05/08/2026 | No | No |
| `RR-21` | “Cargar más” no distinguía página terminal, error recuperable ni doble click en todos los consumidores | Bajo de aceptación | `[I]` | Spec 216 consolidó el hook, deduplicó, aisló filtros y cubrió bordes/concurrencia/error; ejecutar browser con dataset >15, cambio de carrera y fallo forzado | Spec 216 / `CF-04` | Sí hasta aceptación | Sí hasta aceptación |

### 3.1 Acciones obligatorias antes de la defensa

1. Ejecutar la aceptación manual coordinada de Specs 204 a 208, incluyendo onboarding,
   perfil/avatar, navegación responsive, temas, teclado, offline y PDF optimizado para ATS.
2. Integrar y publicar el corte vigente sin archivos auxiliares ni secretos.
3. Ejecutar `scripts/validate-predefense.ps1`,
   `scripts/validate-local-infrastructure.ps1` y
   `scripts/validate-demo-database.ps1` sobre el SHA candidato.
4. Recorrer Estudiante, Profesor, Egresado, Empleador, Moderador y Administrador.
5. Validar chat/notificaciones con dos perfiles de navegador aislados.
6. Recorrer solicitud empresarial, aprobación/rechazo y acceso del Empleador.
7. Consolidar resultados, desviaciones y capturas; etiquetar el SHA presentado.

### 3.2 Acciones obligatorias antes de producción pública

Además de las acciones anteriores, deben completarse `RR-01`, `RR-02`, `RR-03`,
`RR-07`, `RR-11`, `RR-12` y el tratamiento acordado para `RR-08`/`RR-09`. También se requieren políticas
de backup/restore, monitoreo, rotación de secretos, incident response, capacidad y
rollback sobre el ambiente de destino.

### 3.3 Frontera con la entrega académica

Este informe evalúa código, arquitectura, seguridad y operación técnica. La maquetación
DOCX/PDF, los diagramas, la presentación, la impresión, el pendrive y los ensayos no son
hallazgos de seguridad; se controlan mediante `DF-01` a `DF-08` y `LG-01` a `LG-05` en
el roadmap. Su incumplimiento puede bloquear la defensa aunque el software permanezca
técnicamente estable, por lo que deben cerrarse en paralelo sin inflar el 117/117.

---

## 4. Matriz consolidada de remediaciones 186-193

| Caso | Severidad original | Resolución aplicada | Estado y evidencia | Gate residual |
|---|---|---|---|---|
| **Spec 186 - token mock y emisores JWT duplicados** | Crítico | Se eliminó `token_placeholder`; `JwtTokenService` centralizó HS256, claims, issuer, audience y expiración. Magic Link pasó a una credencial criptográfica de un uso con consumo atómico. | **Verificado `[V]`**: 82/82 tests, Release, EF sin drift, JWT válido, replay rechazado y concurrencia 1 éxito/1 rechazo. | Entrega fuera de banda endurecida por Spec 192. |
| **Spec 187 - cancelación incompleta en mutaciones** | Alto | Las mutaciones asíncronas reciben `CancellationToken` y lo propagan por servicios, UnitOfWork, repositorios, EF Core y efectos compatibles; la cancelación no se traduce a error de negocio. | **Verificado `[V]`**: guard por reflexión, prueba pre-cancelada sin escritura y schema sin argumentos de infraestructura. | Sin gate funcional. |
| **Spec 188 - session bleed Apollo/React/WebSocket** | Alto | Logout, expiración, cambio de identidad y cierre entre pestañas convergen en una terminación idempotente que borra identidad, limpia Apollo, termina WebSocket e invalida respuestas tardías por epoch. | **Verificado `[V]`**: tests frontend, build y recorrido Estudiante -> logout -> Administrador sin datos cruzados. | Sin gate local. |
| **Spec 189 - autorización mutacional incompleta** | Crítico | Se aplicó `[Authorize]` declarativo a toda mutación protegida; ownership, autoría e inscripción permanecen en servicios. | **Verificado `[V]`**: la matriz actual cubre 47 resolvers mutacionales; seis son públicos y controlados, y los otros 41 exigen autorización. Incluye pruebas de no-escritura y smokes anónimo/rol incorrecto. | Sin gate funcional. |
| **C-1 - upload validado solo por extensión/MIME** | Crítico | `FileContentInspector` valida firmas y estructura antes del storage y rechaza contenido incompatible sin filtrar detalles. | **Verificado `[V]`**: PDF válido aceptado; ejecutable renombrado y PDF truncado rechazados sin fixture retenido. | Antivirus/CDR externo fuera del MVP. |
| **C-2 - Magic Link sin limitación específica** | Crítico | Límites independientes por IP e identidad/credencial, fingerprints HMAC, memoria acotada local y operación atómica Redis. | **Verificado `[V]`**: umbrales, recuperación, digest, concurrencia, fail-closed y single-use. | Proveedor Redis real en `RR-01`. |
| **C-3 - I/O síncrono en carga del feed** | Crítico | Visibilidad resuelta con `AnyAsync` cancelable; builder del feed sin I/O terminal síncrono. | **Verificado `[V]`**: cancelación y recorrido paginado sin regresión. | Sin gate local. |
| **A-3 - contrato social sin límite** | Alto | Se retiró `inquiries` ilimitado; `inquiriesPage` usa máximo 25, cursor opaco, orden estable y filtro previo al conteo. | **Verificado `[V]`**: schema, límite, orden, deduplicación, siguiente página y filtro de autor. | Sin gate local. |
| **A-4 - estudiantes académicos sin paginación** | Alto | `AcademicStudentPage` limita a 50, proyecta campos del selector, preserva autorización y ordena determinísticamente. | **Verificado `[V]`**: límite, orden, siguiente página y denegación por rol. | Sin gate local. |
| **A-1 - Magic Link expuesto por GraphQL** | Alto | Respuesta genérica, credencial fuera de banda, digest SHA-256 en SQL y fragmento URL eliminado antes del consumo. | **Verificado local `[V]`**: schema, pickup, digest, consumo y replay. | SMTP público en `RR-01`. |
| **A-2 - BCrypt sin política explícita** | Alto | `IPasswordHasher` centraliza costo 12 configurable, eleva hashes débiles y no degrada hashes más fuertes. | **Implementado `[I]`**: registro, administración, empleadores, seeder y tests de rehash/no-downgrade. | Benchmark `RR-03`. |
| **M3-M1 - bypass de silenciamiento en reacciones** | Medio | El guard `MutedUntil` se ejecuta antes de leer o mutar; el rechazo no altera reacciones ni emite notificación. | **Verificado `[V]`**: like/unlike rechazados con delta cero y `USER_ERROR`. | Sin gate local. |
| **M4-M1 - error boundary debajo de providers** | Medio | `GlobalErrorBoundary` envuelve Apollo, Theme y App; el bootstrap agrega fallback React/DOM previo a `createRoot`. | **Verificado `[V]`**: fallos inyectados y recorridos sin errores propios. | Sin gate local. |

---

## 5. Controles vigentes por dominio

### 5.1 Identidad, sesión y autorización

- JWT local exige clave de al menos 32 bytes, issuer, audience y lifetime válido.
- Password local usa lockout de 15 minutos tras cinco intentos y errores genéricos.
- Magic Link posee 256 bits de entropía, expiración de 15 minutos, digest persistido,
  consumo atómico, respuesta anti-enumeración y rate limiting específico.
- Microsoft Entra usa Authorization Code + PKCE, access token del scope OneITB,
  validación RS256/issuer/audience/lifetime/tenant/object ID/scope/dominio y canje por JWT
  local. El flujo frontend es redirect, idempotente y sin popup anidado.
- Los 47 resolvers mutacionales se clasifican de forma explícita: seis superficies
  públicas con controles propios (`registerUser`, `login`, `microsoftLogin`, solicitud y
  consumo de Magic Link, y `submitEmployerRequest`); las otras 41 exigen autorización
  declarativa y validaciones contextuales.
- Logout elimina credenciales, limpia Apollo, termina WebSocket y descarta respuestas
  tardías; el cambio A -> B fue aceptado sin fuga de identidad.

### 5.2 Datos, rendimiento y concurrencia

- Consultas principales de lectura utilizan `AsNoTracking`; grafos complejos aplican
  `AsSplitQuery` cuando corresponde.
- Métricas de usuario se agrupan mediante DataLoaders; la sincronización SIU carga lotes
  antes de iterar y evita N+1.
- Feed, estudiantes académicos, empleos, mensajería, auditoría y notificaciones poseen
  límites explícitos.
- Escrituras propagan `CancellationToken`; Magic Link, notificaciones agrupadas,
  aprobación empresarial y Outbox poseen controles de concurrencia/idempotencia.
- Soft delete y filtros globales excluyen contenido inactivo o moderado; operaciones
  privilegiadas que ignoran filtros están acotadas a casos de autoría/moderación.

### 5.3 Frontend y experiencia defensiva

- No se utiliza `dangerouslySetInnerHTML`; publicaciones y comentarios se renderizan como
  texto/nodos React, sin HTML arbitrario de usuario.
- El bootstrap y el error boundary cubren fábrica Apollo, providers, árbol React y fallos
  previos al montaje sin exponer tokens, caché ni datos personales.
- Guards de sesión verifican identidad y estado académico antes de renderizar el layout
  privado; onboarding obligatorio confirma persistencia mediante refetch.
- Los destinos internos provenientes de notificaciones y redirects se sanitizan.
- La caché y el transporte realtime se aíslan por sesión; respuestas anteriores no pueden
  hidratar una identidad posterior.

### 5.4 Archivos e infraestructura local

- Upload autenticado, límites de tamaño, nombre sanitizado, lista de tipos permitidos y
  validación binaria/estructural previa al storage.
- SQL Server Docker constituye la base local canónica; la reconstrucción demo incluye
  backup verificado, migraciones e integridad relacional.
- Redis y Mailpit fueron aceptados localmente con servicios finitos y limpieza posterior.
- Storage, correo y pub/sub usan configuración condicional y fallbacks controlados en
  Development; Production no debe iniciar silenciosamente con una configuración insegura.

### 5.5 Dominio y privacidad

- Moderación separa edición del autor de hide/restore administrativo y registra auditoría.
- Adjuntos sociales respetan exclusividad XOR entre publicación y comentario.
- Onboarding empresarial no crea privilegios desde la superficie pública; aprobación
  Admin serializable aprovisiona exclusivamente el rol `Empleador`.
- Honeypot temprano, CUIT, consentimiento, anti-enumeración, rate limits y Outbox reducen
  abuso, duplicación y exposición de PII.
- Perfil privado, ownership, scoping por carrera y reglas de acceso académico permanecen
  como controles del servicio, no como decisiones exclusivas del cliente.

---

## 6. Trazabilidad de aceptación y expansión controlada

Las métricas históricas siguientes pertenecen a **cortes sucesivos**. Spec 201 agregó una
ejecución conjunta del worktree; todas sirven como trazabilidad, pero no deben presentarse
como una ejecución sobre el SHA final hasta repetir el gate después de congelarlo.

### 6.1 Spec 194 - Aceptación operacional final

Ejecutó 147 pruebas backend y 79 frontend, builds Release/Vite, drift EF, contratos
paginados, upload hostil, política de silenciamiento y entrega local Magic Link. En
navegador se recorrieron Estudiante, Profesor, Egresado, Administrador y Empleador; se
comprobó `A -> logout -> B` sin identidad, mensajes ni notificaciones residuales. Panel
administrativo, académico, chat, perfil y Gestor de Postulaciones cargaron sin errores o
warnings propios.

### 6.2 Spec 195 - Infraestructura local y aceptación Moderador

Incorporó una identidad Moderador estable, JWT canónico, hide/restore auditado y
denegaciones Admin-only. Redis 7.4.2 entregó exactamente un evento entre dos providers
HotChocolate independientes sin filtrarlo a otro topic. Mailpit 1.29.7 capturó tres
correos inspeccionados sin secretos. El runner es finito, no inicia servidores web,
preserva SQL y elimina servicios/puertos de aceptación.

### 6.3 Spec 196 - Rebaseline y base demo canónica

Un runner protegido verificó `oneitb23-sql/OneItb`, creó backup `COPY_ONLY` con checksum,
aprobó `RESTORE VERIFYONLY`, eliminó solo la base demo y aplicó las 32 migraciones del
corte. Dos ejecuciones del seeder produjeron el mismo inventario: 15 cuentas/usuarios,
9 carreras, 6 materias, recursos, progreso, CV relacional, muro, chat, notificaciones y
empleos.

SQL reportó cero huérfanos, duplicados canónicos, violaciones XOR, auto-interacciones o
profundidad inválida. Se autenticaron seis roles y se recorrieron los módulos principales.
El corte cerró con 153/153 backend, 80/80 frontend, builds limpios y EF sin drift.

### 6.4 Spec 197 - Microsoft Entra institucional

Sustituyó el plan Google por Microsoft Entra ID. MSAL usa Authorization Code + PKCE,
autoridad organizacional multi-tenant `common` y caché de sesión; backend acepta solo el
access token del scope OneITB, resuelve metadata por `tid`, valida fronteras criptográficas
y canjea por JWT local. La identidad externa posee índice único, cuentas nuevas sin
privilegios y vínculo privilegiado fail-closed. Password y Magic Link siguen disponibles.

El corte registró 174/174 backend, 82/82 frontend, builds limpios, 33 migraciones sin
drift y schema runtime de 43 mutaciones. Sin configuración real, `microsoftLogin` respondió
`ENTRA_NOT_CONFIGURED`; el smoke organizacional permanece en `RR-02`.

### 6.5 Spec 198 - Onboarding B2B de empleadores

La solicitud pública normaliza datos, exige consentimiento, valida CUIT, ejecuta
honeypot antes de campos, aplica límites HMAC y responde uniformemente ante duplicados.
No crea cuentas ni revela empresas existentes. Solo Administrador procesa solicitudes.

La aprobación serializable e idempotente persiste solicitud, cuenta, usuario `Empleador`,
auditoría y Outbox. El rechazo conserva el motivo administrativo, mientras la auditoría
transversal solo registra `ReasonProvided = true`. Magic Link mantiene respuesta genérica
y Outbox usa lease/reintentos/códigos sanitizados sin credenciales ni cuerpos de correo.
El corte registró 183 backend, 85 frontend, builds, migración/EF y entrega `.eml` local.

### 6.6 Spec 199 - UX B2B y onboarding académico

Centralizó configuración Entra con `VITE_ENTRA_CLIENT_ID` canónico y alias legacy
acotado; incorporó CTA empresarial responsive. Un guard anterior al layout privado
bloquea solo a Estudiante sin carreras, rechaza datos `me` de otra sesión y exige que el
refetch confirme la asociación persistida antes de abrir la aplicación. La regresión
visual permanece en `RR-04`/`RR-06` según el rol y flujo.

### 6.7 Spec 200 - Microsoft Entra redirect auth hardening

El flujo dejó popups y usa redirección completa. Permanece en
`/auth/microsoft/callback` durante el procesamiento y bloquea nuevas acciones mientras
MSAL no esté en `None`. El callback no ofrece controles para iniciar otro acceso.

Adquiere silenciosamente el access token, conserva el contrato backend y usa un
descriptor efímero sin credenciales con destino sanitizado. Una promesa por flow ID
deduplica adquisición, canje GraphQL, limpieza Apollo e hidratación frente a rerenders o
Strict Mode. El corte incluye 41/41 pruebas focalizadas, 144/144 frontend y build Vite.

### 6.8 Spec 202 - Alineación del redirect Microsoft Entra

El incidente `AADSTS50011` se diagnosticó como divergencia entre la URI solicitada por
la SPA y la registrada en Microsoft Entra, no como un fallo CORS de OneITB. La revisión
segura, sin imprimir valores, confirmó que `.env` solicita exactamente
`http://localhost:5173/auth/microsoft/callback` y que las claves backend requeridas están
presentes y son estructuralmente válidas.

La validación frontend ahora acepta HTTP solo en `localhost`/loopback, exige HTTPS fuera
del entorno local y rechaza query, fragmento o credenciales embebidas. Pasaron 46/46
pruebas Entra focalizadas, 151/151 frontend y el build Vite de 551 módulos en 862 ms.
Los warnings de CSP, BSSO, cookies y telemetría emitidos por páginas Microsoft quedaron
clasificados como externos/no causales. La aceptación real conserva estado `[B]` hasta
registrar/propagar el callback en la App Registration correcta y ejecutar el smoke con
una cuenta Microsoft 365 institucional.

### 6.9 Spec 203 - Commit de sesión Microsoft posterior al redirect

Tras aceptar Azure el callback, el retorno a `/login` quedó localizado en dos condiciones
frontend. La sesión canónica limpiaba MSAL de forma incondicional y el callback navegaba
después de resolver `login`, pero antes de que React expusiera el nuevo contexto al guard.

`AuthContext` distingue ahora el establecimiento local del Microsoft: conserva la cuenta
MSAL únicamente para este último y mantiene la purga completa en accesos locales, logout,
expiración y reemplazo. El callback conserva el canje exactamente una vez, espera JWT,
estado autenticado e identidad coincidente, y recién entonces completa el flow y navega.
Un timeout acotado elimina estado parcial; Login recupera una sesión ya comprometida.
La segunda iteración eliminó además dos redirecciones silenciosas: las sesiones
persistidas incompletas se purgan y Apollo ya no convierte un error controlado de una
operación pública de identidad en expiración global. Si MSAL restaura `/login`, se retoma
el callback únicamente con flow vigente y una cuenta retornada inequívoca.

Pasaron 34/34 pruebas focalizadas de sesión, 11/11 del callback final, 163/163 pruebas
frontend y build Vite de 551 módulos sin errores. El 2026-08-04 una cuenta institucional
completó selección Microsoft, callback, commit OneITB, onboarding y llegada al muro. El
camino exitoso queda aceptado; `RR-02` continúa `[I]` hasta completar cancelación/error,
logout y aislamiento de una segunda cuenta.

### 6.10 Spec 213 - Contrato de runtime y transición Entra

La reincidencia de un schema ejecutado distinto al source motivó un gate explícito previo
a QA. La API entrega `X-OneITB-Build` con versión no sensible y el script finito valida
las operaciones requeridas por la SPA, fallando ante ausencia o mismatch sin iniciar ni
dejar servidores. La prueba sobre un host Release temporal confirmó `inquiriesPage`,
`microsoftLogin` y `confirmStudentCareer`, y el proceso fue detenido por `finally`.

En React, un coordinador observable de redirect y una barrera superior a las rutas
evitan renderizar Login durante MSAL, intercambio o commit. La expiración de un JWT
anterior limpia OneITB/Apollo sin destruir la transición MSAL en curso; logout manual
conserva la purga completa. El callback expone fases explícitas y mantiene deduplicación
por flow. Pasaron backend 216/216, frontend 232/232 y builds sin warnings. La evidencia
es `[I]`: falta repetir éxito, cancelación/error y logout con Microsoft 365 real para
promover el flujo a `[V]` y cerrar `RR-02`.

### 6.11 Spec 214 - Identidad académica estudiantil autoritativa

Las escrituras posteriores al alta convergen en `IUserCareerAssignmentService`, que
valida carreras activas y prepara el reemplazo bajo la transacción del caso de uso. La
política rechaza cero o múltiples carreras para `Estudiante`; onboarding y perfil exigen
confirmación, verifican el `me` persistido e invalidan únicamente las consultas Apollo
dependientes de ese alcance. El registro inicial conserva atomicidad dentro del agregado
`User` y aplica la misma regla de selección.

`SelfDeclaredInstitutionalEnrollmentProvider` reemplaza la denominación manual ambigua:
informa estado, fuente y timestamp, pero no devuelve carrera ni materias inventadas y no
puede marcarse autoritativo. El mock `ISiuIntegrationService` continúa limitado a
calificaciones. Pasaron 218/218 pruebas backend, 237/237 frontend, builds Release sin
warnings y EF sin drift. La evidencia queda `[I]` hasta recorrer onboarding -> feed ->
perfil en navegador contra el runtime candidato.

### 6.12 Spec 215 - Resiliencia de storage e hidratación de perfil

La selección por mera presencia de `CloudinarySettings:Url` fue reemplazada por
`FileStorage:Provider`. El perfil Development declara `Local`; Production declara
`Cloudinary`, rechaza provider ausente/desconocido, disco local y configuración remota
incompleta. El adapter remoto aplica timeout de 1 a 120 segundos, conserva cancelación
del cliente y no expone URL, credenciales ni respuesta del proveedor.

`POST /api/upload` diferencia fallas esperadas e inesperadas solo en logging y mantiene
un contrato cliente único: `UPLOAD_STORAGE_UNAVAILABLE`, modo, `correlationId` y
reintento manual. React traduce ese contrato sin reintento automático y conserva el
avatar anterior. El editor no abandona el skeleton hasta disponer de `me` coincidente y
catálogo de carreras completo. Pasaron 230/230 pruebas backend, 240/240 frontend, builds
Release/Vite, validación Compose y control EF sin model drift. El browser local y Cloudinary real
siguen pendientes, por lo que el estado correcto es `[I]`, no `[V]`.

### 6.13 Spec 216 - Observabilidad de paginación del feed

El servicio backend conservó su implementación porque los bordes 0, 1, 15 y 16
confirmaron límite, cursor y terminal correctos. El defecto de mantenibilidad estaba en
React: el Feed duplicaba `fetchMore` y no compartía las defensas del hook utilizado por
perfil y administración.

`useInquiryPage` es ahora el consumidor canónico: normaliza conjuntos de filtros,
bloquea solicitudes concurrentes, deduplica por ID, ignora para la UI respuestas de un
filtro anterior y conserva los resultados ante una falla de página. Los consumidores
muestran reintento y fin explícitos. Pasaron 234/234 pruebas backend, 249/249 frontend y
builds Release/Vite sin warnings. Como no había runtime escuchando en 5173/44397, resta
el recorrido browser con más de 15 publicaciones; el estado es `[I]`.

### 6.14 Spec 217 - Landing institucional y transición temática

La duración global fue sincronizada en CSS y `ThemeContext` a 1300 ms, con cleanup y
anulación para reduced motion e impresión. Home y footer distinguen el proyecto OneITB
del portal oficial, contextualizan el ISFT N.º 197 y presentan Portal Beltrán, SIU
Guaraní y Microsoft 365 como enlaces externos con `noopener noreferrer`, sin atribuir
una integración productiva. El browser detectó un recorte oculto del Hero a 320 px; se
corrigió con tracks `minmax(0, ...)` y la repetición en 320/768/1440 quedó sin overflow
ni headings truncados, con consola limpia. Pasaron 251/251 pruebas frontend, 17/17
focalizadas y Vite. El estado permanece `[I]` hasta la regresión perceptual dark/light y
reduced-motion del SHA candidato.

### 6.15 Spec 218 - Gate de candidato y predefensa

Se formalizó un contrato `same-SHA` que impide presentar resultados históricos o de un
worktree mutable como evidencia de congelamiento. Las 88 rutas quedaron clasificadas: la
infografía promocional se movió al paquete académico y el logo anterior se preservó local
e ignorado, fuera del candidato. El scan de alta confianza no halló claves privadas ni
tokens y la configuración rastreada no contiene credenciales SQL embebidas.

Sobre `UNFROZEN_WORKTREE` pasaron juntos backend 234/234, frontend 251/251, ambos builds,
EF sin drift, Compose y whitespace. Redis/Mailpit, aislamiento automatizado, integridad
SQL, seis logins y smokes de ocho dominios pasaron con cleanup; el SQL existente no fue
modificado. `npm audit` confirmó únicamente los dos advisories moderados de React Router
6.30.4 ya controlados por `RR-09`: SSR no aplica y los destinos internos rechazan el
vector de backslash; el fix exige v7. Browser por seis roles y dos sesiones continúan
abiertos. No se creó commit/tag. El NO-GO temporal de `CF-01` a `CF-06` se mantiene hasta
obtener evidencia sobre un SHA limpio.

---

## 7. Registro histórico detallado de hallazgos

Las descripciones siguientes conservan la condición observada al momento de cada
auditoría para demostrar trazabilidad. **No representan el estado vulnerable actual**.
En cada caso prevalece el campo **Estado posterior** y la matriz de la sección 4.

### 7.1 Módulo 4 - Arquitectura frontend y React (auditoría 2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Lead Frontend Architect / Especialista en Seguridad React (automatizado)
**Alcance**: `FrontEnd/OneItb-FE/src/` — Apollo Client, flujos de Autenticación/Logout, renderizado de contenido rico, Error Boundaries.

---

#### MEDIO-1: `GlobalErrorBoundary` ubicado dentro de los proveedores raíz (cobertura parcial)

| Campo | Detalle |
|---|---|
| **Archivo en el corte auditado** | `FrontEnd/OneItb-FE/src/main.jsx` |
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
| **GlobalErrorBoundary y bootstrap** | ✅ Verificado `[V]` | La frontera envuelve Apollo, Theme y App; el arranque dinámico captura fallos previos al montaje. El fallback no depende de providers, genera un ID robusto y el diagnóstico excluye mensajes, tokens, cache y datos personales. Once pruebas focalizadas cubren fábrica, providers, hijo, `createRoot`, correlación y singleton por montaje. |
| **Logout: limpieza de credenciales en localStorage** | ✅ Seguro | `terminateLocalSession` (`AuthContext.jsx` líneas 47–66) elimina `token` y `user` de `localStorage` **antes** de limpiar Apollo. El handler de storage cross-tab (líneas 72–84) detecta el logout remoto y propaga la terminación de sesión al tab sibling. |
| **Protección contra payloads tardíos (session epoch)** | ✅ Seguro | `sessionBoundaryLink` (`GraphqlProvider.js` líneas 102–122) captura el `sessionEpoch` al inicio de cada operación y descarta silenciosamente cualquier respuesta que llegue tras un cambio de epoch (logout/login). Previene que datos de una sesión anterior contaminen la UI de la sesión siguiente. |

---

### 7.2 Módulo 3 - Lógica de negocio y moderación (auditoría 2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Auditor de QA / Especialista en Lógica de Negocio (automatizado)
**Alcance**: `SocialService.cs`, `ModerationService.cs`, `AcademicService.cs`, `MockSiuIntegrationService.cs`, `OneItbContext.cs` (query filters)

---

#### MEDIO-1: Bypass de mute en `ToggleReactionAsync` (reacciones a publicaciones)

| Campo | Detalle |
|---|---|
| **Archivo en el corte auditado** | `API Graphql/Services/Social/SocialService.cs` |
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
| **SIU Mock: validación de notas** | ✅ Seguro | `AcademicService.cs` líneas 670–680: `ValidateScore` aplica `Math.Round(score, 2)` y rechaza con `ArgumentException` los valores menores que 0 o mayores que 10. La sincronización SIU (`SyncSiuGradesAsync`, línea 372–381) envuelve cada registro en try/catch y registra el skip sin abortar el batch. Un mock que devolviera un 15 sería rechazado y registrado en `skippedItems`. |
| **SIU Mock: datos hardcodeados** | ✅ Seguro | `MockSiuIntegrationService.cs`: devuelve 3 registros fijos con notas 8.75, 7.50 y 6.00 — todos dentro del rango válido [0, 10]. El registro con email inexistente es correctamente descartado por `SyncSiuGradesAsync` ("sin cuenta local"). |
| **Exclusión de usuarios silenciados del feed** | ✅ Seguro | `GetInquiries` (líneas 149–153) excluye publicaciones de usuarios muteados o bloqueados **por el observador** vía `UserInteractions` (tipo `Mute`/`Block`). Esto es aislamiento social entre usuarios, distinto del mute administrativo (`MutedUntil`), y ambos mecanismos están correctamente implementados. |

---

### 7.3 Módulo 2 - Rendimiento y persistencia (auditoría 2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Arquitecto de Software Senior / DB Performance Specialist (automatizado)
**Alcance**: `Query.cs`, `Mutation.cs`, `SocialService.cs`, `JobService.cs`, `AcademicService.cs`, `NotificationService.cs`, `GraphQLMetricsDataLoaders.cs`

---

#### CRÍTICO-3: Llamada síncrona bloqueante al hilo en `GetInquiries` (Thread-Pool Starvation)

| Campo | Detalle |
|---|---|
| **Archivo en el corte auditado** | `API Graphql/Services/Social/SocialService.cs` |
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
| **Archivo en el corte auditado** | `API Graphql/OneITB/GraphQL/Query.cs` |
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
| **Archivos en el corte auditado** | `API Graphql/OneITB/GraphQL/Query.cs` y `API Graphql/Services/Academic/AcademicService.cs` |
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

### 7.4 Módulo 1 - Seguridad y autenticación (auditoría 2026-07-27)

**Fecha de auditoría**: 2026-07-27
**Auditor**: Red Team / Senior .NET Developer (automatizado)
**Alcance**: Auth services, JWT, UploadController, Mutation.cs (políticas de acceso)

#### CRÍTICO-1: Ausencia de validación por Magic Bytes en subida de archivos

**Estado actualizado (Specs 190/194)**: **VERIFICADO `[V]`**. `FileContentInspector` valida firmas y estructura antes de storage; pruebas y aceptación runtime confirman PDF válido, rechazo de ejecutable renombrado y PDF truncado, sin persistencia residual.

- **Archivo en el corte auditado**: `API Graphql/OneITB/Controllers/UploadController.cs`
- **Líneas**: 60–66
- **Descripción**: La validación de archivos se basa exclusivamente en la **extensión del nombre de archivo** (línea 60) y en el **Content-Type HTTP** enviado por el cliente (línea 64–65). Ambos valores son controlados por el atacante y trivialmente falsificables.
- **No existe inspección de las firmas binarias (magic bytes)** del contenido real del archivo. Esto permite subir archivos políglotas (por ejemplo, un ejecutable renombrado a `.pdf` con `Content-Type: application/pdf`) que pasarían ambas validaciones.
- **Impacto**: Inyección de contenido malicioso en el almacenamiento. Un archivo `.html` disfrazado de imagen podría servirse a otros usuarios y ejecutar JavaScript en contexto de la aplicación (XSS almacenado). Un binario ejecutable disfrazado de documento podría usarse como vector de distribución de malware.
- **Remediación**: Leer los primeros N bytes del stream (`IFormFile.OpenReadStream()`) y compararlos contra las firmas binarias conocidas para cada tipo permitido antes de aceptar el archivo.

#### CRÍTICO-2: Mutaciones `RequestMagicLink` y `LoginWithMagicLink` expuestas sin rate limiting específico

**Estado actualizado (Specs 190/194)**: **VERIFICADO `[V]`**. Ambas operaciones aplican límites por origen e identidad/credencial antes del servicio, con fingerprints HMAC, provider en memoria/Redis y errores genéricos. Concurrencia/fail-closed están cubiertos por tests y umbral, expiración y recuperación cuentan con evidencia runtime previa que no fue reejecutada tras la restricción operativa.

- **Archivo en el corte auditado**: `API Graphql/OneITB/GraphQL/Mutation.cs`
- **Líneas**: 207–222
- **Descripción**: Ambas mutaciones son **públicas** (sin `[Authorize]`), lo cual es correcto por diseño (pre-autenticación). Sin embargo, `RequestMagicLink` **crea usuarios automáticamente** si no existen (línea 49–71 de `EmployerAuthService.cs`), y `LoginWithMagicLink` permite intentos de fuerza bruta contra tokens activos.
- **Impacto**: Sin rate limiting dedicado, un atacante puede:
  1. Generar creación masiva de cuentas de empleador (DoS en la base de datos).
  2. Intentar fuerza bruta contra tokens de magic link de 64 caracteres hex (bajo riesgo práctico por entropía, pero el principio de defensa en profundidad exige limitación).
- **Nota de cierre**: El rate limiting global permanece como defensa adicional. El limiter específico anterior al servicio quedó cubierto por tests y evidencia runtime; el gate seguro de predefensa no vuelve a levantar servidores por defecto.

#### ALTO-1: Token de Magic Link devuelto en la respuesta GraphQL

- **Archivo en el corte auditado**: `API Graphql/Services/Auth/EmployerAuthService.cs`
- **Líneas**: 95–97
- **Descripción**: El método `RequestMagicLinkAsync` retorna el token directamente al cliente como valor de retorno de la mutación GraphQL. Este token es una **credencial de un solo uso** equivalente a una contraseña temporal.
- **Impacto**: Si los logs de GraphQL, APM o algún proxy intermedio registran payloads de respuesta, la credencial queda expuesta en texto plano. Además, cualquier actor con acceso a la respuesta HTTP (MITM sobre HTTP, extensiones de navegador, cache de proxy) obtiene la credencial.
- **Estado posterior (Specs 192/194)**: **VERIFICADO LOCALMENTE `[V]`**. `requestMagicLink` devuelve `MagicLinkRequestPayload`, el token se envía por pickup dentro de un fragmento, SQL guarda SHA-256 y React elimina el fragmento antes del consumo. Schema, tests y aceptación prueban ausencia de campos de credencial, digest y consumo único. SMTP real sigue bloqueado por configuración externa.

#### ALTO-2: BCrypt sin work factor explícito en flujos de producción

- **Archivos**:
- `API Graphql/Services/Users/UsersService.cs` — línea histórica 59
- `API Graphql/Services/Auth/EmployerAuthService.cs` — líneas históricas 54-55
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
| **Autorización de mutaciones** | ✅ Seguro | La matriz vigente cubre 47 resolvers: seis públicos (`registerUser`, `login`, `requestMagicLink`, `loginWithMagicLink`, `microsoftLogin` y `submitEmployerRequest`) con controles específicos, y 41 con `[Authorize]` o `[Authorize(Roles = ...)]`. Los roles usan constantes canónicas en `GraphQlRoles`; ownership y contexto se validan en servicios. |
| **Upload: autenticación** | ✅ Seguro | `UploadController.cs` línea 12: `[Authorize]` a nivel de clase. Límite de 15 MB por archivo, 16 MB por request. Nombre de archivo sanitizado. |
| **Upload: contenido real** | ✅ Verificado `[V]` | Inspección binaria/estructural previa a storage para todos los formatos permitidos, con rechazo genérico y evidencia de ausencia de escritura. Antivirus/CDR permanece como defensa adicional fuera del MVP. |
| **Magic Link: abuso de operaciones públicas** | ✅ Verificado local `[V]` | Límites configurables por origen y fingerprint de identidad/credencial; memoria acotada local y operación Lua atómica en Redis. El proveedor público conserva el gate `RR-01`. |
| **Exposición de datos en JWT** | ✅ Seguro | Claims contienen: sub (userId), name, role, email. No hay datos financieros, CUIT, ni información sensible adicional. |

---

## 8. Evidencia consolidada y decisión de liberación

### 8.1 Evolución de los cortes de aceptación

| Corte | Backend | Frontend | Evidencia adicional | Interpretación correcta |
|---|---:|---:|---|---|
| **Specs 186-189** | 82/82 | 54 tests en 23 archivos | Release/Vite, EF sin drift, GraphQL SQL Docker, concurrencia Magic Link y browser smoke de empleador | Baseline de remediación de seguridad; no es la métrica actual total |
| **Spec 194** | 147/147 | 79/79 | Runtime por cinco roles, paginación, upload hostil, mute, Magic Link y A -> B | Aceptación operacional previa a Moderador |
| **Spec 195** | Suites focalizadas y gates finitos | Suites focalizadas | Moderador, Redis cross-provider y Mailpit | Infraestructura local aceptada; no equivale a proveedor público |
| **Spec 196** | 153/153 | 80/80 | Backup/restore, 32 migraciones, integridad SQL, seis roles y base demo idempotente | Rebaseline canónico de la demo |
| **Spec 197** | 174/174 | 82/82 | 33 migraciones, schema de 43 mutaciones y Entra fail-closed sin secretos | Implementación SSO; aceptación real bloqueada |
| **Spec 198** | 183/183 | 85/85 | Migración, EF sin drift, GraphQL, Outbox y `.eml` local | Onboarding B2B implementado; visual pendiente |
| **Spec 199** | No modifica el baseline backend | Evidencia focalizada registrada en la spec | CTA B2B y guard académico persistente | Cambio frontend; no debe inventarse un total combinado |
| **Spec 200** | No modifica el baseline backend | 144/144, más 41/41 focalizadas | Build Vite y flujo redirect idempotente | Último baseline frontend documentado |
| **Spec 201** | 198/198 | 144/144 | Builds Release/Vite, EF sin drift, registro/academia/privacidad focalizados 32/32 | Ejecución conjunta del worktree; falta repetir tras congelar un SHA limpio |
| **Spec 204** | 210/210 | 172/172 | Builds, schema y EF sin drift; cardinalidad Student y reconciliación cubiertas | Implementación académica; aceptación Microsoft/onboarding/feed pendiente |
| **Spec 205** | 216/216 | 186/186 | Builds limpios; hidratación, drafts, cancelación y selección de storage cubiertos | Baseline más reciente del worktree; navegador y Cloudinary real pendientes |
| **Specs 206-207** | No modifican el baseline backend | 205/205 | Build Vite de 558 módulos en 3,88 s en gate concurrente; WOFF2 locales, guards de impresión/movimiento, preimpresión CV y artifact scan sin hosts visuales externos | Matriz responsive aprobada; teclado/zoom, offline y diálogo nativo de impresión pendientes |
| **Spec 208** | No modifica el baseline backend | 217/217, más 23/23 focalizadas | Build Vite de 559 módulos en 2,17 s; browser Estudiante con paridad de rutas, DOM semántico, consola limpia y matriz 320-1440 px PASS | Implementación ATS `[I]`; perfil de dos páginas, diálogo nativo y Poppler completo bloqueados, sin afirmación universal ni `[V]` |
| **Spec 209** | 216/216 | 220/220 | Builds limpios e introspección HTTP 200 con `confirmStudentCareer(careerId)` | Confirmación Estudiante posterior pendiente |
| **Spec 210** | No modifica el baseline backend | 223/223, más 20/20 focalizadas | Vite 559 módulos en 1,31 s; tema persistido/efectivo y lockup cubiertos | Matriz visual 320-1440 px pendiente |
| **Spec 211** | 216/216 | 224/224, más 6/6 focalizadas | Backend Release 0/0, EF sin drift, Vite 559 módulos en 733 ms, paquete oficial con lockfile SHA-512; Firefox nativo 1440 x 1000, WOFF2 local y cero diagnósticos propios de fuente | `[V]`; procesos y artefactos temporales limpiados |
| **Spec 212** | No modifica el baseline backend | 225/225, más 9/9 focalizadas | Vite 560 módulos en 793 ms; selección exacta de logo completo por `effectiveTheme`, Header solo isotipo y Home claro inspeccionado | `[I]`; matriz visual dark/light responsive pendiente |
| **Spec 213** | 216/216 | 232/232, más 46/46 focalizadas | Builds sin warnings; build header e introspección Release de tres operaciones críticas PASS con cleanup | `[I]`; aceptación Microsoft real post-cambio pendiente |
| **Spec 214** | 218/218 | 237/237, más 26/26 focalizadas | Builds sin warnings, EF sin drift, carrera única backend, confirmación UI e invalidación académica | `[I]`; recorrido onboarding -> feed -> perfil pendiente |
| **Spec 215** | 230/230 | 240/240, más 44/44 uploads y 12/12 perfil/upload | Builds sin warnings, Compose productivo válido y EF sin drift; provider explícito, timeout, cancelación, 503 sanitizado e hidratación atómica | `[I]`; browser local y Cloudinary real pendientes |
| **Spec 216** | 234/234, más 14/14 focalizadas | 249/249, más 16/16 focalizadas | Builds sin warnings; bordes 0/1/15/16, Strict Mode, concurrencia, deduplicación, error y aislamiento por carrera | `[I]`; browser con dataset >15 pendiente |
| **Spec 217** | No modifica backend | 251/251, más 17/17 focalizadas | Vite 565 módulos; Home claro 320/768/1440 sin overflow o headings truncados; enlaces externos seguros y consola limpia | `[I]`; contraste dark y reduced-motion perceptual pendientes en el SHA candidato |
| **Spec 218 preflight** | 234/234 | 251/251 | Builds, EF, Compose, Redis/Mailpit, base demo, seis logins, ocho dominios, audit clasificado y cleanup PASS | No es SHA candidato; browser por roles, dos sesiones y congelamiento pendientes |

La referencia operativa para el siguiente gate es **234 tests backend y 251 frontend**.
Spec 218 ya los ejecutó juntos, pero sobre un worktree mutable. El árbol todavía debe
convertirse en un commit candidato y repetir o vincular ambos gates a ese mismo SHA antes
de declarar `CF-06`.

### 8.2 Evidencias que debe producir el gate final

| Gate | Resultado requerido | Evidencia mínima |
|---|---|---|
| Backend tests | 234/234 o mayor, sin fallos | Comando, SHA, fecha, duración y salida completa |
| Frontend tests | 251/251 o mayor, sin fallos | Comando, SHA, fecha y salida completa |
| Backend Release | 0 warnings / 0 errores | Build sobre el mismo SHA |
| Frontend Vite | Build limpio | Cantidad de módulos, duración y artefacto generado |
| EF model drift | Sin cambios pendientes | Modelo, última migración y destino SQL identificados |
| Base demo | Seeder idempotente e integridad PASS | Inventario, seis roles, cero huérfanos/XOR inválidos |
| GraphQL | Schema y operaciones críticas PASS | Auth, feed, académico, chat, jobs, admin y moderación |
| Session boundary | A -> logout -> B sin datos residuales | Apollo, WebSocket, storage, mensajes y notificaciones |
| Realtime | Dos sesiones aisladas | Handshake, evento, topic correcto, lectura y reconexión |
| Navegador | Consola sin errores propios | Checklist por rol y capturas de flujos principales |
| Seguridad de archivos | Payloads hostiles rechazados | Magic bytes, truncado, tamaño y ausencia de persistencia |

### 8.3 Limitaciones explícitas de la auditoría

1. No se dispone de credenciales reales de SMTP, Redis administrado, Cloudinary ni
   Microsoft Entra institucional dentro del repositorio; correctamente, no deben
   incorporarse para facilitar la auditoría.
2. Los smokes locales demuestran compatibilidad de adaptadores y contratos, pero no
   validan TLS, cuotas, latencia, políticas, firewalls ni disponibilidad de terceros.
3. La aceptación automática no reemplaza la regresión visual en navegadores ni las
   preguntas exploratorias por rol.
4. No se ejecutó una prueba formal de carga, pentest externo, SAST/DAST corporativo ni
   antivirus/CDR. Estos controles exceden el MVP y condicionan una exposición pública.
5. `npm audit --omit=dev` se reejecutó el 05/08/2026 y reportó dos advisories moderados
   de React Router 6.30.4. La única corrección automática propuesta migra a 7.x y rompe
   compatibilidad; se mantiene la sanitización de destinos y la aceptación explícita
   `RR-09` hasta ejecutar esa evolución fuera del Code Freeze.
6. Las referencias de líneas del registro histórico corresponden al archivo en la fecha
   de hallazgo y pueden desplazarse por refactors posteriores.

### 8.4 Recomendación final

Se recomienda mantener **Code Freeze** y no agregar nuevas funcionalidades antes de la
mesa. Solo deben aceptarse correcciones de defectos reproducibles que bloqueen la demo,
acompañadas por prueba de regresión y actualización de evidencia.

Para la defensa, el sistema debe describirse como:

> **Release Candidate académico, core Feature Complete y Code Freeze operativo local,
> con producción pública condicionada a proveedores, tenant institucional, observabilidad
> y controles de destino.**

Esta formulación es técnicamente defendible porque diferencia alcance, implementación,
verificación local y aceptación productiva. Evita tanto subestimar el trabajo realizado
como sobreprometer controles que aún dependen de infraestructura externa.

### 8.5 Definition of Done de auditoría y congelamiento

1. El corte de Specs 198-201 está integrado y publicado en una rama/commit identificable.
2. El worktree del SHA candidato no contiene secretos, fixtures personales ni archivos
   auxiliares sin decisión explícita.
3. Todos los gates de la sección 8.2 pasan sobre ese mismo SHA o registran una desviación
   con impacto, responsable y decisión.
4. Los seis roles y los flujos realtime/B2B se recorren manualmente sin errores propios
   de consola.
5. Roadmap, este informe, estado documental, memoria y presentación citan el mismo SHA,
   fecha, métricas y limitaciones.
6. La base demo posee backup verificable y puede reconstruirse sin depender de datos
   históricos manuales.
7. Ningún gate externo figura como `[V]` sin secretos, ambiente y evidencia reales.
8. El commit presentado queda etiquetado o registrado de forma inmutable y existe un
   respaldo offline recuperable.

### 8.6 Decisión Go/No-Go por destino al 5 de agosto de 2026

| Destino | Decisión actual | Condición para avanzar |
|---|---|---|
| Demo académica local controlada | **GO condicional** | Congelar SHA, repetir gate integrado, completar seis roles y realtime, y conservar plan de contingencia |
| Congelamiento técnico del candidato | **NO-GO temporal** | `REL-001`/`CF-01` a `CF-06`: worktree integrado, limpio, publicado y validado sobre el mismo SHA |
| Paquete para imprenta | **NO-GO temporal** | `DF-01`, `DF-03` a `DF-06` y `DEL-001`: figuras, DOCX/PDF, revisión visual/APA y envío el 4 de agosto |
| Piloto institucional abierto | **NO-GO** | Cerrar `GAP-FILE-01`, aceptar Microsoft Entra y completar controles operativos/de privacidad del destino |
| Producción pública | **NO-GO** | Además del piloto: TLS SQL real, SMTP/Redis/storage administrados, observabilidad, backup/restore, alertas, antivirus/CDR y pruebas de carga/seguridad |

El preflight automatizado conjunto queda verde hasta Spec 218, pero los
gates aún deben repetirse o vincularse al SHA candidato una vez creado. Esta evidencia no
autoriza por sí sola el congelamiento ni la impresión. La demo pasa a **GO definitivo**
solo cuando las condiciones locales y documentales anteriores tengan evidencia fechada.
