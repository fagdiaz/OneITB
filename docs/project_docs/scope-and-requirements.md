# Alcance y requerimientos de OneITB23

**Ultima alineacion con codigo**: 2026-07-08

## 1. Objetivo

OneITB23 es una red social academica para estudiantes, profesores, egresados, empleadores y actores institucionales. Centraliza perfiles/CV, carreras, materias, publicaciones, archivos, interaccion social, mensajeria privada, recursos academicos, progreso por materia, moderacion y empleabilidad.

El objetivo institucional es ofrecer una plataforma demostrable y mantenible para la Practica Profesionalizante, con trazabilidad tecnica suficiente para defensa academica y una base razonable para evolucionar a produccion real.

## 2. Estado por modulo

| Modulo | Estado | Evidencia principal |
|---|---|---|
| Autenticacion y cuentas | Verificado/implementado por etapas | `ROADMAP.md`, specs 038-039, 099, 141, 143, 171 |
| Perfiles, carreras y CV | Implementado/verificado por etapas | specs 020, 035, 110, 114, 142-146, 148-162, 175 |
| Materias y correlatividades | Implementado; requiere regresion admin completa | spec 118 |
| Feed, comentarios, reacciones y reportes | Verificado/implementado por etapas | specs 099, 110, 121-123, 129-135, 178 |
| Archivos y rich media | Implementado/verificado por etapas | specs 121-122, 133, 135, 178 |
| Grafo social | Implementado | spec 110 |
| Mensajeria privada | Verificado | specs 104, 106, 107, 132, 160 |
| Administracion y moderacion | Implementado/verificado por etapas | specs 099, 111, 117-119, 135 |
| Recursos, notas y SIU | Implementado; requiere regresion autenticada de navegador para elevar a verificado | specs 136, 137, 164, 165 |
| Empleos y postulaciones | Implementado; requiere regresion visual y smoke SMTP real con proveedor para elevar a verificado | specs 173-175 |
| Over-delivery institucional | Implementado parcial; SSO Google bloqueado por credenciales reales | specs 168-171 |

## 3. Requerimientos funcionales vigentes

### Cuentas y seguridad

- **RF-001**: Registrar cuentas institucionales y cuentas habilitadas por las reglas del rol.
- **RF-002**: Autenticar con BCrypt y emitir JWT con expiracion validada.
- **RF-003**: Bloquear acceso a cuentas inactivas.
- **RF-004**: Proteger cuentas administradoras contra degradacion o desactivacion desde la aplicacion.
- **RF-004B**: Bloquear temporalmente cuentas ante fuerza bruta de login y resetear el estado tras autenticacion correcta.

### Perfiles y estructura academica

- **RF-005**: Consultar y editar el perfil propio, biografia, contacto y CV.
- **RF-006**: Asociar usuarios a una o mas carreras.
- **RF-006B**: Permitir que cada usuario marque su perfil como publico o privado; la API debe ocultar CV, bio, contacto, carreras y metricas sensibles a terceros no autorizados.
- **RF-007**: Administrar materias con carrera, anio y correlatividades.

### Muro social

- **RF-008**: Crear, buscar, filtrar, editar y desactivar publicaciones; la materia debe pertenecer a una carrera habilitada para el autor, salvo alcance institucional explicito.
- **RF-009**: Comentar y responder con hilos anidados de un nivel logico recursivo.
- **RF-010**: Reaccionar a publicaciones, comentarios y respuestas; reportar, seguir, silenciar y bloquear. El autor puede consultar de forma paginada quienes reaccionaron a su publicacion.
- **RF-011**: Adjuntar hasta 10 archivos y 15 MB agregados a publicaciones, comentarios y respuestas mediante carga desacoplada, conservando nombre original, tipo, tamano y orden.
- **RF-012**: Mostrar conjuntamente YouTube y todos los adjuntos; imagenes/video/PDF usan visores controlados y los documentos conservan apertura o descarga explicita.
- **RF-013**: Priorizar autores seguidos y excluir silenciados/bloqueados del feed.
- **RF-013B**: Agrupar persistentemente notificaciones de comentarios y reacciones por destinatario, publicacion y tipo, con contador y navegacion dirigida al contenido.

### Mensajeria

- **RF-014**: Mantener conversaciones privadas uno a uno con historial persistente.
- **RF-015**: Recibir mensajes nuevos por WebSocket con aislamiento por usuario autenticado.
- **RF-016**: Buscar contactos y mensajes y marcar mensajes como leidos.

### Administracion y moderacion

- **RF-017**: Gestionar usuarios, roles, carreras y materias desde un panel protegido.
- **RF-018**: Gestionar reportes, publicaciones y comentarios con permisos diferenciados.
- **RF-019**: Permitir silenciamientos temporales y soft-delete; no borrar contenido social fisicamente.

### Recursos academicos, SIU y notificaciones

- **RF-020**: Mantener un repositorio academico independiente del feed.
- **RF-021**: Visualizar notas y progreso academico por materia.
- **RF-022**: Sincronizar notas desde un adaptador SIU Guarani mock desacoplado.
- **RF-023**: Configurar preferencias de notificacion por materia/tipo.
- **RF-024**: Registrar Audit Trail transversal de entidades criticas mediante interceptor EF Core.
- **RF-025**: Exportar progreso academico como CSV e imprimir constancias formales.
- **RF-026**: Publicar credenciales digitales de materias aprobadas mediante ruta publica limitada.
- **RF-027**: Mostrar toasts globales a partir de notificaciones WebSocket.

### Empleabilidad

- **RF-028**: Publicar ofertas laborales y listarlas para estudiantes/egresados.
- **RF-029**: Permitir postulaciones unicas por oferta para estudiantes y egresados.
- **RF-030**: Permitir que el empleador propietario revise postulantes desde el Gestor de Postulaciones.
- **RF-031**: Enviar alertas institucionales de cambio de estado de postulacion mediante SMTP configurable con fallback local.
- **RF-031B**: Permitir a administradores ejecutar una prueba SMTP controlada desde GraphQL sin recorrer el flujo completo de postulaciones.

RF-020 a RF-031B estan implementados a nivel `[I]`. No deben presentarse como `[V]` hasta completar regresiones autenticadas en navegador, smoke SMTP real con proveedor configurado y pruebas productivas de servicios externos cuando aplique.

## 4. Roles y utilidad esperada

| Rol | Necesidad cubierta por el sistema |
|---|---|
| Estudiante | Identidad academica, participacion en muro por materias, recursos, progreso/notas, chat y postulaciones laborales |
| Profesor | Acompanamiento academico, recursos por materia, asignacion de progreso/notas, respuesta a consultas y comunicacion directa |
| Egresado | Perfil profesional/CV, participacion como referente y acceso a oportunidades laborales |
| Empleador | Publicacion de ofertas, revision de postulantes y comunicacion institucional del estado de postulaciones |
| Moderador | Revision de reportes, silenciamiento temporal y trazabilidad de decisiones sin borrado fisico |
| Administrador | Gobierno institucional de usuarios, roles, carreras, materias, auditoria, moderacion y configuracion operativa |

## 5. Requerimientos no funcionales

- **RNF-001 Seguridad**: JWT, BCrypt, autorizacion por rol, privacidad de perfil con masking server-side, validacion de inputs, CORS restringido, lockout por cuenta y limites anti-DoS en GraphQL.
- **RNF-002 Integridad**: FKs explicitas, `DeleteBehavior.Restrict` y soft-delete social.
- **RNF-003 Rendimiento**: evitar N+1, proyectar/precargar grafos, paginar historiales extensos y limitar profundidad GraphQL.
- **RNF-004 Escalabilidad**: separar persistencia, API, frontend, Redis opcional y almacenamiento de archivos configurable.
- **RNF-005 Usabilidad**: UI responsiva con Tailwind v4, feedback de carga, skeletons, estados vacios y manejo de errores.
- **RNF-006 Trazabilidad**: specs, evidencia, roadmap, development log, audit trail y correlation id sincronizados.
- **RNF-007 Operabilidad**: Docker SQL local canonico, compose productivo multi-contenedor, SMTP/Redis/Cloudinary configurables por entorno y fallback seguro para desarrollo.

## 6. Fuera de alcance actual

- Pagos y comercio electronico.
- Videollamadas.
- Google SSO productivo sin Client ID/secret, callbacks y politica institucional aprobados.
- Integracion SIU productiva sin contrato real disponible; la integracion vigente es un adaptador mock desacoplado.
- Despliegue Azure real y aplicacion movil nativa; la infraestructura base esta preparada, pero no debe declararse desplegada sin provisioning y smoke tests.
