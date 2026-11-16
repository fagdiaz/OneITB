# Implementation Plan: Cloud, DevOps & Scalability

**Branch**: `170-cloud-devops-scalability` | **Date**: 2026-07-07 | **Spec**: `specs/170-cloud-devops-scalability/spec.md`

## Summary

Prepare OneITB23 for production/cloud operation without changing business behavior: add production Docker assets, conditional Redis subscriptions, conditional Cloudinary storage, rate limiting, security headers and evidence-based documentation updates.

## Technical Context

**Language/Version**: .NET 8, React 18, Vite 8, Nginx Alpine, Docker Compose

**Primary Dependencies**: HotChocolate 14.2.0, HotChocolate.Subscriptions.Redis 14.2.0, EF Core 8.0.6, ASP.NET Core RateLimiting

**Storage**: SQL Server 2022, local disk `/uploads`, optional Cloudinary

**Testing**: `dotnet build`, `dotnet test`, `npm.cmd run build`, Docker config static validation

**Target Platform**: Linux containers and existing Windows local development

**Project Type**: Full-stack web application

**Performance Goals**: horizontal-safe subscription transport when Redis is configured; bounded request abuse with 100 requests/minute default per IP

**Constraints**: no secrets committed; Code Freeze for business logic; local development must work without Redis/Cloudinary

**Scale/Scope**: single-node local fallback and production topology prepared for multiple API replicas behind a reverse proxy

## Constitution Check

- **AD-001**: PASS. No new REST business endpoint is introduced; `/api/upload` remains the only binary REST exception.
- **AD-005**: PASS. Upload validation remains authenticated, bounded and routed through the existing endpoint.
- **AD-006**: PASS. Docker SQL remains the canonical runtime path; production compose extends it.
- **AD-008**: PASS. No frontend session boundary changes.
- **AD-010**: PASS. Roadmap updates are tied to implementation and validation evidence.
- **Secrets rule**: PASS. Docker uses variable interpolation and appsettings contain placeholders only.

## Project Structure

### Documentation

```text
specs/170-cloud-devops-scalability/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
`-- evidence.md
```

### Source Code

```text
API Graphql/OneITB/
|-- Dockerfile
|-- Controllers/UploadController.cs
|-- Infrastructure/SecurityHeadersMiddleware.cs
|-- Services/Storage/*.cs
|-- Startup.cs
`-- appsettings.json

FrontEnd/OneItb-FE/
|-- Dockerfile
|-- nginx.conf
`-- src/data/graphql/GraphqlProvider.js

docker-compose.prod.yml
.dockerignore
```

**Structure Decision**: Infrastructure stays in the API host project because it depends on ASP.NET Core, `IFormFile`, hosting environment and production middleware.

## Complexity Tracking

No constitutional violations.
