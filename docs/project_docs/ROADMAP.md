# Roadmap unico de OneITB23

**Ultima revision**: 2026-07-13

**Estado global**: 98% (106 de 108 items)

**Feature Complete funcional core**: 100%. Los pendientes restantes pertenecen a regresion visual, credenciales externas, despliegue cloud real o ecosistema mobile.

Este archivo concentra avance funcional, estabilizacion, deuda tecnica y prioridades. No existe un roadmap paralelo.

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
- [x] [I] Flujo Magic Link para empleadores.
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

## Modulo 6 - Administracion y moderacion: 90% (9/10)

- [x] [I] Gestion de usuarios, roles y estado.
- [x] [I] Proteccion de cuentas administradoras y promocion con password.
- [x] [I] Gestion de carreras, materias y correlatividades.
- [x] [V] Flujo de reportes comunitarios.
- [x] [I] Explorador de publicaciones y comentarios.
- [x] [I] Silenciamiento temporal por moderadores.
- [x] [I] Metricas, short IDs y jerarquia visual por rol.
- [x] [V] Seed administrado e idempotente.
- [x] [V] Auditoria persistente de acciones administrativas y moderacion reversible con motivo, separada de la edicion exclusiva del autor.
- [ ] [P] Regresion runtime del panel tras cambios de materias y superadmin.

## Modulo 7 - Empleos y Gestor de Postulaciones: 100% (9/9)

- [x] [I] Entidad `JobOffer` con FK explicita a `User` y `DeleteBehavior.Restrict`.
- [x] [I] Entidad `JobApplication` con estados `Pending`, `Reviewed` y `Rejected`, FKs restrictivas e indice unico por oferta/postulante.
- [x] [I] GraphQL `jobOffers`, `myJobOffers`, `createJobOffer`, `applyToJob`, `updateApplicationStatus` y subscription `jobOfferCreated`.
- [x] [I] Vista `/empleos` con skeletons, empty state, tarjetas laborales, postulacion GraphQL, estado `Postulado` y deep-link que enfoca/resalta la oferta exacta.
- [x] [I] Vista `/empleos/mis-ofertas` como Gestor de Postulaciones con postulantes, filtros por estado, perfil academico y acciones de revision/rechazo.
- [x] [I] Badge realtime en Nav para nuevas ofertas laborales y limpieza al ingresar a `/empleos`.
- [x] [I] Alertas por correo SMTP para cambios de estado de postulaciones, con fallback local sin romper desarrollo/CI.
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

## Modulo Extra - Caracteristicas de Alto Impacto (Efecto WOW): 80% (4/5)

- [x] [I] Trazabilidad academica transversal mediante `AuditLog` y `SaveChangesInterceptor` de EF Core para entidades criticas.
- [x] [I] Generacion de constancias y exportacion CSV/impresion formal desde el modulo academico.
- [ ] [B] Integracion Single Sign-On con Google OAuth2; bloqueada hasta contar con Client ID/secret reales, dominios de callback aprobados y politica institucional.
- [x] [I] Credenciales digitales publicas para progreso aprobado mediante ruta `/certificate/{id}` y query GraphQL publica limitada.
- [x] [I] Toast notifications globales conectadas a GraphQL Subscriptions existentes.

## Prioridades

### P0 - Estabilizacion inmediata

1. Verificar visualmente el panel admin completo en navegador contra SQL Docker.
2. Mantener Docker SQL como runtime local canonico para evitar SSPI/LocalDB.
3. Mantener y ampliar el baseline automatizado hacia SQL Server/Testcontainers y browser QA del panel admin.

### P1 - Cierre del nucleo social

1. Paginacion del feed: verificada en runtime contra Docker SQL.
2. Limpieza de uploads huerfanos: verificada en runtime contra Docker SQL.
3. Auditoria persistente de moderacion: verificada en runtime contra Docker SQL.
4. Adjuntos multiples, reacciones de comentarios y notificaciones agrupadas: verificados por tests y smoke GraphQL autenticado contra Docker SQL.

### P2 - Alcance academico

1. Cerrado a nivel de implementacion y hardening tecnico. El hub academico requiere regresion autenticada en navegador para elevar recursos a `[V]`.
2. Empleos y Gestor de Postulaciones quedan implementados end-to-end y requieren regresion visual en navegador para elevar `/empleos` y `/empleos/mis-ofertas` de `[I]` a `[V]`.

### P3 - Escalabilidad y operacion

1. `[x] [I]` Pub/sub distribuido Redis, activado por `ConnectionStrings:Redis` y fallback InMemory local.
2. `[x] [I]` Almacenamiento compartido opcional con Cloudinary, activado por `CloudinarySettings:Url` y fallback local.
3. `[x] [I]` Hardening operativo: rate limiting, security headers, healthcheck y auditoria npm productiva en cero vulnerabilidades conocidas.
4. `[x] [I]` Hardening GraphQL anti-DoS: profundidad maxima configurable y limites globales de paginacion.
5. `[ ] [B]` SSO Google productivo con credenciales institucionales y callback URLs definitivas.

### P4 - Contenedores y CI/CD

1. `[x] [I]` Dockerizacion del entorno local y de produccion.
2. `[x] [I]` Integracion y despliegue continuo con GitHub Actions.

### P5 - Despliegue Cloud Gratuito

1. `[ ] [P]` Migracion y despliegue del backend en Azure App Service F1.
2. `[ ] [P]` Migracion y alojamiento de base de datos en Azure SQL Free Tier.
3. `[x] [I]` Integracion de Cloudinary para el alojamiento de imagenes y archivos estaticos.

### P6 - Ecosistema Movil

1. Inicializacion del proyecto movil con React Native + Expo.
2. Sincronizacion del estado y cache Apollo entre Web y Mobile.
3. Compilacion de APK y distribucion en entornos de prueba.

## Definition of Done por feature

1. Spec, plan y tasks completos.
2. Backend/frontend compilan cuando son afectados.
3. Migracion revisada, aplicada y sin cambios pendientes cuando corresponde.
4. Contrato GraphQL real ejecutado.
5. Autenticacion, cache y persistencia validadas en runtime.
6. Evidencia registra comandos y bloqueos reales.
7. Este roadmap, `DEVELOPMENT_LOG.md` y `DOCUMENTATION_STATUS.md` quedan sincronizados.
