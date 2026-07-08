# 2. Especificacion de requerimientos de software

Este entregable resume el alcance vigente. La fuente completa y versionada es [scope-and-requirements.md](../project_docs/scope-and-requirements.md).

## 2.1 Requerimientos funcionales

| Area | Capacidades |
|---|---|
| Cuentas | Registro institucional, login JWT, BCrypt, cuenta activa, lockout y proteccion administrativa |
| Perfiles | Datos personales, CV, redes, avatar, carreras, roles, metricas y privacidad |
| Materias | Carrera, anio, correlatividades y administracion |
| Muro | Publicaciones, filtros, comentarios, respuestas, reacciones, reportes y soft-delete |
| Archivos | Upload desacoplado, imagenes, documentos, YouTube y adjuntos en comentarios |
| Grafo social | Seguir, silenciar y bloquear |
| Chat | Conversaciones uno a uno, historial, no leidos y WebSocket |
| Moderacion | Reportes, silenciamiento temporal, auditoria y trazabilidad |
| Administracion | Usuarios, roles, carreras, materias, contenido y metricas |
| Academico | Recursos por materia, categorias/versionado, progreso, SIU mock, constancias y credenciales |
| Empleos | Ofertas, postulaciones, Gestor de Postulaciones, notificaciones y correo SMTP |
| Operacion | Docker, CI, rate limiting, security headers, Redis/Cloudinary/SMTP opcionales |

## 2.2 Requerimientos no funcionales

- Seguridad mediante JWT, BCrypt, autorizacion por rol, privacidad server-side, CORS restringido, lockout por cuenta y limites anti-DoS GraphQL.
- Integridad con FKs explicitas, `DeleteBehavior.Restrict`, soft-delete social y estados activos donde corresponde.
- Rendimiento sin N+1, queries acotadas, paginacion y `AsSplitQuery`/DataLoaders segun el grafo.
- UI responsiva construida con Tailwind CSS 4 y sistema visual Clean Tech / Tech Noir.
- Trazabilidad mediante specs, evidencia, roadmap, development log, audit trail y correlation id.
- Operacion con Docker local/productivo, CI y configuraciones por entorno sin secretos versionados.
- Disponibilidad Web actual y extension futura hacia ecosistema movil React Native.

## 2.3 Roles

`Estudiante`, `Profesor`, `Egresado`, `Empleador`, `Moderador` y `Administrador`.

## 2.4 Alcance pendiente honesto

- Regresion autenticada en navegador del panel admin, hub academico y Gestor de Postulaciones.
- Smoke tests productivos con Redis, Cloudinary y SMTP reales.
- Google SSO productivo con credenciales y callbacks institucionales.
- Provisioning y smoke test en Azure App Service/Azure SQL.
- App movil nativa React Native + Expo.
