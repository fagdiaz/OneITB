# Feature Specification: hotfix-institutional-domain-alignment

**Feature Branch**: `172-hotfix-institutional-domain-alignment`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Identificamos que el sistema está utilizando un dominio placeholder (@oneitb.edu.ar) para el Seeder y posibles validaciones, pero el dominio institucional real y definitivo es @itbeltran.com.ar. Objetivo: Realizar una refactorización transversal (Hotfix) para alinear todo el código base, pruebas y documentación al dominio institucional correcto, garantizando que el sistema compile y los tests sigan pasando."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hotfix Transversal de Dominio (Priority: P1)

Como Administrador, quiero que todo el sistema y sus datos de inicialización utilicen el dominio real `@itbeltran.com.ar` para que la aplicación no tenga deuda técnica de placeholders antes del despliegue productivo.

**Why this priority**: Es crítico para la etapa productiva asegurar que los correos, validaciones y seeders utilicen la identidad correcta de la institución.

**Independent Test**: Se puede probar localmente reconstruyendo la BD (con un seeder limpio) y verificando que no existan instancias del string `@oneitb.edu.ar` en todo el código fuente o la BD resultante.

**Acceptance Scenarios**:

1. **Given** la base de código actual, **When** se busque el dominio, **Then** todas las instancias deben ser `@itbeltran.com.ar`.
2. **Given** el Data Seeder, **When** se inicialice la BD, **Then** las cuentas generadas deben tener el dominio `@itbeltran.com.ar`.
3. **Given** las pruebas automatizadas backend/frontend, **When** se ejecuten, **Then** deben pasar exitosamente.

---

### Edge Cases

- ¿Qué pasa si quedan tests hardcodeados con un dominio antiguo? Podrían fallar. Deben corregirse.
- ¿Qué pasa si el frontend valida correos usando el dominio viejo? Los usuarios nuevos no podrían registrarse. Debe actualizarse la regex.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST utilizar `@itbeltran.com.ar` para todos los correos generados por el Data Seeder.
- **FR-002**: System MUST validar correos institucionales de registro permitiendo `@itbeltran.com.ar`.
- **FR-003**: System MUST pasar todos los test unitarios y de integración con el nuevo dominio institucional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 ocurrencias del dominio `@oneitb.edu.ar` en todo el código base y la documentación.
- **SC-002**: 100% de los Unit Tests en verde.
- **SC-003**: Build local del frontend y backend sin advertencias sobre el cambio de dominio.

## Assumptions

- No hay usuarios de producción reales generados con el dominio anterior que necesiten una migración SQL (code freeze y staging actual).
