# Registro de Traza de Ejecución Realtime y Aislamiento Multi-Sesión (CF-05)

- **Fecha y Ventana de Captura:** 2026-11-15T18:02:00.000Z - 2026-11-15T18:05:30.000Z
- **Entorno de Validación:**
  * Backend: ASP.NET Core 8 Kestrel (HotChocolate 14.2.0, WebSocket subprotocol `graphql-transport-ws`)
  * Endpoints: `wss://localhost:44397/graphql` (directo), `ws://localhost:5173/graphql` (proxy de desarrollo Vite)
  * Frontend: React 18 / Apollo Client 3.7.17 / `graphql-ws` 5.16.0
  * Base de Datos: Microsoft SQL Server 2022 (Contenedor Docker `oneitb23-sql` en `127.0.0.1:1433`)

## Identificadores de Cliente y Contextos de Sesión

- **Contexto A (Emisor):**
  * Usuario: `estudiante1.ads@itbeltran.com.ar`
  * UserId: `2e9b3337-1824-339f-b73f-28b9d2cc7832`
  * Rol: `Estudiante`
  * Client / Perfil ID: `ctx-session-A`
- **Contexto B (Destinatario):**
  * Usuario: `profesor1.ads@itbeltran.com.ar`
  * UserId: `35a605e9-120c-e91b-cb8d-a8326ae09a48`
  * Rol: `Profesor`
  * Client / Perfil ID: `ctx-session-B`
- **Contexto C (Observador Pasivo de Aislamiento):**
  * Usuario: `moderador1@itbeltran.com.ar`
  * UserId: `d95fe123-ce75-fe5b-d78c-614456713c50`
  * Rol: `Moderador`
  * Client / Perfil ID: `ctx-session-C`

---

## 1. Paso a Paso de la Traza en Runtime

### Paso 1: Handshake y Autenticación del Socket (`RT-01`)
- `[18:02:01.012] [ctx-session-B]` Conexión WebSocket a `ws://localhost:5173/graphql`.
- `[18:02:01.015] [ctx-session-B]` `SEND: {"type":"connection_init","payload":{"authorization":"Bearer <JWT_SESSION_B>"}}`.
- `[18:02:01.018] [ctx-session-B]` `RECV: {"type":"connection_ack"}`.
- **Métricas:** Latencia de handshake **3 ms**. Kestrel `ConnectionStatus = Accepted`. Socket status = `connected`. Aserción de cliente: `socketStatus == 'connected', error == null` (**PASS**).

### Paso 2: Suscripción y Entrega Reactiva en Vivo (`RT-02`)
- `[18:02:02.100] [ctx-session-B]` Registro de suscripción `sub-b-01` en operación `MessageReceived`.
- `[18:02:03.450] [ctx-session-A]` Mutación HTTP `sendMessage(receiverId: "35a605e9-...", content: "Mensaje de prueba CF-05")`.
- `[18:02:03.475] [ctx-session-A]` HTTP 200: Mensaje persistido con ID `4441bba9-4866-49cf-ad4b-96fffc8c10b1`.
- `[18:02:03.480] [ctx-session-B]` Trama reactiva WebSocket recibida en `sub-b-01` con payload idéntico.
- **Métricas:** Latencia de entrega mutación -> evento WS **30 ms**. Actualización de Apollo Cache en `InMemoryCache` y renderizado en DOM sin refetch manual ni recarga de página (**PASS**).

### Paso 3: Aislamiento de Tópicos y Observador C Activo (`RT-03`)
- `[18:02:04.000] [ctx-session-C]` Contexto C (Moderador) inicia socket y se suscribe a `MessageReceived` (`sub-c-01`).
- `[18:02:05.120] [ctx-session-A]` Envío de mensaje confidencial a Contexto B: ID `b332d961-26e2-40fe-8987-aec4d965072b`.
- `[18:02:05.145] [ctx-session-B]` Trama recibida por B.
- `[18:02:05.145 - 18:02:07.145]` Monitoreo de tramas recibidas por Contexto C en `sub-c-01` durante ventana de 2000 ms.
- **Resultado:** Contexto C recibió **0 tramas**. Fugas detectadas: **0**. Aislamiento estricto de canal por `receiverId` (**PASS**).

### Paso 4: Contador Reactivo de No Leídos y Persistencia de Lectura (`RT-04`)
- `[18:02:08.010] [ctx-session-B]` Contador de no leídos de A en B: 2.
- `[18:02:08.230] [ctx-session-B]` Recepción de 3er mensaje: contador de no leídos incrementado automáticamente a **3** en badge de navbar.
- `[18:02:09.500] [ctx-session-B]` Invocación de `markConversationRead(otherUserId: "2e9b3337-...")`.
- `[18:02:09.525] [ctx-session-B]` HTTP 200: `markedCount = 3`. Badge de no leídos reseteado a **0** en navbar y DOM. En SQL Server: `SELECT isRead FROM dbo.Messages WHERE Id = '861785b5-...'` devuelve `1` (`true`) (**PASS**).

### Paso 5: Caída Anormal de Red (Código 1006) y Reconexión Automática (`RT-05`)
- `[18:02:11.000] [ctx-session-B]` Cierre forzado del socket con código 1006 (Abnormal Closure).
- `[18:02:11.510] [ctx-session-B]` Cliente `graphql-ws` incrementa epoch (1 -> 2) e inicia auto-reconexión.
- `[18:02:11.521] [ctx-session-B]` Nuevo handshake `connection_ack` y re-suscripción `sub-b-02`. Estado = `connected`.
- `[18:02:12.325] [ctx-session-B]` Mensaje posterior emitido por A recibido limpiamente en `sub-b-02` sin pérdida de tramas ni listeners huérfanos (**PASS**).

### Paso 6: Logout en UI, Purga de Apollo Cache y Reemplazo de Sesión A -> C (`RT-06`)
- `[18:02:14.000] [ctx-session-A]` Clic en acción interactiva `/logout`.
- `[18:02:14.005] [ctx-session-A]` Invocación de `resetToken()`, desuscripción y terminación de WebSockets (`client.terminate()`).
- `[18:02:14.012] [ctx-session-A]` Ejecución de `client.clearStore()`.
- `[18:02:14.016] [ctx-session-A]` Inspección de caché: `client.cache.extract(false)` devuelve `{}` y `client.cache.extract(true)` devuelve `{}`. Cero entidades en memoria. `localStorage` con `token = null` y `user = null`.
- `[18:02:15.100] [ctx-session-A]` Autenticación interactiva con Sesión C (`moderador1@itbeltran.com.ar`) en la **misma ventana de navegador**.
- `[18:02:15.220] [ctx-session-A]` Inspección de snapshot de caché y DOM: 0 fragmentos, mensajes o entidades del Usuario A persisten. Sólo datos del Usuario C presentes (**PASS**).

---

## 2. Respaldo de Pruebas Automatizadas de Concurrencia (Constitución §IX)

1. **Suites Frontend de Concurrencia y Multi-Sesión en Vitest:**
   - `src/context/sessionTabs.adversarial.test.jsx`: **5/5 PASS** (143 ms) — MT-01 a MT-05.
   - `src/Components/chat/chatRealtime.adversarial.test.jsx`: **8/8 PASS** (1443 ms) — RT-01 a RT-06.
   - `src/Components/chat/privateChatRecovery.gob12.test.jsx`: **6/6 PASS** (2152 ms) — Replay y reconciliación optimista.
2. **Suite Backend de Aislamiento de Tópicos en xUnit:**
   - `PrivateMessageTopicAdversarialTests.cs`: **3/3 PASS** (436 ms) — Cero recepción cruzada.

**Total de Pruebas Automatizadas de Soporte:** **22 / 22 PASS (100%)**.
