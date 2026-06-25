# Roadmap unico de OneITB23

**Ultima revision**: 2026-06-25

**Estado global**: 86% (65 de 76 items)

Este archivo concentra avance funcional, estabilizacion, deuda tecnica y prioridades. No existe un roadmap paralelo.

## Convencion de estado

- `[x] [V]`: completado y verificado mediante runtime.
- `[x] [I]`: implementado con evidencia de codigo, build, migracion o prueba aislada; puede requerir regresion runtime.
- `[ ] [P]`: pendiente.
- `[ ] [B]`: implementacion o validacion bloqueada por una condicion concreta.

Los porcentajes cuentan items `[x]`. La etiqueta conserva la diferencia entre implementacion y verificacion.

## Modulo 1 - Identidad, cuentas y seguridad: 88% (7/8)

- [x] [V] Relacion 1:1 `Account`-`User` y passwords BCrypt `char(60)`.
- [x] [V] Registro y login con JWT.
- [x] [V] Bloqueo de acceso para cuentas inactivas.
- [x] [V] Expiracion JWT, pipeline de autenticacion y CORS restringido.
- [x] [V] Sesion frontend normalizada sobre `token` y `user`.
- [x] [V] Autorizacion por roles en operaciones sensibles.
- [x] [I] Flujo Magic Link para empleadores.
- [ ] [P] Suite automatizada de registro, login, expiracion y autorizacion.

## Modulo 2 - Perfiles e identidad social: 88% (7/8)

- [x] [V] Perfil publico y perfil propio autenticado.
- [x] [I] Edicion aislada del perfil y CV.
- [x] [I] Biografia, contacto y redes sociales.
- [x] [I] Asociacion de usuarios a multiples carreras.
- [x] [I] Resumen de publicaciones en perfil publico.
- [x] [I] Roles diferenciados e insignias de participacion.
- [x] [I] Seguir, silenciar y bloquear usuarios.
- [ ] [P] Controles de privacidad y gestion explicita de seguidores.

## Modulo 3 - Carreras y materias: 100% (7/7)

- [x] [I] CRUD y estado activo de carreras.
- [x] [I] Materias asociadas obligatoriamente a una carrera.
- [x] [I] Anio de cursada validado entre 1 y 6.
- [x] [I] Correlatividades N:M con integridad restrictiva.
- [x] [I] Inscripcion de usuarios a multiples carreras.
- [x] [I] Selectores en cascada carrera-materia en feed y administracion.
- [x] [I] Progreso academico, cursadas y notas por usuario.

## Modulo 4 - Feed, comentarios y multimedia: 94% (16/17)

- [x] [V] `Inquiry` vinculada a autor y materia sin N+1.
- [x] [V] Creacion, lectura, refetch y persistencia de publicaciones.
- [x] [I] Busqueda y filtros por carrera y materias.
- [x] [I] Edicion y soft-delete de publicaciones.
- [x] [V] Comentarios y respuestas anidadas.
- [x] [I] Edicion y soft-delete de comentarios.
- [x] [V] Reacciones con contador.
- [x] [V] Reportes comunitarios.
- [x] [I] Prioridad de seguidos y exclusion de silenciados/bloqueados.
- [x] [I] Upload desacoplado y `Inquiry.FileUrl`.
- [x] [I] Adjuntos persistentes en comentarios y respuestas.
- [x] [I] Imagenes inline con URL de backend, tarjetas de documentos y YouTube con miniatura previa y carga por click sobre `youtube-nocookie`.
- [x] [I] Previsualizacion de enlaces via GraphQL autenticado con controles SSRF.
- [x] [V] Regresion end-to-end de uploads/rich media con backend local disponible.
- [x] [V] Limpieza de archivos huerfanos cuando GraphQL falla tras el upload.
- [x] [V] Paginacion o scroll incremental del feed.
- [ ] [P] Pruebas automatizadas de publicaciones, comentarios y archivos.

## Modulo 5 - Mensajeria privada: 88% (7/8)

- [x] [V] Persistencia de mensajes uno a uno.
- [x] [V] Contactos e historial paginados.
- [x] [V] Queries y mutations autenticadas por participante.
- [x] [V] Subscription privada con JWT por WebSocket.
- [x] [V] UI optimista, deduplicacion y reconciliacion al reconectar.
- [x] [V] Busqueda de contactos y mensajes.
- [x] [I] Integracion entre chat completo y widget sin updates cruzados.
- [ ] [P] Reemplazar pub/sub en memoria por transporte distribuido.

## Modulo 6 - Administracion y moderacion: 90% (9/10)

- [x] [I] Gestion de usuarios, roles y estado.
- [x] [I] Proteccion de cuentas administradoras y promocion con password.
- [x] [I] Gestion de carreras, materias y correlatividades.
- [x] [V] Flujo de reportes comunitarios.
- [x] [I] Explorador de publicaciones y comentarios.
- [x] [I] Silenciamiento temporal por moderadores.
- [x] [I] Metricas, short IDs y jerarquia visual por rol.
- [x] [V] Seed administrado e idempotente.
- [x] [V] Auditoria persistente de acciones administrativas y de moderacion.
- [ ] [P] Regresion runtime del panel tras cambios de materias y superadmin.

## Modulo 7 - Recursos y seguimiento academico: 83% (5/6)

- [x] [I] Entidad y repositorio de recursos academicos independiente del feed.
- [x] [I] Permisos de recursos por carrera, materia y rol.
- [ ] [P] Busqueda, categorias y versionado de recursos.
- [x] [I] Visualizacion de notas y progreso academico.
- [x] [I] Adaptador o simulador desacoplado para SIU Guarani.
- [x] [I] Preferencias de notificacion por materia.

## Modulo 8 - Calidad, operacion y escalabilidad: 58% (7/12)

- [x] [I] Stack normalizado en .NET 8, EF Core 8 y HotChocolate 14.
- [x] [I] FKs explicitas, `DeleteBehavior.Restrict` y soft-delete social.
- [x] [I] Builds Release/Vite y gates de migraciones documentados.
- [x] [I] Documentacion consolidada y fuentes de verdad definidas.
- [x] [I] Evidencia por spec y development log cronologico inverso.
- [x] [I] Base de pruebas unitarias del backend para servicios academicos y notificaciones.
- [ ] [P] Pruebas de componentes y estado frontend.
- [ ] [P] Pruebas de integracion GraphQL con SQL Server de prueba.
- [ ] [P] Pipeline CI para build, tests y validacion de migraciones.
- [ ] [P] Logging estructurado, metricas y trazabilidad de errores.
- [x] [V] Entorno local reproducible sin bloqueo de SQL SSPI/certificado HTTPS.
- [ ] [P] Actualizacion controlada de dependencias y division del bundle frontend.

## Prioridades

### P0 - Estabilizacion inmediata

1. Incorporar pruebas automatizadas de autenticacion y feed.
2. Verificar visualmente el panel admin completo en navegador contra SQL Docker.
3. Mantener Docker SQL como runtime local canonico para evitar SSPI/LocalDB.

### P1 - Cierre del nucleo social

1. Paginacion del feed: verificada en runtime contra Docker SQL.
2. Limpieza de uploads huerfanos: verificada en runtime contra Docker SQL.
3. Auditoria persistente de moderacion: verificada en runtime contra Docker SQL.

### P2 - Alcance academico pendiente

1. Busqueda, categorias y versionado de recursos.

### P3 - Escalabilidad y operacion

1. Pub/sub distribuido.
2. Almacenamiento compartido de archivos.
3. CI, observabilidad y actualizacion de dependencias.

### P4 - Contenedores y CI/CD

1. Dockerización del entorno local y de producción.
2. Integración y despliegue continuo con GitHub Actions.

### P5 - Despliegue Cloud Gratuito

1. Migración y despliegue del backend en Azure App Service F1.
2. Migración y alojamiento de base de datos en Azure SQL Free Tier.
3. Integración de Cloudinary para el alojamiento de imágenes y archivos estáticos.

### P6 - Ecosistema Móvil

1. Inicialización del proyecto móvil con React Native + Expo.
2. Sincronización del estado y cache Apollo entre Web y Mobile.
3. Compilación de APK y distribución en entornos de prueba.

## Definition of Done por feature

1. Spec, plan y tasks completos.
2. Backend/frontend compilan cuando son afectados.
3. Migracion revisada, aplicada y sin cambios pendientes cuando corresponde.
4. Contrato GraphQL real ejecutado.
5. Autenticacion, cache y persistencia validadas en runtime.
6. Evidencia registra comandos y bloqueos reales.
7. Este roadmap, `DEVELOPMENT_LOG.md` y `DOCUMENTATION_STATUS.md` quedan sincronizados.
