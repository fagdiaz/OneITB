# Feature Specification: UX Alignment and SMTP

**Feature Branch**: `174-ux-alignment-and-smtp`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Code Freeze absoluto. Refinar terminologia visible del modulo de empleos y reemplazar envio simulado por SMTP real con fallback local, notificando por correo cambios de estado de postulaciones."

## User Scenarios & Testing

### User Story 1 - Terminologia honesta de postulaciones (Priority: P1)

Un empleador debe ver el modulo de seguimiento de postulaciones con una terminologia clara y no sobreprometida, sin referencias visibles a ATS.

**Why this priority**: Es una correccion de honestidad de producto durante Code Freeze. Reduce sobrepromesa funcional sin cambiar comportamiento ni agregar pantallas.

**Independent Test**: Ingresar como empleador a `/empleos/mis-ofertas` y verificar que la UI habla de "Gestor de Postulaciones" y "Perfil Academico", sin textos visibles "ATS" ni "CV del postulante".

**Acceptance Scenarios**:

1. **Given** un empleador autenticado, **When** abre el gestor de sus ofertas, **Then** la cabecera visible usa "Gestor de Postulaciones".
2. **Given** un empleador con postulantes, **When** abre el modal de un candidato, **Then** el titulo visible es "Perfil Academico".
3. **Given** un empleador interactuando con acciones de estado, **When** pasa el mouse o presiona los botones, **Then** recibe feedback visual inmediato.

---

### User Story 2 - Envio real de correos con fallback local (Priority: P1)

El sistema debe enviar correos reales cuando existe configuracion SMTP y conservar un fallback de consola cuando la configuracion no esta disponible.

**Why this priority**: Madurez productiva sin romper desarrollo local. Permite operar con SMTP real sin versionar secretos ni depender de servicios externos en cada build.

**Independent Test**: Levantar backend sin variables SMTP y verificar que el servicio registrado es fallback; levantar con `SmtpSettings` completos y verificar que se instancia el adaptador SMTP.

**Acceptance Scenarios**:

1. **Given** configuracion SMTP completa, **When** el backend arranca, **Then** registra un servicio de envio SMTP.
2. **Given** configuracion SMTP incompleta, **When** el backend arranca, **Then** registra un servicio de consola y no falla el runtime local.
3. **Given** un cambio de estado a Revisado o Rechazado, **When** la mutacion termina, **Then** el sistema intenta enviar un correo institucional al postulante.

---

### User Story 3 - Cambio de estado resiliente (Priority: P2)

El cambio de estado de postulacion no debe fallar si el proveedor SMTP queda temporalmente fuera de servicio despues de persistir el cambio.

**Why this priority**: Evita inconsistencias UX y bloqueos operativos por una dependencia externa no critica para la transaccion principal.

**Independent Test**: Configurar SMTP invalido, actualizar una postulacion a Revisado y confirmar que la mutacion devuelve el estado actualizado mientras el fallo se registra como warning.

**Acceptance Scenarios**:

1. **Given** SMTP configurado pero no disponible, **When** el empleador marca una postulacion como Revisado, **Then** la postulacion queda actualizada y el fallo de email queda logueado.

---

### Edge Cases

- Configuracion SMTP con host vacio, puerto cero o credenciales faltantes debe caer a consola.
- Cambios a estado Pendiente no deben enviar correo.
- Postulantes sin email valido no deben romper la mutacion; debe registrarse warning.
- El copy visible no debe crear rutas ni pantallas nuevas.

## Requirements

### Functional Requirements

- **FR-001**: System MUST remove visible "ATS" terminology from the employer jobs UI and replace it with "Gestor de Postulaciones" or a concise derivative where space is constrained.
- **FR-002**: System MUST rename the applicant modal title from "CV del postulante" to "Perfil Academico".
- **FR-003**: Status action buttons MUST provide hover and pressed-state visual feedback.
- **FR-004**: System MUST define an email sender abstraction used by backend mutations.
- **FR-005**: System MUST use SMTP when `SmtpSettings:Host`, `SmtpSettings:Port`, `SmtpSettings:User`, and `SmtpSettings:Pass` are configured.
- **FR-006**: System MUST fall back to a console/log email sender when SMTP settings are incomplete.
- **FR-007**: `updateApplicationStatus` MUST attempt an email notification when the new status is Reviewed or Rejected.
- **FR-008**: Email delivery failure after persistence MUST be logged without rolling back the successful status update.
- **FR-009**: No SMTP secret may be hardcoded in tracked files.
- **FR-010**: No database schema, EF migration, or new frontend screen is introduced by this spec.

### Key Entities

- **JobApplication**: Existing postulacion whose status change triggers email notification.
- **EmailMessage**: Runtime delivery request containing recipient, subject and body; it is not persisted by this spec.
- **SMTP Settings**: Operational configuration read from environment/configuration only.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of visible jobs UI references to "ATS" in affected components are removed.
- **SC-002**: Status changes to Reviewed or Rejected trigger exactly one email attempt per successful mutation.
- **SC-003**: Backend starts successfully with missing SMTP settings.
- **SC-004**: Backend build and frontend build complete with zero compilation errors.
- **SC-005**: No tracked file contains SMTP passwords or real credentials.

## Assumptions

- `updateApplicationStatus` already persists state and validates offer ownership.
- Real SMTP credentials will be provided by environment variables or user secrets using the `SmtpSettings` configuration path.
- Email delivery is a side effect, not the source of truth for application status.
- Browser visual regression of `/empleos/mis-ofertas` remains a manual follow-up unless the local browser runtime is available.
