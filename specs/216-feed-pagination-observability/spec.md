# Feature Specification: Feed Pagination Observability

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; browser acceptance pending  
**Priority**: P1 after Specs 213-214  
**Recommended reasoning**: Medium

## Goal

Hacer determinista el botón “Cargar más”: anexar la página siguiente sin duplicados o
explicar que no existen más publicaciones, conservando carrera y filtros durante todo el
cursor.

## User Scenarios & Testing

### User Story 1 - Página siguiente real (P1)

Con más resultados, cada click agrega elementos cronológicamente y bloquea dobles clicks.

### User Story 2 - Fin explícito (P1)

Sin más resultados, el botón desaparece o se reemplaza por “No hay más publicaciones”.

### User Story 3 - Filtros estables (P2)

Un cambio de carrera reinicia cursor y lista; una página siguiente conserva la misma
carrera, materias, búsqueda y autor.

## Functional Requirements

- **FR-001**: Cursor, filtros y orden MUST permanecer consistentes.
- **FR-002**: Respuestas MUST fusionarse por ID sin duplicados.
- **FR-003**: Click concurrente MUST ser ignorado mientras carga.
- **FR-004**: Página vacía MUST fijar `hasNextPage=false` y mostrar fin explícito.
- **FR-005**: Error MUST conservar resultados previos y ofrecer reintento.
- **FR-006**: Tests MUST cubrir 0, 1, 15, 16+ y cambio de carrera.

## Success Criteria

- Ningún click queda sin feedback.
- Todos los resultados disponibles aparecen exactamente una vez.
- El conteo y el final coinciden con la consulta backend para la carrera activa.
