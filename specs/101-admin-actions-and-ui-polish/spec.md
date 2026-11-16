# Feature Specification: Admin Actions and UI Polish (101)

**Feature Branch**: `101-admin-actions-and-ui-polish`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Dotar de interactividad completa (CRUD) a las pestañas de Materias y Reportes en el AdminDashboard, igualando la UI del reporte de comentarios con la publicación principal, y solucionar definitivamente los problemas de codificación de caracteres especiales (Encoding) en los datos de la plataforma."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resolución de Encoding (Priority: P1)

Como usuario, quiero que la información cargada en la plataforma (como nombres de materias y biografías) se lea sin símbolos erróneos, independientemente del motor de base de datos o sistema operativo del servidor.

**Why this priority**: La consistencia de los datos base es vital para un producto con calidad de producción.

**Independent Test**: Verificar en el Feed o Panel Administrativo que nombres como "Sofía", "Martínez" o "Análisis" se rendericen correctamente.

**Acceptance Scenarios**:

1. **Given** datos semilla en el backend, **When** el frontend los solicita, **Then** deben ser renderizados correctamente usando secuencias Unicode u omisión de acentos (como un fallback rudo).

---

### User Story 2 - Reportar Comentarios UI (Priority: P2)

Como usuario, quiero que el botón de reportar un comentario sea un ícono reconocible (bandera) alineado a la derecha, de igual forma que el botón de reportar la publicación principal, para una mejor experiencia de uso.

**Why this priority**: Homogeneidad en los controles de interfaz.

**Independent Test**: Observar cualquier comentario en el Feed.

**Acceptance Scenarios**:

1. **Given** un comentario en el Feed, **When** el usuario lo visualiza, **Then** el botón de reportar debe verse como un ícono en la esquina superior derecha del comentario.

---

### User Story 3 - Administración de Materias (Priority: P1)

Como administrador, quiero poder crear, editar y eliminar (o desactivar) materias desde mi panel de control para mantener el catálogo actualizado sin intervención directa en la BD.

**Why this priority**: Autonomía funcional del rol administrador.

**Independent Test**: Usar los controles CRUD dentro de la pestaña "Materias" del Panel.

**Acceptance Scenarios**:

1. **Given** la lista de materias, **When** clickeo en crear/editar, **Then** un formulario debe permitirme guardar los datos.

---

### User Story 4 - Gestión de Reportes (Priority: P2)

Como moderador, quiero poder revisar la lista de reportes y cambiar su estado (por ejemplo, a "Revisado" o "Resuelto") para limpiar la cola de trabajo pendiente.

**Why this priority**: Permite que el panel de moderación sirva a su propósito real de gestión y resolución.

**Independent Test**: Acceder a la pestaña de reportes y utilizar los controles de estado.

**Acceptance Scenarios**:

1. **Given** un reporte en estado pendiente, **When** el moderador selecciona "Resolver", **Then** el reporte debe actualizar su estado y ser visualmente marcado o filtrado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Codificación. Se DEBEN reemplazar los caracteres especiales en `DbInitializer.cs` con secuencias unicode `\uXXXX` o eliminar los tildes/eñes.
- **FR-002**: UI Comentarios. Se DEBE modificar `CommentThread.jsx` para que el botón "Reportar" sea un ícono de FontAwesome posicionado en `justify-between` del header del comentario.
- **FR-003**: CRUD Materias. Se DEBEN agregar botones e invocar mutaciones para `Crear`, `Editar` y `Eliminar/Desactivar` materias en `SubjectManagement.jsx`.
- **FR-004**: Gestión Reportes. Se DEBEN agregar botones en `ModerationManagement.jsx` para cambiar el status de los reportes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La semilla (`DbInitializer`) compila e hidrata la base sin generar caracteres "?".
- **SC-002**: La interfaz de administración es 100% interactiva sin fallos funcionales ni visuales.
