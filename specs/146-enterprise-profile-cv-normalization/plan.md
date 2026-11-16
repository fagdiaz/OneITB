# Implementation Plan: Enterprise Profile CV Normalization

**Branch**: `146-enterprise-profile-cv-normalization` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Normalize Profile/CV persistence end-to-end using first-class relational data instead of `CvDataJson`.

## Summary

Replace the MVP `User.CvDataJson` storage with normalized EF Core entities for CV sections. The migration must preserve JSON data by transforming it into relational rows, then remove the JSON field. GraphQL exposes typed collections and the React editor saves one consolidated profile/CV graph.

## Technical Context

**Backend**: .NET 8, EF Core 8, HotChocolate 14.2, SQL Server  
**Frontend**: React 18, Apollo Client, Vite 8, Tailwind CSS 4  
**Database**: SQL Server Docker/local with EF migrations  
**Constraints**: AD-004 `DeleteBehavior.Restrict`, no shadow properties, single mutation for profile/CV save, no localStorage CV persistence  

## Constitution Check

- **Explicit relational mapping**: PASS. CV section entities will have explicit keys, FKs, indexes, and restricted deletes.
- **GraphQL contract validation**: PASS. Contract changes will be validated by runtime mutation/query.
- **Frontend state consistency**: PASS. The editor uses one state object and one save mutation.
- **Documentation evidence**: PASS. Evidence, roadmap, documentation status, and development log will be updated.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design

See [data-model.md](./data-model.md) and [contracts/profile-cv-graphql.md](./contracts/profile-cv-graphql.md).

## Validation Plan

1. Generate and apply `NormalizeUserCvTables` migration.
2. `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
3. `npm.cmd run build` in `FrontEnd/OneItb-FE`.
4. Runtime GraphQL smoke: login, update normalized CV sections, query `me` readback.
