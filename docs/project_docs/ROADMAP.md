# Roadmap unico de OneITB23

**Ultima revision**: 2026-07-30

**Estado global**: 100% (116 de 116 items)

**Feature Complete funcional core**: 100%. Las remediaciones 186-193 cuentan con
evidencia automatizada y aceptacion operativa local. Las Specs 194-196 verificaron los
recorridos principales, la infraestructura local y la base demo canonica. La Spec 197
implemento el acceso institucional Microsoft Entra ID con Authorization Code + PKCE,
validacion backend del access token y canje por el JWT canonico de OneITB. La aceptacion
contra el tenant real permanece como gate externo y no se contabiliza como `[V]`.

Este archivo concentra avance funcional, estabilizacion, deuda tecnica y prioridades. No existe un roadmap paralelo.
El porcentaje global cuenta los items funcionales y de auditoria; P5/P6 describen
evolucion futura de despliegue y ecosistema movil fuera del cierre academico.

## Convencion de estado

- `[x] [V]`: completado y verificado mediante runtime.
- `[x] [I]`: implementado con evidencia de codigo, build, migracion o prueba aislada; puede requerir regresion runtime.
- `[ ] [P]`: pendiente.
- `[ ] [B]`: implementacion o validacion bloqueada por una condicion concreta.

Los porcentajes cuentan items `[x]`. La etiqueta conserva la diferencia entre implementacion y verificacion.

## Modulo 1 - Identidad, cuentas y seguridad: 100% (9/9)

- [x] [V] Relacion 1:1 `Account`-`User` y passwords BCrypt `char(60)`.
- [x] [V] Registro y login con JWT.
- [x] [V] Bloqueo de acceso para cuentas inactivas.
- [x] [V] Expiracion JWT, pipeline de autenticacion y CORS restringido.
- [x] [V] Sesion frontend normalizada sobre `token` y `user`.
- [x] [V] Autorizacion por roles en operaciones sensibles.
- [x] [V] Flujo Magic Link para empleadores con JWT firmado, expiracion y consumo atomico de un solo uso.
- [x] [I] Suite automatizada backend de registro, login, cuentas inactivas y autorizacion administrativa.
- [x] [I] Lockout persistente por cuenta ante fuerza bruta de login, con tests automatizados.

## Modulo 2 - Perfiles e identidad social: 100% (8/8)

- [x] [V] Perfil publico y perfil propio autenticado.
- [x] [V] Edicion aislada del perfil y CV con persistencia relacional normalizada, cancelacion limpia e impresion formal A4.
- [x] [V] Biografia, avatar defensivo, contacto, metricas de aportes y redes sociales.
- [x] [V] Asociacion de usuarios a multiples carreras desde perfil.
- [x] [I] Resumen de publicaciones en perfil publico.
- [x] [I] Roles diferenciados e insignias de participacion.
- [x] [I] Seguir/dejar de seguir con estado explicito e idempotente, ademas de silenciar y bloquear usuarios sin sobrescribir relaciones compatibles.
- [x] [I] Controles de privacidad del perfil con masking backend-side para CV, bio, contacto y carreras ante terceros no autorizados.

## Modulo 3 - Carreras y materias: 100% (7/7)

- [x] [I] CRUD y estado activo de carreras.
- [x] [I] Materias asociadas obligatoriamente a una carrera.
- [x] [I] Anio de cursada validado entre 1 y 6.
- [x] [I] Correlatividades N:M con integridad restrictiva.
- [x] [I] Inscripcion de usuarios a multiples carreras.
- [x] [I] Selectores en cascada carrera-materia en feed y administracion.
- [x] [I] Progreso academico, cursadas y notas por usuario.

## Modulo 4 - Feed, comentarios y multimedia: 100% (25/25)

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

## Modulo 5 - Mensajeria privada: 100% (9/9)

- [x] [V] Persistencia de mensajes uno a uno.
- [x] [V] Contactos e historial paginados.
- [x] [V] Queries y mutations autenticadas por participante.
- [x] [V] Subscription privada con JWT por WebSocket.
- [x] [V] UI optimista, deduplicacion y reconciliacion al reconectar.
- [x] [V] Busqueda de contactos y mensajes.
- [x] [I] Integracion entre chat completo y widget sin updates cruzados.
- [x] [I] Reemplazar pub/sub en memoria por transporte distribuido Redis configurable.
- [x] [I] Badges de no leidos independientes en navegacion/widget minimizado y recordatorio persistente, acotado e idempotente para mensajes con mas de una hora, respetando preferencias.

## Modulo 6 - Administracion y moderacion: 100% (10/10)

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

## Modulo 7 - Empleos y Gestor de Postulaciones: 100% (9/9)

- [x] [I] Entidad `JobOffer` con FK explicita a `User` y `DeleteBehavior.Restrict`.
- [x] [I] Entidad `JobApplication` con estados `Pending`, `Reviewed` y `Rejected`, FKs restrictivas e indice unico por oferta/postulante.
- [x] [I] GraphQL `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus` y subscription `jobOfferCreated`.
- [x] [I] Vista `/empleos` con skeletons, empty state, tarjetas laborales, postulacion GraphQL, estado `Postulado` y deep-link que enfoca/resalta la oferta exacta.
- [x] [I] Vista `/empleos/mis-ofertas` como Gestor de Postulaciones con postulantes, filtros por estado, perfil academico y acciones de revision/rechazo.
- [x] [I] Badge realtime en Nav para nuevas ofertas laborales y limpieza al ingresar a `/empleos`.
- [x] [V] Alertas por correo SMTP para cambios de estado de postulaciones: contrato de empleo cubierto y adaptador de red verificado contra Mailpit local; proveedor SMTP publico permanece como gate externo.
- [x] [I] Seeder enterprise con empleadores, ofertas laborales, postulaciones y notificaciones persistentes.
- [x] [I] QA/security del gestor: validacion por rol, ownership estricto de oferta, auditoria persistente y build/migracion sin errores.

## Modulo 8 - Recursos y seguimiento academico: 100% (6/6)

- [x] [I] Entidad y repositorio de recursos academicos independiente del feed.
- [x] [I] Permisos de recursos por carrera, materia y rol.
- [x] [I] Busqueda, categorias y versionado de recursos.
- [x] [I] Visualizacion de notas y progreso academico.
- [x] [I] Adaptador o simulador desacoplado para SIU Guarani.
- [x] [I] Preferencias de notificacion por materia.

## Modulo 9 - Calidad, operacion y escalabilidad: 100% (20/20)

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
- [x] [I] Orquestacion productiva `docker-compose.prod.yml` con SQL Server, Redis, API y frontend sin secretos versionados.
- [x] [I] Almacenamiento cloud opcional con Cloudinary y fallback local para `/api/upload`.
- [x] [I] Hardening HTTP productivo con rate limiting por IP, healthcheck y security headers.
- [x] [I] Hardening GraphQL anti-DoS con profundidad maxima y paging global configurable.
- [x] [I] Seeding demo/productivo configurable, idempotente y sin reset de passwords existentes.

## Modulo Extra - Caracteristicas de Alto Impacto (Efecto WOW): 100% (5/5)

- [x] [I] Trazabilidad academica transversal mediante `AuditLog` y `SaveChangesInterceptor` de EF Core para entidades criticas.
- [x] [I] Generacion de constancias y exportacion CSV/impresion formal desde el modulo academico.
- [x] [I] Integracion institucional Microsoft Entra ID single-tenant mediante MSAL Authorization Code + PKCE, validacion criptografica del access token de la API y emision del JWT canonico OneITB; la aceptacion con el tenant Microsoft 365 real permanece como gate externo.
- [x] [I] Credenciales digitales publicas para progreso aprobado mediante ruta `/certificate/{id}` y query GraphQL publica limitada.
- [x] [I] Toast notifications globales conectadas a GraphQL Subscriptions existentes.

## Prioridades

### P0 - Estabilizacion inmediata

1. Mantener el Code Freeze funcional: aceptar solo defectos reproducibles con prueba de regresion.
2. Conservar Docker SQL como runtime local canonico para evitar SSPI/LocalDB.
3. Conservar la base demo canonica mediante `scripts/reset-demo-database.ps1` solo
   cuando sea necesario y ejecutar `scripts/validate-demo-database.ps1` antes de la
   auditoria funcional final.
4. Ejecutar `scripts/validate-predefense.ps1` antes de la defensa y de cada entrega.
5. Validar SMTP, Redis y Cloudinary solo cuando existan secretos no versionados y un ambiente aprobado.

### P1 - Cierre del nucleo social

1. Paginacion del feed: verificada en runtime contra Docker SQL.
2. Limpieza de uploads huerfanos: verificada en runtime contra Docker SQL.
3. Auditoria persistente de moderacion: verificada en runtime contra Docker SQL.
4. Adjuntos multiples, reacciones de comentarios y notificaciones agrupadas: verificados por tests y smoke GraphQL autenticado contra Docker SQL.

### P2 - Alcance academico

1. Cerrado a nivel de implementacion y hardening tecnico; el hub academico fue recorrido con Estudiante y Profesor durante la Spec 194.
2. Empleos y Gestor de Postulaciones fueron recorridos con Egresado y Empleador durante la Spec 194.

### P3 - Escalabilidad y operacion

1. `[x] [V]` Pub/sub distribuido Redis, activado por `ConnectionStrings:Redis` y fallback InMemory local; entrega exacta e aislamiento de topic verificados entre dos proveedores independientes contra Redis Docker.
2. `[x] [I]` Almacenamiento compartido opcional con Cloudinary, activado por `CloudinarySettings:Url` y fallback local.
3. `[x] [I]` Hardening operativo: rate limiting, security headers, healthcheck y auditoria npm sin hallazgos altos/criticos; dos avisos moderados upstream de React Router quedan documentados y el destino interno de notificaciones se sanitiza.
4. `[x] [I]` Hardening GraphQL anti-DoS: profundidad maxima configurable y limites globales de paginacion.
5. `[x] [I]` SSO institucional Microsoft Entra ID single-tenant; configuracion fail-closed, vinculacion segura, auditoria y limpieza de sesion implementadas. El consentimiento y smoke del tenant real permanecen en `PR-04`.

### P4 - Contenedores y CI/CD

1. `[x] [I]` Dockerizacion del entorno local y de produccion.
2. `[x] [I]` Integracion y despliegue continuo con GitHub Actions.

### P5 - Despliegue Cloud Gratuito

1. `[ ] [P]` Migracion y despliegue del backend en Azure App Service F1. Estimacion:
   **8-12 h**, una vez definida la suscripcion, region, variables y estrategia de rollback.
2. `[ ] [P]` Migracion y alojamiento de base de datos en Azure SQL Free Tier. Estimacion:
   **6-10 h**, incluyendo backup, migraciones, smoke de integridad y plan de retorno.
3. `[x] [I]` Integracion de Cloudinary para el alojamiento de imagenes y archivos estaticos.

### P6 - Ecosistema Movil

1. `[ ] [P]` Inicializacion del proyecto movil con React Native + Expo. Estimacion:
   **8-12 h** para estructura, autenticacion y navegacion base.
2. `[ ] [P]` Sincronizacion del estado y cache Apollo entre Web y Mobile. Estimacion:
   **16-24 h** para contratos, persistencia segura y pruebas de cambio de sesion.
3. `[ ] [P]` Compilacion de APK y distribucion en entornos de prueba. Estimacion:
   **6-10 h** luego de cerrar los dos puntos anteriores.

## Auditoria de Cierre y Seguridad - Etapa 1: 100% (4/4)

- [x] [V] **Spec 186 - Employer Authentication JWT Remediation**: emision JWT centralizada, sin tokens mock/placeholder, Magic Link atomico y validado contra SQL Server Docker.
- [x] [V] **Spec 187 - Mutation Cancellation Propagation**: `CancellationToken` propagado desde todas las mutaciones asincronas hasta EF Core y efectos soportados, con guard automatizado.
- [x] [V] **Spec 188 - Apollo Logout Session Isolation**: frontera de sesion idempotente para React, Apollo HTTP/cache y WebSocket, con regresion A -> B automatizada y browser smoke limpio.
- [x] [V] **Spec 189 - Declarative GraphQL Mutation Authorization**: matriz declarativa completa, ampliada por Spec 197 a 43 mutaciones y cinco entradas publicas; controles contextuales de ownership preservados.

## Auditoria de Cierre y Seguridad - Etapa 2: 100% (4/4)

- [x] [V] **Spec 190 - Upload and Magic Link Abuse Hardening**: inspeccion binaria/estructural previa a storage y limites especificos por operacion, origen e identidad; upload valido/hostil/truncado y limites de Magic Link con recuperacion cuentan con evidencia ejecutada.
- [x] [V] **Spec 191 - Async Query and Pagination Hardening**: I/O social asincronico y cancelable, contrato ilimitado retirado y paginacion social/academica verificadas con orden, limite, deduplicacion, filtro de autor y autorizacion.
- [x] [V] **Spec 192 - Credential Delivery and Cryptographic Policy Hardening**: respuesta generica, pickup local, digest SQL y consumo unico verificados; SMTP real permanece como gate externo bloqueado y no afecta la validacion del fallback de Development.
- [x] [V] **Spec 193 - Social Policy and UI Bootstrap Resilience**: silenciamiento like/unlike verificado sin persistencia ni notificaciones; browser limpio y aislamiento A -> logout -> B comprobado.

## Aceptacion operacional final - Spec 194

La Spec 194 cerro los gates locales controlables con 147 pruebas backend, 79 frontend,
builds Release/Vite, modelo EF sincronizado, pruebas runtime focalizadas y recorridos de
Estudiante, Profesor, Egresado, Administrador y Empleador. Los bloqueos locales de
identidad Moderador, Redis y SMTP capturado fueron tratados por la Spec 195.

## Aceptacion de infraestructura local y Moderador - Spec 195

La Spec 195 agrego una identidad Moderador canonica e idempotente, probo su JWT y sus
limites de autorizacion, y verifico el reemplazo de sesion Estudiante -> Moderador. Un
Compose de aceptacion efimero ejecuto Redis 7 y Mailpit con pruebas reales de entrega
cross-provider, aislamiento de topics y tres correos inspeccionados sin secretos. El gate
finito no inicia API/Vite, preserva SQL y elimina contenedores/puertos en `finally`.

Permanecen `[B]` el SMTP publico, Cloudinary, la aceptacion Microsoft Entra en el tenant
institucional y el handshake WebSocket de red con dos navegadores; Redis local y Mailpit
no se presentan como validacion cloud.

## Aceptacion de base demo canonica - Spec 196

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

## Identidad institucional Microsoft Entra ID - Spec 197

La Spec 197 reemplazo el plan Google OAuth por la plataforma que utiliza la institucion:
Microsoft Entra ID/Microsoft 365. La SPA usa MSAL con Authorization Code + PKCE,
autoridad single-tenant, scope delegado propio de la API y cache en `sessionStorage`.
El backend valida firma RS256, emisor, audiencia, vigencia, `tid`, `oid`, scope y dominio
institucional antes de vincular o aprovisionar una cuenta sin privilegios y emitir el
JWT local. No persiste tokens externos ni secretos; logout limpia MSAL, Apollo y
WebSocket. La migracion agrega identidad externa unica y password local nullable solo
para cuentas SSO-only. Tests, builds, EF y schema runtime cuentan con evidencia; el
consentimiento y la prueba con una cuenta real del tenant siguen en `PR-04`.

## Plan operativo de cierre para la defensa

Este plan no agrega alcance funcional ni modifica el calculo de 116/116 items. Convierte
el Release Candidate academico en un paquete reproducible de defensa. Las estimaciones
representan tiempo efectivo de una persona con el entorno ya instalado; no incluyen
esperas institucionales, aprobacion de credenciales ni incidentes de terceros.

### A. Integracion, higiene y aceptacion final

| ID | Tarea | Estado | Estimacion | Dependencia | Criterio de salida |
|---|---|---|---:|---|---|
| `CF-01` | Publicar y revisar el corte de Spec 197; integrar la rama mediante PR | `[ ] [P]` | 30-45 min | Acceso a los remotos | Rama remota, revision y merge sin perder evidencia |
| `CF-02` | Resolver `prompt_modulo1.txt` y confirmar higiene del worktree | `[ ] [P]` | 15-30 min | Decision de conservar, mover o ignorar el archivo | `git status` limpio y sin artefactos de trabajo accidentalmente versionados |
| `CF-03` | Ejecutar los gates de predefensa, infraestructura local y base demo | `[ ] [P]` | 75-105 min | Docker operativo | Tests, builds, EF drift, integridad, seis roles, Redis, Mailpit y cleanup en PASS |
| `CF-04` | Regresion manual guiada por roles: Estudiante, Profesor, Egresado, Empleador, Moderador y Administrador | `[ ] [P]` | 3-4 h | `CF-03` | Checklist firmado, consola limpia y capturas de los flujos principales |
| `CF-05` | Validar chat/notificaciones con dos navegadores o perfiles aislados | `[ ] [P]` | 60-90 min | API y frontend temporales, dos identidades | Handshake WebSocket, aislamiento de topic, badges y lectura comprobados |
| `CF-06` | Consolidar evidencia, congelar el corte y etiquetar el commit presentado | `[ ] [P]` | 45-60 min | `CF-01` a `CF-05` | SHA, fecha, resultados y limitaciones coinciden en todos los documentos |

**Subtotal estimado:** **6 h 45 min a 9 h 30 min**. La ruta critica es
`CF-01 -> CF-03 -> CF-04/CF-05 -> CF-06`.

### B. Entrega final academica

| ID | Tarea | Estado | Estimacion | Dependencia | Criterio de salida |
|---|---|---|---:|---|---|
| `DF-01` | Completar nombre, docentes, fecha y datos institucionales de portada | `[ ] [P]` | 20-30 min | Datos oficiales | Portada sin marcadores `[Completar]` |
| `DF-02` | Sincronizar memoria y guia con Specs 194-197, 174/82 pruebas y riesgos vigentes | `[x] [I]` | 90-120 min | Evidencia canónica | Markdown alineado con roadmap y auditoria al 2026-07-30 |
| `DF-03` | Renderizar y revisar los 10 diagramas Mermaid exportables | `[ ] [P]` | 2-3 h | `DF-02` | SVG/PNG legibles, numerados y sin errores de sintaxis |
| `DF-04` | Recrear DER Crow's Foot y los 3 graficos de gestion en Draw.io | `[ ] [P]` | 4-6 h | Descripciones de la memoria | 4 fuentes editables y 4 PNG/SVG consistentes con el modelo |
| `DF-05` | Generar `DOCUMENTO_MAQUETACION.md`, DOCX APA 7 e indice automatico | `[ ] [P]` | 3-4 h | `DF-03` y `DF-04` | DOCX editable, estilos APA, tablas/figuras dentro de margenes |
| `DF-06` | Exportar y auditar el PDF en cuatro pasadas | `[ ] [P]` | 2-3 h | `DF-05` | PDF revisado pagina por pagina, enlaces y accesibilidad basica |
| `DF-07` | Preparar paquete de defensa, guion y ensayo cronometrado | `[ ] [P]` | 4-5 h | `CF-06` y `DF-06` | Exposicion base de 22-25 min dentro del rango oficial de 20-30 min, fallback y respuestas sobre limites reales |

**Subtotal pendiente estimado:** **15 h 20 min a 21 h 30 min**, porque `DF-02` ya
quedo implementado documentalmente. La entrega academica completa, incluyendo el cierre
tecnico del bloque A, requiere aproximadamente **22-31 h efectivas**, equivalentes a
**3-4 jornadas concentradas**.

### C. Condiciones oficiales y logistica de mesa

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

Las estimaciones `LG-01` a `LG-04` se solapan con `DF-05` a `DF-07` y no deben sumarse
por segunda vez al subtotal documental. No se requiere un Manual de Usuario separado:
su contenido permanece integrado en la seccion 6 de la memoria tecnica.

### D. Gates productivos externos

Estos puntos no bloquean la defensa controlada y no deben presentarse como verificados
hasta ejecutarse en el ambiente de destino.

| ID | Gate | Estado | Estimacion tecnica | Condicion externa |
|---|---|---|---:|---|
| `PR-01` | Smoke con proveedor SMTP publico | `[ ] [B]` | 1-3 h | Host, puerto, cuenta y politica institucional |
| `PR-02` | Smoke con Redis administrado | `[ ] [B]` | 1-3 h | Endpoint TLS, credenciales y red permitida |
| `PR-03` | Smoke de Cloudinary y ciclo upload/delete | `[ ] [B]` | 1-3 h | Cuenta, URL firmada y cuota aprobada |
| `PR-04` | Aceptacion Microsoft Entra en tenant institucional | `[ ] [B]` | 3-6 h | Tenant ID, dos App Registrations, scope delegado, redirect URIs, consentimiento y cuenta de prueba |
| `PR-05` | Benchmark BCrypt en hardware objetivo | `[ ] [B]` | 1-2 h | Host productivo representativo |
| `PR-06` | Alertas operativas y politica de I/O persistente | `[ ] [B]` | 2-4 h | Plataforma de monitoreo seleccionada |
| `PR-07` | Antivirus/CDR externo para uploads | `[ ] [B]` | 8-16 h | Seleccion de proveedor, API, presupuesto y privacidad |

**Esfuerzo tecnico estimado:** **17-37 h**, excluyendo tiempos de aprobacion y
provisionamiento. La aceptacion Entra, cloud publico y antivirus/CDR son evolucion productiva;
no forman parte del Definition of Done academico del MVP.

### Definition of Done de la entrega academica

1. `CF-01` a `CF-06` completados y evidenciados sobre un SHA inmutable.
2. `DF-01` y `DF-03` a `DF-07` completados; DOCX/PDF coinciden con el Markdown canonico.
3. Ningun gate externo figura como verificado sin credenciales y evidencia de destino.
4. La exposicion utiliza la formula: **Release Candidate academico, Feature Complete
   core y Code Freeze operativo local**.
5. Los limites se explican como decisiones de alcance o gates externos, no como
   funcionalidades productivas ya disponibles.

## Definition of Done por feature

1. Spec, plan y tasks completos.
2. Backend/frontend compilan cuando son afectados.
3. Migracion revisada, aplicada y sin cambios pendientes cuando corresponde.
4. Contrato GraphQL real ejecutado.
5. Autenticacion, cache y persistencia validadas en runtime.
6. Evidencia registra comandos y bloqueos reales.
7. Este roadmap, `DEVELOPMENT_LOG.md` y `DOCUMENTATION_STATUS.md` quedan sincronizados.
