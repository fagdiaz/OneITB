# Task Breakdown: Chat UX Refinement

## Frontend Tasks

- [x] 1. Limpieza de Buscador
  - **Componente:** `src/Components/chat/PrivateChat.jsx`
  - **Acción:** En `handleSelectContact`, llamar a `setSearchTerm('')` después de setear el feedback y el input.

- [x] 2. Reactividad de Conversaciones Activas al Enviar
  - **Componente:** `src/Components/chat/PrivateChat.jsx`
  - **Acción:** Dentro de la resolución (o el try/catch) de `sendMessage`, comprobar si el `selectedContactId` ya existe en `activeData.activeConversations.nodes`. Si no, llamar a `refetchActive()`.

- [x] 3. Reactividad de Conversaciones Activas al Recibir
  - **Componente:** `src/Components/chat/PrivateChat.jsx`
  - **Acción:** Dentro de la función de suscripción `onData` de `MESSAGE_RECEIVED`, verificar si `otherUserId` está en `activeData`. Si no, invocar `refetchActive()`.

- [x] 4. Enter-to-Send en Cuadro de Texto
  - **Componente:** `src/Components/chat/PrivateChat.jsx`
  - **Acción:** Agregar evento `onKeyDown` al `<textarea>`. Si `e.key === 'Enter'` y `!e.shiftKey`, prevenir comportamiento default y ejecutar `handleSubmit(e)`.

- [x] 5. Commit de cambios
  - **Acción:** Realizar el commit (`git commit -m "fix(chat): search state, cache invalidation and enter-to-send UX"`).
