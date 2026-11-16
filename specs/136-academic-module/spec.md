# Feature Specification: Academic Module

**Feature Branch**: `136-academic-module`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Diseñar e implementar End-to-End el Módulo Académico (Prioridad P2) del ROADMAP.md. Esto incluye la gestión de Recursos Académicos (apuntes) y el Progreso/Notas de los alumnos por materia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar recursos por materia (Priority: P1)

Como estudiante inscripto en una carrera, quiero consultar apuntes, archivos y enlaces asociados a una materia para estudiar sin depender del feed social.

**Why this priority**: El roadmap P2 abre el alcance académico con un repositorio independiente del muro. Sin lectura de recursos, el módulo académico no entrega valor visible.

**Independent Test**: Un usuario autenticado asociado a la carrera de una materia puede abrir la vista académica de esa materia y ver la lista de recursos activos con título, descripción, tipo de recurso, adjunto o enlace y autor.

**Acceptance Scenarios**:

1. **Given** un estudiante asociado a la carrera de una materia con recursos activos, **When** abre la pestaña académica de la materia, **Then** ve los recursos disponibles ordenados por fecha reciente.
2. **Given** un usuario que no pertenece a la carrera de la materia, **When** intenta consultar sus recursos, **Then** el sistema rechaza la consulta o no expone esos recursos.
3. **Given** una materia sin recursos, **When** un usuario autorizado abre la vista académica, **Then** ve un estado vacío claro sin error.

---

### User Story 2 - Publicar y retirar recursos académicos (Priority: P2)

Como profesor o administrador, quiero crear y retirar recursos académicos por materia para mantener apuntes y materiales actualizados.

**Why this priority**: La lectura de recursos requiere una fuente administrable. Profesores y administradores necesitan cargar material sin mezclarlo con publicaciones sociales.

**Independent Test**: Un profesor o administrador puede crear un recurso con título, descripción, materia y archivo o enlace; luego puede retirarlo de la vista pública sin borrarlo físicamente.

**Acceptance Scenarios**:

1. **Given** un profesor o administrador autenticado, **When** crea un recurso con datos válidos para una materia activa, **Then** el recurso queda disponible para usuarios autorizados de esa carrera.
2. **Given** un estudiante autenticado, **When** intenta crear o retirar un recurso, **Then** la operación es rechazada.
3. **Given** un recurso activo creado por profesor o administrador, **When** se retira, **Then** deja de aparecer en las listas normales y queda preservado para auditoría.

---

### User Story 3 - Consultar progreso y notas (Priority: P3)

Como estudiante, quiero ver mi estado académico y calificaciones por materia para conocer mi avance real. Como administrador, quiero consultar y cargar notas para gestionar el seguimiento académico.

**Why this priority**: Progreso y notas son el segundo objetivo explícito de P2. Requieren privacidad estricta y trazabilidad institucional.

**Independent Test**: Un estudiante solo puede ver sus propias notas; un administrador puede cargar o actualizar una nota por estudiante y materia; usuarios no autorizados no pueden leer notas ajenas.

**Acceptance Scenarios**:

1. **Given** un estudiante con una nota registrada, **When** abre su progreso académico, **Then** ve materia, carrera, puntaje, estado y fecha de actualización.
2. **Given** un estudiante distinto, **When** intenta consultar la nota de otro usuario, **Then** no obtiene datos privados.
3. **Given** un profesor o administrador autorizado, **When** registra una calificación válida para un estudiante y materia, **Then** el progreso queda actualizado sin duplicar registros para el mismo estudiante y materia.

---

### Edge Cases

- Recursos con archivo y enlace a la vez: se permite al menos uno; ambos pueden coexistir si el material tiene documento y referencia externa.
- Recursos sin archivo ni enlace: se rechazan porque no entregan contenido académico accionable.
- Materias inactivas: no admiten nuevos recursos ni nuevas notas.
- Calificaciones fuera de rango: se rechazan.
- Estados académicos inválidos: se rechazan y no se persisten.
- Usuario sin carrera asociada: solo puede acceder a recursos públicos si su rol institucional lo permite; estudiantes sin asociación no ven recursos por materia.
- Nota duplicada para el mismo usuario y materia: se actualiza el registro existente en lugar de crear duplicados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a resource repository independent from social feed publications.
- **FR-002**: System MUST allow authorized teachers and administrators to create academic resources for active subjects.
- **FR-003**: System MUST require every academic resource to include title, subject and either a file URL or an external link.
- **FR-004**: System MUST allow authorized teachers and administrators to deactivate academic resources without physical deletion.
- **FR-005**: System MUST allow authenticated users associated with a subject career to view active resources for that subject.
- **FR-006**: System MUST allow administrators and teachers to view resources for institutional management.
- **FR-007**: System MUST prevent students from creating, updating or deactivating academic resources.
- **FR-008**: System MUST allow authorized teachers and administrators to assign or update one academic progress record per student and subject.
- **FR-009**: System MUST validate academic scores and academic status before saving progress.
- **FR-010**: System MUST allow students to view only their own academic progress records.
- **FR-011**: System MUST allow administrators to view progress records for any student.
- **FR-012**: System MUST prevent students from reading or modifying other students' progress records.
- **FR-013**: System MUST show resources and progress in a dedicated academic experience connected to subjects.
- **FR-014**: System MUST preserve relational integrity for users, subjects and uploaded files references.
- **FR-015**: System MUST record enough metadata to show who uploaded a resource and who last assigned or updated a progress record.

### Key Entities *(include if feature involves data)*

- **AcademicResource**: Study material associated with a subject, including title, description, optional file URL, optional external link, uploader and active state.
- **AcademicProgress**: Student academic state for one subject, including score, status, comments, assigned user, student, subject and update timestamp.
- **Subject**: Existing academic subject used as the anchor for resources and progress.
- **User**: Existing actor that uploads resources, receives progress records or assigns grades depending on role.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student associated with a career can find active resources for a subject in under 3 interactions from the authenticated application.
- **SC-002**: 100% of attempts by students to create or deactivate academic resources are rejected.
- **SC-003**: 100% of attempts to read another student's progress from a non-admin account are rejected or return no private data.
- **SC-004**: Teachers or administrators can create a valid resource and see it listed for the target subject in the same session.
- **SC-005**: Administrators can assign or update a student progress record and retrieve the updated value without duplicate records.
- **SC-006**: The academic module can be demonstrated without relying on social feed posts.

## Assumptions

- Existing authentication, roles, careers and subjects are reused.
- A "teacher" maps to the existing `Profesor` role and an administrator maps to `Administrador`.
- Subject access for students is derived from the student's associated careers.
- Resource deletion is logical deactivation; physical files are governed by the existing upload cleanup rules.
- SIU Guarani integration remains out of scope for this spec; the progress model acts as the internal source for local demonstration.
