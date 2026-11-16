# Feature Specification: Admin UX Refinement

**Feature Branch**: `[102-admin-ux-refinement]`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Refinar la Experiencia de Usuario (UX) en el AdminDashboard.jsx, implementando modales dedicados para la edición de materias y reestructurando la pestaña de moderación para mostrar un historial completo de reportes divididos por estado. 1) La edición de materias actualmente recicla el formulario de creación, desplazando la vista del usuario. Se requiere un Modal dedicado para la edición. 2) Al resolver o rechazar un reporte, este desaparece de la interfaz porque solo se renderizan los pendientes. Se requiere dividir la vista de reportes en dos listas separadas: "Pendientes" e "Historial (Resueltos/Rechazados)"."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar Materia en Modal Dedicado (Priority: P1)

Como Administrador, quiero poder editar una materia mediante un modal sobrepuesto en lugar de desplazar mi vista, para mantener el contexto visual de la lista de materias intacto mientras modifico los datos.

**Why this priority**: Evita que los usuarios pierdan su posición de scroll y contexto en listas largas al intentar editar. Mejora drásticamente la usabilidad general del panel.

**Independent Test**: Can be fully tested by clicking "Editar" on any subject, verifying a modal opens without shifting page layout, modifying the data, and saving to see it update in the background table.

**Acceptance Scenarios**:

1. **Given** the subject management tab is open, **When** I click "Editar" on a subject, **Then** a modal opens over the current view with the subject's details pre-filled.
2. **Given** the subject edit modal is open, **When** I update the name and click Save, **Then** the modal closes, the underlying list updates, and the page scroll remains unchanged.

---

### User Story 2 - Visualizar Historial de Moderación (Priority: P1)

Como Administrador/Moderador, quiero poder ver no solo los reportes pendientes, sino también un registro histórico de los reportes ya gestionados (Resueltos o Rechazados), para poder auditar decisiones previas de moderación.

**Why this priority**: Actualmente los reportes "desaparecen" de la interfaz tras ser procesados, lo que impide cualquier tipo de auditoría o revisión de acciones pasadas.

**Independent Test**: Can be fully tested by resolving a pending report and then navigating to the "History" section to verify the report appears there with its final status.

**Acceptance Scenarios**:

1. **Given** the moderation tab is open, **When** I view the interface, **Then** I see a clear division or toggle between "Pending" reports and "History" (Resolved/Rejected) reports.
2. **Given** I am viewing the History section, **When** I look at the reports, **Then** I see only reports that have already been Resolved or Rejected, along with their final status.
3. **Given** I resolve a pending report, **When** the action completes, **Then** the report moves from the Pending list to the History list.

---

### Edge Cases

- What happens when the user clicks outside the edit subject modal? The modal should safely close without saving, or prompt if unsaved changes exist.
- How does system handle viewing the history if there are thousands of resolved reports? (Assume pagination or infinite scroll is out of scope for this refinement, but UI should support a scrollable container).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dedicated modal dialog for editing existing Subjects, completely separate from the "Create Subject" inline form.
- **FR-002**: System MUST retain the current scroll position and background context when the edit modal is active.
- **FR-003**: System MUST split the Moderation view into two distinct logical areas or tabs: "Pending" and "History".
- **FR-004**: System MUST display only reports with status "Pending" in the Pending area.
- **FR-005**: System MUST display reports with status "Resolved" or "Rejected" in the History area.
- **FR-006**: System MUST ensure that taking action on a pending report immediately moves it from the Pending area to the History area without requiring a full page reload.

### Key Entities

- **Subject**: Academic subject, has properties like Name, Code, and IsActive. Will be manipulated via the edit modal.
- **CommunityReport**: Moderation report, has properties like Status (Pending, Resolved, Rejected). Will be filtered by status to populate the two different views.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open and close the edit subject modal without the underlying table shifting vertically.
- **SC-002**: Users can locate a previously resolved or rejected report in the new History section 100% of the time.
- **SC-003**: The UI layout remains consistent with the rest of the AdminDashboard (Tailwind v4 usage).

## Assumptions

- We are continuing to use the existing GraphQL queries (`GET_COMMUNITY_REPORTS` and `GET_SUBJECTS`) which already return all necessary data (all reports regardless of status, and all subjects).
- The separation in the Moderation tab will be handled client-side by filtering the existing data array.
- No new backend API endpoints or mutations are required for this UX refinement.
