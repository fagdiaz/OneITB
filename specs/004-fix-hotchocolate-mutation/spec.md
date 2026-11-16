# Feature Specification: Fix HotChocolate Mutation Schema

**Feature Branch**: `004-fix-hotchocolate-mutation`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Solucionar el error crítico de inicio en el backend System.InvalidCastException: Unable to cast object of type 'HotChocolate.Types.ObjectTypeExtension' to type 'HotChocolate.Types.ObjectType' corrigiendo la configuración del esquema de HotChocolate en el pipeline de inyección de dependencias."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compilación Correcta del Esquema GraphQL (Priority: P1)

Como desarrollador, el servidor backend de .NET 6 debe compilar e iniciar correctamente sin lanzar excepciones de casteo de HotChocolate, permitiendo servir peticiones de GraphQL.

**Why this priority**: Es una tarea de infraestructura crítica; bloquea el inicio del servidor.

**Independent Test**: Se valida ejecutando `dotnet build` y ejecutando el proyecto para comprobar que no lanza `InvalidCastException`.

**Acceptance Scenarios**:
1. **Given** la configuración de GraphQL en `Startup.cs`, **When** se inicia la aplicación, **Then** el esquema de GraphQL debe compilar exitosamente sin lanzar excepciones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La clase `Mutation` en `Mutation.cs` debe ser un tipo base regular (eliminar `[ExtendObjectType]`) para actuar como la raíz de las mutaciones.
- **FR-002**: El pipeline de GraphQL en `Startup.cs` debe registrar correctamente la clase raíz de Mutation mediante `.AddMutationType<Mutation>()`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Compilación exitosa del proyecto backend.
- **SC-002**: El servidor arranca sin lanzar excepciones en el middleware de GraphQL.

## Assumptions

- No se requieren tipos de mutaciones extendidas en esta etapa; la clase `Mutation` actual servirá como tipo raíz.
