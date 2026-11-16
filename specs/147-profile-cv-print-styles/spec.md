# Feature Specification: Profile CV Print Styles

**Feature Branch**: `147-profile-cv-print-styles`

**Created**: 2026-06-29

**Status**: In Progress — v2 (ampliado)

**Input**: "Fase de estabilización. En la auditoría del módulo de Perfil/CV encontramos varios problemas visuales y de estilos de impresión (@media print) que debes solucionar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Imprimir o exportar el perfil/CV como PDF legible (Priority: P1)

Un usuario (empleador, docente o el propio estudiante) navega al perfil público de un alumno egresado, presiona Ctrl+P o "Guardar como PDF" desde el navegador, y obtiene un documento limpio con todos los datos del CV (nombre, rol, biografía, experiencia, formación, habilidades, idiomas, redes de contacto) correctamente visible sobre fondo blanco.

**Why this priority**: El perfil está diseñado como un curriculum vitae institucional. Si la impresión es ilegible el componente no cumple su propósito principal como documento exportable.

**Independent Test**: Abrir `/profile/{id}` → File → Imprimir → Vista previa. Verificar que todo el texto es legible sobre fondo blanco sin elementos de interfaz que no pertenecen a un documento.

**Acceptance Scenarios**:

1. **Given** el perfil público tiene datos de CV cargados, **When** el usuario imprime desde Chrome/Firefox/Edge, **Then** el header oscuro se reemplaza por fondo blanco con texto oscuro legible.
2. **Given** el perfil tiene sección de experiencia, formación, habilidades e idiomas, **When** el usuario imprime, **Then** todas las secciones aparecen con texto negro sobre fondo blanco, sin colores de fondo.
3. **Given** la vista en pantalla muestra botones "Editar CV/Perfil" y "Editar CV", **When** el usuario imprime, **Then** esos controles de navegación no aparecen en el documento impreso.
4. **Given** los proyectos tienen URL de enlace, **When** el usuario imprime, **Then** la URL textual es visible junto al nombre del proyecto.
5. **Given** el layout usa 2 columnas (aside + main) en pantalla, **When** el usuario imprime, **Then** el contenido se renderiza en una sola columna de ancho completo para evitar contenido cortado.

---

### User Story 2 — Navegación digital sin degradar experiencia de pantalla (Priority: P2)

Al agregar los estilos de impresión, la experiencia visual en pantalla (dark header, colores de rol, badges, cards) no debe alterarse.

**Why this priority**: Los fixes de @media print no deben romper la UI interactiva existente.

**Independent Test**: Verificar visualmente la vista en pantalla antes y después del fix para confirmar que no hay regresión visual.

**Acceptance Scenarios**:

1. **Given** el fix está aplicado, **When** el usuario ve el perfil en pantalla, **Then** el header oscuro, los badges de rol y los colores de acento se muestran igual que antes.

---

### Edge Cases

- ¿Qué pasa si el perfil no tiene CV extendido? → Las secciones vacías ya muestran texto de fallback; en impresión esas secciones simplemente no deben mostrar fondo de color.
- ¿Qué pasa con el avatar generado externamente? → Se mantiene la imagen; si el navegador no carga imágenes externas al imprimir se mostrará el espacio vacío (comportamiento aceptable).
- ¿Qué pasa en Firefox vs Chrome con `-webkit-print-color-adjust`? → Usar la propiedad estándar `print-color-adjust: exact` con fallback `-webkit-print-color-adjust: exact`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE renderizar el header del perfil con fondo blanco y texto oscuro en modo impresión.
- **FR-002**: El sistema DEBE ocultar todos los controles de edición/navegación (botones "Editar CV", "Editar CV/Perfil", "Ver todas") en modo impresión.
- **FR-003**: El sistema DEBE mostrar las URL textuales de los proyectos en modo impresión cuando el ítem tiene un enlace.
- **FR-004**: El sistema DEBE colapsar el layout de 2 columnas a 1 columna en modo impresión.
- **FR-005**: El sistema DEBE eliminar sombras, fondos de color y bordes decorativos de las tarjetas en modo impresión para producir un documento limpio.
- **FR-006**: El sistema DEBE conservar todos los datos de texto (nombre, rol, carrera, biografía, fechas, descripciones) visibles e íntegros en el documento impreso.
- **FR-007**: Los cambios DEBEN estar contenidos exclusivamente en archivos de la capa frontend; ningún archivo de backend debe ser modificado.
- **FR-008**: La sección "Contacto y redes" DEBE mostrar el nombre de la red social junto a la URL completa visible y copiable (ej: `LinkedIn — https://linkedin.com/in/usuario`), no solo el nombre de la red.
- **FR-009**: El botón "Imprimir/Guardar CV" (que dispara `window.print()`) DEBE estar visible en la vista principal del perfil (no solo en el editor) y DEBE ocultarse en modo impresión.
- **FR-010**: El sistema NO DEBE mostrar roles de sistema genéricos (ej: "User") en la cabecera del CV. Solo los roles institucionales con significado visible para el usuario (Estudiante, Profesor, Egresado, Moderador, Administrador, Empleador) deben mostrarse.
- **FR-011**: El widget del chat global (MiniChatWidget) DEBE tener clase `print:hidden` para no aparecer en documentos impresos.
- **FR-012**: No deben generarse páginas en blanco adicionales al imprimir. Los márgenes superiores excesivos (`space-y-*`, `py-*`) en el contenedor raíz deben neutralizarse con `print:m-0 print:p-0`.

### Key Entities

- **Perfil público** (`UserProfile.tsx`): Vista de lectura del curriculum institucional. Es la única entidad afectada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al imprimir el perfil desde Chrome, Firefox y Edge, ningún texto aparece ilegible por contraste insuficiente (texto oscuro sobre fondo claro en todo el documento).
- **SC-002**: Los botones de edición y navegación son completamente invisibles en la vista previa de impresión.
- **SC-003**: Las URLs de proyectos con enlace son visibles como texto en el documento impreso.
- **SC-004**: El layout no produce cortes de contenido en los márgenes laterales al imprimir en A4.
- **SC-005**: La experiencia visual en pantalla (dark header, badges de rol, fondos de cards) es idéntica a antes del cambio.

## Assumptions

- El fix se aplica exclusivamente al componente `UserProfile.tsx` mediante clases utilitarias de Tailwind CSS con los prefijos `print:`.
- No se requiere un archivo CSS separado; Tailwind 4 soporta variantes `print:` de forma nativa.
- La impresión se valida manualmente en la vista previa del navegador (no hay automatización de tests de impresión).
- El avatar externo (ui-avatars.com) puede no renderizarse en impresión según configuración del navegador; esto es aceptable.
- La sección "Estado académico personal" (solo visible en perfil propio) también debe estar limpia en impresión si el usuario la imprime.
