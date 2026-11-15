# Registro de Traza de Ejecución Realtime y Aislamiento Multi-Sesión (CF-05)

- **Fecha de Validación en Vivo Unmocked:** 2026-11-15T19:55:39.101Z - 2026-11-15T19:55:45.715Z
- **Entorno de Validación:**
  * Backend: ASP.NET Core 8 Kestrel (HotChocolate 14.2.0, WebSocket subprotocol `graphql-transport-ws`) en `http://127.0.0.1:5098` (`ws://127.0.0.1:5098/graphql`)
  * Cliente Transporte: Node.js v22.13.0 con paquete real `graphql-ws` 5.16.0 (sin mock, con temporizador y política natural de `retryWait`)
  * Base de Datos: Microsoft SQL Server 2022 (Contenedor Docker `oneitb23-sql` en `127.0.0.1:1433`)
  * Script Orquestador: [`scripts/run-cf05-live-validation.ps1`](file:///f:/React/OneITB23/scripts/run-cf05-live-validation.ps1)
  * Script Runner: [`scripts/verify-cf05-realtime-live.mjs`](file:///f:/React/OneITB23/scripts/verify-cf05-realtime-live.mjs)
  * Evidencia de Salida Literal: [`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md)

---

## 1. Declaración de Metodología, Instrumentación y Procedencia

Conforme a los dictámenes de arbitraje `ARBITRAJE_31e59a2.md` y `ARBITRAJE_aeceeb7.md`, se formaliza la distinción explícita de procedencia entre:

1. **Traza Sintética Compuesta Inicial (Vitest Mocked Fixtures):**
   - La traza preliminar documentada anteriormente se obtuvo a partir de las suites de pruebas unitarias y adversariales de frontend (`chatRealtime.adversarial.test.jsx` y `privateChatRecovery.gob12.test.jsx`).
   - En dichas suites de Vitest, la función `retryWait` de `graphql-ws` fue configurada como un mock inmediato (`async () => {}`) para posibilitar una ejecución rápida sin demoras artificiales en CI, y la variable rotulada "epoch" correspondió a un contador cíclico interno de prueba dentro del test harness.
   - En el código de producción de la aplicación (`FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js:356`), el `sessionEpoch` se actualiza **únicamente al invalidar o resetear la sesión de autenticación** (`resetToken()`), y no en las reconexiones de socket ante pérdidas de red.

2. **Traza de Ejecución en Vivo Unmocked (Cliente Real `graphql-ws` 5.16.0 con Aserciones Estrictas):**
   - El runner unmocked opera contra un host Kestrel real en el puerto 5098 con credenciales obtenidas de forma segura vía `Seed:DemoPassword` sin fallbacks planos.
   - Aplica aserciones estrictas (`assert`) que lanzan excepción y provocan salida con código 1 ante cualquier fallo de matching de IDs, roles, fugas de paquetes o umbrales de temporización.
   - En `RT-04`, además de recibir `markedCount`, ejecuta una **relectura real mediante query GraphQL `conversation(otherUserId: $otherUserId)`** para comprobar que el mensaje persistió con `isRead: true` en la base de datos.
   - En `RT-05`, la desconexión se describe con exactitud como terminación forzada de cliente (`client.terminate()`, código `4499 Terminated`). La espera natural medida fue de **3336 ms** (estrictamente en el rango `>= 1300 ms`, respetando la fórmula de biblioteca `1000ms + random(300..2999ms)` sin override).
   - En `RT-06`, se evalúa la disposición de transporte y la re-autenticación limpia de la identidad C a nivel de API/transporte, dejando explícito que el ciclo de logout interactivo y purga de caché Apollo en memoria pertenece al dominio de UI en navegador.

3. **Falsabilidad del Instrumento (Controles Negativos Verificados):**
   - Se verificó que el checker falla con código de salida 1 ante 4 escenarios negativos deliberados:
     * `id-mismatch`: Falla con `[ASSERTION_FAILED]: Message 1 ID mismatch`.
     * `leak-to-c`: Falla con `[ASSERTION_FAILED]: Topic isolation violation: Observer C received 1 unexpected frames`.
     * `observer-error`: Falla con `[ASSERTION_FAILED]: Observer C subscription experienced immediate error`.
     * `short-wait`: Falla con `[ASSERTION_FAILED]: Natural retryWait was 500 ms, which is below the declared minimum threshold of 1300 ms`.

---

## 2. Traza de Ejecución en Vivo Unmocked (Salida Literal del Runner)

Secuencia cronológica registrada en vivo ([`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md)):

```text
[19:55:39.101Z] [INIT] Starting Live CF-05 Transport Runner against Kestrel ASP.NET Core 8
[19:55:39.102Z] [AUTH] Authenticating test accounts against Kestrel /graphql (external credentials)
[19:55:40.219Z] [AUTH] Session A authenticated {"email":"estudiante1.ads@itbeltran.com.ar","id":"2e9b3337-1824-339f-b73f-28b9d2cc7832","role":"Estudiante"}
[19:55:40.485Z] [AUTH] Session B authenticated {"email":"profesor1.ads@itbeltran.com.ar","id":"35a605e9-120c-e91b-cb8d-a8326ae09a48","role":"Profesor"}
[19:55:40.754Z] [AUTH] Session C authenticated {"email":"moderador1@itbeltran.com.ar","id":"d95fe123-ce75-fe5b-d78c-614456713c50","role":"Moderador"}
[19:55:40.754Z] [RT-01] Initiating unmocked graphql-ws connection for Session B
[19:55:40.814Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":60}
[19:55:40.814Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket
[19:55:40.830Z] [RT-03] Session C connected to WebSocket
[19:55:41.279Z] [RT-02] Session A emitting mutation sendMessage to Session B
[19:55:41.436Z] [RT-02] Message 1 persisted by backend {"id":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","httpLatencyMs":157}
[19:55:41.442Z] [RT-02] Session B received live message frame via WebSocket {"id":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[19:55:41.498Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B with exact payload match {"messageId":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","matches":true}
[19:55:42.109Z] [RT-03] VERIFIED: Strict topic isolation confirmed. 0 frames leaked to Observer C {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
[19:55:42.109Z] [RT-04] Session B invoking markConversationRead for Session A
[19:55:42.204Z] [RT-04] VERIFIED: markConversationRead persisted in DB (verified via conversation re-read query) {"markedCount":1,"persistedMessageId":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","persistedIsRead":true,"verifiedViaReRead":true}
[19:55:42.204Z] [RT-05] Forcing client termination via client.terminate() (simulating transport drop code 4499)
[19:55:42.204Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[19:55:45.540Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":4786}
[19:55:45.576Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded with verified wait threshold {"tDrop":1794772542204,"reconnectedAt":1794772545540,"measuredRetryWaitMs":3336,"minimumRequiredThresholdMs":1300,"exceedsMinimumExpectedWait":true}
[19:55:45.577Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery
[19:55:45.597Z] [RT-02] Session B received live message frame via WebSocket {"id":"ed477da0-e4a7-431f-83f3-a9177f9b55c2","content":"Segundo mensaje post-reconexion live (Canal recuperado)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[19:55:45.653Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection on recovered channel {"messageId":"ed477da0-e4a7-431f-83f3-a9177f9b55c2","matches":true}
[19:55:45.653Z] [RT-06] Disposing Session A/B transports and asserting clean re-authentication as Session C
[19:55:45.715Z] [RT-06] VERIFIED: Transport re-authentication confirmed with exact Session C identity (Note: UI logout/cache purge is a browser UI concern) {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador","matchesExpectedUserC":true}
[19:55:45.715Z] [DONE] ALL TRANSPORT REALTIME DIMENSIONS PASSED WITH STRICT ASSERTIONS
```

---

## 3. Estado del Tramo UI Multi-Sesión en Navegador Real

Conforme a la instrucción explícita de `ARBITRAJE_aeceeb7.md`:

- **Estado del Tramo:** **`BLOCKED`** (Bloqueado por dependencia de infraestructura).
- **Dependencia Exacta de Bloqueo:** Falta de un harness de automatización multi-contexto de navegador (p. ej. Playwright multi-perfil o Selenium Grid) capaz de levantar de manera concurrente dos perfiles de usuario independientes y aislados (Estudiante y Docente) más un observador Moderador simultáneo, observar las insignias de no leídos en tiempo real en el DOM, simular cortes de red en cliente web, y verificar la purga de la memoria interna de Apollo Client (`InMemoryCache`) tras un `/logout` interactivo en UI sin alterar dependencias de desarrollo ni código de producción bajo Code Freeze.
- **Alcance Acreditado:** El transporte WebSocket real, la entrega de mensajes, la relectura de persistencia en base de datos (`isRead = true`), la reconexión natural (3336 ms `>= 1300 ms`) y el aislamiento estricto de topics en HotChocolate quedan formalmente **ACREDITADOS A NIVEL DE TRANSPORTE Y API**. El tramo de UI multi-sesión queda formalmente clasificado como **BLOCKED**.

---

## 4. Respaldo de Pruebas Automatizadas de Concurrencia (Constitución §IX)

Como complemento a la ejecución en vivo unmocked de transporte, se mantienen las 22 pruebas automatizadas de regresión que integran el baseline canónico de 785 pruebas:

1. **Suites Frontend de Concurrencia y Multi-Sesión en Vitest:**
   - `src/context/sessionTabs.adversarial.test.jsx`: **5/5 PASS** (143 ms) — MT-01 a MT-05.
   - `src/Components/chat/chatRealtime.adversarial.test.jsx`: **8/8 PASS** (1443 ms) — RT-01 a RT-06.
   - `src/Components/chat/privateChatRecovery.gob12.test.jsx`: **6/6 PASS** (2152 ms) — Replay y reconciliación optimista.
2. **Suite Backend de Aislamiento de Tópicos en xUnit:**
   - `PrivateMessageTopicAdversarialTests.cs`: **3/3 PASS** (436 ms) — Cero recepción cruzada.

**Total de Pruebas Automatizadas de Soporte:** **22 / 22 PASS (100%)**.
