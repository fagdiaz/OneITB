# Feature Specification: QA Session 2 Social Core Fixes

**Feature Branch**: `codex/178-qa-session2-social-core-fixes` *(branch hook blocked; work continues on current branch)*
**Created**: 2026-07-11
**Status**: Draft
**Input**: Auditoria manual del muro: selector academico sin alcance, adjuntos unicos sin preview, render multimedia excluyente, interacciones incompletas, notificaciones defectuosas y ausencia de pie institucional.

## User Scenarios & Testing

### User Story 1 - Publicar en el contexto academico correcto (Priority: P1)

Como integrante de una o mas carreras, quiero elegir una materia ordenada y agrupada dentro de mis carreras para publicar en el contexto correcto sin recorrer materias ajenas.

**Why this priority**: Evita contenido mal clasificado y exposicion entre carreras, una regla central del muro academico.

**Independent Test**: Iniciar sesion con un usuario inscripto en dos carreras, abrir el formulario y comprobar que solo aparecen sus materias agrupadas por carrera, anio y nombre; intentar crear por API una publicacion en otra carrera y verificar el rechazo.

**Acceptance Scenarios**:

1. **Given** un usuario con una carrera, **When** abre el selector, **Then** ve exclusivamente materias de esa carrera con formato `Nombre - Codigo`.
2. **Given** un usuario con varias carreras, **When** abre el selector, **Then** las materias aparecen agrupadas por carrera y ordenadas por anio y nombre.
3. **Given** una materia fuera de las carreras del autor, **When** intenta publicar mediante API, **Then** la operacion se rechaza sin persistir datos.

---

### User Story 2 - Adjuntar y previsualizar multiples recursos (Priority: P1)

Como autor de una publicacion o comentario, quiero seleccionar varios archivos, revisar su nombre y vista previa y quitar archivos antes de enviar, para compartir recursos con confianza.

**Why this priority**: Los adjuntos forman parte del flujo academico principal y hoy pierden informacion o se reemplazan entre si.

**Independent Test**: Seleccionar imagenes y documentos cuyo total sea menor o igual a 15 MB, quitar uno, publicar y recargar; verificar que cada adjunto restante conserva nombre original, tipo, URL y visualizacion.

**Acceptance Scenarios**:

1. **Given** varios archivos validos, **When** se seleccionan en uno o mas pasos, **Then** se acumulan sin duplicados y pueden quitarse individualmente.
2. **Given** archivos cuyo total supera 15 MB, **When** se agregan, **Then** el formulario los rechaza con un mensaje claro antes de subir.
3. **Given** una imagen, video compatible, PDF o enlace YouTube, **When** se agrega al borrador, **Then** se muestra una vista previa antes de publicar.
4. **Given** un PDF publicado en cualquier nivel del hilo, **When** se renderiza, **Then** muestra su nombre original y permite abrir una vista previa sin forzar descarga.

---

### User Story 3 - Consumir medios sin abandonar el muro (Priority: P2)

Como lector, quiero ver todos los medios de una publicacion y abrir imagenes o videos en un visor modal, para mantener el contexto del muro.

**Why this priority**: Evita renderizado excluyente y navegaciones inesperadas en publicaciones multimedia.

**Independent Test**: Abrir una publicacion con YouTube, imagen y documento; comprobar que todos aparecen y que imagen/video se abren y cierran en modal, mientras el PDF puede previsualizarse o abrirse en otra pestaña.

**Acceptance Scenarios**:

1. **Given** una publicacion con enlace YouTube y adjuntos, **When** se muestra la tarjeta, **Then** ambos tipos de contenido se renderizan.
2. **Given** una imagen o video, **When** se activa su preview, **Then** se abre un modal accesible que puede cerrarse por boton, Escape o clic exterior.
3. **Given** un PDF, **When** se activa, **Then** puede visualizarse sin descarga obligatoria.

---

### User Story 4 - Interactuar con publicaciones y comentarios (Priority: P1)

Como usuario, quiero comentar con foco inmediato, reaccionar a comentarios y respuestas y consultar quienes reaccionaron a mis publicaciones, para que la conversacion sea fluida y transparente.

**Why this priority**: Completa el nucleo social y requiere persistencia y autorizacion correctas.

**Independent Test**: Comentar, reaccionar y recargar; comprobar foco, persistencia, contador, estado propio y listado paginado de usuarios en una publicacion propia.

**Acceptance Scenarios**:

1. **Given** una publicacion, **When** el usuario selecciona comentar, **Then** el campo correspondiente recibe foco.
2. **Given** un comentario o respuesta activo, **When** un usuario reacciona, **Then** el estado y contador se actualizan de inmediato y persisten tras recargar.
3. **Given** una publicacion propia con reacciones, **When** el autor selecciona el contador, **Then** ve un modal con los usuarios que reaccionaron.

---

### User Story 5 - Recibir notificaciones sociales agrupadas (Priority: P1)

Como autor, quiero recibir notificaciones confiables y agrupadas por publicacion para comentarios y reacciones de terceros, y navegar directamente al contenido relacionado.

**Why this priority**: Un fallo silencioso de notificaciones rompe el ciclo de participacion y la agrupacion evita ruido.

**Independent Test**: Hacer que varios usuarios comenten y reaccionen sobre una publicacion; verificar un registro agrupado por tipo/publicacion, contador correcto, ausencia de auto-notificacion y navegacion a la publicacion.

**Acceptance Scenarios**:

1. **Given** un tercero que comenta o reacciona, **When** la accion persiste, **Then** el autor recibe una notificacion incluso si el actor es Administrador.
2. **Given** varios eventos del mismo tipo y publicacion, **When** se consultan notificaciones, **Then** se muestra una notificacion agrupada con cantidad acumulada.
3. **Given** una notificacion agrupada, **When** se selecciona, **Then** navega a la publicacion asociada.

---

### User Story 6 - Cerrar el muro con identidad institucional (Priority: P3)

Como visitante del muro, quiero encontrar un pie de pagina institucional despues del contenido para reconocer autoria, enlaces y contexto del sistema.

**Why this priority**: Mejora la terminacion visual y la presentacion academica sin alterar flujos de negocio.

**Independent Test**: Llegar al final del feed y comprobar que el footer aparece despues de `Cargar mas`, sin tapar el chat ni romper mobile o impresion.

**Acceptance Scenarios**:

1. **Given** el feed con o sin publicaciones, **When** se llega al final, **Then** aparece un footer responsivo con copyright y enlaces institucionales.

### Edge Cases

- El usuario no tiene carreras o una carrera no tiene materias activas.
- Se selecciona dos veces el mismo archivo o se elimina antes de publicar.
- Una subida parcial falla despues de que otros archivos ya fueron almacenados.
- Una URL de media es invalida, externa no permitida o deja de estar disponible.
- Un comentario o publicacion fue desactivado antes de reaccionar o abrir una notificacion.
- Dos usuarios reaccionan simultaneamente y actualizan el mismo grupo de notificacion.
- El autor interactua con su propio contenido y no debe autogenerarse ruido.
- El listado de usuarios que reaccionaron es largo y requiere limite/paginacion.

## Requirements

### Functional Requirements

- **FR-001**: El selector de materias MUST mostrar solo materias activas pertenecientes a carreras activas del usuario autenticado.
- **FR-002**: Las materias MUST agruparse por carrera y ordenarse por carrera, anio y nombre, con etiqueta `Nombre - Codigo`.
- **FR-003**: La creacion de publicaciones MUST rechazar server-side materias fuera del alcance academico del autor, salvo una excepcion institucional documentada para administradores.
- **FR-004**: Publicaciones, comentarios y respuestas MUST admitir multiples adjuntos persistentes con nombre original, URL, tipo MIME, tamano y orden.
- **FR-005**: El total de archivos de una operacion MUST limitarse a 15 MB y los tipos MUST respetar la allowlist institucional tanto en cliente como en servidor.
- **FR-006**: El formulario MUST acumular selecciones, evitar duplicados y permitir quitar adjuntos antes de enviar.
- **FR-007**: El formulario MUST previsualizar imagenes, videos compatibles, PDFs y enlaces de YouTube antes de publicar.
- **FR-008**: El muro MUST renderizar en conjunto texto, YouTube y todos los adjuntos, sin que un medio excluya a otro.
- **FR-009**: Imagenes y YouTube MUST abrirse en un modal accesible; PDFs MUST poder previsualizarse o abrirse en una pestana nueva.
- **FR-010**: Los adjuntos MUST conservar el nombre original en toda vista; el nombre fisico generado no debe presentarse como nombre de usuario.
- **FR-011**: La accion de comentar MUST enfocar el editor correspondiente.
- **FR-012**: Usuarios autenticados MUST poder alternar una unica reaccion `Me gusta` por comentario o respuesta activa.
- **FR-013**: El contador de reacciones de publicaciones propias MUST abrir un listado paginado de usuarios que reaccionaron.
- **FR-014**: Comentarios y reacciones de terceros MUST generar notificaciones para el autor, independientemente del rol del actor.
- **FR-015**: Las notificaciones sociales MUST agruparse persistentemente por destinatario, publicacion y tipo de evento con actualizacion atomica del contador.
- **FR-016**: Toda notificacion agrupada MUST incluir una ruta estable hacia la publicacion relacionada.
- **FR-017**: El feed MUST finalizar con un footer institucional responsivo ubicado despues de la paginacion.
- **FR-018**: Las mutaciones nuevas MUST validar autenticacion, existencia, estado activo, ownership cuando corresponda y limites de entrada en el backend.
- **FR-019**: Las listas GraphQL nuevas MUST ser acotadas o paginadas y evitar N+1.
- **FR-020**: Las acciones sociales de alta frecuencia MUST mantener consistencia de cache y respuesta optimista sin duplicar elementos.

### Key Entities

- **SocialAttachment**: Recurso binario o enlace persistido para una publicacion o comentario, con metadatos de presentacion y orden.
- **CommentReaction**: Reaccion unica de un usuario sobre un comentario activo.
- **Notification**: Aviso persistente al usuario, extendido con identidad de agrupacion, tipo, contador y referencia a la publicacion.
- **Inquiry**: Publicacion academica vinculada a autor, materia, adjuntos, comentarios y reacciones.
- **Comment**: Mensaje del hilo, incluida una respuesta, con adjuntos y reacciones.

## Success Criteria

### Measurable Outcomes

- **SC-001**: En el 100% de las pruebas, un usuario no puede seleccionar ni crear publicaciones en materias fuera de sus carreras autorizadas.
- **SC-002**: Los usuarios pueden adjuntar, revisar y quitar hasta el limite de 15 MB sin perder selecciones previas.
- **SC-003**: El 100% de los adjuntos publicados conserva nombre original y sigue disponible tras recargar.
- **SC-004**: Una tarjeta puede mostrar simultaneamente YouTube y multiples adjuntos sin errores de render.
- **SC-005**: Reacciones de comentarios y respuestas persisten y reflejan contador/estado correcto tras recargar.
- **SC-006**: Diez eventos iguales sobre una publicacion producen una sola notificacion visible con contador 10.
- **SC-007**: Todas las notificaciones sociales llevan al contenido relacionado en un solo clic.
- **SC-008**: Los flujos modificados compilan, superan pruebas automatizadas de autorizacion/persistencia y completan una regresion autenticada de navegador cuando el runtime local esta disponible.

## Assumptions

- La excepcion de Administrador para publicar en cualquier materia se mantiene solo si el contrato actual ya la soporta; de lo contrario se aplica el mismo alcance que a usuarios comunes.
- El limite de 15 MB es agregado por submit y la cantidad maxima de archivos se acota defensivamente a 10.
- La vista previa PDF usa capacidades nativas del navegador; no se agrega una dependencia pesada solo para generar thumbnails.
- Los archivos ya persistidos en `FileUrl` se conservan mediante una migracion/backfill compatible hacia el nuevo modelo.
- Las notificaciones se agrupan al escribir para conservar consistencia entre consultas, recargas y clientes.
- No se amplia la profundidad de comentarios ni se agregan tipos de reaccion distintos de `Me gusta`.
