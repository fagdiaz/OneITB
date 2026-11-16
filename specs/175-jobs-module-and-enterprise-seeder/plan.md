# Implementation Plan: Jobs Module and Enterprise Seeder

**Branch**: `[175-jobs-module-and-enterprise-seeder]` | **Date**: 2026-07-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/175-jobs-module-and-enterprise-seeder/spec.md`

## Summary

Implement `JobOffer` as a first-class EF Core/GraphQL entity, publish new offers through HotChocolate subscriptions, add a React job board at `/empleos`, and replace the effective demo seeding flow with an idempotent enterprise graph generator that seeds coherent careers, users, feed activity, chats, notifications and job offers.

## Technical Context

**Language/Version**: C# 12 / .NET 8, JavaScript React 18

**Primary Dependencies**: EF Core 8.0.6, HotChocolate 14.2.0, Apollo Client 3.7, React Router 6, Tailwind CSS 4

**Storage**: SQL Server through `OneItbContext`

**Testing**: `dotnet build`, EF migration generation, `npm.cmd run build`; runtime GraphQL if local services are available

**Target Platform**: Local Docker SQL Server and production-ready multi-container deployment

**Project Type**: Full-stack web application

**Performance Goals**: No N+1 for `JobOffer.Employer`; seeder clears EF tracker between phases

**Constraints**: AD-004 `DeleteBehavior.Restrict`, no REST business endpoint, no hardcoded secrets, existing roles in Spanish

**Scale/Scope**: Demo graph with tens of users and hundreds of relationship rows; idempotent repeated startup

## Constitution Check

- **I. Decoupled Application Contracts**: PASS. Jobs use GraphQL only; no new REST business endpoint.
- **II. Security and Password Hashing**: PASS. Seeder uses `Seed:DemoPassword` and BCrypt, preserving existing passwords.
- **III. Input Validation**: PASS. Job creation validates required fields and max lengths server-side.
- **IV. Relational Integrity**: PASS. `JobOffer.EmployerId` uses explicit FK and `DeleteBehavior.Restrict`; seeder inserts in FK-safe phases.
- **V. Secure Session**: PASS. Create mutation requires JWT role authorization.
- **VI. Evidence-Based Completion**: PASS target. Builds, migration and documentation evidence are recorded in `evidence.md`.

## Project Structure

### Documentation

```text
specs/175-jobs-module-and-enterprise-seeder/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── evidence.md
└── tasks.md
```

### Source Code

```text
API Graphql/
├── Entities/Models/JobOffer.cs
├── Data/OneItbContext.cs
├── Data/EnterpriseDemoSeeder.cs
├── Data/DbInitializer.cs
├── Services/Jobs/
└── OneITB/GraphQL/{Query,Mutation,Subscription}.cs

FrontEnd/OneItb-FE/src/
├── Components/jobs/JobBoard.jsx
├── data/graphql/jobs.js
├── router/Routing.jsx
└── Components/layout/private/Nav.jsx
```

**Structure Decision**: Keep service business rules in `API Graphql/Services/Jobs`, EF mapping in `Data`, GraphQL orchestration in `OneITB`, and UI feature files under `Components/jobs`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
