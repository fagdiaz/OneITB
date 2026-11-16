# Implementation Plan: Archivos adjuntos en publicaciones

**Branch**: `121-file-upload-inquiries` | **Date**: 2026-06-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/121-file-upload-inquiries/spec.md`

## Summary

Normalizar la carga desacoplada ya iniciada en el repositorio: renombrar el contrato persistido `AttachedFileUrl` a `FileUrl` sin perder datos, exponer un endpoint REST autenticado y limitado, servir archivos estaticos y conectar el flujo asincrono del feed con GraphQL.

## Technical Context

**Language/Version**: C# / .NET 8; JavaScript / React 18
**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, Tailwind CSS 4
**Storage**: SQL Server para metadatos; `wwwroot/uploads` para archivos locales
**Testing**: builds Release/Vite, migracion EF, contrato HTTP/GraphQL y flujo de navegador cuando el entorno local este disponible
**Target Platform**: Aplicacion web local con backend ASP.NET Core y navegador moderno
**Project Type**: Full-stack web application
**Performance Goals**: Una carga por publicacion, limite estricto de 15 MB y feedback inmediato
**Constraints**: Sin GraphQL Upload; JWT obligatorio; nombres GUID; sin perdida de URLs existentes; sin commit ni push
**Scale/Scope**: Almacenamiento local de una sola instancia

## Constitution Check

- PASS: las operaciones de aplicacion siguen usando GraphQL salvo la transferencia binaria desacoplada definida por CU-07.
- PASS: el JWT protege la carga y la mutacion conserva autorizacion existente.
- PASS: la migracion renombra la columna y preserva datos.
- PASS: el frontend mantiene Apollo para datos y Tailwind v4 para UI.
- PASS: la validacion incluye compilacion, contrato y persistencia cuando el runtime lo permita.

## Project Structure

### Documentation (this feature)

```text
specs/121-file-upload-inquiries/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/upload-api.md
|-- checklists/requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
API Graphql/
|-- Entities/Models/Inquiry.cs
|-- Data/OneItbContext.cs
|-- Data/Migrations/
|-- Services/Social/
`-- OneITB/Controllers/UploadController.cs

FrontEnd/OneItb-FE/src/
|-- Components/publication/Feed.jsx
`-- data/graphql/{queries,mutations}/inquiries.js
```

**Structure Decision**: Reusar las capas existentes. El nuevo controlador reemplaza la ruta heredada de carga; los archivos se sirven directamente por el middleware estatico.

## Complexity Tracking

No hay violaciones constitucionales que requieran excepcion.
