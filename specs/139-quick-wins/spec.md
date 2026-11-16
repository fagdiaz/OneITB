# Feature Specification: Quick Wins & Warning Cleanup

**Feature Branch**: `137-siu-notifications` (bundled)

**Created**: 2026-06-26

**Status**: Completed

**Input**: User description: "agy, hacete una auditoria robusta y total. fijate si podes aportar o documentar quick wins sin alterar la logica documental ni reducir el contenido. sino agregar quick wins en roadmap quizas, pensalo, analizalo bien y hacelo. luego dame un breve resumen. full-stack por favor"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compilación Limpia (Priority: P1)

Como desarrollador, quiero que los comandos de compilación del frontend y backend terminen sin advertencias ni ruido innecesario para poder identificar rápidamente problemas reales durante el desarrollo.

**Why this priority**: Mejora la experiencia de desarrollo local y la legibilidad de logs en futuros pipelines de CI.

**Independent Test**: Ejecutar `dotnet build -c Release` y `npm run build` y observar la ausencia de advertencias.

**Acceptance Scenarios**:

1. **Given** un entorno configurado, **When** se ejecuta el build de Vite, **Then** no debe aparecer la advertencia de chunk size ni de babel obsoleto.
2. **Given** un entorno .NET 8, **When** se compilan los proyectos, **Then** no deben emitirse warnings CS8632, CS8618, CS8604 ni CS8603 por nullability de referencia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema de build frontend DEBE separar las dependencias de node_modules en un chunk propio (vendor).
- **FR-002**: El límite de tamaño de chunk en Vite DEBE aumentarse para evitar advertencias injustificadas con React.
- **FR-003**: Los proyectos .NET DEBEN silenciar las advertencias heredadas de tipos de referencia nullable sin inicializar globalmente para limpiar la consola.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run build` arroja 0 advertencias.
- **SC-002**: `dotnet build` arroja 0 advertencias.
- **SC-003**: ROADMAP y DEVELOPMENT_LOG reflejan estos cambios sin alterar estructura.
