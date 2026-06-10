# Feature Specification: Backend .NET 8 Validation (039)

**Feature Branch**: `039-backend-dotnet8-validation`
**Created**: 2026-06-10
**Scope**: Terminal validation only — no file modifications.

## Objective
Execute automated infrastructure tests to validate the .NET 8 upgrade (038):
1. `dotnet restore` — restore all NuGet packages at new versions
2. `dotnet build` — verify C# 12 syntax and package compatibility (0 errors expected)
3. `dotnet ef database update` — verify EF Core 8 ORM connects to the DB and applies migrations

## Success Criteria
- SC-001: `dotnet build` → **0 Errors, 0 Warnings** (or warnings only, no errors)
- SC-002: `dotnet ef database update` → confirms DB connection and migration state
- SC-003: No source files are modified during this spec

## Solution Location
`F:\React\OneITB23\API Graphql\OneITB\OneITB.sln`
