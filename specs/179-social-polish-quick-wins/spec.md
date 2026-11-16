# Feature Specification: Social Polish Quick Wins

**Feature Branch**: `179-social-polish-quick-wins`

**Created**: 2026-07-12

**Status**: Draft

**Input**: Apply low-risk quick wins over the latest social/feed/header specs: improve shareability, accessibility, attachment resilience, and targeted regression tests without changing backend persistence contracts.

## User Scenarios & Testing

### User Story 1 - Compartir publicaciones con enlace estable (Priority: P1)

Como usuario del muro, quiero copiar un enlace directo a una publicacion para compartirla en chat, defensa o revision institucional sin perder el contexto del feed.

**Why this priority**: Spec 178 agrego deep-links de notificaciones; exponer la misma capacidad al usuario mejora trazabilidad y demo sin tocar datos.

**Independent Test**: Abrir una publicacion del feed, usar la accion de compartir y comprobar que el sistema genera una URL con el identificador de la publicacion y muestra feedback claro.

**Acceptance Scenarios**:

1. **Given** una publicacion visible, **When** el usuario selecciona "Copiar enlace", **Then** se copia una URL estable con `inquiryId` y se informa exito.
2. **Given** que el navegador no permite portapapeles, **When** el usuario intenta copiar, **Then** el sistema muestra un error controlado sin romper el feed.

---

### User Story 2 - Adjuntar archivos con menos friccion (Priority: P2)

Como autor de publicaciones o comentarios, quiero arrastrar archivos al selector y ver instrucciones claras para adjuntarlos sin depender solo del explorador del sistema.

**Why this priority**: El flujo de adjuntos multiples ya existe; drag-and-drop reduce friccion de demo y mantiene los mismos limites institucionales.

**Independent Test**: Arrastrar dos archivos validos sobre el selector, comprobar acumulacion, limites y remocion individual.

**Acceptance Scenarios**:

1. **Given** archivos validos, **When** se sueltan sobre el selector, **Then** se agregan igual que si se hubieran elegido desde el input.
2. **Given** archivos duplicados o exceso de limite, **When** se sueltan, **Then** aparece el mismo mensaje defensivo que en seleccion manual.

---

### User Story 3 - Cerrar visores y modales con accesibilidad consistente (Priority: P2)

Como usuario que navega con teclado o lector de pantalla, quiero que los visores multimedia y modales sociales mantengan foco, etiquetas y cierre predecible.

**Why this priority**: Spec 178 agrego modales de media y reacciones; una capa de accesibilidad reduce riesgo de regresion visual/manual.

**Independent Test**: Abrir visor de media y listado de reacciones, cerrar con Escape, click exterior y boton, comprobando que no quedan overlays ni scroll bloqueado.

**Acceptance Scenarios**:

1. **Given** un visor abierto, **When** el usuario presiona Escape, **Then** el visor se cierra y el scroll del documento se restaura.
2. **Given** una imagen o preview externa rota, **When** falla la carga, **Then** se muestra una tarjeta defensiva sin error visible ni layout roto.

### Edge Cases

- El navegador no expone `navigator.clipboard`.
- La pagina se sirve desde una ruta con query previa.
- El usuario arrastra carpetas o archivos duplicados.
- Un modal se desmonta mientras una query de reacciones sigue cargando.
- Una miniatura externa falla o devuelve contenido vacio.

## Requirements

### Functional Requirements

- **FR-001**: El feed MUST ofrecer una accion visible para copiar el enlace directo de cada publicacion.
- **FR-002**: La URL copiada MUST conservar el origen actual y usar una ruta estable hacia el feed con `inquiryId`.
- **FR-003**: La accion de copiar MUST informar exito o error sin lanzar excepciones no controladas.
- **FR-004**: El selector de adjuntos MUST aceptar drag-and-drop manteniendo deduplicacion, allowlist, cantidad maxima y limite agregado existentes.
- **FR-005**: El selector de adjuntos MUST comunicar visualmente cuando el usuario esta arrastrando archivos sobre el area.
- **FR-006**: Los modales de media y reacciones MUST conservar cierre por Escape, click exterior y boton, restaurando scroll global.
- **FR-007**: Las imagenes/previews rotas MUST degradar a tarjeta de archivo o placeholder controlado.
- **FR-008**: Deben agregarse pruebas automatizadas de los quick wins frontend modificados.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El 100% de publicaciones renderizadas incluye una accion de copia de enlace funcional o error controlado.
- **SC-002**: Drag-and-drop reutiliza los mismos limites del picker: maximo 10 archivos y 15 MB agregados.
- **SC-003**: Los tests de componentes afectados pasan y cubren copia de enlace o drag-and-drop.
- **SC-004**: El build frontend finaliza sin errores tras los cambios.

## Assumptions

- No se modifican entidades, migraciones ni contratos GraphQL.
- La ruta canonica de una publicacion compartida es `/feed?inquiryId={id}`.
- El portapapeles se considera una mejora progresiva; si no esta disponible, se muestra feedback de error.
