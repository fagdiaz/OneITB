# Feature Specification: UX & Print Polish

**Feature Branch**: `150-ux-print-polish`

**Created**: 2026-06-30

**Status**: Draft

**Input**: "Auditoría de UX encontró fallos en la previsualización de impresión, imágenes rotas en el feed, falta de botones de escape y métricas sin sentido en el perfil."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Imprimir el CV sin que aparezca el Portfolio Social (Priority: P1)

Un estudiante o egresado presiona "Imprimir CV" en su perfil y obtiene un PDF limpio que solo contiene su curriculum institucional (datos personales, experiencia, formación, habilidades, idiomas). La sección "Publicaciones recientes" no aparece porque no es parte de un CV formal.

**Why this priority**: La sección de publicaciones contamina el documento impreso con contenido de red social que no tiene lugar en un CV.

**Independent Test**: Ir a `/profile` → Imprimir → verificar que el PDF no contiene la sección "Portfolio social / Publicaciones recientes".

**Acceptance Scenarios**:

1. **Given** el perfil tiene publicaciones, **When** el usuario imprime, **Then** la sección "Portfolio social" no aparece en el documento impreso.
2. **Given** el perfil no tiene publicaciones, **When** el usuario imprime, **Then** el mensaje "Sin publicaciones" tampoco aparece.

---

### User Story 2 — Ver imágenes en el feed sin encontrar imágenes rotas (Priority: P2)

Un usuario navega el feed y las publicaciones con imagen adjunta muestran siempre un estado visual coherente: la imagen si carga correctamente, o un fallback elegante (ícono + nombre de archivo) si la URL no responde. Nunca se muestra el ícono roto del navegador.

**Why this priority**: Las imágenes rotas degradan la percepción de calidad de la plataforma y confunden al usuario sobre si el contenido existe.

**Independent Test**: Modificar temporalmente la URL de una imagen para que falle y verificar que aparece el fallback en lugar del ícono roto.

**Acceptance Scenarios**:

1. **Given** una publicación tiene `fileUrl` de imagen que responde, **When** el usuario ve la publicación, **Then** la imagen se muestra correctamente.
2. **Given** una publicación tiene `fileUrl` de imagen que falla (backend no disponible), **When** el usuario ve la publicación, **Then** aparece un fallback con ícono de imagen y nombre del archivo, nunca el ícono roto del navegador.
3. **Given** el fallback se muestra, **When** el usuario hace clic, **Then** el enlace al archivo sigue siendo accesible.

---

### User Story 3 — Cerrar o escapar de estados abiertos en el feed y el perfil (Priority: P2)

Un usuario que expandió una sección, abrió un filtro o activó una vista de comentarios puede volver al estado anterior sin recargar la página. Existen controles visuales claros para cerrar o resetear.

**Why this priority**: Sin botones de escape el usuario queda "atrapado" en un estado y su única salida es recargar, lo que rompe el flujo natural de navegación.

**Independent Test**: Expandir comentarios en el feed → verificar que existe un botón o acción para cerrarlos.

**Acceptance Scenarios**:

1. **Given** el usuario activó el filtro de búsqueda en el feed con texto, **When** desea resetear, **Then** existe un botón "X" o "Limpiar" visible en el campo de búsqueda.
2. **Given** el usuario expandió los comentarios de una publicación, **When** desea cerrarlos, **Then** existe un control visible para colapsar el hilo.

---

### User Story 4 — Entender las métricas del perfil sin ambigüedad (Priority: P3)

Un visitante del perfil lee las métricas del encabezado (Publicaciones / Carreras / Materias) y comprende qué representan. Los valores son consistentes con el contenido visible en la página, y las métricas en cero tienen una representación neutral en lugar de números vacíos que generan confusión.

**Why this priority**: Métricas inconsistentes o con valor 0 sin contexto dañan la credibilidad del perfil.

**Independent Test**: Ver el perfil de un usuario sin publicaciones → las métricas deben mostrar "—" o un estado vacío, no "0" a secas.

**Acceptance Scenarios**:

1. **Given** un usuario no tiene publicaciones, **When** otro usuario visita su perfil, **Then** el contador muestra "—" en lugar de 0.
2. **Given** un usuario tiene publicaciones, **When** otro usuario visita su perfil, **Then** el contador refleja un número realista y consistente con el contenido visible.
3. **Given** el usuario tiene 0 materias de actividad, **When** otro usuario ve el perfil, **Then** el valor muestra "—" o se oculta la tarjeta, no "0".

---

### Edge Cases

- ¿Qué pasa si el backend está caído y todas las imágenes fallan? → Todas muestran el fallback; la experiencia sigue siendo usable.
- ¿Qué pasa si el perfil no tiene ninguna sección de CV? → Las métricas "—" aplican igualmente; no hay regresión.
- ¿Qué pasa si el usuario tiene exactamente 1 publicación? → Se muestra "1", no "—" (solo se muestra "—" cuando es 0).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La sección "Portfolio social / Publicaciones recientes" DEBE tener clase `print:hidden` para no aparecer en documentos impresos.
- **FR-002**: El componente `MediaAttachment` DEBE mostrar un fallback visual elegante cuando `imageFailed === true`, en lugar del elemento `<img>` roto del navegador.
- **FR-003**: El fallback de imagen rota DEBE mantener el enlace al archivo original para que el usuario pueda acceder igualmente.
- **FR-004**: El campo de búsqueda del feed DEBE tener un botón "X" / limpiar que resetee el filtro cuando hay texto activo.
- **FR-005**: El hilo de comentarios expandido en el feed DEBE tener un control visible para colapsar/cerrar.
- **FR-006**: Los contadores de métricas del perfil (Publicaciones, Carreras, Materias) DEBEN mostrar "—" cuando el valor es 0, en lugar de mostrar el número 0.
- **FR-007**: Todos los cambios DEBEN estar contenidos en la capa frontend; ningún archivo de backend ni esquema GraphQL debe ser modificado.

### Key Entities

- **UserProfile** (`UserProfile.tsx`): Vista de perfil. Afectada por FR-001, FR-006.
- **MediaAttachment** (`MediaAttachment.jsx`): Componente de adjuntos. Afectado por FR-002, FR-003.
- **Feed** (`Feed.jsx`): Feed principal. Afectado por FR-004, FR-005.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al imprimir el perfil, la sección "Publicaciones recientes" no aparece en ninguna página del PDF.
- **SC-002**: Una imagen con URL inválida muestra el fallback en menos de 1 segundo tras el error de carga, sin mostrar el ícono roto del navegador en ningún momento visible.
- **SC-003**: El campo de búsqueda del feed muestra el botón "X" cuando hay texto y al hacer clic limpia el filtro y restaura el feed completo.
- **SC-004**: Los valores de métrica 0 en el perfil se muestran como "—" en el encabezado del perfil.
- **SC-005**: El build de Vite completa sin errores TypeScript tras todos los cambios.

## Assumptions

- El fallback de imagen rota ya está parcialmente manejado con `imageFailed` y `onError` en `MediaAttachment.jsx`; se requiere mejorar el estado de fallback visual.
- El campo de búsqueda del feed ya existe en `Feed.jsx`; se añade el botón limpiar sin cambiar la lógica de búsqueda.
- El hilo de comentarios ya tiene un mecanismo de expandir en `Feed.jsx`; se añade el control de colapsar si no existe.
- Los cambios de métricas son puramente de presentación (ternario `value || '—'`).
- La sección de Portfolio Social es la última sección de `UserProfile.tsx`; se agrega `print:hidden` al `<section>` correspondiente.
