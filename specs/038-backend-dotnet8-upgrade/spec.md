# Feature Specification: Backend .NET 8 LTS Upgrade (038)

**Feature Branch**: `038-backend-dotnet8-upgrade`
**Created**: 2026-06-10
**Scope**: Backend Only — no frontend changes.

## Problem Statement
The backend runs on .NET 6 (EOL since November 2024) with EF Core 7.0.4 and HotChocolate 13.0.5.
The TFM and NuGet packages must be upgraded to .NET 8 LTS for security, performance, and support.

## Pre-Upgrade Audit

| Project | TFM | EF Core | HotChocolate | JwtBearer |
|---------|-----|---------|--------------|-----------|
| Entities.csproj | net6.0 | — | — | — |
| Data.csproj | net6.0 | 7.0.4 | — | — |
| Services.csproj | net6.0 | — | 13.0.5 (Types) | — |
| GraphQL.csproj | net6.0 | 7.0.4 | 13.0.5 | 6.0.16 |

## Target Versions (.NET 8 LTS)

| Package | Current | Target |
|---------|---------|--------|
| TargetFramework | net6.0 | **net8.0** |
| Microsoft.EntityFrameworkCore | 7.0.4 | **8.0.6** |
| Microsoft.EntityFrameworkCore.Relational | 7.0.4 | **8.0.6** |
| Microsoft.EntityFrameworkCore.SqlServer | 7.0.4 | **8.0.6** |
| Microsoft.EntityFrameworkCore.Tools | 7.0.4 | **8.0.6** |
| HotChocolate.AspNetCore | 13.0.5 | **14.2.0** |
| HotChocolate.AspNetCore.Authorization | 13.0.5 | **14.2.0** |
| HotChocolate.Data.EntityFramework | 13.0.5 | **14.2.0** |
| HotChocolate.Types | 13.0.5 | **14.2.0** |
| Microsoft.AspNetCore.Authentication.JwtBearer | 6.0.16 | **8.0.6** |
| System.ComponentModel.Annotations | 5.0.0 | **8.0.0** |
| BCrypt.Net-Next | 4.0.3 | **4.0.3** (no change — framework-agnostic) |

## Success Criteria
- SC-001: All 4 .csproj files target `net8.0`
- SC-002: All Microsoft.* packages are on 8.0.x
- SC-003: HotChocolate packages are on 14.2.0
- SC-004: No frontend files are modified
