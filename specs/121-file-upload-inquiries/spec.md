# Feature Specification: Archivos adjuntos en publicaciones

**Feature Branch**: `121-file-upload-inquiries`

**Created**: 2026-06-19

**Status**: Ready

**Input**: Permitir que una persona autenticada adjunte un archivo educativo a una publicacion mediante una carga previa e independiente de la creacion de la publicacion.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar con archivo adjunto (Priority: P1)

Una persona autenticada selecciona un archivo educativo, publica el contenido y ve la publicacion con un acceso al archivo.

**Why this priority**: Completa CU-07 y la unica tarea pendiente del modulo de publicaciones.

**Independent Test**: Crear una publicacion con un archivo valido y comprobar que aparece inmediatamente, puede abrirse y permanece luego de recargar.

**Acceptance Scenarios**:

1. **Given** una sesion autenticada y un archivo valido menor o igual a 15 MB, **When** la persona publica, **Then** el archivo se carga primero y la publicacion conserva la URL obtenida.
2. **Given** una publicacion con archivo, **When** otra persona abre el adjunto, **Then** recibe el contenido almacenado sin depender del cliente que lo subio.

---

### User Story 2 - Publicar sin archivo (Priority: P1)

Una persona puede seguir creando publicaciones de texto sin seleccionar un archivo.

**Why this priority**: La incorporacion de adjuntos no debe introducir una regresion en el flujo principal del muro.

**Independent Test**: Crear una publicacion sin adjunto y verificar que se guarda y renderiza como antes.

**Acceptance Scenarios**:

1. **Given** una publicacion valida sin archivo, **When** la persona confirma, **Then** se crea sin URL de archivo.

---

### User Story 3 - Rechazo seguro y feedback (Priority: P2)

Una persona recibe un mensaje claro cuando el archivo supera el limite, tiene un formato no admitido o la carga falla, y no puede enviar dos veces mientras la operacion esta en curso.

**Why this priority**: Evita archivos inseguros, publicaciones incompletas y duplicados accidentales.

**Independent Test**: Intentar cargar archivos invalidos y repetir el envio durante una carga.

**Acceptance Scenarios**:

1. **Given** un archivo mayor a 15 MB o de tipo no permitido, **When** se intenta cargar, **Then** el sistema lo rechaza y no crea la publicacion.
2. **Given** una carga en curso, **When** la persona intenta publicar nuevamente, **Then** el control permanece deshabilitado y muestra estado de progreso.

### Edge Cases

- La carga se completa pero la creacion de la publicacion falla.
- El nombre original contiene rutas, caracteres especiales o coincide con otro archivo.
- La solicitud no contiene una sesion valida.
- Una URL historica ya almacenada debe seguir resolviendo despues del cambio de nombre del campo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir cargar un unico archivo educativo antes de crear una publicacion.
- **FR-002**: El sistema MUST exigir una sesion autenticada para aceptar una carga.
- **FR-003**: El sistema MUST limitar cada archivo a 15 MB y aceptar solo formatos educativos e imagenes expresamente permitidos.
- **FR-004**: El sistema MUST generar un nombre de almacenamiento unico independiente del nombre original.
- **FR-005**: El sistema MUST devolver una URL relativa utilizable para consultar el archivo cargado.
- **FR-006**: La publicacion MUST persistir opcionalmente la URL del archivo sin eliminar URLs historicas existentes.
- **FR-007**: La creacion sin archivo MUST mantener el comportamiento actual.
- **FR-008**: La interfaz MUST mostrar progreso, impedir envios duplicados y comunicar errores de carga.
- **FR-009**: Las tarjetas con adjunto MUST ofrecer un enlace para abrir o descargar el archivo.
- **FR-010**: Los archivos generados en ejecucion MUST permanecer fuera del control de versiones.

### Key Entities

- **Publicacion**: Contenido del muro que puede conservar una URL opcional a un archivo cargado.
- **Archivo adjunto**: Recurso educativo validado, almacenado con nombre unico y accesible mediante una URL relativa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona completa una publicacion con adjunto valido en un unico intento y sin recargar la pagina.
- **SC-002**: El 100% de los archivos superiores a 15 MB o con formato no permitido se rechaza antes de crear la publicacion.
- **SC-003**: El 100% de las publicaciones sin archivo sigue pudiendo crearse con el mismo flujo.
- **SC-004**: Una publicacion con adjunto conserva un enlace funcional despues de recargar la aplicacion.
- **SC-005**: Dos archivos con el mismo nombre original se almacenan sin colision.

## Assumptions

- La primera version admite PDF, documentos de oficina habituales, texto, imagenes y ZIP.
- La limpieza de archivos huerfanos queda fuera de alcance y se tratara como mantenimiento separado.
- El almacenamiento local es adecuado para el entorno actual de una sola instancia.
