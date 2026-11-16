# Implementation Plan: Spec 163 Zero Debt Audit

**Branch**: current working branch | **Date**: 2026-07-05 | **Spec**: `specs/163-zero-debt-audit/spec.md`

## Summary

Consolidate technical debt remediation around observable risks: Apollo cache replacement warnings, academic query graph loading and production bundle configuration. The audit avoids broad, unsafe deletions in a dirty worktree and focuses on changes that can be validated by build and source inspection.

## Technical Context

**Language/Version**: React 18, Apollo Client 3.7, Vite 8, .NET 8, EF Core 8, HotChocolate 14  
**Primary Dependencies**: Apollo Client, React Router, EF Core, HotChocolate  
**Testing**: `npm.cmd run build`, `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`, targeted backend tests if available  
**Project Type**: Full-stack hardening  
**Performance Goals**: Stable Apollo cache behavior, no N+1 in academic resource graph, deterministic frontend chunking  
**Constraints**: No dependency installs, no commits, no unrelated refactor

## Constitution Check

- **Decoupled Application Contracts**: PASS. Business flow remains GraphQL; upload REST exception remains unchanged.
- **Strict Security and Password Hashing**: PASS. No password or auth persistence changes.
- **Input Validation and ReDoS Protection**: PASS. No new regex-heavy input in this spec.
- **Relational Integrity and Soft Delete**: PASS. No FK behavior changes in this spec.
- **Secure Session and Token Management**: PASS. Apollo policies preserve session boundary fixes.
- **Evidence-Based Completion**: PASS pending build/test evidence.

## Design Decisions

1. Keep Vite vendor split as the production chunking baseline; do not remove dependencies without reliable static or compiler evidence.
2. Use Apollo `keyFields` and replacement merges instead of cache resets or global warning suppression.
3. Keep academic EF queries explicit through service-level `Include`/`AsNoTracking`/`AsSplitQuery` where graph materialization is required.

## Project Structure

```text
FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js
FrontEnd/OneItb-FE/vite.config.js
API Graphql/Services/Academic/AcademicService.cs
docs/audit/DEVELOPMENT_LOG.md
docs/project_docs/ROADMAP.md
```
