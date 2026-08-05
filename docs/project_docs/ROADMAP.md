# Roadmap único de OneITB23

**Ultima revision**: 2026-08-05

## 1. Estado ejecutivo y criterio de medición

| Indicador | Estado | Evidencia o alcance |
|---|---|---|
| Avance contabilizado | **100% (117/117)** | 109 ítems funcionales/operativos más 8 remediaciones de auditoría |
| Verificación runtime `[V]` | **46 ítems** | Flujos ejecutados contra runtime, base o infraestructura local según su alcance |
| Implementación comprobada `[I]` | **71 ítems** | Código, tests, builds, migraciones o pruebas aisladas; pueden conservar aceptación manual/externa |
| Backend automatizado más reciente | **234/234** | Spec 218 repitió la suite junto al frontend sobre el mismo worktree; todavía no equivale a evidencia sobre SHA candidato |
| Frontend automatizado más reciente | **251/251** | Spec 218 repitió la suite junto al backend sobre el mismo worktree; falta congelar y repetir/vincular el SHA |
| Estado de entrega | **Release Candidate académico** | Core Feature Complete y Code Freeze operativo local; preparación documental y logística pendiente |

El **100%** expresa que el alcance funcional comprometido y las ocho remediaciones de
auditoría incluidas en el denominador están implementados. No significa despliegue cloud
productivo ni finalización material de la defensa. La aceptación con proveedores reales,
la regresión visual final, la exportación DOCX/PDF, la presentación y la logística se
administran como gates separados y no inflan ni reducen el 117/117.

Las Specs 194-196 verificaron los recorridos principales, la infraestructura local y la
base demo canónica. La Spec 197 implementó Microsoft Entra ID; la 198 incorporó el alta
B2B de empleadores; la 199 agregó configuración multi-tenant y onboarding académico; y
la 200 reemplazó el popup institucional por redirect, callback aislado e intercambio
GraphQL idempotente. La Spec 202 alineó y endureció el contrato exacto de redirect local;
la 203 corrigió la carrera entre MSAL, el commit de `AuthContext` y los guards. El
recorrido real con una cuenta Microsoft 365 ya alcanzó onboarding y muro; `PR-04`
permanece abierto solo para cancelación/error, logout y aislamiento de segunda cuenta.

Este documento es la única fuente de avance, estabilización, deuda y prioridades. Ante
una contradicción prevalecen, en este orden: código y esquema ejecutado, evidencia de la
spec, este roadmap y documentación narrativa. No existe un roadmap paralelo.

### 1.1 Qué queda fuera del 117/117

1. **Cierre técnico del corte**: integración Git, worktree limpio, gates de predefensa,
   regresión manual por roles, realtime con dos sesiones y congelamiento del SHA.
2. **Entrega académica**: portada definitiva, diagramas exportados, DOCX/PDF, presentación,
   guion, ensayo, impresión y respaldos.
3. **Gates externos de producción**: SMTP público, Redis administrado, Cloudinary real,
   aceptación Microsoft Entra, benchmark BCrypt, observabilidad y antivirus/CDR.
4. **Evolución posterior**: Azure App Service/SQL y ecosistema móvil.

## 2. Convención de estados

- `[x] [V]`: completado y verificado mediante runtime.
- `[x] [I]`: implementado con evidencia de codigo, build, migracion o prueba aislada; puede requerir regresion runtime.
- `[ ] [P]`: pendiente.
- `[ ] [B]`: implementacion o validacion bloqueada por una condicion concreta.

Los porcentajes cuentan ítems `[x]`. La etiqueta conserva la diferencia entre
implementación y verificación. Un ítem `[I]` no debe promoverse a `[V]` por inferencia:
requiere evidencia runtime proporcional al riesgo y al contrato afectado.

## 3. Alcance funcional consolidado

### 3.1 Módulo 1 - Identidad, cuentas y seguridad: 100% (9/9)

- [x] [V] Relacion 1:1 `Account`-`User` y passwords BCrypt `char(60)`.
- [x] [V] Registro estudiantil institucional y login con JWT: dominio backend, anti-enumeración y limitador específico por origen/identidad.
- [x] [V] Bloqueo de acceso para cuentas inactivas.
- [x] [V] Expiracion JWT, pipeline de autenticacion y CORS restringido.
- [x] [V] Sesion frontend normalizada sobre `token` y `user`.
- [x] [V] Autorizacion por roles en operaciones sensibles.
- [x] [V] Flujo Magic Link para empleadores con JWT firmado, expiracion y consumo atomico de un solo uso.
- [x] [I] Suite automatizada backend de registro, login, cuentas inactivas y autorizacion administrativa.
- [x] [I] Lockout persistente por cuenta ante fuerza bruta de login, con tests automatizados.

### 3.2 Módulo 2 - Perfiles e identidad social: 100% (8/8)

- [x] [V] Perfil publico y perfil propio autenticado.
- [x] [V] Edicion aislada del perfil y CV con persistencia relacional normalizada, cancelacion limpia e impresion formal A4.
- [x] [V] Biografia, avatar defensivo, contacto, metricas de aportes y redes sociales.
- [x] [V] Asociacion de usuarios a multiples carreras desde perfil.
- [x] [I] Resumen de publicaciones en perfil publico.
- [x] [I] Roles diferenciados e insignias de participacion.
- [x] [I] Seguir/dejar de seguir con estado explicito e idempotente, ademas de silenciar y bloquear usuarios sin sobrescribir relaciones compatibles.
- [x] [I] Controles de privacidad con masking backend-side: Follow unilateral no concede acceso; solo propietario, Administrador o Moderador ven datos sensibles de un perfil privado.

### 3.3 Módulo 3 - Carreras y materias: 100% (7/7)

- [x] [I] CRUD y estado activo de carreras.
- [x] [I] Materias asociadas obligatoriamente a una carrera.
- [x] [I] Anio de cursada validado entre 1 y 6.
- [x] [I] Correlatividades N:M con integridad restrictiva.
- [x] [I] Inscripcion de usuarios a multiples carreras, con onboarding obligatorio para Estudiantes sin identidad academica persistida.
- [x] [I] Selectores en cascada carrera-materia en feed y administracion.
- [x] [I] Progreso academico, cursadas y notas por usuario.

### 3.4 Módulo 4 - Feed, comentarios y multimedia: 100% (25/25)

- [x] [V] `Inquiry` vinculada a autor y materia sin N+1.
- [x] [V] Creacion, lectura, refetch y persistencia de publicaciones.
- [x] [I] Busqueda y filtros por carrera y materias.
- [x] [I] Edicion de texto/adjuntos y soft-delete de publicaciones exclusiva del autor.
- [x] [V] Comentarios limitados a dos niveles; responder a una respuesta conserva la raiz, registra destinatario dirigido y muestra mencion sin crear un tercer nivel.
- [x] [I] Edicion de texto/adjuntos y soft-delete de comentarios exclusiva del autor.
- [x] [V] Reacciones con contador.
- [x] [V] Reportes comunitarios.
- [x] [I] Prioridad de seguidos y exclusion de silenciados/bloqueados, sin consultas por publicacion y con orden cronologico secundario cubierto por tests.
- [x] [I] Upload desacoplado y `Inquiry.FileUrl`.
- [x] [I] Adjuntos persistentes en comentarios y respuestas.
- [x] [I] Imagenes inline con URL de backend, tarjetas de documentos y YouTube con miniatura previa y carga por click sobre `youtube-nocookie`.
- [x] [I] Previsualizacion de enlaces via GraphQL autenticado con controles SSRF.
- [x] [V] Regresion end-to-end de uploads/rich media con backend local disponible.
- [x] [V] Limpieza de archivos huerfanos cuando GraphQL falla tras el upload.
- [x] [V] Paginacion o scroll incremental del feed.
- [x] [I] Pruebas automatizadas backend de publicaciones, comentarios, archivos, busqueda, scoping y reacciones.
- [x] [V] Selector de materias limitado a carreras propias, agrupado por carrera y ordenado por anio/nombre, con validacion backend contra bypass.
- [x] [V] Adjuntos multiples con nombre original en publicaciones, comentarios y respuestas, maximo 10 archivos y 15 MB agregados.
- [x] [I] Portada persistente sin recorte y adaptada por orientacion, mosaico mixto acotado que preserva hasta dos videos de YouTube y calcula overflow `+X`, galeria/carrusel e imagen de primera pagina PDF por worker local diferido; visor completo por Blob URL sin relajar protecciones anti-framing.
- [x] [V] Reacciones persistentes en comentarios/respuestas y listado paginado de usuarios que reaccionaron a publicaciones propias.
- [x] [V] Notificaciones sociales agrupadas persistentemente, reabiertas como una unica fila no leida, con badge calculado solo por `IsRead == false` y enlaces a publicacion/comentario exactos cuando corresponde.
- [x] [I] Footer institucional y eliminacion del compositor legacy duplicado del sidebar para conservar un unico flujo de publicacion.
- [x] [I] Enlaces compartibles por publicacion con deep-link estable y feedback controlado.
- [x] [I] Drag-and-drop de adjuntos, restauracion de foco en visores y fallback defensivo para previews rotas.

### 3.5 Módulo 5 - Mensajería privada: 100% (9/9)

- [x] [V] Persistencia de mensajes uno a uno.
- [x] [V] Contactos e historial paginados.
- [x] [V] Queries y mutations autenticadas por participante.
- [x] [V] Subscription privada con JWT por WebSocket.
- [x] [V] UI optimista, deduplicacion y reconciliacion al reconectar.
- [x] [V] Busqueda de contactos y mensajes.
- [x] [I] Integracion entre chat completo y widget sin updates cruzados.
- [x] [I] Reemplazar pub/sub en memoria por transporte distribuido Redis configurable.
- [x] [I] Badges de no leidos independientes en navegacion/widget minimizado y recordatorio persistente, acotado e idempotente para mensajes con mas de una hora, respetando preferencias.

### 3.6 Módulo 6 - Administración y moderación: 100% (10/10)

- [x] [I] Gestion de usuarios, roles y estado.
- [x] [I] Proteccion de cuentas administradoras y promocion con password.
- [x] [I] Gestion de carreras, materias y correlatividades.
- [x] [V] Flujo de reportes comunitarios.
- [x] [I] Explorador de publicaciones y comentarios.
- [x] [I] Silenciamiento temporal por moderadores.
- [x] [I] Metricas, short IDs y jerarquia visual por rol.
- [x] [V] Seed administrado e idempotente.
- [x] [V] Auditoria persistente de acciones administrativas y moderacion reversible con motivo, separada de la edicion exclusiva del autor.
- [x] [V] Regresion runtime del panel tras cambios de materias y superadmin.

### 3.7 Módulo 7 - Empleos y Gestor de Postulaciones: 100% (10/10)

- [x] [I] Entidad `JobOffer` con FK explicita a `User` y `DeleteBehavior.Restrict`.
- [x] [I] Entidad `JobApplication` con estados `Pending`, `Reviewed` y `Rejected`, FKs restrictivas e indice unico por oferta/postulante.
- [x] [I] GraphQL `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus` y subscription `jobOfferCreated`.
- [x] [I] Vista `/empleos` con skeletons, empty state, tarjetas laborales, postulacion GraphQL, estado `Postulado` y deep-link que enfoca/resalta la oferta exacta.
- [x] [I] Vista `/empleos/mis-ofertas` como Gestor de Postulaciones con postulantes, filtros por estado, perfil academico y acciones de revision/rechazo.
- [x] [I] Badge realtime en Nav para nuevas ofertas laborales y limpieza al ingresar a `/empleos`.
- [x] [V] Alertas por correo SMTP para cambios de estado de postulaciones: contrato de empleo cubierto y adaptador de red verificado contra Mailpit local; proveedor SMTP publico permanece como gate externo.
- [x] [I] Seeder enterprise con empleadores, ofertas laborales, postulaciones y notificaciones persistentes.
- [x] [I] QA/security del gestor: validacion por rol, ownership estricto de oferta, auditoria persistente y build/migracion sin errores.
- [x] [I] Onboarding B2B de empleadores: solicitud publica con anti-enumeracion y rate limiting, revision Admin, aprovisionamiento atomico de cuenta `Empleador`, auditoria sanitizada y entrega reintentable de Magic Link mediante Outbox.

### 3.8 Módulo 8 - Recursos y seguimiento académico: 100% (6/6)

- [x] [I] Entidad y repositorio de recursos academicos independiente del feed.
- [x] [I] Permisos de recursos/progreso por rol y carrera: Profesor acotado a materias de carreras vinculadas; Administrador global.
- [x] [I] Busqueda, categorias y versionado de recursos.
- [x] [I] Visualizacion de notas y progreso academico.
- [x] [I] Adaptador o simulador desacoplado para SIU Guarani.
- [x] [I] Preferencias de notificacion por materia.

### 3.9 Módulo 9 - Calidad, operación y escalabilidad: 100% (20/20)

- [x] [I] Stack normalizado en .NET 8, EF Core 8 y HotChocolate 14.
- [x] [I] FKs explicitas, `DeleteBehavior.Restrict` y soft-delete social.
- [x] [I] Builds Release/Vite y gates de migraciones documentados.
- [x] [I] Documentacion consolidada y fuentes de verdad definidas.
- [x] [I] Evidencia por spec y development log cronologico inverso.
- [x] [I] Base de pruebas unitarias del backend para servicios academicos, notificaciones, autenticacion y feed social.
- [x] [I] Baseline de pruebas de componentes y estado frontend con Vitest y Testing Library.
- [x] [I] Baseline de pruebas de integracion GraphQL con executor real de HotChocolate y EF Core de prueba.
- [x] [I] Pipeline CI para build, tests y validacion de modelo EF sin secretos versionados.
- [x] [V] Logging estructurado, metricas basicas de request y trazabilidad de errores con correlation id.
- [x] [V] Entorno local reproducible sin bloqueo de SQL SSPI/certificado HTTPS.
- [x] [V] Limpieza de warnings de compilacion (Vite chunk size y .NET nullability).
- [x] [I] Actualizacion controlada de dependencias y division del bundle frontend.
- [x] [I] Sistema visual Clean Tech / Tech Noir con tema persistente, branding OneITB definitivo, textura global tenue, landing premium, Header institucional auto-hide accesible, Footer unificado y superficies principales dual-theme.
- [x] [I] Dockerizacion productiva multi-stage para API .NET y frontend Nginx con reverse proxy SPA/WebSocket.
- [x] [I] Orquestacion productiva `docker-compose.prod.yml` con SQL Server, Redis, API y frontend sin secretos versionados; conexión SQL completa inyectada sin trust bypass predeterminado.
- [x] [I] Almacenamiento por provider explícito: disco local limitado a Development y
  Cloudinary fail-closed para Production en `/api/upload`.
- [x] [I] Hardening HTTP productivo con rate limiting por IP, probes `/health/live` y `/health/ready`, correlation ID y security headers.
- [x] [I] Hardening GraphQL anti-DoS con profundidad maxima y paging global configurable.
- [x] [I] Seeding demo/productivo configurable, idempotente y sin reset de passwords existentes.

### 3.10 Módulo extra - Características de alto impacto: 100% (5/5)

- [x] [I] Trazabilidad academica transversal mediante `AuditLog` y `SaveChangesInterceptor` de EF Core para entidades criticas.
- [x] [I] Generacion de constancias y exportacion CSV/impresion formal desde el modulo academico.
- [x] [I] Integracion institucional Microsoft Entra ID organizacional multi-tenant mediante MSAL Authorization Code + PKCE, validacion criptografica tenant-specific del access token de la API y emision del JWT canonico OneITB; la aceptacion con Microsoft 365 real permanece como gate externo.
- [x] [I] Credenciales digitales publicas para progreso aprobado mediante ruta `/certificate/{id}` y query GraphQL publica limitada.
- [x] [I] Toast notifications globales conectadas a GraphQL Subscriptions existentes.

## 4. Horizontes técnicos y evolución posterior

Las etiquetas P0-P4 se conservan como trazabilidad de las prioridades que llevaron el
proyecto al Release Candidate actual. Ya no representan una cola activa de desarrollo:
están cerradas o sujetas únicamente a conservación durante el Code Freeze. P5 y P6 son
evolución posterior a la defensa y no forman parte del alcance académico contabilizado.

### 4.1 P0 - Estabilización inmediata: cerrada y en conservación

1. Mantener el Code Freeze funcional: aceptar solo defectos reproducibles con prueba de regresion.
2. Conservar Docker SQL como runtime local canonico para evitar SSPI/LocalDB.
3. Conservar la base demo canonica mediante `scripts/reset-demo-database.ps1` solo
   cuando sea necesario y ejecutar `scripts/validate-demo-database.ps1` antes de la
   auditoria funcional final.
4. Ejecutar `scripts/validate-predefense.ps1` antes de la defensa y de cada entrega.
5. Validar SMTP, Redis y Cloudinary solo cuando existan secretos no versionados y un ambiente aprobado.

### 4.2 P1 - Cierre del núcleo social: cerrado

1. Paginacion del feed: verificada en runtime contra Docker SQL.
2. Limpieza de uploads huerfanos: verificada en runtime contra Docker SQL.
3. Auditoria persistente de moderacion: verificada en runtime contra Docker SQL.
4. Adjuntos multiples, reacciones de comentarios y notificaciones agrupadas: verificados por tests y smoke GraphQL autenticado contra Docker SQL.

### 4.3 P2 - Alcance académico y empleabilidad: cerrado

1. Cerrado a nivel de implementacion y hardening tecnico; el hub academico fue recorrido con Estudiante y Profesor durante la Spec 194.
2. Empleos y Gestor de Postulaciones fueron recorridos con Egresado y Empleador durante la Spec 194.

### 4.4 P3 - Escalabilidad y operación: base implementada

1. `[x] [V]` Pub/sub distribuido Redis, activado por `ConnectionStrings:Redis` y fallback InMemory local; entrega exacta e aislamiento de topic verificados entre dos proveedores independientes contra Redis Docker.
2. `[x] [I]` Almacenamiento compartido con selección explícita por
   `FileStorage:Provider`: `Local` solo en Development y `Cloudinary` fail-closed en
   Production, con timeout, cancelación y correlación sanitizada.
3. `[x] [I]` Hardening operativo: rate limiting, security headers, healthcheck y auditoria npm sin hallazgos altos/criticos; dos avisos moderados upstream de React Router quedan documentados y el destino interno de notificaciones se sanitiza.
4. `[x] [I]` Hardening GraphQL anti-DoS: profundidad maxima configurable y limites globales de paginacion.
5. `[x] [I]` SSO institucional Microsoft Entra ID organizacional multi-tenant; configuracion fail-closed, vinculacion segura por `tid`, auditoria y limpieza de sesion implementadas. El consentimiento y smoke real permanecen en `PR-04`.

### 4.5 P4 - Contenedores y CI/CD: base implementada

1. `[x] [I]` Dockerizacion del entorno local y de produccion.
2. `[x] [I]` Integracion y despliegue continuo con GitHub Actions.

### 4.6 P5 - Despliegue cloud: evolución postdefensa

1. `[ ] [P]` Migracion y despliegue del backend en Azure App Service F1. Estimacion:
   **8-12 h**, una vez definida la suscripcion, region, variables y estrategia de rollback.
2. `[ ] [P]` Migracion y alojamiento de base de datos en Azure SQL Free Tier. Estimacion:
   **6-10 h**, incluyendo backup, migraciones, smoke de integridad y plan de retorno.
3. `[x] [I]` Integracion de Cloudinary para el alojamiento de imagenes y archivos estaticos.

### 4.7 P6 - Ecosistema móvil: evolución postdefensa

1. `[ ] [P]` Inicializacion del proyecto movil con React Native + Expo. Estimacion:
   **8-12 h** para estructura, autenticacion y navegacion base.
2. `[ ] [P]` Sincronizacion del estado y cache Apollo entre Web y Mobile. Estimacion:
   **16-24 h** para contratos, persistencia segura y pruebas de cambio de sesion.
3. `[ ] [P]` Compilacion de APK y distribucion en entornos de prueba. Estimacion:
   **6-10 h** luego de cerrar los dos puntos anteriores.

## 5. Trazabilidad del cierre técnico

Esta sección explica cómo se alcanzó el estado actual. No duplica el denominador de los
módulos: solamente las ocho remediaciones 186-193 forman parte de los 117 ítems. Las
Specs 194-201 son aceptación, rebaseline, ampliaciones aprobadas o cierre de auditoría y se documentan sin
alterar retroactivamente el porcentaje.

### 5.1 Auditoría de cierre y seguridad - Etapa 1: 100% (4/4)

- [x] [V] **Spec 186 - Employer Authentication JWT Remediation**: emision JWT centralizada, sin tokens mock/placeholder, Magic Link atomico y validado contra SQL Server Docker.
- [x] [V] **Spec 187 - Mutation Cancellation Propagation**: `CancellationToken` propagado desde todas las mutaciones asincronas hasta EF Core y efectos soportados, con guard automatizado.
- [x] [V] **Spec 188 - Apollo Logout Session Isolation**: frontera de sesion idempotente para React, Apollo HTTP/cache y WebSocket, con regresion A -> B automatizada y browser smoke limpio.
- [x] [V] **Spec 189 - Declarative GraphQL Mutation Authorization**: matriz declarativa completa, ampliada por Spec 197 a 43 mutaciones y cinco entradas publicas; controles contextuales de ownership preservados.

### 5.2 Auditoría de cierre y seguridad - Etapa 2: 100% (4/4)

- [x] [V] **Spec 190 - Upload and Magic Link Abuse Hardening**: inspeccion binaria/estructural previa a storage y limites especificos por operacion, origen e identidad; upload valido/hostil/truncado y limites de Magic Link con recuperacion cuentan con evidencia ejecutada.
- [x] [V] **Spec 191 - Async Query and Pagination Hardening**: I/O social asincronico y cancelable, contrato ilimitado retirado y paginacion social/academica verificadas con orden, limite, deduplicacion, filtro de autor y autorizacion.
- [x] [V] **Spec 192 - Credential Delivery and Cryptographic Policy Hardening**: respuesta generica, pickup local, digest SQL y consumo unico verificados; SMTP real permanece como gate externo bloqueado y no afecta la validacion del fallback de Development.
- [x] [V] **Spec 193 - Social Policy and UI Bootstrap Resilience**: silenciamiento like/unlike verificado sin persistencia ni notificaciones; browser limpio y aislamiento A -> logout -> B comprobado.

### 5.3 Aceptación operacional final - Spec 194

La Spec 194 cerro los gates locales controlables con 147 pruebas backend, 79 frontend,
builds Release/Vite, modelo EF sincronizado, pruebas runtime focalizadas y recorridos de
Estudiante, Profesor, Egresado, Administrador y Empleador. Los bloqueos locales de
identidad Moderador, Redis y SMTP capturado fueron tratados por la Spec 195.

### 5.4 Aceptación de infraestructura local y Moderador - Spec 195

La Spec 195 agrego una identidad Moderador canonica e idempotente, probo su JWT y sus
limites de autorizacion, y verifico el reemplazo de sesion Estudiante -> Moderador. Un
Compose de aceptacion efimero ejecuto Redis 7 y Mailpit con pruebas reales de entrega
cross-provider, aislamiento de topics y tres correos inspeccionados sin secretos. El gate
finito no inicia API/Vite, preserva SQL y elimina contenedores/puertos en `finally`.

Permanecen `[B]` el SMTP publico, Cloudinary, la aceptacion Microsoft Entra en el tenant
institucional y el handshake WebSocket de red con dos navegadores; Redis local y Mailpit
no se presentan como validacion cloud.

### 5.5 Aceptación de base demo canónica - Spec 196

La Spec 196 elimino la dependencia de datos historicos del puesto de desarrollo. El
procedimiento protegido genero y verifico un backup, reconstruyo `OneItb` desde 32
migraciones y ejecuto dos veces el seeder con inventario identico. El grafo resultante
incluye 15 cuentas/usuarios, 9 carreras, 6 materias, recursos/progreso academico, CV,
muro, interacciones, 280 mensajes, 127 notificaciones y el modulo de empleos.

La aceptacion finita obtuvo cero violaciones relacionales, autentico Administrador,
Moderador, Profesor, Estudiante, Egresado y Empleador, y probo feed, academico, chat,
notificaciones, empleos, administracion, moderacion y upload. Ese corte mantuvo el 99%
porque se trato de estabilizacion operativa y documental; la feature institucional que
faltaba fue implementada posteriormente por la Spec 197.

### 5.6 Identidad institucional Microsoft Entra ID - Spec 197

La Spec 197 reemplazo el plan Google OAuth por la plataforma que utiliza la institucion:
Microsoft Entra ID/Microsoft 365. La SPA usa MSAL con Authorization Code + PKCE,
autoridad organizacional multi-tenant `common`, scope delegado propio de la API y cache
en `sessionStorage`.
El backend valida firma RS256, emisor, audiencia, vigencia, `tid`, `oid`, scope y dominio
institucional antes de vincular o aprovisionar una cuenta sin privilegios y emitir el
JWT local. No persiste tokens externos ni secretos; logout limpia MSAL, Apollo y
WebSocket. La migracion agrega identidad externa unica y password local nullable solo
para cuentas SSO-only. Tests, builds, EF y schema runtime cuentan con evidencia; el
consentimiento y la prueba con una cuenta real del tenant siguen en `PR-04`.

### 5.7 Onboarding B2B de empleadores - Spec 198

La Spec 198 cierra el alta controlada de empresas externas sin habilitar un registro
publico directo con privilegios. La solicitud valida CUIT, normaliza datos, aplica
honeypot antes de procesar campos, rate limiting con claves HMAC y respuesta generica
ante duplicados. Solo Administradores pueden consultar PII, aprobar, rechazar o
reintentar la entrega.

La aprobacion utiliza una transaccion serializable para crear exactamente una cuenta y
un usuario con rol canonico `Empleador`, registrar auditoria y persistir un mensaje de
Outbox. El worker entrega un Magic Link de un uso con lease y reintentos acotados; un
fallo SMTP no revierte la identidad ya aprobada. La migracion, schema, flujo GraphQL y
pickup local cuentan con evidencia automatizada. La regresion visual de
`/empleos/solicitud` y la pestaña administrativa queda como recorrido manual previo a
la defensa y no se presenta como ejecutada.

### 5.8 UX B2B y configuración académica inicial - Spec 199

La Spec 199 unifica la configuracion publica de Microsoft Entra: el client ID canonico
tiene precedencia sobre el alias temporal, `common` se acepta como autoridad
organizacional y una configuracion parcial mantiene oculto el acceso. El Header publico
expone `Soy empresa` en escritorio y movil reutilizando `/empleos/solicitud`.

Antes de montar el layout privado, `RequireAcademicOnboarding` relee el perfil canonico
y valida que pertenezca a la sesion actual. Solo `Estudiante` sin carreras es dirigido
a `/onboarding/academic`; el guard no afecta otros roles. La seleccion persiste mediante
GraphQL y el acceso se habilita exclusivamente despues de que `me` confirme la carrera.
Tests y build cuentan con evidencia automatizada; la regresion visual y el tenant real
permanecen pendientes sin alterar el 117/117.

### 5.9 Autenticación Microsoft por redirect - Spec 200

La Spec 200 elimina el flujo popup que podia reingresar a `/login` y producir
`block_nested_popups`. La SPA usa `loginRedirect`, conserva MSAL en
`/auth/microsoft/callback` y bloquea cualquier segunda accion mientras el estado de
interaccion sea distinto de `None`. El callback no muestra botones de acceso: selecciona
la cuenta retornada, adquiere silenciosamente el access token delegado y ejecuta una
sola vez `microsoftLogin` y la frontera canonica de sesion/Apollo.

Un descriptor efimero de pestaña no contiene credenciales, limita su vigencia y solo
restaura destinos internos sanitizados. La barrera de promesas por flow ID evita
duplicados por rerender o Strict Mode y libera el intento ante error explicito. Las 144
pruebas frontend y el build Vite cuentan con evidencia automatizada; el recorrido con
Microsoft 365 real permanece en `PR-04` sin alterar el 117/117.

### 5.10 Cierre de auditoría documental y autorización - Spec 201

La Spec 201 procesó la bitácora `temp_audit_review.md` y cerró las brechas controlables
sin expandir el alcance funcional. El registro público ahora es Student-only, valida el
dominio institucional en backend, evita enumerar duplicados y aplica limitación específica
por origen e identidad. El Profesor queda acotado a materias de carreras vinculadas en
recursos, listados y progreso. Follow dejó de habilitar datos sensibles de perfiles
privados. La plantilla productiva exige una cadena SQL externa sin trust bypass y la API
separa liveness de readiness SQL.

Sobre el worktree actual pasaron backend **198/198**, frontend **144/144**, builds Release/
Vite y EF sin drift. Esta evidencia permite afirmar remediación técnica, pero `REL-001`
sigue abierto hasta repetir el gate sobre un SHA limpio. `GAP-FILE-01`, observabilidad
central, proveedores reales y los entregables DOCX/PDF/figuras conservan sus gates
explícitos.

### 5.11 Alineación y aceptación del redirect Microsoft Entra - Spec 202

La Spec 202 respondió al `AADSTS50011` observado con la cuenta institucional. La
auditoría segura confirmó que frontend y backend ya utilizan la configuración Entra
esperada y que la SPA solicita exactamente
`http://localhost:5173/auth/microsoft/callback`; por lo tanto, la causa se acotó a la
URI ausente o distinta en la App Registration indicada por el `client_id`.

El frontend ahora solo admite callbacks HTTP en `localhost`/loopback, exige HTTPS para
hosts remotos y rechaza query, fragmento o credenciales embebidas. Las pruebas Entra
focalizadas pasaron 46/46, la suite frontend 151/151 y Vite compiló 551 módulos en
862 ms. El guardado de la URI bajo plataforma SPA y el recorrido real de éxito,
cancelación/reintento, logout y aislamiento de una segunda cuenta continúan formando el
gate externo `PR-04`; no se debilitaron CORS ni CSP para ocultar warnings de Microsoft.

### 5.12 Commit de sesión posterior al redirect Microsoft - Spec 203

Una vez registrada la URI SPA, Microsoft volvió correctamente a OneITB pero el navegador
terminaba otra vez en `/login`. La causa no era CORS ni la telemetría de Microsoft:
`AuthContext.login` borraba MSAL también para accesos Microsoft y el callback navegaba
antes de que React confirmara la nueva identidad ante el guard privado.

La frontera de sesión ahora conserva MSAL solo durante el establecimiento Microsoft y
mantiene la limpieza completa para password, empleador, logout, expiración y reemplazo de
cuenta. El callback separa intercambio y commit, deduplica el canje y navega únicamente
cuando el contexto expone el mismo usuario y un JWT OneITB. `/login` incorpora una
recuperación defensiva para sesiones ya comprometidas. La ampliación de hardening purga
sesiones parciales, preserva los errores controlados de operaciones públicas y retoma el
callback cuando MSAL restaura Login con un flow/cuenta inequívocos. Pasaron 34/34 pruebas
focalizadas, 163/163 frontend y Vite compiló 551 módulos sin errores. El 2026-08-04 una
cuenta institucional completó Microsoft, onboarding y llegada al muro. `PR-04` continúa
abierto para cancelación/error, logout y aislamiento de una segunda identidad.

### 5.13 Remediaciones derivadas de la auditoría manual - Specs 204 a 207

Estos trabajos son correcciones de calidad y reglas de negocio detectadas durante la
regresión final. No amplían el denominador 117/117 ni autorizan a declarar aceptación
antes de implementar y ejecutar su evidencia.

- [x] [I] **Spec 204 - Student Enrollment Onboarding**: selección única y confirmación
  explícita para Estudiantes, reconciliación de estados con varias carreras, enforcement
  backend también en registro/perfil/mutación legacy y puerto desacoplado para una futura
  API institucional ITB/SIU sin simular una integración inexistente. Evidencia: backend
  210/210, frontend 172/172, builds limpios, schema real y EF sin drift. Resta **30-45 min**
  de aceptación manual institucional para promoverla a `[V]`.
- [x] [I] **Spec 205 - Profile Hydration and Avatar Storage**: editor bloqueado hasta
  hidratar el `me` de la identidad activa, snapshot único que no pisa borradores, upload
  abortable y avatar candidato preservado hasta que GraphQL/refetch confirman la URL.
  El backend informa `Local`/`Cloudinary`, rechaza configuración cloud incompleta y mapea
  fallos de storage a `UPLOAD_STORAGE_UNAVAILABLE`. Evidencia: backend 216/216, frontend
  186/186 y builds limpios. Restan **45-60 min** de aceptación visual local; Cloudinary
  real permanece en `PR-03` y no bloquea la defensa controlada.
- [x] [I] **Spec 206 - Adaptive Navigation and Brand Lockup**: navegación por rol desde
  descriptores únicos, overflow progresivo según el ancho real observado y lockup atómico
  isotipo + wordmark compartido sin bloom oscuro en Header, Landing y Footer. Spec 210
  corrigió luego su composición visible definitiva a isotipo `O` + `neITB`. El algoritmo conserva
  rutas, estado activo y badges al mover destinos; Escape, clic exterior y navegación
  cierran el menú. Evidencia conjunta: 27/27 focalizadas, frontend 205/205 y build Vite
  de 558 módulos en 3,88 s en el gate final concurrente. La matriz de roles y anchos
  320-1440 px pasó sin overflow; restan teclado real, zoom y movimiento reducido para
  promoverla a `[V]`.
- [x] [I] **Spec 207 - Local Visual Asset Resilience**: Google Fonts y cdnjs retirados;
  Font Awesome se empaqueta desde el repositorio, la tipografía usa el stack del sistema,
  los aliases incompatibles fueron corregidos y los avatares fallback son iniciales
  locales. El build emitió WOFF2 versionados y su artefacto no contiene referencias a
  Google Fonts, gstatic, cdnjs ni `ui-avatars.com`. Resta **30-45 min** de aceptación
  offline, rutas principales y diálogo nativo de impresión/PDF para promoverla a `[V]`;
  la preimpresión CV compartida ya pasó en navegador.

### 5.14 Calidad de exportación del CV - Spec 208

- [x] [I] **Spec 208 - ATS-Friendly CV Export**: sustituyó las dos representaciones
  divergentes del CV por un único documento semántico, lineal y sin altura fija,
  compartido por `/profile` y `/profile/edit`; imprimir solamente ese nodo mediante
  `react-to-print` y validar el PDF real con extracción de texto, orden de secciones,
  Unicode, A4, fuentes, enlaces y ausencia de cifrado. La comunicación debe utilizar
  **"PDF optimizado para ATS"** y no prometer compatibilidad universal. Estimación:
  **3-5 h** de implementación y pruebas automáticas, más **30-45 min** de aceptación con
  el diálogo nativo y un PDF real. Evidencia: 23/23 pruebas focalizadas, frontend 217/217
  y build Vite de 559 módulos en 2,17 s. La aceptación browser posterior confirmó paridad
  de secciones y valores entre ambas rutas, estructura semántica, consola limpia y
  navegación Estudiante sin overflow entre 320-1440 px. Faltan un perfil aprobado de dos
  páginas, el diálogo
  nativo y `pdftotext`/`pdffonts`; el artefacto PDF permanece `[B]`, no PASS. Este gate no
  altera el denominador funcional 117/117.

**Orden actualizado:** aceptar el PDF real de Spec 208 antes de exportar el CV definitivo;
luego completar la aceptación manual coordinada de `204` a `207` y continuar con
`CF-01` a `CF-06` sobre el corte integrado y congelado.

### 5.15 Recuperación del schema de onboarding - Spec 209

- [x] [I] **Spec 209 - Runtime Schema Onboarding Recovery**: confirmó que fuente,
  autorización, registro HotChocolate y documento Apollo ya coincidían, y aisló el error
  observado en un proceso Debug iniciado el 02/08 que servía un schema anterior. El
  cliente ahora mapea esa incompatibilidad a una recuperación institucional sin exponer
  nombres internos ni usar la mutación legacy como fallback. El runbook incorpora una
  introspección finita y reemplazo acotado del PID. Evidencia: backend 216/216, frontend
  220/220, ambos builds limpios y endpoint activo HTTP 200 con
  `confirmStudentCareer(careerId)`. Resta el clic manual de confirmación y navegación del
  Estudiante para promover el flujo a `[V]`; Specs 210 y 211 quedan planificadas para
  branding/tema e integridad de la fuente local. No altera 117/117.

### 5.16 Contrato de marca y tema de onboarding - Spec 210

- [x] [I] **Spec 210 - Brand Lockup and Theme Contract**: normalizó la composición
  visual como isotipo `O` + `neITB`, mantuvo `OneITB` como nombre accesible y protegió
  el asset contra filtros o bloom por defecto. `ThemeProvider` ahora separa la
  preferencia persistida del tema efectivo y permite overrides temporales apilables con
  cleanup; `/onboarding/academic` permanece claro incluso tras recarga sin sobrescribir
  `oneitb-theme`, y restaura la preferencia al desmontarse. Header, Landing, Hero y Footer
  consumen el lockup compartido. Evidencia: 20/20 pruebas focalizadas, frontend 223/223 y
  build Vite de 559 módulos en 1,31 s. Resta la pasada visual manual de 320-1440 px para
  promoverla a `[V]`. Spec 211 conserva por separado la integridad de Font Awesome en
  Firefox. No altera el denominador 117/117.

### 5.17 Integridad local de iconos - Spec 211

- [x] [V] **Spec 211 - Local Icon Font Integrity**: reemplazó la copia manual de Font
  Awesome 6.1.2 por `@fortawesome/fontawesome-free` 6.7.2 exacto, con tarball e
  integridad SHA-512 en lockfile. CSS, metadata y WOFF2 proceden ahora de una única
  distribución oficial; el guard automatizado comprueba versión, licencia, archivos e
  iconos activos. Se retiró la carpeta vendorizada completa y el build no contiene sus
  rutas ni referencias a CDNs. Evidencia: 6/6 focalizadas, frontend 224/224 y Vite 559
  módulos en 733 ms; `npm audit --omit=dev` solo conserva `RR-09`, sin hallazgos de la
  nueva dependencia. La aceptación del 05/08/2026 sobre `2f20bce` produjo un render
  Firefox nativo 1440 x 1000, registró el WOFF2 oficial desde el origen local y no emitió
  `download failed`, `glyf bbox` ni errores Font Awesome; una inspección independiente
  confirmó 12 iconos renderizados y consola sin warnings/errores. Procesos, pestañas,
  perfil y capturas temporales fueron cerrados o eliminados. No altera 117/117.

### 5.18 Contrato de assets de marca por tema - Spec 212

- [x] [I] **Spec 212 - Theme Logo Asset Contract**: reemplazó el lockup construido en
  DOM por los assets completos aprobados según el tema efectivo: `logo-oneitb.png` en
  claro y `logo-oneitb-dark-mode.png` en oscuro. El Header queda deliberadamente fuera
  de esa sustitución y muestra únicamente `only-logo.png` en ambos temas, sin wordmark,
  filtros ni glow. `BrandLockup` conserva un único nombre accesible y controla el lienzo
  cuadrado mediante un viewport proporcional sin deformar la imagen. Evidencia: 9/9
  pruebas focalizadas, suite frontend 225/225, build Vite de 560 módulos en 793 ms y
  smoke visual del Home claro. Resta la matriz manual dark/light en 320, 768 y 1440 px
  para promoverla a `[V]`. No altera el denominador 117/117.

### 5.19 Cola correctiva de QA del 05/08 - Specs 213 a 217

Los siguientes hallazgos proceden de una sesión manual con Microsoft 365, onboarding,
perfil, upload y feed. Son gates correctivos fuera del denominador funcional 117/117 y
no modifican el 100% de alcance. El error GraphQL que negó `confirmStudentCareer` mientras
el repositorio sí contiene esa operación demuestra una **desalineación de runtime**; por
eso no se debe atribuir cada síntoma al código fuente hasta completar Spec 213.

| Spec | Alcance | Estado | Estimación | Dependencia | Nivel recomendado | Criterio de salida |
|---|---|---|---:|---|---|---|
| **213 - Runtime Contract & Entra Transition** | Preflight de schema/corte, eliminación del flash de Login y máquina de estados idempotente del callback | `[x] [I]` | 2-3 h | Backend disponible; cuenta Entra para aceptación final | **Alto** | Implementación y contrato runtime PASS; falta repetir éxito/cancelación en navegador real para `[V]` |
| **214 - Authoritative Student Enrollment** | Carrera única para Estudiante, confirmación, coherencia feed/perfil y puerto institucional de inscripción | `[x] [I]` | 3-5 h | Spec 213 | **Alto** | Implementación y regresiones automáticas aprobadas; resta recorrido manual onboarding -> feed -> perfil para promover a `[V]` |
| **215 - Profile Storage & Hydration Resilience** | Hydration atómica del editor, provider Local/Cloudinary explícito y ciclo avatar upload-save-refresh | `[x] [I]` | 45-60 min de browser local; +1-3 h Cloudinary | Credenciales solo para smoke cloud | **Alto** | Provider, timeout, cancelación, error sanitizado e hidratación cubiertos; falta browser upload-save-refresh y proveedor real para `[V]` |
| **216 - Feed Pagination Observability** | Cursor, merge, estados fin/error y estabilidad de filtros | `[x] [I]` | 30-45 min de browser | Runtime y dataset controlado >15 | **Medio** | Automatización PASS; falta confirmar append, fin, error/retry y reset por carrera en navegador para `[V]` |
| **217 - Institutional Landing & Theme Polish** | Transición 1300 ms y contenido del Home alineado con fuentes oficiales del Beltrán | `[x] [I]` | 2-3 h | Specs P0/P1 cerradas | **Medio** | Tests/build PASS; Home claro sin overflow en 320/768/1440 y consola limpia. Contraste dark y transición perceptual quedan incluidos en la regresión final |

**Orden obligatorio**: 213 -> 214 -> 215 -> 216 -> 217. Las Specs 214 y 215 pueden
implementarse en paralelo solo después de demostrar paridad de runtime. La Spec 217 es
cosmética/documental y no debe desplazar los bloqueos funcionales de la demo.

**Corte de implementación Spec 213 (05/08/2026):** el backend expone un identificador
no sensible `X-OneITB-Build` y el preflight finito valida build y operaciones
`inquiriesPage`, `microsoftLogin` y `confirmStudentCareer` sin iniciar servidores. El
frontend agregó una barrera única para el retorno institucional, fases explícitas
MSAL/intercambio/commit/error y preservación del redirect frente a expiración de un JWT
anterior. Pasaron backend 216/216, frontend 232/232, ambos builds sin warnings y el
preflight sobre un proceso Release temporal con cleanup confirmado. La promoción a `[V]`
queda sujeta al recorrido Microsoft real de éxito, cancelación y error sin flash de Login.

**Corte de implementación Spec 214 (05/08/2026):** el reemplazo posterior al alta se
centralizó en `IUserCareerAssignmentService`, con validación de carrera activa y regla
de exactamente una para `Estudiante`. Onboarding y editor exigen confirmación, verifican
el `me` persistido e invalidan de forma acotada feed, materias, recursos y progreso. El
puerto de matrícula quedó en modo honesto `SelfDeclared`, con fuente y timestamp, y se
mantiene separado del mock SIU de calificaciones. Pasaron backend 218/218, frontend
237/237, ambos builds Release y el control EF sin drift. El recorrido manual completo
onboarding -> feed -> perfil permanece como gate para promover `[I]` a `[V]`.

**Corte de implementación Spec 215 (05/08/2026):** `FileStorage:Provider` reemplazó
la detección implícita por URL. Development declara `Local`; Production declara
`Cloudinary`, valida credenciales y timeout al iniciar y no degrada a disco. El adapter
preserva cancelación del request, traduce timeout/transporte a una falla controlada y el
REST 503 devuelve modo, correlación y acción recuperable sin detalles internos. El editor
espera perfil y catálogo completos, conserva el avatar previo y no reintenta en forma
automática. Pasaron backend 230/230, frontend 240/240, builds limpios y Compose
productivo válido y EF sin model drift. El ciclo visual local y Cloudinary real permanecen como
gates separados antes de `[V]`.

**Corte de implementación Spec 216 (05/08/2026):** los bordes backend 0/1/15/16
confirmaron que el cursor existente no anunciaba páginas inexistentes. El Feed dejó de
duplicar `fetchMore` y consume `useInquiryPage`, que normaliza filtros, bloquea doble
click, deduplica IDs, descarta resultados obsoletos para la UI y conserva publicaciones
ante error. Feed, perfil y administración distinguen carga inicial, reintento y final.
Apollo mantiene páginas aisladas por carrera. Pasaron backend 234/234, frontend 249/249
y ambos builds sin warnings. Los puertos locales estaban cerrados; el smoke con dataset
mayor a 15 permanece como gate antes de `[V]`.

**Corte de implementación Spec 217 (05/08/2026):** la transición React/CSS pasó de
800 a 1300 ms con cleanup sincronizado y duración cero para reduced motion e impresión.
Home y footer distinguen OneITB del portal oficial, presentan el ISFT N.º 197 y enlazan
Portal Beltrán, SIU Guaraní y Microsoft 365 como destinos externos seguros, sin copiar
assets ni afirmar integraciones productivas. La aceptación browser encontró y corrigió
un recorte del Hero móvil; 320/768/1440 quedaron sin overflow ni headings truncados y la
consola terminó limpia. Pasaron 251/251 pruebas frontend, 17/17 focalizadas y Vite en
627 ms. Se conserva `[I]` hasta la pasada perceptual dark/light y reduced-motion del
candidato final.

**Corte parcial de aceptación del 04/08/2026:** el navegador confirmó el invariante de
una carrera ya persistida y la hidratación inicial estable del editor. También ejecutó la
matriz Anonymous/Student/Employer/Admin a 320, 375, 768, 1024, 1280 y 1440 px, sin
overflow horizontal, con navegación real desde el menú secundario a `/admin` y branding
legible en light/dark. Permanecen abiertos: reconciliación cero/múltiples completa
(**20-30 min**), avatar upload-refresh y sesión A -> B (**30-45 min**), teclado/zoom/
reduced-motion (**20-30 min**) y red offline + print preview (**20-30 min**). Estos pases
parciales no cambian `[I]` a `[V]`.

## 6. Plan operativo de cierre para la defensa

Este plan no agrega alcance funcional ni modifica el calculo de 117/117 items. Convierte
el Release Candidate academico en un paquete reproducible de defensa. Las estimaciones
representan tiempo efectivo de una persona con el entorno ya instalado; no incluyen
esperas institucionales, aprobacion de credenciales ni incidentes de terceros.

**Regla de ejecución hasta la mesa:** no incorporar features nuevas. Solo se aceptan
correcciones de defectos reproducibles que bloqueen la demostración, con prueba de
regresión y actualización de evidencia. Los trabajos documentales, visuales y logísticos
tienen prioridad sobre mejoras cosméticas no comprometidas.

### 6.1 Secuencia recomendada del 3 al 7 de agosto

| Jornada | Foco principal | Carga sugerida | Resultado esperado al cerrar el día |
|---|---|---:|---|
| **Lunes 03/08** | Cierre de Spec 201, integración Git, higiene y gates automáticos | 5-7 h | Rama final identificada, worktree explicable y baseline técnico verde |
| **Martes 04/08** | Diagramas, maquetación DOCX, auditoría PDF y envío a imprenta | 10-14 h, con trabajo visual en paralelo | Memoria final enviada a impresión a color; copia digital verificada |
| **Miércoles 05/08** | Regresión por seis roles, realtime con dos sesiones, capturas y presentación | 8-11 h | Checklist funcional cerrado, material visual de contingencia y PPTX/PDF estructurado |
| **Jueves 06/08** | Congelamiento del SHA, backups, retiro de impresión y dos ensayos | 6-8 h | Corte inmutable, paquete físico/digital completo y exposición dentro de 20-30 minutos |
| **Viernes 07/08** | Contingencia mínima y presentación | Llegada 08:15-08:30 | Notebook, HDMI, pendrive, copia impresa y demo listos antes de las 09:00 |

El orden debe solaparse el 4 de agosto para cumplir la imprenta. No debe exportarse el PDF
definitivo antes de cerrar los diagramas. Desde que el PDF se envía a imprimir solo se
admiten correcciones técnicas bloqueantes; cualquier cambio debe registrarse y no puede
contradecir la memoria impresa.

### 6.2 Integración, higiene y aceptación final

| ID | Tarea | Estado | Estimacion | Dependencia | Criterio de salida |
|---|---|---|---:|---|---|
| `CF-01` | Consolidar y publicar el corte de Specs 198-201; revisar e integrar la rama mediante PR | `[ ] [P]` | 30-45 min | Acceso a los remotos | Rama remota y SHA candidato identificados, sin perder código ni evidencia de las cuatro specs |
| `CF-02` | Completar la auditoría de archivos auxiliares de raíz y secretos ignorados; el prompt histórico `prompt_modulo1.txt` fue retirado el 2026-08-03 | `[ ] [P]` | 15-30 min | Decisión explícita de conservar, mover, ignorar o eliminar cada artefacto restante | `git status` limpio; ningún secreto, fixture personal o archivo de trabajo entra al corte |
| `CF-03` | Ejecutar gates de predefensa, infraestructura local y base demo sobre el SHA candidato | `[ ] [P]` | 75-105 min | Docker operativo | Backend 234/234 o mayor, frontend 251/251 o mayor, builds, EF drift, integridad, seis roles, Redis, Mailpit y cleanup en PASS o con desviación documentada |
| `CF-04` | Regresion manual guiada por roles: Estudiante, Profesor, Egresado, Empleador, Moderador y Administrador | `[ ] [P]` | 3-4 h | `CF-03` | Checklist firmado, consola limpia y capturas de los flujos principales |
| `CF-05` | Validar chat/notificaciones con dos navegadores o perfiles aislados | `[ ] [P]` | 60-90 min | API y frontend temporales, dos identidades | Handshake WebSocket, aislamiento de topic, badges y lectura comprobados |
| `CF-06` | Consolidar evidencia, congelar el corte y etiquetar el commit presentado | `[ ] [P]` | 45-60 min | `CF-01` a `CF-05` | SHA, fecha, métricas, resultados, limitaciones y versión documental coinciden en repositorio, auditoría y presentación |

**Spec 218 - Candidate Freeze & Pre-Defense Gate (`[ ] [P]`, activa):** formalizó
el contrato de evidencia y ejecutó el primer preflight conjunto del worktree. Pasaron
backend **234/234**, frontend **251/251**, ambos builds, EF sin drift, Compose y
`git diff --check`. Redis/Mailpit reales locales, aislamiento automatizado, integridad de
base, seis logins y smokes de ocho dominios pasaron con cleanup y SQL sin cambios. Las 88
rutas quedaron clasificadas: la infografía se movió al paquete académico y el logo
anterior se conservó local e ignorado. `npm audit` conserva solo dos advisories moderados
de React Router 6.30.4 bajo `RR-09`; el fix exige migración rompiente a v7. `CF-03` no
cambia de estado hasta vincular el gate a un SHA limpio y completar browser/realtime. No
se creó commit, tag ni reset de base.

**Subtotal estimado:** **6 h 45 min a 9 h 30 min**. La ruta critica es
`CF-01 -> CF-03 -> CF-04/CF-05 -> CF-06`.

### 6.3 Entrega final académica

| ID | Tarea | Estado | Estimacion | Dependencia | Criterio de salida |
|---|---|---|---:|---|---|
| `DF-01` | Completar nombre, docentes, fecha y datos institucionales de portada | `[ ] [P]` | 20-30 min | Datos oficiales | Portada sin marcadores `[Completar]` |
| `DF-02` | Sincronizar memoria y guía con el corte documental vigente, baselines por capa 234/251 y riesgos actuales | `[x] [I]` | 90-120 min | Evidencia canónica | Markdown alineado con roadmap y auditoría al 2026-08-05; aceptación Entra hasta onboarding/muro, archivos privados y proveedores externos permanecen explícitos |
| `DF-03` | Seleccionar, renderizar e insertar los 10 diagramas Mermaid de la memoria | `[ ] [P]` | 2-3 h | `DF-02` | SVG/PNG legibles, numerados, insertados en el Word y aprobados visualmente en tamaño A4 |
| `DF-04` | Recrear DER Crow's Foot y los 3 graficos de gestion en Draw.io | `[ ] [P]` | 4-6 h | Descripciones de la memoria | 4 fuentes editables y 4 PNG/SVG consistentes con el modelo |
| `DF-05` | Generar `DOCUMENTO_MAQUETACION.md`, DOCX APA 7 e indice automatico | `[ ] [P]` | 3-4 h | `DF-03` y `DF-04` | DOCX editable, estilos APA, tablas/figuras dentro de margenes |
| `DF-06` | Exportar y auditar el PDF en cuatro pasadas | `[ ] [P]` | 2-3 h | `DF-05` | PDF revisado pagina por pagina, enlaces y accesibilidad basica |
| `DF-07` | Diseñar presentación de defensa en PPTX/PDF con narrativa problema-solución-arquitectura-demo-evidencia | `[ ] [P]` | 2 h 30 min-4 h | `DF-03`, `DF-04` y evidencia de `CF-03` | Presentación legible, visual, con demo guiada, métricas verificables y límites honestos; sin copiar páginas completas de la memoria |
| `DF-08` | Preparar guion, contingencias y ejecutar al menos dos ensayos cronometrados | `[ ] [P]` | 3-4 h | `CF-06`, `DF-06` y `DF-07` | Exposición base de 22-25 min dentro del rango oficial de 20-30 min, transiciones ensayadas y respuestas preparadas sobre seguridad, arquitectura y límites |

**Corte documental del 05/08/2026:** el alumno informó que ya renderizó los 13 bloques
Mermaid del paquete técnico `docs/academic/04-design-diagrams.md`. Ese paquete sirve
como fuente técnica y material de anexo, pero no reemplaza uno a uno las 10 figuras
Mermaid requeridas por la memoria. `DF-03` se cerrará cuando las figuras definitivas
hayan sido seleccionadas, insertadas en el Word y revisadas por legibilidad en página A4.

**Subtotal pendiente estimado:** **16 h 50 min a 24 h 30 min**, porque `DF-02` ya
quedó implementado documentalmente. La entrega académica completa, incluyendo el cierre
técnico del bloque 6.2, requiere aproximadamente **23 h 35 min a 34 h efectivas**. Es un
plan exigente de cuatro jornadas: los rangos altos requieren delegar la impresión,
evitar refactors no bloqueantes y trabajar presentación/documentación en paralelo con
la regresión manual.

### 6.4 Condiciones oficiales y logística de mesa

La mesa comienza el **viernes 7 de agosto de 2026 a las 09:00**. El aula o laboratorio
se confirmara ese mismo dia. La duracion oficial de exposicion es **20-30 minutos** y
puede extenderse por preguntas; el objetivo interno de **22-25 minutos** deja margen
para transiciones sin redefinir el requisito de la catedra.

| ID | Tarea | Estado | Estimacion | Condicion oficial o criterio |
|---|---|---|---:|---|
| `LG-01` | Imprimir una copia de la memoria tecnica, preferentemente a color, y anillarla o encuadernarla | `[ ] [P]` | 60-90 min de preparacion, mas plazo de imprenta | Una copia fisica para la mesa |
| `LG-02` | Preparar notebook propia, cargador y adaptador HDMI compatible | `[ ] [P]` | 60-90 min | Sistema instalado, configurado y probado; el equipo institucional queda como respaldo |
| `LG-03` | Crear y verificar pendrive de contingencia | `[ ] [P]` | 45-60 min | Sistema, repositorio, memoria DOCX/PDF y presentacion PPTX/PDF; el pendrive no se entrega |
| `LG-04` | Confirmar repositorio remoto actualizado y conservar un snapshot offline | `[ ] [P]` | 30-45 min | Corte presentado identificable y recuperable sin Internet |
| `LG-05` | Llegar entre 08:15 y 08:30 y confirmar aula/equipamiento | `[ ] [P]` | 15-30 min in situ | Recomendacion operativa; la mesa inicia a las 09:00 |

Las estimaciones `LG-01` a `LG-04` se solapan con `DF-05` a `DF-08` y no deben sumarse
por segunda vez al subtotal documental. No se requiere un Manual de Usuario separado:
su contenido permanece integrado en la seccion 6 de la memoria tecnica.

### 6.5 Gates productivos externos

Estos puntos no bloquean la defensa controlada y no deben presentarse como verificados
hasta ejecutarse en el ambiente de destino.

| ID | Gate | Estado | Estimacion tecnica | Condicion externa |
|---|---|---|---:|---|
| `PR-01` | Smoke con proveedor SMTP publico | `[ ] [B]` | 1-3 h | Host, puerto, cuenta y politica institucional |
| `PR-02` | Smoke con Redis administrado | `[ ] [B]` | 1-3 h | Endpoint TLS, credenciales y red permitida |
| `PR-03` | Smoke de Cloudinary y ciclo upload/delete | `[ ] [B]` | 1-3 h | Cuenta, URL firmada y cuota aprobada |
| `PR-04` | Aceptacion Microsoft Entra en tenant institucional | `[ ] [P]` | 20-45 min restantes | Éxito real hasta onboarding/muro verificado el 2026-08-04; resta cancelación/error, logout y aislamiento con segunda cuenta |
| `PR-05` | Benchmark BCrypt en hardware objetivo | `[ ] [B]` | 1-2 h | Host productivo representativo |
| `PR-06` | Alertas operativas y politica de I/O persistente | `[ ] [B]` | 2-4 h | Plataforma de monitoreo seleccionada |
| `PR-07` | Antivirus/CDR externo para uploads | `[ ] [B]` | 8-16 h | Seleccion de proveedor, API, presupuesto y privacidad |

**Esfuerzo tecnico estimado:** **17-37 h**, excluyendo tiempos de aprobacion y
provisionamiento. La aceptacion Entra, cloud publico y antivirus/CDR son evolucion productiva;
no forman parte del Definition of Done academico del MVP.

### 6.6 Definition of Done de la entrega académica

1. `CF-01` a `CF-06` completados y evidenciados sobre un SHA inmutable.
2. `DF-01` y `DF-03` a `DF-08` completados; DOCX/PDF coinciden con el Markdown canonico.
3. Ningun gate externo figura como verificado sin credenciales y evidencia de destino.
4. La exposicion utiliza la formula: **Release Candidate academico, Feature Complete
   core y Code Freeze operativo local**.
5. Los limites se explican como decisiones de alcance o gates externos, no como
   funcionalidades productivas ya disponibles.

## 7. Definition of Done por feature

1. Spec, plan y tasks completos.
2. Backend/frontend compilan cuando son afectados.
3. Migracion revisada, aplicada y sin cambios pendientes cuando corresponde.
4. Contrato GraphQL real ejecutado.
5. Autenticacion, cache y persistencia validadas en runtime.
6. Evidencia registra comandos y bloqueos reales.
7. Este roadmap, `DEVELOPMENT_LOG.md` y `DOCUMENTATION_STATUS.md` quedan sincronizados.
