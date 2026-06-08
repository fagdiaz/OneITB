# Implementation Plan: throw-graphql-exception

**Branch**: `007-throw-graphql-exception` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-throw-graphql-exception/spec.md`

## Summary

Modificar la mutación `RegisterUserAsync` en `Mutation.cs` para capturar `System.ArgumentException` y lanzar `HotChocolate.GraphQLException` con el mensaje exacto de la entidad.

## Technical Context

**Language/Version**: C# / .NET 6

**Primary Dependencies**: HotChocolate (GraphQL)

**Testing**: Compilación con `dotnet build`

## Project Structure

### Documentation (this feature)

```text
specs/007-throw-graphql-exception/
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
