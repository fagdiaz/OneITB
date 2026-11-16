# Feature Specification: Jobs Module and Enterprise Seeder

**Feature Branch**: `[175-jobs-module-and-enterprise-seeder]`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Crear el Modulo de Empleos end-to-end y reescribir el seeder para inyectar una red social academica viva con relaciones profundas."

## User Scenarios & Testing

### User Story 1 - Bolsa de empleos institucional (Priority: P1)

Usuarios autenticados consultan ofertas laborales activas desde `/empleos`; empleadores y administradores publican nuevas ofertas que aparecen en tiempo real.

**Why this priority**: agrega una funcionalidad demostrable de alto impacto y conecta la red social academica con salida laboral.

**Independent Test**: iniciar sesion como `Empleador`, abrir `/empleos`, publicar una oferta y verificar que aparece en el listado y dispara `jobOfferCreated`.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** consulta `jobOffers(onlyActive: true)`, **Then** recibe ofertas activas ordenadas de mas nuevas a mas viejas.
2. **Given** un usuario con rol `Empleador` o `Administrador`, **When** ejecuta `createJobOffer`, **Then** la oferta persiste con `EmployerId`, se emite `jobOfferCreated` y queda visible en `/empleos`.
3. **Given** un usuario sin rol autorizado, **When** intenta publicar una oferta, **Then** GraphQL rechaza la operacion.

---

### User Story 2 - Demo data enterprise (Priority: P1)

Al levantar una base vacia, el backend crea una red demo consistente con carreras, materias, usuarios por rol, publicaciones, comentarios, likes, chats, notificaciones y ofertas.

**Why this priority**: reduce riesgo de demo con base vacia y permite mostrar flujos reales sin carga manual.

**Independent Test**: ejecutar migraciones sobre una base vacia, iniciar el backend con `Seed:DemoPassword` y validar conteos minimos de usuarios, publicaciones, mensajes y ofertas.

**Acceptance Scenarios**:

1. **Given** base vacia y demo seed habilitado, **When** arranca la API, **Then** se crean 2 carreras, 3 materias por carrera y cuentas por rol con emails institucionales.
2. **Given** el seeder corre mas de una vez, **When** vuelve a arrancar la API, **Then** no duplica datos ni resetea passwords existentes.
3. **Given** relaciones restrictivas AD-004, **When** el seeder crea el grafo social, **Then** las FK se insertan por fases con `SaveChangesAsync` y `ChangeTracker.Clear()`.

---

### Edge Cases

- Oferta sin titulo, empresa, descripcion o ubicacion debe rechazarse con mensaje controlado.
- Oferta con campos demasiado largos debe rechazarse antes de guardar.
- Seeder ejecutado contra base parcialmente poblada debe completar datos faltantes sin borrar datos existentes.
- Un usuario no autenticado no debe recibir subscripciones ni visualizar `/empleos` por estar bajo layout privado.

## Requirements

### Functional Requirements

- **FR-001**: System MUST persist `JobOffer` with explicit FK to `User` using `DeleteBehavior.Restrict`.
- **FR-002**: System MUST expose `jobOffers(onlyActive)` and `createJobOffer(...)` through GraphQL.
- **FR-003**: System MUST publish `jobOfferCreated` through HotChocolate subscriptions after a successful create.
- **FR-004**: Frontend MUST add `/empleos`, a Nav link, realtime badge, loading skeleton, empty state and job cards with `mailto:` application.
- **FR-005**: Seeder MUST be idempotent, phased, password-configurable and avoid EF ChangeTracker growth with `ChangeTracker.Clear()`.
- **FR-006**: Seeder MUST create demo careers, subjects, users by role, inquiries, comments, reactions, messages, notifications and job offers.

### Key Entities

- **JobOffer**: Labor opportunity created by an employer/admin; belongs to one `User` author.
- **Notification**: Existing realtime/persistent notification record; extended with `JobOffer` type.
- **EnterpriseDemoSeeder**: Deterministic seeding pipeline for a live academic/social graph.

## Success Criteria

- **SC-001**: Backend Release build passes after entity, migration, service and GraphQL changes.
- **SC-002**: Frontend Vite build passes after route, Nav and JobBoard changes.
- **SC-003**: EF migration contains no cascade delete path for `JobOffer`.
- **SC-004**: Seeder can run repeatedly without creating duplicates for its deterministic keys.

## Assumptions

- Existing Spanish role names remain canonical: `Administrador`, `Empleador`, `Profesor`, `Estudiante`, `Egresado`.
- `DbInitializer.Initialize` remains the startup entrypoint; the enterprise seeder is called from there.
- Existing `/graphql` and WebSocket client infrastructure are reused.
