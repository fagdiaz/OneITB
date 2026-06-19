# 2. Especificacion de requerimientos de software

Este entregable resume el alcance vigente. La fuente completa y versionada es [scope-and-requirements.md](../project_docs/scope-and-requirements.md).

## 2.1 Requerimientos funcionales

| Area | Capacidades |
|---|---|
| Cuentas | Registro, login JWT, BCrypt, estado activo y proteccion administrativa |
| Perfiles | Datos personales, CV, redes, carreras y roles |
| Materias | Carrera, anio, correlatividades y administracion |
| Muro | Publicaciones, filtros, comentarios, respuestas, reacciones y reportes |
| Archivos | Upload desacoplado, imagenes, documentos, YouTube y adjuntos en comentarios |
| Grafo social | Seguir, silenciar y bloquear |
| Chat | Conversaciones uno a uno, historial y WebSocket |
| Moderacion | Reportes, soft-delete y silenciamiento temporal |
| Administracion | Usuarios, roles, carreras, materias y contenido |

## 2.2 Requerimientos no funcionales

- Seguridad mediante JWT, BCrypt, autorizacion por rol y CORS restringido.
- Integridad con FKs explicitas, `DeleteBehavior.Restrict` y soft-delete.
- Rendimiento sin N+1 y con consultas acotadas.
- UI responsiva construida con Tailwind CSS 4.
- Trazabilidad mediante specs, evidencia, roadmap y development log.

## 2.3 Roles

`Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador` y `Administrador`.

## 2.4 Alcance pendiente

- Recursos academicos independientes del feed.
- Notas e integracion/simulacion SIU Guarani.
- Preferencias de notificacion por materia.
