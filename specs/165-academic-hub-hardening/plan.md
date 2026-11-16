# Implementation Plan: Spec 165 Academic Hub Hardening

**Branch**: current working branch | **Date**: 2026-07-06 | **Spec**: `specs/165-academic-hub-hardening/spec.md`

## Summary

Close the remaining gaps from Specs 163/164 through an audit-implement-audit loop: modal upload, local resource filtering, explicit Apollo cache updates, GraphQL alias compatibility and defensive social feed graph loading.

## Technical Context

**Language/Version**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4  
**Primary Dependencies**: `IAcademicService`, `ISocialService`, HotChocolate resolvers, Apollo Client, existing `uploadAttachment` helper  
**Storage**: SQL Server with `AcademicResources` from Spec 164  
**Testing**: `dotnet test`, `dotnet build -c Release`, `npm.cmd run build`, temporary GraphQL schema smoke  
**Project Type**: Full-stack hardening over existing academic/social modules  
**Performance Goals**: No broad refetch for resource create/delete; explicit split-query graph loading for nested feed data  
**Constraints**: No new dependencies, no GraphQL Upload, no destructive cleanup

## Constitution Check

- **Decoupled Application Contracts**: PASS. Metadata remains GraphQL and file upload remains the approved REST exception.
- **Strict Security and Password Hashing**: PASS. No credential flow changes.
- **Input Validation and ReDoS Protection**: PASS. Search and form inputs remain bounded by existing service validation.
- **Relational Integrity and Soft Delete**: PASS. Resource delete remains logical; social entities retain existing soft-delete/filter behavior.
- **Secure Session and Token Management**: PASS. Protected operations stay authenticated.
- **Evidence-Based Completion**: PASS pending validation and documented browser-runtime status.

## Initial Audit Findings

See `audit/initial-audit.md`.

## Data Model

See `data-model.md`.

## API Contracts

See `contracts/academic-resources-hardening.graphql`.

## Implementation Order

1. Backend alias and social graph hardening.
2. Frontend academic modal, local filter and Apollo cache updates.
3. Schema smoke/build/tests.
4. Final audit and documentation.

## Post-Design Constitution Check

- **Decoupled Application Contracts**: PASS. `/api/upload` remains the only binary path and metadata stays in GraphQL.
- **Relational Integrity and Soft Delete**: PASS. No schema or deletion model changes were introduced.
- **Performance and N+1 Control**: PASS. Social feed graph loading now uses split queries and explicit nested includes.
- **State Consistency**: PASS. Academic create/delete flows update Apollo cache explicitly instead of broad refetching.
- **Evidence-Based Completion**: PASS. Tests, builds, schema smoke, diff hygiene and final audit are recorded in `evidence.md`.
