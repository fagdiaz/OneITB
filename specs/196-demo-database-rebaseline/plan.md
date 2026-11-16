# Implementation Plan: Demo Database Rebaseline

**Branch**: `codex/196-demo-database-rebaseline` | **Date**: 2026-07-29 |
**Spec**: [spec.md](spec.md)

## Summary

Create a guarded PowerShell rebaseline runbook, extend the existing enterprise seed to
cover the complete demonstrable domain, back up and recreate only the Docker-local
`OneItb` database, prove idempotency/integrity and role authentication, then reconcile
canonical documentation and diagrams.

## Technical Context

**Language/Version**: C# 12 / .NET 8; PowerShell 5.1-compatible orchestration; React 18

**Primary Dependencies**: EF Core 8, SQL Server 2022 Docker, HotChocolate 14, BCrypt,
Apollo Client 3.7, Vite 8

**Storage**: Docker SQL database `OneItb`; local timestamped `.bak`; local uploads

**Testing**: xUnit, HotChocolate integration tests, Vitest, Vite build, SQL integrity
queries, authenticated GraphQL smoke tests

**Target Platform**: Windows development workstation and Docker Desktop

**Project Type**: Full-stack web application with operational scripts

**Performance Goals**: Complete finite rebaseline and validation without tracker growth
or duplicate rows; runtime requests complete within configured smoke timeouts

**Constraints**: No production access, no tracked secrets, no blocking servers, no
volume deletion, backup required, fail closed on target mismatch

**Scale/Scope**: One canonical local demonstration dataset covering all active modules

## Constitution Check

- **Decoupled contracts**: PASS. Runtime proof uses GraphQL; SQL is used only for
  operational backup, migration, and integrity inspection.
- **Password hashing**: PASS. `IPasswordHasher` remains the only seed hash source.
- **Input/security**: PASS. Destructive input is bounded by exact container, host,
  database, and explicit confirmation.
- **Relational integrity**: PASS. Existing explicit FKs and restrictive deletes remain;
  integrity queries verify the rebuilt result.
- **Session security**: PASS. Tokens and credentials are never written to evidence.
- **Evidence-based completion**: PASS. Builds, tests, migrations, runtime role login,
  idempotency, and documentation checks are required.

## Architecture Decisions

1. Preserve normal idempotent seed semantics: existing passwords are not overwritten.
2. Rebaseline by dropping only `OneItb`, never by deleting the Docker volume.
3. Back up inside SQL Server storage and copy the artifact to ignored host storage.
4. Extend `EnterpriseDemoSeeder` with deterministic academic/CV/preferences/report
   phases and clear the Change Tracker after each save.
5. Add finite scripts for sanitized inventory and integrity evidence.
6. Use the Vite same-origin proxy for browser-facing runtime smoke checks.

## Project Structure

```text
API Graphql/
├── Data/EnterpriseDemoSeeder.cs
└── Tests/Services.Tests/Data/EnterpriseDemoSeederTests.cs
scripts/
├── reset-demo-database.ps1
└── validate-demo-database.ps1
docs/
├── audit/
├── academic/
├── project_docs/
└── entrega_final/
specs/196-demo-database-rebaseline/
```

## Execution Phases

1. Baseline audit and quality gates.
2. Seeder/test/script implementation.
3. Target validation and backup.
4. Database reconstruction and double seed.
5. Integrity and runtime role acceptance.
6. Documentation reconciliation.
7. Final quality gates and evidence closure.

## Complexity Tracking

No constitutional violation is required. The operation is complex because it is
destructive, but the implementation isolates that risk behind exact environment guards.
