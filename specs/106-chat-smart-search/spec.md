# Feature Specification: Chat Smart Search

**Feature Branch**: `[106-chat-smart-search]`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User request: "Refinar la usabilidad del Módulo 4 (Chat Privado) implementando un sistema de filtrado y búsqueda categorizada. Por defecto, la barra lateral solo debe mostrar las conversaciones activas. Al utilizar el buscador, los resultados deben dividirse en tres niveles de prioridad: 1) Conversaciones activas coincidentes, 2) Nuevos usuarios coincidentes, y 3) Mensajes que contengan la palabra clave. Actualmente, PrivateChat.jsx renderiza a todos los usuarios, rompiendo escalabilidad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Active Conversations Default (Priority: P1)

Como usuario, quiero ver sólo los contactos con los que ya tengo una conversación activa al entrar al chat para no sobrecargar mi vista.

**Independent Test**: Load the `PrivateChat` UI without typing any search term. Confirm the sidebar only lists users with whom a conversation already exists.

**Acceptance Scenarios**:

1. **Given** a user has previous chat history with another user, **When** they load the sidebar, **Then** that user appears in the list.
2. **Given** a user has no previous history with another user, **When** they load the sidebar without searching, **Then** that user does NOT appear in the list.

### User Story 2 - Search Priorities (Priority: P1)

Como usuario, quiero buscar en la barra lateral y ver primero contactos activos, luego nuevos usuarios, y finalmente resultados de mensajes específicos.

**Independent Test**: Type a term in the search bar and verify the GraphQL queries return tiered results matching the logic.

**Acceptance Scenarios**:

1. **Given** a `searchTerm`, **When** the backend resolves the query, **Then** it must filter or rank results into 1) Active chats, 2) New matching users, 3) Matching messages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend MUST provide queries to resolve active conversations vs all users.
- **FR-002**: Backend MUST support keyword search for messages and users.
- **FR-003**: Frontend MUST implement a `searchTerm` state.
- **FR-004**: Frontend MUST render categories according to the 3-level priority based on `searchTerm`.

## Success Criteria *(mandatory)*

- **SC-001**: The sidebar efficiently limits the default list to active chats.
- **SC-002**: The frontend cleanly categorizes the search results.
