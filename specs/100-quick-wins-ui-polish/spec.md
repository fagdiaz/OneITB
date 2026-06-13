# Feature Specification: Quick Wins UI Polish (100)

**Feature Branch**: `100-quick-wins-ui-polish`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Ejecutar una fase de pulido integral (Quick Wins) sobre la interfaz de usuario del Módulo 3 y el Panel de Administración. Se deben resolver problemas de codificación de caracteres (Encoding), formateo de fechas, agregar funcionalidades faltantes en la interacción social y unificar el diseño visual de las pestañas administrativas utilizando Tailwind CSS v4."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corrección de visualización de textos (Priority: P1)

Como usuario de la plataforma, quiero poder leer publicaciones, nombres y descripciones sin problemas de codificación para que los textos que incluyen tildes y caracteres especiales como la 'ñ' se entiendan perfectamente.

**Why this priority**: La lectura de caracteres truncados daña severamente la percepción de calidad del producto y la usabilidad.

**Independent Test**: Can be fully tested by creating a post or reading the seed data containing 'ñ' and accents.

**Acceptance Scenarios**:

1. **Given** un texto con caracteres especiales provisto por el backend (ej. "Administración", "Sofía"), **When** se visualiza en la interfaz de usuario, **Then** el texto se renderiza de forma correcta sin mostrar símbolos de interrogación u omisiones.

---

### User Story 2 - Formateo de fechas legible (Priority: P2)

Como usuario, quiero ver la hora de las publicaciones en un formato claro (24:00) sin los segundos, para tener un contexto temporal útil sin exceso de información visual.

**Why this priority**: Eliminar ruido visual mejora el diseño de la interfaz del feed.

**Independent Test**: Observar la hora de publicación en cualquier post o comentario dentro del Feed.

**Acceptance Scenarios**:

1. **Given** una publicación o comentario en el Feed, **When** se revisa la marca de tiempo, **Then** debe mostrarse en formato 'HH:mm' (e.g. '14:30') y no 'HH:mm:ss'.

---

### User Story 3 - Reportar comentarios (Priority: P2)

Como usuario o moderador, quiero poder reportar comentarios inapropiados, al igual que ocurre con las publicaciones principales, para mantener la integridad y seguridad de la comunidad.

**Why this priority**: Se necesita consistencia en las herramientas de moderación entre publicaciones y comentarios.

**Independent Test**: Verificar la existencia del botón de reporte en cada comentario y que la acción dispare el flujo correspondiente.

**Acceptance Scenarios**:

1. **Given** un comentario en una publicación, **When** el usuario interactúa con sus opciones, **Then** debe aparecer un botón de "Reportar".

---

### User Story 4 - Controles completos de administración de usuarios (Priority: P1)

Como administrador, quiero tener un botón explícito para "Desactivar/Suspender Usuario" en el Panel de Administración, de modo que pueda ejercer mis derechos de admisión sin depender de acciones secundarias.

**Why this priority**: El panel de usuarios pierde utilidad operativa si no se pueden suspender cuentas de forma sencilla.

**Independent Test**: Ingresar al panel de usuarios y usar el botón de desactivar/suspender.

**Acceptance Scenarios**:

1. **Given** la lista de usuarios en el Panel de Administración, **When** interactúo con la fila de un usuario, **Then** debe existir un botón/acción clara para "Desactivar/Suspender Usuario".

---

### User Story 5 - Consistencia visual en el Panel de Administración (Priority: P3)

Como administrador, quiero que todas las pestañas de mi panel (Usuarios, Materias, Reportes) compartan el mismo diseño estructural de listas o grillas, para que la experiencia de uso sea predecible y consistente.

**Why this priority**: El uso de tarjetas mezcladas con listas rompe las heurísticas de diseño y hace que la UI parezca inacabada.

**Independent Test**: Navegar entre las tres pestañas del panel y verificar la cohesión visual.

**Acceptance Scenarios**:

1. **Given** el Panel de Administración, **When** navego a las pestañas de "Materias" y "Reportes", **Then** la información debe presentarse mediante un diseño de tabla/grilla uniforme al de la pestaña de "Usuarios".

---

### Edge Cases

- ¿Qué ocurre si un usuario intenta suspender a un usuario que ya fue suspendido o que es otro administrador?
- ¿Cómo se maneja la zona horaria al aplicar el formateo de hora a 24:00?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST garantizar la codificación `UTF-8` en el cliente (`index.html`) y en la entrega de datos por parte del backend (`DbInitializer.cs`, EF Core, HotChocolate).
- **FR-002**: El sistema MUST renderizar las fechas de publicaciones y comentarios en formato de hora `HH:mm` eliminando los segundos en el frontend (`Feed.jsx`, `CommentThread.jsx`).
- **FR-003**: El sistema MUST proveer en el componente de hilos de comentarios un botón/modal de "Reporte" asociado al comentario.
- **FR-004**: El sistema MUST incluir un botón visible para suspender o activar usuarios dentro del componente `UserManagement.jsx`.
- **FR-005**: El sistema MUST refactorizar los componentes de Materias y Reportes para usar el mismo diseño de tabla que `UserManagement.jsx` utilizando Tailwind CSS v4.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las tildes y eñes se muestran correctamente en todos los componentes del sistema usando datos del backend.
- **SC-002**: Las marcas temporales muestran el formato `HH:mm`.
- **SC-003**: 100% de los comentarios de la semilla presentan la opción "Reportar".
- **SC-004**: El panel administrativo unifica sus vistas bajo una estructura de listado tabular estándar.

## Assumptions

- El problema de codificación puede radicar tanto en la base de datos (DbInitializer con codificación incorrecta del archivo), como en la metaetiqueta HTML.
- El servidor soporta la mutación para suspender al usuario, solo falta la llamada o el botón de frontend.
- Reportar un comentario requerirá el ID del comentario, asumiendo que el backend soporta `TargetId` para comentarios.
