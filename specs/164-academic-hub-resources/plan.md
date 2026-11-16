# Implementation Plan: Spec 164 Academic Hub Resources

**Branch**: current working branch | **Date**: 2026-07-05 | **Spec**: `specs/164-academic-hub-resources/spec.md`

## Summary

Close the remaining P2 academic roadmap item by adding category and version metadata to academic resources, exposing filtered GraphQL operations, and upgrading `/academic` into a resource hub that keeps authorization by career and uses the existing authenticated upload endpoint for files.

## Technical Context

**Language/Version**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4  
**Primary Dependencies**: Existing `IAcademicService`, HotChocolate resolvers, Apollo Client, `uploadAttachment` utility  
**Storage**: SQL Server `AcademicResources` table plus filesystem uploads served from `/uploads`  
**Testing**: `dotnet build`, targeted service tests, `npm.cmd run build`, migration generation  
**Target Platform**: Web application and SQL Server runtime  
**Project Type**: Full-stack feature over existing academic module  
**Performance Goals**: Server-side resource filtering by subject/category/search, no N+1 for resource cards  
**Constraints**: Authenticated REST only for binary upload; GraphQL for metadata; soft delete; restrictive FKs

## Constitution Check

- **Decoupled Application Contracts**: PASS. Resource metadata remains GraphQL; binary transfer uses approved REST exception.
- **Strict Security and Password Hashing**: PASS. No password flow changes.
- **Input Validation and ReDoS Protection**: PASS. Search/title/url inputs remain bounded and no unbounded regex is introduced.
- **Relational Integrity and Soft Delete**: PASS. Existing restrictive FKs are retained and delete is logical.
- **Secure Session and Token Management**: PASS. Upload and GraphQL remain authenticated.
- **Evidence-Based Completion**: PASS pending build/test/migration evidence.

## Data Model

- `AcademicResource.Category`: enum stored as short string (`Libro`, `Apunte`, `Examen`, `Otro`).
- `AcademicResource.Version`: positive integer with default `1`.
- Existing relations:
  - `AcademicResource.SubjectId -> Subject.Id` with `DeleteBehavior.Restrict`.
  - `AcademicResource.UploaderId -> User.Id` with `DeleteBehavior.Restrict`.

## GraphQL Contract

See `contracts/academic-resources.graphql`.

## Implementation Order

1. Backend model, mapping, service interface and resolver changes.
2. Backend unit tests for resource authorization/filter/version.
3. Frontend GraphQL documents and Apollo cache policy.
4. `/academic` UI updates for filters, version/category and upload metadata.
5. EF migration, builds and documentation.

## Post-Design Constitution Check

PASS. The implemented contract keeps GraphQL for resource metadata, uses the existing authenticated REST upload exception for binaries, preserves restrictive FKs, implements soft-delete for resource removal, and records build/test/migration evidence.
