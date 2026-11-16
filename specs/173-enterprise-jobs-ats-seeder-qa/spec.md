# Feature Specification: Enterprise Jobs ATS Seeder QA

**Feature Branch**: `173-enterprise-jobs-ats-seeder-qa`
**Created**: 2026-07-07
**Status**: Draft
**Input**: Sprint masivo para consolidar el Modulo de Empleos bajo Spec 173, agregar Mini-ATS, reescribir el seeder enterprise y ejecutar QA/security gates.

## User Scenarios & Testing

### User Story 1 - Postularse a ofertas laborales (Priority: P1)

Como estudiante o egresado autenticado, quiero ver ofertas laborales activas y postularme desde OneITB, para centralizar mi actividad laboral academica.

**Independent Test**: Iniciar sesion como estudiante, abrir `/empleos`, ver ofertas activas, postularse una vez y verificar que el boton cambia a Postulado sin crear duplicados.

### User Story 2 - Gestionar postulantes como empleador (Priority: P1)

Como empleador o admin que publica ofertas, quiero ver mis ofertas y sus postulantes, abrir el CV resumido y cambiar el estado de cada postulacion.

**Independent Test**: Iniciar sesion como empleador, abrir `/empleos/mis-ofertas`, ver solo ofertas propias, abrir postulantes y cambiar estado a Revisado o Rechazado.

### User Story 3 - Demo institucional viva (Priority: P2)

Como evaluador academico, quiero levantar el sistema con datos coherentes de red social, empleos, postulaciones, chats y notificaciones, para demostrar el producto sin carga manual.

**Independent Test**: Ejecutar migraciones y arranque con `Seed:DemoPassword`, luego consultar cuentas, publicaciones, ofertas, aplicaciones, mensajes y notificaciones generadas.

### User Story 4 - Seguridad y calidad del modulo ATS (Priority: P2)

Como responsable tecnico, quiero que las mutaciones validen rol y propiedad de oferta, que no existan cascadas peligrosas ni N+1 evidentes, y que React no tenga efectos sin limpieza.

**Independent Test**: Intentar aplicar con rol no permitido, intentar cambiar estado de una oferta ajena y verificar error controlado; ejecutar build/backend/frontend y smoke GraphQL.

## Requirements

- **FR-001**: El sistema debe persistir ofertas laborales y postulaciones con FKs explicitas y `DeleteBehavior.Restrict`.
- **FR-002**: `createJobOffer` debe estar restringida a `Empleador` y `Administrador`.
- **FR-003**: `applyToJob` debe estar restringida a `Estudiante` y `Egresado`, debe evitar postulaciones duplicadas y debe rechazar ofertas inactivas.
- **FR-004**: `updateApplicationStatus` debe permitir cambios solo al autor de la oferta o a un administrador.
- **FR-005**: `jobOffers` debe devolver ofertas activas con postulaciones del usuario autenticado y datos suficientes para el ATS sin N+1 evidente.
- **FR-006**: `/empleos` debe mostrar skeletons, empty state, listado, postulacion y badge realtime por `jobOfferCreated`.
- **FR-007**: `/empleos/mis-ofertas` debe mostrar ofertas propias, postulantes, filtro por estado y modal CV con acciones de estado.
- **FR-008**: El seeder debe crear 2 carreras, 6 materias, 14 usuarios institucionales, publicaciones, comentarios, respuestas, reacciones, chats, notificaciones, ofertas y postulaciones usando `Seed:DemoPassword`.
- **FR-009**: El seeder debe guardar por fases y limpiar `ChangeTracker` entre fases.
- **FR-010**: Todo dato demo debe usar dominio `@itbeltran.com.ar`.

## Key Entities

- **JobOffer**: Oferta laboral publicada por un empleador/admin.
- **JobApplication**: Postulacion de estudiante/egresado a una oferta.
- **JobApplicationStatus**: Estado de postulacion: Pending, Reviewed, Rejected.
- **EnterpriseDemoSeeder**: Pipeline deterministico de demo data institucional.

## Success Criteria

- **SC-001**: Un estudiante/egresado puede postularse a una oferta activa en menos de 3 clicks desde `/empleos`.
- **SC-002**: Un empleador puede revisar postulantes y cambiar estado desde `/empleos/mis-ofertas` sin acceder a datos de ofertas ajenas.
- **SC-003**: La base demo contiene al menos 4 ofertas, postulaciones, conversaciones con 10 mensajes y notificaciones relacionadas.
- **SC-004**: Build backend, build frontend y migracion EF completan sin errores.
- **SC-005**: Las operaciones GraphQL criticas devuelven errores controlados ante rol no permitido o propiedad invalida.

## Assumptions

- Se reutiliza `JobOffer` ya implementado y se agrega `JobApplication` como extension ATS.
- El rol institucional de empleador es `Empleador` y los candidatos validos son `Estudiante` y `Egresado`.
- El CV modal usa datos de perfil existentes y no crea un nuevo esquema de CV.
