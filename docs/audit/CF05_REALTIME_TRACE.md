# Registro de Traza de Ejecución Realtime y Aislamiento Multi-Sesión (CF-05)

- **Fecha de Validación en Vivo Unmocked:** 2026-11-15T19:40:41.625Z - 2026-11-15T19:40:46.823Z
- **Entorno de Validación:**
  * Backend: ASP.NET Core 8 Kestrel (HotChocolate 14.2.0, WebSocket subprotocol `graphql-transport-ws`) en `http://127.0.0.1:5098` (`ws://127.0.0.1:5098/graphql`)
  * Frontend / Cliente: Node.js v22.13.0 con paquete real `graphql-ws` 5.16.0 (sin mock, con temporizador y política natural de `retryWait`)
  * Base de Datos: Microsoft SQL Server 2022 (Contenedor Docker `oneitb23-sql` en `127.0.0.1:1433`)
  * Script Orquestador: [`scripts/run-cf05-live-validation.ps1`](file:///f:/React/OneITB23/scripts/run-cf05-live-validation.ps1)
  * Script Runner: [`scripts/verify-cf05-realtime-live.mjs`](file:///f:/React/OneITB23/scripts/verify-cf05-realtime-live.mjs)
  * Evidencia de Salida Literal: [`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md)

---

## 1. Declaración de Metodología, Instrumentación y Procedencia

Conforme al dictamen de arbitraje `ARBITRAJE_31e59a2.md`, se formaliza la distinción explícita de procedencia entre:

1. **Traza Sintética Compuesta Inicial (Vitest Mocked Fixtures):**
   - La traza preliminar documentada anteriormente se obtuvo a partir de las suites de pruebas unitarias y adversariales de frontend (`chatRealtime.adversarial.test.jsx` y `privateChatRecovery.gob12.test.jsx`).
   - En dichas suites de Vitest, la función `retryWait` de `graphql-ws` fue configurada como un mock inmediato (`async () => {}`) para posibilitar una ejecución rápida sin demoras artificiales en CI, y la variable rotulada "epoch" correspondió a un contador cíclico interno de prueba dentro del test harness.
   - En el código de producción de la aplicación (`FrontEnd/OneItb-FE/src/data/graphql/GraphqlProvider.js:356`), el `sessionEpoch` se actualiza **únicamente al invalidar o resetear la sesión de autenticación** (`resetToken()`), y no en las reconexiones de socket ante pérdidas de red.

2. **Traza de Ejecución en Vivo Unmocked (Cliente Real `graphql-ws` 5.16.0):**
   - Para proporcionar soporte empírico irrebatible sin simulaciones de reloj ni overrides, se diseñó y ejecutó una sesión en vivo finita contra un host Kestrel real en el puerto 5098.
   - El cliente `graphql-ws` 5.16.0 ejecutó su política predeterminada de reconexión sin modificación de `retryWait` (fórmula de biblioteca: `1000ms + random(300..2999ms)` = espera mínima de 1300 ms).
   - La desconexión anormal se provocó mediante terminación física de socket (`client.terminate()`), provocando el cierre abrupto del socket.
   - La demora medida hasta la reconexión fue de **2112 ms**, dentro del rango estricto esperado `>= 1300 ms`.
   - Se registró en vivo la salida literal en consola, verificando las 6 dimensiones de la compuerta CF-05.

---

## 2. Traza de Ejecución en Vivo Unmocked (Sesión Focalizada Real)

A continuación se transcribe la secuencia cronológica exacta registrada durante la ejecución del runner en vivo ([`./CF05_LIVE_RUNNER_OUTPUT.md`](./CF05_LIVE_RUNNER_OUTPUT.md)):

### Actores de la Traza en Vivo:
- **Sesión A (Emisor):** `estudiante1.ads@itbeltran.com.ar` (`2e9b3337-1824-339f-b73f-28b9d2cc7832`, Rol `Estudiante`)
- **Sesión B (Destinatario):** `profesor1.ads@itbeltran.com.ar` (`35a605e9-120c-e91b-cb8d-a8326ae09a48`, Rol `Profesor`)
- **Sesión C (Observador de Aislamiento):** `moderador1@itbeltran.com.ar` (`d95fe123-ce75-fe5b-d78c-614456713c50`, Rol `Moderador`)

### Cronología de Eventos:

```text
[19:40:41.625Z] [INIT] Starting Live CF-05 Realtime Runner against Kestrel ASP.NET Core 8
[19:40:41.626Z] [AUTH] Authenticating test accounts against Kestrel /graphql
[19:40:42.805Z] [AUTH] Session A authenticated (Estudiante)
[19:40:43.068Z] [AUTH] Session B authenticated (Profesor)
[19:40:43.332Z] [AUTH] Session C authenticated (Moderador)

[19:40:43.332Z] [RT-01] Initiating unmocked graphql-ws connection for Session B
[19:40:43.384Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":52}
                        -> Veredicto RT-01: PASS (Handshake exitoso en 52 ms)

[19:40:43.385Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket
[19:40:43.398Z] [RT-03] Session C connected to WebSocket and subscribed to MessageReceived

[19:40:43.751Z] [RT-02] Session A emitting mutation sendMessage to Session B
[19:40:43.892Z] [RT-02] Message 1 persisted by backend {"id":"3d4357cd-95ae-4516-91cd-06e39ce7da4e","httpLatencyMs":141}
[19:40:43.897Z] [RT-02] Session B received live message frame via WebSocket {"id":"3d4357cd-95ae-4516-91cd-06e39ce7da4e"}
[19:40:43.954Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B
                        -> Veredicto RT-02: PASS (Entrega reactiva inmediata sin recarga de página)

[19:40:44.470Z] [RT-03] Topic isolation check on Observer C:
                        {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
                        -> Veredicto RT-03: PASS (Aislamiento hermético: 0 tramas recibidas por Sesión C)

[19:40:44.470Z] [RT-04] Session B invoking markConversationRead for Session A
[19:40:44.504Z] [RT-04] VERIFIED: markConversationRead persisted in DB {"markedCount":1}
                        -> Veredicto RT-04: PASS (Marcado de conversación y persistencia en base de datos)

[19:40:44.504Z] [RT-05] Forcing abnormal socket drop via client.terminate() (simulating network loss)
[19:40:44.505Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[19:40:46.616Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":3284}
[19:40:46.674Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded
                        {"tDrop":1794771644504,"reconnectedAt":1794771646616,"measuredRetryWaitMs":2112,
                         "expectedRange":">= 1300 ms (1000ms base + 300..2999ms jitter)","exceedsMinimumExpectedWait":true}
[19:40:46.674Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery
[19:40:46.701Z] [RT-02] Session B received live message frame via WebSocket {"id":"bee790ad-84ae-49e4-b3c3-570129bedf69"}
[19:40:46.752Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection
                        -> Veredicto RT-05: PASS (Demora de reintento natural medida: 2112 ms >= 1300 ms, canal recuperado)

[19:40:46.752Z] [RT-06] Session A performing logout: terminating transports and resetting store
[19:40:46.752Z] [RT-06] Session A client disposed. Authenticating as Session C on the same client context
[19:40:46.823Z] [RT-06] VERIFIED: Context hydrated with Session C only
                        {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador",
                         "matchesExpectedUserC":true,"userADataResidualDetected":false}
                        -> Veredicto RT-06: PASS (Purga y reemplazo limpio de identidad: 0 datos residuales de Usuario A)

[19:40:46.823Z] [DONE] ALL 6 REALTIME DIMENSIONS (RT-01 TO RT-06) PASSED AGAINST LIVE RUNTIME WITH UNMOCKED graphql-ws
```

---

## 3. Respaldo de Pruebas Automatizadas de Concurrencia (Constitución §IX)

Como complemento a la ejecución en vivo unmocked, se mantienen las 22 pruebas automatizadas de regresión que integran el baseline de 785 pruebas:

1. **Suites Frontend de Concurrencia y Multi-Sesión en Vitest:**
   - `src/context/sessionTabs.adversarial.test.jsx`: **5/5 PASS** (143 ms) — MT-01 a MT-05.
   - `src/Components/chat/chatRealtime.adversarial.test.jsx`: **8/8 PASS** (1443 ms) — RT-01 a RT-06.
   - `src/Components/chat/privateChatRecovery.gob12.test.jsx`: **6/6 PASS** (2152 ms) — Replay y reconciliación optimista.
2. **Suite Backend de Aislamiento de Tópicos en xUnit:**
   - `PrivateMessageTopicAdversarialTests.cs`: **3/3 PASS** (436 ms) — Cero recepción cruzada.

**Total de Pruebas Automatizadas de Soporte:** **22 / 22 PASS (100%)**.
