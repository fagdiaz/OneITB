# Feature Specification: Cloud, DevOps & Scalability

**Feature Branch**: `170-cloud-devops-scalability`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Preparar OneITB23 para entorno productivo/cloud bajo Code Freeze funcional: Docker productivo multicontenedor, Redis Pub/Sub condicional, Cloudinary condicional con fallback local, rate limiting, security headers y documentacion de cierre."

## User Scenarios & Testing

### User Story 1 - Operar la plataforma en contenedores productivos (Priority: P1)

Como responsable tecnico, quiero levantar backend, frontend, base de datos y cache desde una orquestacion productiva sin secretos versionados, para poder desplegar o demostrar la plataforma en un entorno reproducible.

**Why this priority**: Sin contenedores productivos no existe una ruta limpia hacia cloud ni una forma consistente de validar infraestructura fuera del entorno local de desarrollo.

**Independent Test**: Construir las imagenes de backend y frontend, verificar que el frontend sirva la SPA con fallback y que el backend use configuracion por variables de entorno.

**Acceptance Scenarios**:

1. **Given** variables de entorno productivas definidas, **When** se ejecuta el compose productivo, **Then** SQL Server, Redis, backend y frontend quedan declarados con healthchecks y dependencias.
2. **Given** una ruta interna de React, **When** Nginx recibe la request, **Then** responde `index.html` sin romper el routing de la SPA.

---

### User Story 2 - Escalar suscripciones y archivos sin romper desarrollo local (Priority: P1)

Como responsable de arquitectura, quiero que Redis y Cloudinary sean opcionales por configuracion, para que produccion pueda escalar horizontalmente mientras desarrollo local sigue funcionando sin servicios externos.

**Why this priority**: El roadmap tiene brechas explicitas de pub/sub en memoria y almacenamiento local que impiden escalar a multiples instancias.

**Independent Test**: Compilar con soporte Redis/Cloudinary y verificar que sin variables externas se conserva InMemory Pub/Sub y disco local.

**Acceptance Scenarios**:

1. **Given** no existe connection string Redis, **When** arranca el backend, **Then** HotChocolate usa subscriptions en memoria.
2. **Given** existe connection string Redis, **When** arranca el backend, **Then** HotChocolate registra Redis Subscriptions.
3. **Given** no existe `CloudinarySettings:Url`, **When** se sube un archivo, **Then** el endpoint usa almacenamiento local.
4. **Given** existe `CloudinarySettings:Url`, **When** se sube un archivo, **Then** el endpoint delega la carga en Cloudinary y devuelve una URL HTTPS.

---

### User Story 3 - Proteger endpoints publicables en produccion (Priority: P2)

Como operador, quiero controles defensivos HTTP basicos, para reducir abuso y endurecer respuestas antes de exponer la API.

**Why this priority**: GraphQL y uploads son puntos de entrada sensibles y deben tener limites razonables y cabeceras de seguridad.

**Independent Test**: Validar que el backend compile con rate limiting y que los endpoints afectados tengan policy aplicada.

**Acceptance Scenarios**:

1. **Given** mas de 100 requests por minuto desde una IP, **When** se excede el limite, **Then** el backend devuelve HTTP 429.
2. **Given** una respuesta HTTP del backend, **When** sale del pipeline, **Then** incluye cabeceras de seguridad basicas.

### Edge Cases

- Si Redis esta mal configurado, el backend debe fallar rapido en produccion en vez de declarar escalabilidad falsa.
- Si Cloudinary no esta configurado, el upload debe conservar el comportamiento local existente.
- Los secretos se inyectan por variables de entorno o user-secrets, nunca por archivos versionados.
- El reverse proxy debe soportar WebSockets para GraphQL subscriptions.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide production-oriented backend and frontend container builds.
- **FR-002**: System MUST provide a production compose topology with SQL Server, Redis, backend API and frontend Nginx.
- **FR-003**: System MUST use Redis Pub/Sub for GraphQL subscriptions only when Redis configuration exists.
- **FR-004**: System MUST keep InMemory subscriptions when Redis configuration is absent.
- **FR-005**: System MUST support cloud file storage when Cloudinary configuration exists.
- **FR-006**: System MUST keep local disk upload fallback when Cloudinary configuration is absent.
- **FR-007**: System MUST rate limit `/graphql` and `/api/upload` without affecting local build.
- **FR-008**: System MUST emit strict HTTP security headers from the backend.
- **FR-009**: System MUST avoid hardcoded secrets in Docker, appsettings and documentation.
- **FR-010**: System MUST update roadmap, final audit and development log with evidence-based status.

### Key Entities

- **Deployment topology**: SQL Server, Redis, API and frontend reverse proxy containers.
- **Storage provider**: Conditional runtime selection between local disk and Cloudinary.
- **Subscription provider**: Conditional runtime selection between in-memory and Redis Pub/Sub.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Productive deployment configuration can build backend and frontend images without manual project restructuring.
- **SC-002**: Local development remains operational without Redis or Cloudinary variables.
- **SC-003**: Protected endpoints reject abusive request volume with HTTP 429.
- **SC-004**: No committed file contains production credentials or cloud secrets.
- **SC-005**: Roadmap reaches at least 98% with remaining blockers honestly documented.

## Assumptions

- Production secrets are supplied through environment variables, Azure App Service settings or user-secrets.
- Cloudinary URL uses the standard `cloudinary://api_key:api_secret@cloud_name` format.
- Frontend production traffic should prefer same-origin reverse proxy paths to reduce CORS complexity.
