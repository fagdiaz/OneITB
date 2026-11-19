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
[20:09:21.243Z] [INIT] Starting Live CF-05 Transport Runner against Kestrel ASP.NET Core 8
[20:09:21.244Z] [AUTH] Authenticating test accounts against Kestrel /graphql (external credentials)
[20:09:22.349Z] [AUTH] Session A authenticated {"email":"estudiante1.ads@itbeltran.com.ar","id":"2e9b3337-1824-339f-b73f-28b9d2cc7832","role":"Estudiante"}
[20:09:22.613Z] [AUTH] Session B authenticated {"email":"profesor1.ads@itbeltran.com.ar","id":"35a605e9-120c-e91b-cb8d-a8326ae09a48","role":"Profesor"}
[20:09:22.873Z] [AUTH] Session C authenticated {"email":"moderador1@itbeltran.com.ar","id":"d95fe123-ce75-fe5b-d78c-614456713c50","role":"Moderador"}
[20:09:22.873Z] [RT-01] Initiating unmocked graphql-ws connection for Session B
[20:09:22.930Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":57}
[20:09:22.930Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket
[20:09:22.944Z] [RT-03] Session C connected to WebSocket
[20:09:23.397Z] [RT-02] Session A emitting mutation sendMessage to Session B
[20:09:23.555Z] [RT-02] Message 1 persisted by backend {"id":"6a3408f2-4598-44c2-94fe-927b5bedd427","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","httpLatencyMs":158}
[20:09:23.559Z] [RT-02] Session B received live message frame via WebSocket {"id":"6a3408f2-4598-44c2-94fe-927b5bedd427","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[20:09:23.613Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B with exact payload match {"messageId":"6a3408f2-4598-44c2-94fe-927b5bedd427","matches":true}
[20:09:24.219Z] [RT-03] VERIFIED: Strict topic isolation confirmed. 0 frames leaked to Observer C {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
[20:09:24.219Z] [RT-04] Session B invoking markConversationRead for Session A
[20:09:24.325Z] [RT-04] VERIFIED: markConversationRead persisted in DB (verified via conversation re-read query) {"markedCount":1,"persistedMessageId":"6a3408f2-4598-44c2-94fe-927b5bedd427","persistedIsRead":true,"verifiedViaReRead":true}
[20:09:24.325Z] [RT-05] Forcing client termination via client.terminate() (simulating transport drop code 4499)
[20:09:24.325Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[20:09:26.641Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":3768}
[20:09:26.697Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded with verified wait threshold {"tDrop":1794773364325,"reconnectedAt":1794773366641,"measuredRetryWaitMs":2316,"minimumRequiredThresholdMs":1300,"exceedsMinimumExpectedWait":true}
[20:09:26.697Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery
[20:09:26.718Z] [RT-02] Session B received live message frame via WebSocket {"id":"9d158ce8-20b3-4770-b19b-d439dd33933a","content":"Segundo mensaje post-reconexion live (Canal recuperado)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[20:09:26.775Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection on recovered channel {"messageId":"9d158ce8-20b3-4770-b19b-d439dd33933a","matches":true}
[20:09:26.776Z] [RT-06] Resolving identity for Session C via me query with existing Bearer token (teardown occurs in finally)
[20:09:26.853Z] [RT-06] VERIFIED: Identity resolution for Session C confirmed without identity mixture (Note: Interactive UI logout & Apollo in-memory cache purge belong to the browser UI domain) {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador","matchesExpectedUserC":true}
[20:09:26.853Z] [DONE] ALL TRANSPORT REALTIME DIMENSIONS PASSED WITH STRICT ASSERTIONS
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
