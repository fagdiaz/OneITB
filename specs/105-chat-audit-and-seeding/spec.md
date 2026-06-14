# Feature Specification: Chat Audit and Seeding

**Feature Branch**: `[105-chat-audit-and-seeding]`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User request: "Actuar como Auditor Técnico Principal. Debes revisar, corregir y pulir la implementación del Módulo 4 (Mensajería Privada en Tiempo Real, RF-009) generada en el ciclo anterior. El objetivo es asegurar la estabilidad del túnel de WebSockets, garantizar el cumplimiento estricto de la restricción AD-004 en Entity Framework Core y poblar la base de datos con un historial de chat de prueba para facilitar la validación.
Puntos críticos: 1) Orden del pipeline HTTP de WebSockets. 2) Reglas estrictas de restricción de eliminación en las FK de la entidad Message. 3) Enrutamiento correcto (Split) entre HTTP y WS en GraphqlProvider.js. 4) Ausencia de datos de prueba en la tabla de mensajes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Estabilidad del Túnel de Suscripciones (Priority: P1)

Como usuario, quiero que la mensajería funcione en tiempo real sin desconexiones para poder interactuar fluidamente.

**Independent Test**: Connect to the GraphQL subscriptions endpoint in a browser environment, confirm WebSocket handshake completes, and wait for messages. The Apollo client must successfully use the WS link for subscriptions and HTTP for queries.

**Acceptance Scenarios**:

1. **Given** Apollo Client connects, **When** a subscription is executed, **Then** it correctly routes to the `ws://` or `wss://` endpoint.
2. **Given** the backend pipeline, **When** a WebSocket upgrade request arrives, **Then** the `.UseWebSockets()` middleware processes it successfully before GraphQL endpoints.

### User Story 2 - Restricción de Eliminación AD-004 (Priority: P1)

Como arquitecto, quiero que la base de datos proteja la integridad de los mensajes incluso si un usuario o chat se elimina.

**Independent Test**: Inspect the SQL constraint or EF Core DbContext mapping. Attempting to delete a User must either fail due to a constraint or not cascade delete the Message.

**Acceptance Scenarios**:

1. **Given** a `Message` entity with `SenderId` and `ReceiverId`, **When** the context is built, **Then** `DeleteBehavior.Restrict` is applied to avoid cascading deletes.

### User Story 3 - Historial de Pruebas (Priority: P2)

Como probador QA, quiero tener mensajes de prueba precargados para verificar inmediatamente el funcionamiento del chat.

**Independent Test**: Load the frontend and navigate to a chat window to see historical seeded messages.

**Acceptance Scenarios**:

1. **Given** the database seeding script, **When** it executes, **Then** historical `Message` records are inserted for test users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST configure `app.UseWebSockets()` correctly in the application builder.
- **FR-002**: System MUST map `Message` foreign keys (`SenderId`, `ReceiverId`) with `DeleteBehavior.Restrict`.
- **FR-003**: System MUST configure `GraphqlProvider.js` to split traffic: operations of type `subscription` go to the WebSocketLink, while `query`/`mutation` go to the HttpLink.
- **FR-004**: System MUST include a DB seeder or SQL script to populate test data for the `Messages` table.

## Success Criteria *(mandatory)*

- **SC-001**: WebSocket connections do not drop unexpectedly or fail to upgrade.
- **SC-002**: Database schema complies with AD-004.
- **SC-003**: React frontend connects without issues and correctly discriminates subscription traffic.
- **SC-004**: The chat view displays mock data upon initial application launch.
