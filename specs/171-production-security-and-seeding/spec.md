# Feature Specification: Production Security and Seeding

**Feature Branch**: `171-production-security-and-seeding`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Cerrar brechas MVP vs produccion: hardening anti-DoS en GraphQL, account lockout ante fuerza bruta y seeding enterprise para demo/produccion sin secretos versionados."

## User Scenarios & Testing

### User Story 1 - Bloquear abuso de GraphQL (Priority: P1)

Como responsable tecnico, quiero que GraphQL rechace consultas con profundidad excesiva y page sizes no acotados, para reducir riesgo de DoS por queries anidadas.

**Independent Test**: Compilar el backend y verificar que HotChocolate registre `AddMaxExecutionDepthRule` y opciones globales de paginacion.

**Acceptance Scenarios**:

1. **Given** una query con profundidad superior al limite configurado, **When** llega a `/graphql`, **Then** HotChocolate la rechaza durante validacion.
2. **Given** una query paginada, **When** no define un page size, **Then** el servidor aplica `DefaultPageSize`.
3. **Given** una query paginada que pide mas del maximo, **When** se valida, **Then** el servidor aplica o rechaza sobre `MaxPageSize`.

---

### User Story 2 - Proteger login contra fuerza bruta por cuenta (Priority: P1)

Como administrador de seguridad, quiero que cada cuenta registre intentos fallidos y se bloquee temporalmente tras abuso, para mitigar ataques de password guessing aunque el atacante rote IPs.

**Independent Test**: Ejecutar tests unitarios del servicio de cuentas que validen incremento, bloqueo, rechazo durante bloqueo y reseteo tras login exitoso.

**Acceptance Scenarios**:

1. **Given** una cuenta activa, **When** se ingresa una password incorrecta, **Then** aumenta `FailedLoginAttempts`.
2. **Given** cinco fallos consecutivos, **When** se procesa el quinto intento, **Then** se define `LockoutEnd` por 15 minutos y se retorna un error controlado.
3. **Given** una cuenta bloqueada, **When** se intenta login con password correcta, **Then** se rechaza hasta que expire el bloqueo.
4. **Given** login exitoso, **When** existen fallos previos vencidos/no bloqueantes, **Then** se resetean contador y bloqueo.

---

### User Story 3 - Levantar demo productiva con datos coherentes (Priority: P2)

Como presentador del proyecto, quiero que una base nueva pueda inicializar usuarios, carreras, materias y contenido demo de forma idempotente, para no cargar datos manualmente durante la defensa.

**Independent Test**: Revisar que el `DbInitializer` ejecute migraciones, use seed idempotente y no pise passwords ya existentes.

**Acceptance Scenarios**:

1. **Given** una base vacia y password de seed configurada, **When** inicia la API, **Then** se crean cuentas demo, carreras, materias y contenido social sin violar FKs.
2. **Given** una base existente, **When** reinicia la API, **Then** el seeder no duplica datos ni resetea contrasenas existentes.
3. **Given** entorno Production sin password de seed, **When** se intenta inicializar demo data, **Then** el proceso registra un error claro y exige configuracion externa.

## Requirements

- **FR-001**: System MUST configure HotChocolate maximum execution depth with a production default of 10.
- **FR-002**: System MUST configure global paging defaults and maximum page size.
- **FR-003**: System MUST persist `FailedLoginAttempts` and `LockoutEnd` on `Account`.
- **FR-004**: System MUST increment failed login attempts only for existing active accounts.
- **FR-005**: System MUST lock an account for 15 minutes after five consecutive failed password attempts.
- **FR-006**: System MUST reset lockout state after a successful login.
- **FR-007**: System MUST preserve existing seed account passwords on repeated startup.
- **FR-008**: System MUST require seed demo password from configuration in production compose.
- **FR-009**: System MUST not modify React UI files.
- **FR-010**: System MUST document validation evidence and roadmap status.

## Key Entities

- **Account**: Adds lockout fields for login security.
- **DbInitializer**: Idempotent demo data initializer using configured seed password.
- **GraphQL Server Configuration**: Depth and paging limits.

## Success Criteria

- **SC-001**: Backend builds in Release.
- **SC-002**: Account service tests cover lockout behavior.
- **SC-003**: EF migration captures account lockout columns and index.
- **SC-004**: Docker production compose requires seed password without committing secrets.
- **SC-005**: Documentation reflects mitigated DoS/brute-force/demo-readiness gaps.
