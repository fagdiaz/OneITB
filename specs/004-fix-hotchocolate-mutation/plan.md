# Implementation Plan: fix-hotchocolate-mutation

**Branch**: `004-fix-hotchocolate-mutation` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-fix-hotchocolate-mutation/spec.md`

## Summary

Corregir la registración de la clase `Mutation` en HotChocolate. Actualmente está configurada como un `ExtendObjectType` pero se intenta agregar mediante `.AddMutationType<Mutation>()` lo que produce `InvalidCastException`. Se convertirá en una clase de tipo base de mutación normal removiendo el decorador.

## Technical Context

**Language/Version**: C# / .NET 6

**Primary Dependencies**: HotChocolate (GraphQL)

**Storage**: N/A (Solo inyección de dependencias)

**Testing**: Compilación con `dotnet build`

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-hotchocolate-mutation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task list
```

### Affected Files

```text
API Graphql/OneITB/GraphQL/Mutation.cs
```
