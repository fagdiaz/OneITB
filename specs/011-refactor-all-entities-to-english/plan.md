# Implementation Plan: Refactor all entities to English

**Branch**: `011-refactor-all-entities-to-english` | **Date**: 2026-06-08 | **Spec**: [spec.md](file:///F:/React/OneITB23/specs/011-refactor-all-entities-to-english/spec.md)

## Summary
Refactor `Materia` to `Subject` and `Consulta` to `Inquiry` across all projects (.NET and React) to remove Spanish nomenclature. Rebuild database to apply physical schema changes.

## Technical Context
- **Language/Version**: .NET 6.0, React
- **Primary Dependencies**: Entity Framework Core, HotChocolate GraphQL, Apollo Client
- **Storage**: SQL Server
- **Testing**: CLI builds and compilation checks

## Constitution Check
- No violations detected. Naming aligns with AD-006.

## Project Structure
```text
specs/011-refactor-all-entities-to-english/
├── spec.md
├── plan.md
└── tasks.md
```
