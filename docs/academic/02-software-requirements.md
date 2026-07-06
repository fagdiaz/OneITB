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
| Academico | Recursos por materia, categorias/versionado, progreso, SIU mock y notificaciones |

## 2.2 Requerimientos no funcionales

- Seguridad mediante JWT, BCrypt, autorizacion por rol y CORS restringido.
- Integridad con FKs explicitas, `DeleteBehavior.Restrict` y soft-delete.
- Rendimiento sin N+1 y con consultas acotadas.
- UI responsiva construida con Tailwind CSS 4.
- Trazabilidad mediante specs, evidencia, roadmap y development log.
- Disponibilidad Web actual y extension futura hacia ecosistema movil React Native.
- Rendimiento y optimización de consumo de recursos bajo un entorno Cloud de capa gratuita (Azure App Service F1 / Azure SQL Free Tier / Docker).

## 2.3 Roles

`Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador` y `Administrador`.

## 2.4 Alcance pendiente

- Regresion autenticada en navegador del hub academico.
- Pruebas automatizadas frontend de componentes y estado.
- Pruebas de integracion GraphQL contra SQL Server de prueba.
- Pub/sub distribuido, almacenamiento compartido de archivos, despliegue cloud y app movil.
