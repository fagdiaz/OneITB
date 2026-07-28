# 1. Presentacion general del proyecto

## 1.1 Organizacion

OneITB23 es un proyecto academico full-stack desarrollado para el Instituto Tecnologico Beltran en el marco de Practica Profesionalizante. El trabajo integra desarrollo web, persistencia, seguridad, experiencia de usuario, DevOps y documentacion mediante un flujo iterativo basado en especificaciones.

## 1.2 Problema

La informacion academica y la comunicacion entre estudiantes, docentes, egresados y actores externos suele quedar distribuida entre canales sin trazabilidad comun. Esto dificulta encontrar respuestas por materia, compartir recursos, sostener conversaciones contextualizadas y vincular el perfil academico con oportunidades laborales.

## 1.3 Objetivo

Construir una red social educativa institucional que permita:

- Organizar usuarios por carreras y materias.
- Crear publicaciones, comentarios, respuestas, reacciones y reportes.
- Compartir archivos educativos, recursos academicos y multimedia.
- Mantener perfiles academicos/profesionales con formato de CV y controles de privacidad.
- Consultar progreso academico, notas y constancias.
- Comunicarse mediante chat privado en tiempo real.
- Moderar contenido y auditar decisiones institucionales.
- Publicar ofertas laborales y gestionar postulaciones.
- Preparar una base tecnica para despliegue cloud y futura extension movil.

## 1.4 Stack

- Backend: .NET 8, ASP.NET Core, HotChocolate GraphQL 14 y EF Core 8.
- Persistencia: SQL Server 2022 en Docker para runtime local; Azure SQL queda como objetivo de despliegue.
- Frontend Web: React 18, Apollo Client, Vite 8 y Tailwind CSS 4.
- Tiempo real: GraphQL Subscriptions por WebSocket; Redis Pub/Sub opcional en produccion.
- Archivos: `/api/upload` desacoplado, disco local por defecto y Cloudinary opcional.
- Correo: SMTP obligatorio en produccion y pickup `.eml` local, ignorado y sin secretos en logs para desarrollo.
- Infraestructura: Docker multi-stage, Nginx, GitHub Actions y compose productivo.
- Frontend Movil: React Native + Expo planificado; no existe codigo mobile versionado.

## 1.5 Estado

El estado verificable se mantiene en [ROADMAP.md](../project_docs/ROADMAP.md). El proyecto se encuentra alrededor del 98% de avance documentado y con core funcional Feature Complete. Los modulos sociales, perfiles/CV con privacidad, mensajeria, administracion, recursos academicos, SIU mock, notificaciones y empleos estan implementados a nivel `[I]` o `[V]` segun evidencia. Las regresiones visuales autenticadas, SSO Google productivo, despliegue Azure real y mobile quedan fuera del cierre inmediato.
