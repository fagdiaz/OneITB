# Tasks: Backend .NET 8 LTS Upgrade (038)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + .specify/feature.json → 038 plan

## Phase 2: TFM + Package Upgrades
- [x] T002 Entities.csproj: net6.0 → net8.0 (no packages)
- [x] T003 Data.csproj: net6.0 → net8.0 · EF Core 7.0.4 → 8.0.6 (Core, Relational, SqlServer)
- [x] T004 Services.csproj: net6.0 → net8.0 · HotChocolate.Types 13.0.5 → 14.2.0 · System.ComponentModel.Annotations 5.0.0 → 8.0.0
- [x] T005 GraphQL.csproj: net6.0 → net8.0 · HotChocolate 13.0.5 → 14.2.0 · EF Core → 8.0.6 · JwtBearer 6.0.16 → 8.0.6

## Phase 3: QA Verification
- [x] T006 grep `net6.0` across all .csproj → 0 results ✅
- [x] grep `net8.0` across all .csproj → 4/4 confirmed ✅

## Phase 4: Documentation
- [x] T007 Update DEVELOPMENT_LOG.md
