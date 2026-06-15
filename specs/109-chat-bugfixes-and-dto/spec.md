# Feature Specification: 109-chat-bugfixes-and-dto

**Feature Branch**: `[109-chat-bugfixes-and-dto]`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Error React: Warning: Cannot update a component ('PrivateChat') while rendering a different component ('MiniChatWidget'). UX Issue: La query GetActiveConversations devuelve una lista de la entidad User. Se requiere crear un DTO en el backend para agrupar al usuario y su último mensaje, y actualizar el frontend para consumirlo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solve React Render Warning (Priority: P1)

Como usuario, quiero poder navegar entre los módulos de la aplicación y el chat sin recibir advertencias en la consola o caídas de rendimiento por actualizaciones cruzadas.

**Why this priority**: Evitar un problema crítico de renderizado (React setState in render) es esencial para la estabilidad de la aplicación.

**Independent Test**: Can be fully tested by navigating to the chat full-screen page while the mini widget is active, confirming no React warnings appear in the console.

**Acceptance Scenarios**:

1. **Given** I am in any route that renders MiniChatWidget, **When** I navigate to `/chat`, **Then** no React `setState` warnings should be logged in the console.

---

### User Story 2 - Load Recent Message from Backend (Priority: P2)

Como usuario, quiero ver la miniatura del último mensaje de cada conversación en mi lista de chats activos desde el mismo instante en que se carga la página, sin necesidad de abrir el chat.

**Why this priority**: Mejora drásticamente la UX del módulo de mensajería (Módulo 4) al eliminar retardos visuales o *hacks* en el cliente para obtener la miniatura.

**Independent Test**: Can be fully tested by loading the application fresh and checking if the active conversations list shows the latest message snippets immediately.

**Acceptance Scenarios**:

1. **Given** I open the MiniChatWidget or PrivateChat for the first time, **When** the active conversations list loads, **Then** the snippet of the most recent message is displayed under each contact name immediately.

---

### Edge Cases

- What happens when a conversation has no messages? It should just show the user's role or a default text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a new `ActiveConversationDto` in the backend that groups the `User` entity (`Contact`) and a `string` (`LastMessage`).
- **FR-002**: System MUST modify the `GetActiveConversations` GraphQL resolver to return `IEnumerable<ActiveConversationDto>`.
- **FR-003**: System MUST calculate the `LastMessage` snippet dynamically in the backend (e.g. `OrderByDescending(m => m.SentAt).FirstOrDefault()`).
- **FR-004**: System MUST update the Frontend GraphQL query `GET_ACTIVE_CONVERSATIONS` in `src/data/graphql/chat.js` to request the new structured data (`contact` and `lastMessage`).
- **FR-005**: System MUST remove the cross-rendering triggers in `MiniChatWidget.jsx` and consume the new DTO directly from Apollo cache without executing state updates during the render phase.

### Key Entities

- **ActiveConversationDto**: Represents an active messaging relationship containing a `User` (Contact) and the `LastMessage` content (string).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The application logs exactly 0 "setState in render" warnings when switching to the `/chat` route.
- **SC-002**: The `GET_ACTIVE_CONVERSATIONS` query returns the last message content in a single network trip for all active conversations.
- **SC-003**: The chat sidebars display the last message content upon initial load in less than 500ms without secondary cache-reading side effects.

## Assumptions

- The backend architecture permits creating DTOs within `API Graphql/Services/DTOs.cs` or a similar directory without breaking existing GraphQL HotChocolate projections.
- The React Frontend correctly parses nested fields (`contact.firstName`, etc.) once the GraphQL query is updated.
