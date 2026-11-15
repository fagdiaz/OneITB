# Evidencia de Ejecución en Vivo: Validación Realtime CF-05 (graphql-ws sin mock)

- **Fecha de Ejecución:** 2026-11-15T17:09:35-03:00
- **Script Orquestador:** `scripts/run-cf05-live-validation.ps1`
- **Script Runner:** `scripts/verify-cf05-realtime-live.mjs`
- **Cliente WebSocket:** `graphql-ws` v5.16.0 (sin mock, política predeterminada de reconexión)
- **Runtime Backend:** ASP.NET Core 8 Kestrel en `http://127.0.0.1:5098` (`ws://127.0.0.1:5098/graphql`)
- **Base de Datos:** Docker SQL Server 2022 (`oneitb23-sql`)
- **Adquisición de Credencial:** Externa mediante `Seed:DemoPassword` (User Secrets) sin valores por defecto en texto plano
- **Código de Salida Ejecución Principal:** 0 (PASS con aserciones estrictas)

---

## 1. Salida de Consola Literal del Runner Principal (100% PASS)

``` text
[CF-05 RUNNER] Target HTTP: http://127.0.0.1:5098/graphql
[CF-05 RUNNER] Target WS:   ws://127.0.0.1:5098/graphql
[CF-05 RUNNER] graphql-ws version: 5.16.0 (unmocked)
[2026-11-15T20:09:21.243Z] [INIT] Starting Live CF-05 Transport Runner against Kestrel ASP.NET Core 8
[2026-11-15T20:09:21.244Z] [AUTH] Authenticating test accounts against Kestrel /graphql (external credentials)
[2026-11-15T20:09:22.349Z] [AUTH] Session A authenticated {"email":"estudiante1.ads@itbeltran.com.ar","id":"2e9b3337-1824-339f-b73f-28b9d2cc7832","role":"Estudiante"}
[2026-11-15T20:09:22.613Z] [AUTH] Session B authenticated {"email":"profesor1.ads@itbeltran.com.ar","id":"35a605e9-120c-e91b-cb8d-a8326ae09a48","role":"Profesor"}
[2026-11-15T20:09:22.873Z] [AUTH] Session C authenticated {"email":"moderador1@itbeltran.com.ar","id":"d95fe123-ce75-fe5b-d78c-614456713c50","role":"Moderador"}
[2026-11-15T20:09:22.873Z] [RT-01] Initiating unmocked graphql-ws connection for Session B
[2026-11-15T20:09:22.930Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":57}
[2026-11-15T20:09:22.930Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket
[2026-11-15T20:09:22.944Z] [RT-03] Session C connected to WebSocket
[2026-11-15T20:09:23.397Z] [RT-02] Session A emitting mutation sendMessage to Session B
[2026-11-15T20:09:23.555Z] [RT-02] Message 1 persisted by backend {"id":"6a3408f2-4598-44c2-94fe-927b5bedd427","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","httpLatencyMs":158}
[2026-11-15T20:09:23.559Z] [RT-02] Session B received live message frame via WebSocket {"id":"6a3408f2-4598-44c2-94fe-927b5bedd427","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T20:09:23.613Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B with exact payload match {"messageId":"6a3408f2-4598-44c2-94fe-927b5bedd427","matches":true}
[2026-11-15T20:09:24.219Z] [RT-03] VERIFIED: Strict topic isolation confirmed. 0 frames leaked to Observer C {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
[2026-11-15T20:09:24.219Z] [RT-04] Session B invoking markConversationRead for Session A
[2026-11-15T20:09:24.325Z] [RT-04] VERIFIED: markConversationRead persisted in DB (verified via conversation re-read query) {"markedCount":1,"persistedMessageId":"6a3408f2-4598-44c2-94fe-927b5bedd427","persistedIsRead":true,"verifiedViaReRead":true}
[2026-11-15T20:09:24.325Z] [RT-05] Forcing client termination via client.terminate() (simulating transport drop code 4499)
[2026-11-15T20:09:24.325Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[2026-11-15T20:09:26.641Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":3768}
[2026-11-15T20:09:26.697Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded with verified wait threshold {"tDrop":1794773364325,"reconnectedAt":1794773366641,"measuredRetryWaitMs":2316,"minimumRequiredThresholdMs":1300,"exceedsMinimumExpectedWait":true}
[2026-11-15T20:09:26.697Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery
[2026-11-15T20:09:26.718Z] [RT-02] Session B received live message frame via WebSocket {"id":"9d158ce8-20b3-4770-b19b-d439dd33933a","content":"Segundo mensaje post-reconexion live (Canal recuperado)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T20:09:26.775Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection on recovered channel {"messageId":"9d158ce8-20b3-4770-b19b-d439dd33933a","matches":true}
[2026-11-15T20:09:26.776Z] [RT-06] Resolving identity for Session C via me query with existing Bearer token (teardown occurs in finally)
[2026-11-15T20:09:26.853Z] [RT-06] VERIFIED: Identity resolution for Session C confirmed without identity mixture (Note: Interactive UI logout & Apollo in-memory cache purge belong to the browser UI domain) {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador","matchesExpectedUserC":true}
[2026-11-15T20:09:26.853Z] [DONE] ALL TRANSPORT REALTIME DIMENSIONS PASSED WITH STRICT ASSERTIONS

================================================================
CF-05 TRANSPORT EXECUTION VERDICT: 100% PASS
Measured graphql-ws Natural Retry Delay: 2316 ms (threshold >= 1300 ms: PASS)
Database Persistence Re-Read Verification: PASS
Strict Assertions Evaluated: All passed
================================================================
```

---

## 2. Falsabilidad del Instrumento: Verificación de Controles Negativos

Para garantizar que el runner no emite falsos positivos y que cualquier desviación o fuga de paquetes bloquea inmediatamente la certificación con código de salida 1, se ejecutaron 4 controles negativos deliberados:

| Escenario Negativo Simulado | Código Esperado | Código Obtenido | Veredicto del Checker | Mensaje de Aserción Interceptado |
|---|:---:|:---:|:---:|---|
| `id-mismatch` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Message 1 ID mismatch: expected 3fb03be5-6629-4bb6-887f-27b81c505af3, received 00000000-0000-0000-0000-000000000000 |
| `leak-to-c` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Topic isolation violation: Observer C received 1 unexpected frames |
| `observer-error` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Observer C subscription experienced immediate error: Error: Simulated observer C subscription failure for checker verification |
| `short-wait` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Natural retryWait was 500 ms, which is below the declared minimum threshold of 1300 ms (1000ms base + 300..2999ms jitter) |


**Conclusión de Instrumentación:** El checker de transporte es 100% estricto y falsable. Ninguna discrepancia de IDs, fuga hacia terceros observadores, error de suscripción o reconexión prematura por debajo de 1300 ms puede pasar inadvertida ni resultar en un veredicto aprobatorio.
