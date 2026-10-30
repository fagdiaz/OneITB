# Reporte de Auditoría: Módulo MOD-04 - Mensajería en Tiempo Real, Notificaciones y Subscriptions WebSockets

**Fecha y Hora:** 2026-10-29T22:50:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Archivos Inspeccionados:** 13 archivos (Frontend: 8, Backend: 5)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Vistas / Pantallas Analizadas | 3 |
| Botones y Acciones Interactivas | 13 |
| 🔴 Hallazgos Críticos (Bloqueantes / Rotos) | 0 |
| 🟡 Advertencias (Gaps / UX / Incompletos) | 2 |
| 🟢 Oportunidades de Reducción de Código | 3 |

---

## 2. Matriz Detallada de Componentes y Botones

### Vista: `PrivateChat` (`FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx`)
* **Ruta de Acceso:** `/chat` (Nota: en `audit_state.json` se refería `/mensajes`)
* **Roles Autorizados:** Todos los roles autenticados con onboarding completado

#### Botón / Acción: `Seleccionar Contacto / Conversación`
* **Ubicación:** Línea 80 en `ChatSidebar.jsx`
* **Comportamiento en UI:**
  * Carga historial de mensajes de la conversación activa
  * Dispara automáticamente `markConversationRead` para reiniciar contador de no leídos
  * Scroll automático hacia el mensaje más reciente
* **Contrato GraphQL:**
  * Query: `GET_CONVERSATION_MESSAGES` (`query Conversation($otherUserId: UUID!)`)
  * Mutation: `MARK_CONVERSATION_READ` (`mutation MarkConversationRead($otherUserId: UUID!)`)
* **Backend (.NET / HotChocolate):**
  * Query Resolver: `Query.cs` -> `GetConversation`
  * Mutation Resolver: `Mutation.cs` -> `MarkConversationRead`
  * Servicio: `MessagingService.cs` -> `MarkConversationReadAsync`
  * Persistencia: `ExecuteUpdateAsync` actualizando `IsRead = true` en SQL Server
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Enviar Mensaje (Chat Composer)`
* **Ubicación:** Línea 107 en `PrivateChat.jsx` / `ChatWindow.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Deshabilita botón mientras envía (`disabled={loadingSend || !draft.trim()}`)
  * Limpieza del input de texto tras confirmación
* **Contrato GraphQL:**
  * Operación: `SEND_MESSAGE` (`mutation SendMessage($receiverId: UUID!, $content: String!)`)
  * Hook: `useMutation(SEND_MESSAGE)`
  * Caché de Apollo: Actualiza lista de mensajes vía `chatCache.js`
* **Backend (.NET / HotChocolate):**
  * Resolver: `Mutation.cs` -> `SendMessage`
  * Autorización: `[Authorize]` (El ID del emisor se toma estrictamente desde `ClaimsPrincipal`)
  * Servicio: `MessagingService.cs` -> `SendMessageAsync`
  * Persistencia: Inserción en tabla `Messages`
  * Publicación WebSocket: `ITopicEventSender.SendAsync` envía el mensaje de forma atómica a dos tópicos aislados:
    * `PrivateMessageTopics.ForUser(senderId)`
    * `PrivateMessageTopics.ForUser(receiverId)`
* **Diagnóstico y Estado:** 🟢 OK (Blindaje estricto de tópicos, evitando fugas de mensajes entre usuarios ajenos).

#### Componente Reactivo: `Suscripción WebSocket de Mensajes en Vivo`
* **Ubicación:** Línea 196 en `PrivateChat.jsx` y Línea 203 en `MiniChatWidget.jsx`
* **Contrato GraphQL:**
  * Operación: `MESSAGE_SENT_SUBSCRIPTION` (`subscription OnMessageReceived { messageReceived { id content sentAt senderId receiverId isRead } }`)
  * Hook: `useSubscription(MESSAGE_SENT_SUBSCRIPTION)`
* **Backend (.NET / HotChocolate):**
  * Subscripción: `Subscription.cs` -> `MessageReceived` con `[Subscribe(With = nameof(SubscribeToMessageReceived))]`
  * Control de Acceso: Extrae `ClaimTypes.NameIdentifier` de la conexión WebSocket para suscribir al cliente únicamente a su canal privado `private-message:{userId:N}`.
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `MiniChatWidget` (`FrontEnd/OneItb-FE/src/Components/chat/MiniChatWidget.jsx`)
* **Ubicación:** Widget flotante en esquina inferior derecha presente en toda la app privada
* **Comportamiento en UI:**
  * Botón flotante con badge de total no leído
  * Al expandir, permite chatear directamente en ventana minimizada sin abandonar la pantalla actual
  * Sincronizado en tiempo real con la misma suscripción de WebSocket
* **Diagnóstico y Estado:** 🟢 OK

---

### Componente: `NotificationBell` (`FrontEnd/OneItb-FE/src/Components/notifications/NotificationBell.jsx`)
* **Ubicación:** Barra superior de navegación (`Nav.jsx`)

#### Botón / Acción: `Abrir Dropdown de Notificaciones`
* **Ubicación:** Línea 145 en `NotificationBell.jsx`
* **Comportamiento en UI:**
  * Insignia numérica roja si `unreadCount > 0`
  * Despliega panel flotante con las últimas 10 notificaciones (académicas, sociales, de empleo o del sistema)
  * Cierre por clic externo (`handleClickOutside`)
* **Contrato GraphQL:**
  * Queries: `GET_MY_NOTIFICATIONS`, `GET_UNREAD_NOTIFICATION_COUNT`
  * Subscription: `NOTIFICATION_RECEIVED` (`subscription OnNotificationReceived`)
* **Backend (.NET / HotChocolate):**
  * Resolvers: `Query.cs` -> `GetMyNotifications`, `GetUnreadNotificationCount`
  * Subscripción: `Subscription.cs` -> `NotificationReceived` suscrito al tópico `notification:{userId:N}`
  * Servicio: `NotificationService.cs`
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Marcar Notificación como Leída al Clic`
* **Ubicación:** Línea 195 en `NotificationBell.jsx`
* **Comportamiento en UI:** Dispara `markNotificationRead` y navega a la URL interna correspondiente.
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Marcar Todas como Leídas`
* **Ubicación:** Línea 172 en `NotificationBell.jsx`
* **Comportamiento en UI:**
  * Estado de carga: Spinner en botón (`markingAllRead`)
  * Reinicia inmediatamente el contador de no leídos a 0
* **Contrato GraphQL:** `MARK_ALL_NOTIFICATIONS_READ` (`Mutation.cs` -> `MarkAllNotificationsRead`)
* **Diagnóstico y Estado:** 🟢 OK

#### Botón / Acción: `Configuración de Preferencias de Notificaciones`
* **Ubicación:** Línea 182 en `NotificationBell.jsx`
* **Comportamiento en UI:** Abre `NotificationPreferencesModal.jsx` para configurar canales (Push / Email / In-App).
* **Contrato GraphQL:**
  * Query: `GET_NOTIFICATION_PREFERENCES`
  * Mutation: `UPDATE_NOTIFICATION_PREFERENCE`
* **Diagnóstico y Estado:** 🟢 OK

---

## 3. Oportunidades de Optimización y Reducción de Líneas

### A. Código Muerto / Huérfano
* `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx#L15-L22`: Tipos y propTypes comentados no utilizados tras la migración a JSX.

### B. Boilerplate y Simplificación
* `FrontEnd/OneItb-FE/src/Components/chat/PrivateChat.jsx` y `MiniChatWidget.jsx`:
  Ambos archivos duplican ~180 líneas idénticas de gestión de estado de Apollo (`GET_MESSAGING_USERS`, `GET_ACTIVE_CONVERSATIONS`, suscripción `MESSAGE_SENT_SUBSCRIPTION`, `markConversationRead` y listeners de reconexión).
  * *Potencial de reducción:* Extraer la lógica compartida a un custom hook `useChatSession()`, reduciendo ~150 líneas netas de código duplicado.

### C. Mocks y Logs Residuales
* `API Graphql/Services/Messaging/MessagingService.cs#L161`: Log informativo `_logger.LogInformation(...)` por cada mensaje individual. En un entorno de alta concurrencia produce sobrecarga de I/O en logs si no se ajusta el nivel a Debug.

---

## 4. Advertencias y Gaps Detectados (Sin romper Code Freeze)

1. 🟡 **Discrepancia en Rutas de Mensajería y Notificaciones:**  
   `audit_state.json` estipulaba `/mensajes`, `/mensajes/:conversationId` y `/notificaciones`.
   - La ruta oficial en `Routing.jsx` es exclusivamente `/chat`. Navegar a `/mensajes` o `/mensajes/:id` devuelve un error `404` (NotFound).
   - Las notificaciones no cuentan con una página de pantalla completa (`/notificaciones`), sino que se gestionan íntegramente a través del menú emergente `NotificationBell` en la barra de navegación superior.  
   *Propuesta de Cierre:* Si se desean soportar URLs directas de mensajes, mapear `<Route path="mensajes/*" element={<Navigate to="/chat" replace />} />` en `Routing.jsx`.

2. 🟡 **Reconexión de WebSockets ante Pérdida de Conexión:**  
   Cuando la conexión de WebSocket se interrumpe temporalmente, `ApolloClient` intenta reconectar automáticamente, pero si el token JWT expiró durante la suspensión, el socket no se actualiza hasta que el usuario recarga la página o el guardia de expiración de sesión lo intercepta.

---

## 5. Conclusiones y Próximos Pasos para este Módulo
El Módulo 04 (Mensajería en Tiempo Real y Notificaciones) exhibe una **excelente arquitectura de seguridad en WebSockets**: el servidor HotChocolate utiliza tópicos aislados calculados dinámicamente desde los claims JWT, imposibilitando la intercepción cruzada de chats o alertas. La persistencia en base de datos es tolerante a fallos si el bus de eventos en memoria se reinicia.

Procede avanzar inmediatamente al **Módulo 05: Bolsa de Trabajo, Empleabilidad, Postulaciones y CV Builder**.
