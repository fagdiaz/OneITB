# Implementation Plan: UX Alignment and SMTP

**Branch**: `174-ux-alignment-and-smtp` | **Date**: 2026-07-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/174-ux-alignment-and-smtp/spec.md`

## Summary

This spec performs a Code Freeze-safe polish pass: rename visible jobs-module terminology from ATS to Gestor de Postulaciones/Perfil Academico, add immediate Tailwind feedback to status controls, and introduce an SMTP email sender abstraction with console fallback. `updateApplicationStatus` will notify applicants by email when a status becomes Reviewed or Rejected, without rolling back the persisted status if email delivery fails.

## Technical Context

**Language/Version**: .NET 8, React 18

**Primary Dependencies**: ASP.NET Core DI/configuration, HotChocolate GraphQL, Apollo Client, Tailwind CSS v4, built-in `System.Net.Mail`

**Storage**: SQL Server unchanged; no migration

**Testing**: `dotnet build`, backend service tests, Vite build, optional Vitest if environment permits

**Target Platform**: Local Docker SQL runtime and production-ready ASP.NET Core host

**Project Type**: Full-stack web app

**Performance Goals**: No additional database queries beyond the existing loaded `JobApplication` graph; email side effect must not block successful status persistence on provider failure.

**Constraints**: Code Freeze, no new screens, no EF schema changes, no secrets in tracked files, GraphQL business operations remain in `/graphql`.

**Scale/Scope**: Existing jobs/postulations module only.

## Constitution Check

- Decoupled contracts: PASS. Business operation stays GraphQL; no new REST endpoint.
- Security: PASS. SMTP secrets are configuration-only; no plaintext secrets in code/docs.
- Input validation: PASS. No new unbounded user input is introduced.
- Relational integrity: PASS. No EF model change.
- Session/token management: PASS. Existing authorization/ownership in `JobService` remains authoritative.
- Evidence: PASS. Builds and evidence will be recorded.

## Project Structure

### Documentation

```text
specs/174-ux-alignment-and-smtp/
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
|-- Services/Email/
|   |-- IEmailSender.cs
|   |-- ConsoleEmailService.cs
|   |-- SmtpEmailService.cs
|   `-- SmtpEmailSettings.cs
|-- Startup.cs
`-- GraphQL/Mutation.cs

FrontEnd/OneItb-FE/src/
|-- Components/jobs/EmployerJobOffers.jsx
`-- Components/layout/private/Nav.jsx
```

**Structure Decision**: Email delivery is host-level infrastructure because it depends on ASP.NET Core configuration and DI. The jobs service keeps ownership/authorization; the mutation coordinates post-persistence notification side effects.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
