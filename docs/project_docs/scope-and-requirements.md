# Alcance y requerimientos de OneITB23

**Ultima alineacion con codigo**: 2026-07-06

## 1. Objetivo

OneITB23 es una red social academica para estudiantes, profesores, egresados y actores institucionales. Centraliza perfiles, carreras, materias, publicaciones, archivos, interaccion social, moderacion y mensajeria privada.

## 2. Estado por modulo

| Modulo | Estado | Evidencia principal |
|---|---|---|
| Autenticacion y cuentas | Verificado | `ROADMAP.md`, specs 038-039, 099, 141, 143 |
| Perfiles, carreras y CV | Implementado/verificado por etapas | specs 020, 035, 110, 114, 142-146 |
| Materias y correlatividades | Implementado; runtime reciente bloqueado | spec 118 |
| Feed, comentarios, reacciones y reportes | Verificado en flujo base | spec 099 |
| Archivos y rich media | Implementado; runtime reciente bloqueado | specs 121-122 |
| Grafo social | Implementado | spec 110 |
| Mensajeria privada | Verificado | specs 104, 106 y 107 |
| Administracion y moderacion | Implementado/verificado por etapas | specs 099, 111, 117-119 |
| Recursos, notas y SIU | Implementado; requiere regresion autenticada de navegador para elevar a verificado | specs 136, 137, 164, 165 |

## 3. Requerimientos funcionales vigentes

### Cuentas y seguridad

- **RF-001**: Registrar cuentas institucionales y cuentas habilitadas por las reglas del rol.
- **RF-002**: Autenticar con BCrypt y emitir JWT con expiracion validada.
- **RF-003**: Bloquear acceso a cuentas inactivas.
- **RF-004**: Proteger cuentas administradoras contra degradacion o desactivacion desde la aplicacion.

### Perfiles y estructura academica

- **RF-005**: Consultar y editar el perfil propio, biografia, contacto y CV.
- **RF-006**: Asociar usuarios a una o mas carreras.
- **RF-007**: Administrar materias con carrera, anio y correlatividades.

### Muro social

- **RF-008**: Crear, buscar, filtrar, editar y desactivar publicaciones.
- **RF-009**: Comentar y responder con hilos anidados de un nivel logico recursivo.
- **RF-010**: Reaccionar, reportar, seguir, silenciar y bloquear.
- **RF-011**: Adjuntar archivos a publicaciones y comentarios mediante carga desacoplada.
- **RF-012**: Mostrar imagenes inline, documentos como tarjetas y enlaces validos de YouTube como embeds.
- **RF-013**: Priorizar autores seguidos y excluir silenciados/bloqueados del feed.

### Mensajeria

- **RF-014**: Mantener conversaciones privadas uno a uno con historial persistente.
- **RF-015**: Recibir mensajes nuevos por WebSocket con aislamiento por usuario autenticado.
- **RF-016**: Buscar contactos y mensajes y marcar mensajes como leidos.

### Administracion y moderacion

- **RF-017**: Gestionar usuarios, roles, carreras y materias desde un panel protegido.
- **RF-018**: Gestionar reportes, publicaciones y comentarios con permisos diferenciados.
- **RF-019**: Permitir silenciamientos temporales y soft-delete; no borrar contenido social fisicamente.

### Recursos academicos, SIU y notificaciones

- **RF-020**: Repositorio academico independiente del feed.
- **RF-021**: Visualizacion de notas e integracion o simulacion SIU Guarani.
- **RF-022**: Preferencias de notificacion por materia.

RF-020 a RF-022 estan implementados a nivel backend/frontend y documentados en el roadmap como `[I]`. No deben presentarse como `[V]` hasta completar regresion autenticada en navegador del hub academico.

## 4. Roles

| Rol | Capacidades principales |
|---|---|
| Estudiante | Perfil, carreras, feed, comentarios, archivos y chat |
| Profesor | Capacidades sociales y academicas de docente |
| Egresado | Perfil profesional y participacion social |
| Empleador | Identidad externa y acceso segun habilitacion |
| Moderador | Revision de reportes y silenciamiento temporal |
| Administrador | Gestion institucional; cuenta protegida contra cambios desde UI/API |

## 5. Requerimientos no funcionales

- **RNF-001 Seguridad**: JWT, BCrypt, autorizacion por rol, validacion de inputs y CORS restringido.
- **RNF-002 Integridad**: FKs explicitas, `DeleteBehavior.Restrict` y soft-delete social.
- **RNF-003 Rendimiento**: evitar N+1, proyectar/precargar grafos y paginar historiales extensos.
- **RNF-004 Escalabilidad**: separar persistencia, API y UI; documentar componentes de una sola instancia.
- **RNF-005 Usabilidad**: UI responsiva con Tailwind v4, feedback de carga y manejo de errores.
- **RNF-006 Trazabilidad**: specs, evidencia, roadmap y development log sincronizados.

## 6. Fuera de alcance actual

- Pagos y comercio electronico.
- Videollamadas.
- Almacenamiento distribuido de archivos.
- Pub/sub distribuido para multiples instancias.
- Integracion productiva con sistemas externos sin contrato disponible; la integracion SIU vigente es un adaptador mock desacoplado.
