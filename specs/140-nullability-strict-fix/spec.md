# Feature Specification: Nullability Strict Fix

**Feature Branch**: `140-nullability-strict-fix`

**Created**: 2026-06-26

**Status**: In Progress

**Input**: User description: "Revertir la supresión de advertencias y solucionar el problema real de raíz en el código fuente de C#."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type Safety Estricta (Priority: P1)

Como Tech Lead, quiero que todas las advertencias de nulidad del compilador en el backend se resuelvan de raíz, en lugar de ser suprimidas, para mantener las garantías de type safety de .NET 8 y evitar NullReferenceExceptions en tiempo de ejecución.

**Why this priority**: Evitar esconder deuda técnica y prevenir bugs en tiempo de ejecución.

**Independent Test**: Ejecutar `dotnet build` y validar 0 advertencias, sin el uso de etiquetas `<NoWarn>`.

**Acceptance Scenarios**:

1. **Given** el código fuente sin `<NoWarn>`, **When** se compila el backend, **Then** el compilador no debe reportar advertencias CS8632, CS8618, CS8604 o CS8603.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El proyecto `GraphQL.csproj` DEBE definir `<Nullable>enable</Nullable>`.
- **FR-002**: Ningún archivo `.csproj` DEBE suprimir advertencias de nullability (`CS8632`, `CS8618`, `CS8604`, `CS8603`).
- **FR-003**: Todas las referencias nulas sin inicializar en las entidades DEBEN resolverse (ej. usando `required` o `default!`).
- **FR-004**: Todas las firmas de GraphQL que retornan o aceptan tipos de referencia nulos DEBEN resolverse explícitamente en `Mutation.cs` y `Query.cs`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `dotnet build` completa exitosamente con 0 advertencias y 0 errores.
- **SC-002**: Las directivas `<NoWarn>` son eliminadas por completo.
