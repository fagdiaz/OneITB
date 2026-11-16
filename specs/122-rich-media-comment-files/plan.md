# Implementation Plan: Multimedia enriquecida y adjuntos en comentarios

**Branch**: `122-rich-media-comment-files` | **Date**: 2026-06-19 | **Spec**: [spec.md](spec.md)

## Summary

Extender `Comment` con `FileUrl`, reutilizar el upload REST autenticado y crear componentes livianos para clasificar/renderizar adjuntos y enlaces de YouTube en publicaciones, comentarios y respuestas.

## Technical Context

**Language/Version**: C# / .NET 8; JavaScript / React 18
**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind CSS 4, FontAwesome 6.6
**Storage**: SQL Server y archivos estaticos bajo `wwwroot/uploads`
**Testing**: build Release, build Vite, migracion EF, pruebas del parser y verificacion de navegador cuando el backend este disponible
**Target Platform**: Navegador moderno y backend ASP.NET Core
**Project Type**: Full-stack web application
**Performance Goals**: Sin dependencias nuevas; embeds con carga diferida; una carga desacoplada por comentario
**Constraints**: Sin HTML inyectado, sin reproductores externos, JWT y limite de 15 MB existentes, sin commit ni push
**Scale/Scope**: Primer video valido por publicacion; adjuntos en comentarios y respuestas

## Constitution Check

- PASS: GraphQL conserva datos y REST se limita a la transferencia binaria ya aprobada.
- PASS: la nueva columna es opcional y no cambia relaciones ni DeleteBehavior.
- PASS: no se incorporan dependencias frontend ni HTML de usuario.
- PASS: se mantiene Tailwind v4 y el contrato canonico en ingles.

## Project Structure

```text
specs/122-rich-media-comment-files/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/graphql.md
|-- checklists/requirements.md
`-- tasks.md

API Graphql/
|-- Entities/Models/Comment.cs
|-- Data/OneItbContext.cs
|-- Data/Migrations/
|-- Services/Social/
`-- OneITB/{Controllers/UploadController.cs,GraphQL/Mutation.cs}

FrontEnd/OneItb-FE/src/
|-- Components/publication/{Feed.jsx,CommentThread.jsx,MediaAttachment.jsx}
|-- utils/mediaParser.js
`-- data/graphql/{queries,mutations}/inquiries.js
```

**Structure Decision**: Mantener la mutacion de comentarios en `inquiries.js`, que es el modulo real vigente, y extraer parsing/renderizado para compartirlo entre tarjetas y burbujas.

## Complexity Tracking

No hay excepciones constitucionales.
