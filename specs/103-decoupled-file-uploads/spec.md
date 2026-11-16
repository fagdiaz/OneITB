# Feature Specification: Decoupled File Uploads

**Feature Branch**: `[103-decoupled-file-uploads]`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Implementar el Caso de Uso 07 (CU-07: Carga Desacoplada) y RF-011, desarrollando un sistema de gestión de archivos educativos. Se requiere una arquitectura híbrida: un endpoint REST para el almacenamiento físico y streaming/preview del archivo, y la actualización del esquema GraphQL para vincular la URL del archivo a las publicaciones (Inquiries)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subir Archivo Adjunto (Priority: P1)

Como Estudiante o Profesor, quiero poder subir un archivo físico (PDF, DOCX) al crear una publicación, para que mis compañeros puedan acceder al material de estudio.

**Why this priority**: Es el núcleo del CU-07, permitiendo el intercambio real de materiales educativos en la plataforma.

**Independent Test**: Can be fully tested by sending a POST request with `multipart/form-data` containing a file to the REST endpoint and verifying that it returns a valid relative path and the file exists in the server's filesystem.

**Acceptance Scenarios**:

1. **Given** I am creating a new publication, **When** I attach a valid file and submit, **Then** the file is uploaded to the REST endpoint.
2. **Given** the file upload succeeds, **When** the REST API returns the path, **Then** the GraphQL mutation `AddInquiry` receives this path and links it to the new Inquiry.

---

### User Story 2 - Previsualización de Archivo (Priority: P2)

Como Usuario de la plataforma, quiero poder previsualizar o transmitir (streaming) el archivo adjunto de una publicación sin necesidad de descargarlo completamente antes de verlo.

**Why this priority**: Resuelve la resolución de auditoría sobre el streaming de archivos, mejorando la experiencia de usuario y reduciendo la transferencia innecesaria de datos.

**Independent Test**: Can be fully tested by requesting a previously uploaded file via the streaming REST endpoint and verifying the appropriate headers (e.g., `Content-Type`, `Accept-Ranges`) and partial content delivery are returned.

**Acceptance Scenarios**:

1. **Given** an inquiry has an attached file, **When** I click to view the file, **Then** the streaming endpoint serves the file content natively in the browser if supported.

---

### Edge Cases

- What happens when the file is too large? (API should reject payloads exceeding a sensible limit, e.g., 10MB or 50MB).
- What happens when a malicious file type (e.g., `.exe` or `.bat`) is uploaded? (API must strictly validate allowed MIME types/extensions like PDF, Word, images).
- How does system handle orphan files if the GraphQL mutation fails after the REST upload succeeds? (Out of scope for this immediate phase, but ideally a cleanup job or soft-link system).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a REST API endpoint accepting `multipart/form-data` for file uploads.
- **FR-002**: System MUST save uploaded files to the `wwwroot/uploads` directory (or similar local storage configuration).
- **FR-003**: System MUST return the relative path (or identifier) of the uploaded file via the REST API response.
- **FR-004**: System MUST allow the GraphQL `AddInquiry` mutation to accept a `FileUrl` (or `AttachmentPath`) string argument.
- **FR-005**: System MUST provide a REST endpoint capable of streaming the saved file back to the client for previewing.
- **FR-006**: System MUST validate that uploaded files are of allowed types (e.g., documents, images).

### Key Entities *(include if feature involves data)*

- **Inquiry**: Needs to be updated in the backend model to support a new optional field (e.g., `AttachmentUrl` or `FileUrl`) mapping to the physical file.
- **FileStream**: The physical binary file managed by the REST controller.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A test file can be successfully uploaded via Postman/fetch to the REST endpoint.
- **SC-002**: A new Inquiry can be created via GraphQL containing the returned file URL.
- **SC-003**: The file can be retrieved via the browser using the streaming endpoint.

## Assumptions

- Authentication is required to upload files (using existing JWT infrastructure).
- File storage is purely local (Filesystem) for this iteration, not cloud storage (S3/Blob).
- The frontend will handle the two-step process: 1) Upload to REST, 2) Send URL to GraphQL.
