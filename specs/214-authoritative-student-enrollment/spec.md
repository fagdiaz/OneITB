# Feature Specification: Authoritative Student Enrollment

**Created**: 2026-08-05  
**Status**: Implemented `[I]`; browser acceptance pending  
**Priority**: P0 after Spec 213  
**Recommended reasoning**: High

## Goal

Hacer única y coherente la carrera activa del rol Estudiante en onboarding, perfil,
feed y módulos académicos, y formalizar un puerto de integración institucional sin
afirmar que existe una API SIU disponible cuando su contrato y credenciales no fueron
provistos.

## User Scenarios & Testing

### User Story 1 - Elección única confirmada (P1)

El estudiante elige exactamente una carrera y confirma “¿Estás seguro de que esta es la
carrera que cursás?” antes de persistirla. Cambiarla reemplaza la anterior.

### User Story 2 - Alcance consistente (P1)

Perfil, feed, materias y recursos usan la misma carrera persistida; no mezclan datos de
una asociación histórica ni de caché.

### User Story 3 - Integración institucional preparada (P2)

La arquitectura consulta un proveedor de inscripción. El modo local permite declaración
confirmada; un modo institucional solo puede activarse con contrato y configuración
reales y debe fallar cerrado si faltan.

## Functional Requirements

- **FR-001**: Estudiante MUST tener cero o una carrera; después del onboarding, una.
- **FR-002**: UI MUST usar radio y confirmación explícita en onboarding y edición.
- **FR-003**: Backend MUST reemplazar enlaces en transacción y rechazar múltiples IDs.
- **FR-004**: Todas las consultas acotadas por carrera MUST derivar del usuario actual.
- **FR-005**: Caché Apollo MUST invalidarse/refrescar tras cambiar la carrera.
- **FR-006**: El puerto institucional MUST devolver carrera y materias verificadas.
- **FR-007**: Sin API/credenciales, MUST declararse `SelfDeclared`; no habrá mock
  presentado como verificación SIU real.

## Success Criteria

- Un estudiante no puede persistir dos carreras por ninguna mutación pública.
- Tras cambiar carrera, el primer render de feed/perfil coincide con DB.
- La presentación puede demostrar el puerto y explicar honestamente el gate externo.
