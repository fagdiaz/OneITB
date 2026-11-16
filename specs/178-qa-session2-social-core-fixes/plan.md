# Implementation Plan: QA Session 2 Social Core Fixes

**Logical feature**: `178-qa-session2-social-core-fixes` | **Date**: 2026-07-11 | **Spec**: [spec.md](spec.md)

**Git note**: el hook obligatorio de rama fue intentado y rechazado por el limite del revisor de ejecucion. Se preserva el worktree existente en la rama actual y no se realizan commits automaticos.

## Summary

Estabilizar el muro academico mediante alcance de materias validado en servidor, adjuntos multiples normalizados para publicaciones y comentarios, render multimedia no excluyente, reacciones persistentes en comentarios, listado seguro de reacciones de publicaciones propias, notificaciones sociales agrupadas y footer institucional. La evolucion mantiene compatibilidad con `FileUrl`, agrega una migracion no destructiva y actualiza Apollo de forma optimista en interacciones de alta frecuencia.

## Technical Context

**Language/Version**: C#/.NET 8; JavaScript/JSX con React 18

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind CSS 4, Vite 8

**Storage**: SQL Server 2022; disco local o Cloudinary para binarios

**Testing**: xUnit/Moq/EF Core InMemory, Vitest/Testing Library, schema GraphQL y regresion de navegador

**Target Platform**: navegador web y API ASP.NET Core en desarrollo Docker/produccion Linux

**Project Type**: aplicacion web full-stack desacoplada

**Performance Goals**: feed paginado sin consulta por fila; listas acotadas; hasta 10 adjuntos y 15 MB agregados por envio; cambios de reaccion percibidos de inmediato

**Constraints**: `DeleteBehavior.Restrict`, soft-delete social, JWT obligatorio, upload desacoplado, allowlist de archivos, URLs internas/Cloudinary, ninguna libreria pesada de PDF, compatibilidad con clientes `fileUrl`

**Scale/Scope**: publicaciones y comentarios existentes deben sobrevivir a la migracion; agrupacion de notificaciones debe ser idempotente y segura ante concurrencia

## Constitution Check

### Pre-design gate

- PASS: los binarios siguen usando exclusivamente `POST /api/upload`; metadatos y acciones usan GraphQL.
- PASS: cada mutacion valida identidad, estado activo, alcance academico y ownership server-side.
- PASS: FKs nuevas son explicitas, restrictivas y sin shadow properties.
- PASS: `Inquiry`/`Comment` mantienen soft-delete y los adjuntos no se eliminan en cascada.
- PASS: URLs, cantidad, tamano, nombre y tipo se validan con limites concretos.
- PASS: el plan incluye migracion, pruebas, schema/runtime y navegador; build por si solo no cierra la spec.

### Post-design gate

- PASS: `SocialAttachment` usa un propietario exclusivo (`InquiryId` XOR `CommentId`) con check constraint.
- PASS: `CommentReaction` tiene indice unico por comentario/usuario y filtro de contenido activo.
- PASS: la agrupacion usa clave unica filtrada, contador persistente y control de concurrencia.
- PASS: las consultas de feed conservan `AsNoTracking` + `AsSplitQuery`; el listado de reacciones se pagina en servicio.
- PASS: Apollo usa actualizaciones optimistas y tipos normalizados para adjuntos/reacciones.

## Project Structure

### Documentation (this feature)

```text
specs/178-qa-session2-social-core-fixes/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- contracts/graphql.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/                  # SocialAttachment, CommentReaction, Notification
|-- Data/OneItbContext.cs             # mapping, indices, constraints, migration
|-- Services/Social/                  # rules, attachments, reactions, notification triggers
|-- Services/Notifications/           # persistent grouped upsert
|-- Services/Uploads/                 # orphan reference scan
|-- OneITB/GraphQL/                    # operations and object contracts
`-- Tests/Services.Tests/             # social/notification regression

FrontEnd/OneItb-FE/src/
|-- Components/publication/           # feed, comments, previews, lightbox, footer
|-- data/graphql/                      # query/mutation contracts and cache policy
`-- utils/                             # upload descriptors and media parsing
```

**Structure Decision**: extender los dominios Social, Notifications y Uploads existentes. Los componentes multimedia reutilizables permanecen bajo `Components/publication`; no se introduce un gestor de estado nuevo ni una API REST de negocio.

## Delivery Strategy

1. Crear modelos, mapping y pruebas de dominio antes de la migracion.
2. Mantener `fileUrl` como alias de compatibilidad y backfill de adjuntos historicos.
3. Implementar contratos GraphQL y comprobar schema antes de adaptar React.
4. Integrar selector, uploader, media, reacciones y notificaciones con cache optimista.
5. Ejecutar migracion, tests, builds, operaciones GraphQL y regresion de navegador.

## Complexity Tracking

No hay violaciones constitucionales. Las dos entidades nuevas eliminan duplicacion y soportan relaciones que el esquema singular actual no puede representar sin serializar datos no relacionales.
