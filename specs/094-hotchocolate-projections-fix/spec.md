# Feature Specification: HotChocolate Projections Fix

**Feature Branch**: `094-hotchocolate-projections-fix`

**Created**: 2026-06-13

**Status**: In Progress

## Requirements
- **FR-001**: Registrar los middleware de HotChocolate para habilitar proyecciones, filtrado y ordenamiento en el contenedor DI.
- **FR-002**: Solucionar la excepción "Projection provider not found" (HTTP 500) que se dispara cuando los queries con `[UseProjection]` intentan resolverse.
