# Feature Specification: Runtime Schema Onboarding Recovery

**Created**: 2026-08-04  
**Status**: Implemented `[I]`; final Student click-through pending  
**Input**: El onboarding académico falla después de Microsoft SSO porque la API en ejecución no expone `confirmStudentCareer`, aunque el contrato existe en el código actual.

## User Scenarios & Testing

### User Story 1 - Confirmar una carrera contra el contrato vigente (P1)

Como estudiante autenticado por Microsoft, quiero confirmar una única carrera y continuar al muro sin recibir errores internos del esquema.

**Acceptance Scenarios**

1. **Given** una API construida desde el corte actual, **When** se inspecciona `Mutation`, **Then** expone `confirmStudentCareer(careerId: Int!)`.
2. **Given** un estudiante sin carrera, **When** confirma una opción, **Then** la API persiste exactamente esa carrera y el perfil rehidratado desbloquea el acceso.
3. **Given** una API incompatible o desactualizada, **When** rechaza la operación por contrato, **Then** la interfaz muestra una recuperación institucional sin revelar detalles del esquema.

### User Story 2 - Detectar un proceso backend desactualizado (P1)

Como responsable de la demo, quiero un chequeo finito del esquema activo para distinguir un defecto de código de un proceso local iniciado con binarios anteriores.

## Requirements

- **FR-001**: El esquema vigente MUST exponer `confirmStudentCareer(careerId)` solo para Estudiante.
- **FR-002**: El frontend MUST enviar una única variable `careerId` y MUST revalidar `me` antes de navegar.
- **FR-003**: Los errores de incompatibilidad de esquema MUST mapearse a un mensaje recuperable y no a texto técnico crudo.
- **FR-004**: El runbook MUST incluir inspección finita del esquema y reinicio controlado de procesos obsoletos.
- **FR-005**: No se modifican EF Core, Microsoft Entra ni la regla de una carrera por Estudiante.

## Success Criteria

- El contrato se valida en una prueba ejecutable y en el endpoint activo.
- El error técnico no aparece en la UI ante un backend desactualizado.
- Las pruebas focalizadas, suite frontend y builds afectados finalizan sin errores.

## Out of Scope

- Branding, temas y fuentes locales, cubiertos por Specs 210 y 211.
- Integración real con SIU/ITB o cambios de base de datos.
