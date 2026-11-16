# Implementation Plan: Production Security and Seeding

**Branch**: `171-production-security-and-seeding` | **Date**: 2026-07-07 | **Spec**: `specs/171-production-security-and-seeding/spec.md`

## Summary

Close the final MVP-to-production backend gaps without changing React UI: configure HotChocolate depth/paging limits, add account-level lockout for brute-force mitigation, and harden the existing demo seeder so Docker/production startup is reproducible without versioned secrets.

## Technical Context

**Language/Version**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, SQL Server 2022

**Primary Dependencies**: HotChocolate validation, EF Core migrations, BCrypt.Net

**Storage**: SQL Server through `OneItbContext`

**Testing**: `dotnet build`, `dotnet test`, EF migration generation

**Target Platform**: Existing Windows local development and Linux production containers

**Project Type**: Backend/infrastructure hardening

**Performance Goals**: reject abusive GraphQL depth before resolver execution; keep login lockout O(1) lookup on indexed email

**Constraints**: no React UI changes; no hardcoded production passwords; preserve existing GraphQL `login` payload contract

## Constitution Check

- **AD-002 / Security**: PASS. Passwords remain BCrypt and lockout metadata does not expose secrets.
- **AD-003 / Input bounds**: PASS. GraphQL depth and paging are bounded.
- **AD-004 / Relational integrity**: PASS. No new FK is introduced.
- **AD-006 / Evidence-based completion**: PASS. Build/tests/migration evidence recorded.
- **Secrets rule**: PASS. Production seed password is supplied through environment/configuration.

## Project Structure

```text
API Graphql/
|-- Entities/Models/Account.cs
|-- Data/OneItbContext.cs
|-- Data/DbInitializer.cs
|-- Data/Migrations/*AddAccountLockout*
|-- OneITB/Program.cs
|-- OneITB/Startup.cs
|-- OneITB/appsettings.json
|-- Services/Accounts/AccountsService.cs
`-- Tests/Services.Tests/Auth/AccountsServiceTests.cs

docker-compose.prod.yml
docs/audit/*
docs/project_docs/ROADMAP.md
```

## Complexity Tracking

No constitutional violation or extra complexity requiring exception. The prompt's original `UserError` union request was intentionally adapted to the existing `AuthPayload` contract to avoid a frontend breaking change during Code Freeze.
