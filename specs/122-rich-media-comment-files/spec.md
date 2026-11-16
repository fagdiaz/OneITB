# Feature Specification: Multimedia enriquecida y adjuntos en comentarios

**Feature Branch**: `122-rich-media-comment-files`

**Created**: 2026-06-19

**Status**: Ready

**Input**: Mostrar imagenes, videos de YouTube y documentos de forma contextual en el muro, y permitir archivos adjuntos en comentarios y respuestas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consumir publicaciones multimedia (Priority: P1)

Una persona recorre el muro y ve imagenes dentro de la publicacion, reproduce videos de YouTube sin abandonar la pagina y reconoce documentos mediante tarjetas claras.

**Why this priority**: Es el valor central de la experiencia de multimedia enriquecida.

**Independent Test**: Publicar ejemplos con una imagen, un enlace de YouTube y distintos documentos, y verificar que cada uno se presenta con el formato correcto.

**Acceptance Scenarios**:

1. **Given** una publicacion con imagen adjunta, **When** se muestra en el muro, **Then** la imagen aparece integrada y conserva un acceso al archivo original.
2. **Given** una publicacion con un enlace valido de YouTube, **When** se muestra, **Then** el enlace se reemplaza visualmente por un reproductor y el resto del texto permanece legible.
3. **Given** una publicacion con PDF, presentacion u otro documento, **When** se muestra, **Then** aparece una tarjeta identificable con nombre y accion de descarga.

---

### User Story 2 - Adjuntar archivos a comentarios (Priority: P1)

Una persona puede seleccionar un archivo al escribir un comentario o una respuesta y verlo dentro del hilo luego de enviarlo.

**Why this priority**: Extiende el intercambio academico a los hilos de conversacion, no solo a la publicacion inicial.

**Independent Test**: Crear un comentario y una respuesta con adjuntos, recargar y comprobar que ambos archivos permanecen visibles.

**Acceptance Scenarios**:

1. **Given** un comentario valido con archivo, **When** se envia, **Then** el archivo se carga antes y su URL queda asociada al comentario.
2. **Given** una respuesta con imagen, **When** se renderiza el hilo, **Then** la imagen aparece en formato compacto dentro de su burbuja.

---

### User Story 3 - Mantener una experiencia segura y liviana (Priority: P2)

La persona recibe feedback durante la carga, no puede duplicar envios y un enlace parecido a YouTube pero invalido permanece como texto sin generar un reproductor inseguro.

**Why this priority**: Evita regresiones, contenido embebido arbitrario y operaciones duplicadas.

**Independent Test**: Probar URLs invalidas, archivos no permitidos y un segundo envio durante una carga.

**Acceptance Scenarios**:

1. **Given** una URL que no pertenece a un host reconocido de YouTube, **When** se renderiza, **Then** permanece como texto y no crea contenido embebido.
2. **Given** una carga de comentario en curso, **When** se intenta reenviar, **Then** los controles permanecen deshabilitados y muestran progreso.

### Edge Cases

- Texto con mas de un enlace de YouTube.
- URL de YouTube con parametros adicionales, formato corto, Shorts o embed.
- Nombre de archivo codificado o sin extension reconocible.
- Comentario con texto valido pero carga fallida.
- Adjunto historico inexistente o URL nula.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El muro MUST distinguir imagenes, PDF, presentaciones y otros documentos por su extension.
- **FR-002**: Las imagenes MUST mostrarse integradas en publicaciones y en formato compacto dentro de comentarios.
- **FR-003**: Los documentos MUST mostrarse como tarjetas con tipo, nombre y accion de acceso.
- **FR-004**: El sistema MUST reconocer enlaces de hosts oficiales de YouTube en formatos habituales y mostrar un reproductor para el primer enlace valido.
- **FR-005**: El texto restante MUST conservarse sin interpretar HTML proporcionado por usuarios.
- **FR-006**: El sistema MUST persistir una URL opcional de archivo en cada comentario.
- **FR-007**: Las personas MUST poder adjuntar archivos tanto a comentarios principales como a respuestas.
- **FR-008**: La carga del comentario MUST reutilizar las mismas reglas de autenticacion, tamano y formatos del flujo de publicaciones.
- **FR-009**: Las consultas y mutaciones existentes sin archivo MUST mantener compatibilidad.
- **FR-010**: La interfaz MUST mostrar seleccion, progreso, error y bloqueo de doble envio durante la carga.
- **FR-011**: GIF y WebP MUST admitirse como formatos de imagen.

### Key Entities

- **Publicacion**: Contenido del muro cuyo texto puede contener un enlace reconocido y cuya URL adjunta determina una representacion visual.
- **Comentario**: Respuesta del hilo que conserva opcionalmente la URL de un archivo, incluyendo respuestas anidadas.
- **Medio**: Representacion derivada de una URL como imagen, PDF, presentacion o documento generico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los formatos de imagen admitidos se muestra inline sin navegacion adicional.
- **SC-002**: El 100% de las URLs validas de YouTube cubiertas por los formatos definidos genera un reproductor funcional, y ninguna URL de otro host lo hace.
- **SC-003**: Una persona puede crear un comentario o respuesta con adjunto en un unico flujo y verlo despues de recargar.
- **SC-004**: Las publicaciones y comentarios existentes sin archivo mantienen su presentacion y funcionamiento.
- **SC-005**: Los documentos reconocidos muestran nombre, tipo y acceso en una unica tarjeta visible.

## Assumptions

- Solo se embebe el primer enlace valido de YouTube por publicacion; enlaces adicionales permanecen en el texto.
- No se generan previsualizaciones remotas para PDF, Word o PowerPoint.
- Los comentarios requieren texto aunque incluyan un archivo.
- El endpoint de carga desacoplada existente sigue siendo la unica via de transferencia binaria.
