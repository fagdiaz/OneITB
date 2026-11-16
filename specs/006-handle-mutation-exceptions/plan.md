# Implementation Plan: handle-mutation-exceptions

**Branch**: `006-handle-mutation-exceptions` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-handle-mutation-exceptions/spec.md`

## Summary

Modificar la mutación `RegisterUserAsync` en `Mutation.cs` para capturar `System.ArgumentException` lanzada por las entidades de negocio (Entities.dll) al asignar propiedades con valores inválidos. El catcher retornará una instancia de `UserPayload` con `Success = false` y el mensaje de error correspondiente.

## Technical Context

**Language/Version**: C# / .NET 6

**Testing**: Compilación y verificación.

## Project Structure

### Documentation (this feature)

```text
specs/006-handle-mutation-exceptions/
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
