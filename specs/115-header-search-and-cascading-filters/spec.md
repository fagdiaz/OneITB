# Feature Specification: Header Search & Cascading Filters

**Feature Branch**: `115-header-search-and-cascading-filters`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "El usuario requiere una interfaz más limpia. La barra superior (Header) debe tener un icono de lupa que, al clickearse, despliegue hacia abajo el panel de búsqueda y filtros. Para los filtros: Se debe incluir un botón de "Limpiar filtros". Las materias solo deben aparecer en el filtro si la carrera a la que pertenecen está tildada previamente. Se debe mostrar el código de la carrera/materia al lado de su nombre en color grisado. El buscador debe ser capaz de buscar coincidencias no solo por nombre, sino también por el código de la materia o carrera."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header Search Access & UI (Priority: P1)

As a user, I want to access a search panel by clicking a magnifying glass icon in the header so that the main interface remains clean but search is always accessible.

**Why this priority**: The header is the global navigation element. Making search accessible here improves UX across the entire application.

**Independent Test**: Can be fully tested by clicking the search icon in the header and verifying that a search panel drops down containing text input and filter options.

**Acceptance Scenarios**:

1. **Given** I am logged into the application, **When** I look at the top navigation bar, **Then** I see a magnifying glass icon.
2. **Given** the search panel is closed, **When** I click the magnifying glass icon, **Then** a search panel drops down from the header.
3. **Given** the search panel is open, **When** I view the list of careers or subjects, **Then** I see their respective codes displayed in a gray color next to their names.

---

### User Story 2 - Cascading Subject Filters (Priority: P1)

As a user, I want the subjects list to only show subjects belonging to my selected career so that I am not overwhelmed by irrelevant options.

**Why this priority**: It significantly reduces cognitive friction by preventing the user from seeing hundreds of unrelated subjects.

**Independent Test**: Can be fully tested by selecting and deselecting a career filter and observing the subject filter options dynamically update.

**Acceptance Scenarios**:

1. **Given** I have opened the search panel, **When** no career is selected, **Then** no subjects are shown in the subject filter list.
2. **Given** I have opened the search panel, **When** I select a specific career, **Then** only the subjects that belong to that career appear in the subject filter list.

---

### User Story 3 - Search by Entity Codes and Reset Filters (Priority: P2)

As a user, I want to search for posts using the exact code of a career or subject and easily reset my filters so I can quickly find what I need and start over if I make a mistake.

**Why this priority**: Being able to search by code allows power users to find specific content instantly. Resetting filters prevents frustration.

**Independent Test**: Can be tested by searching for a valid career/subject code and seeing matching posts, and by clicking the "Limpiar filtros" button to clear all selected options.

**Acceptance Scenarios**:

1. **Given** I have selected multiple filters and typed a search term, **When** I click the "Limpiar filtros" button, **Then** all selected careers, subjects, and the text input are cleared.
2. **Given** a post exists related to a subject with code "AC-101", **When** I type "AC-101" into the search bar and submit, **Then** that post appears in the results.

---

### Edge Cases

- What happens when a search by code matches multiple subjects across different careers? (It should return posts for all matching subjects).
- How does the system handle clicking outside the search dropdown? (It should close the dropdown).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a search icon in the global header.
- **FR-002**: System MUST render a dropdown panel when the search icon is clicked.
- **FR-003**: System MUST provide a text input for search queries within the panel.
- **FR-004**: System MUST display a list of available Careers for filtering, showing the Career Code in gray next to the Career Name.
- **FR-005**: System MUST NOT display Subjects for filtering unless a parent Career is selected.
- **FR-006**: System MUST dynamically load and display Subjects belonging only to the selected Career(s), showing the Subject Code in gray next to the Subject Name.
- **FR-007**: System MUST provide a "Limpiar filtros" button that clears all active text searches and selected filter pills/checkboxes.
- **FR-008**: System MUST support returning search results when the text input matches either a Subject's Code or a Career's Code associated with the post.

### Key Entities

- **Career**: Requires a `Code` attribute. Represents an academic path.
- **Subject**: Requires a `Code` attribute. Represents a specific class within a Career.
- **Inquiry (Post)**: The main content entity that is filtered and searched.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access the search panel from any page with a single click.
- **SC-002**: Selecting a career filter updates the subjects list in under 500ms.
- **SC-003**: Text search queries successfully return posts that match associated Subject/Career codes.
- **SC-004**: The "Limpiar filtros" button returns the search panel to its default empty state in a single click.

## Assumptions

- Tailwind CSS v4 is configured and active in the project.
- The backend already supports filtering inquiries by text and IDs, but needs the text search logic expanded to check related entity codes.
