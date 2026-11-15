# Evidencia de Ejecución en Vivo: Validación Realtime CF-05 (graphql-ws sin mock)

- **Fecha de Ejecución:** 2026-11-15T16:55:55-03:00
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
[2026-11-15T19:55:39.101Z] [INIT] Starting Live CF-05 Transport Runner against Kestrel ASP.NET Core 8
[2026-11-15T19:55:39.102Z] [AUTH] Authenticating test accounts against Kestrel /graphql (external credentials)
[2026-11-15T19:55:40.219Z] [AUTH] Session A authenticated {"email":"estudiante1.ads@itbeltran.com.ar","id":"2e9b3337-1824-339f-b73f-28b9d2cc7832","role":"Estudiante"}
[2026-11-15T19:55:40.485Z] [AUTH] Session B authenticated {"email":"profesor1.ads@itbeltran.com.ar","id":"35a605e9-120c-e91b-cb8d-a8326ae09a48","role":"Profesor"}
[2026-11-15T19:55:40.754Z] [AUTH] Session C authenticated {"email":"moderador1@itbeltran.com.ar","id":"d95fe123-ce75-fe5b-d78c-614456713c50","role":"Moderador"}
[2026-11-15T19:55:40.754Z] [RT-01] Initiating unmocked graphql-ws connection for Session B
[2026-11-15T19:55:40.814Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":60}
[2026-11-15T19:55:40.814Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket
[2026-11-15T19:55:40.830Z] [RT-03] Session C connected to WebSocket
[2026-11-15T19:55:41.279Z] [RT-02] Session A emitting mutation sendMessage to Session B
[2026-11-15T19:55:41.436Z] [RT-02] Message 1 persisted by backend {"id":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","httpLatencyMs":157}
[2026-11-15T19:55:41.442Z] [RT-02] Session B received live message frame via WebSocket {"id":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T19:55:41.498Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B with exact payload match {"messageId":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","matches":true}
[2026-11-15T19:55:42.109Z] [RT-03] VERIFIED: Strict topic isolation confirmed. 0 frames leaked to Observer C {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
[2026-11-15T19:55:42.109Z] [RT-04] Session B invoking markConversationRead for Session A
[2026-11-15T19:55:42.204Z] [RT-04] VERIFIED: markConversationRead persisted in DB (verified via conversation re-read query) {"markedCount":1,"persistedMessageId":"1bf6a6e9-f3cf-413d-a95c-69f60ada6683","persistedIsRead":true,"verifiedViaReRead":true}
[2026-11-15T19:55:42.204Z] [RT-05] Forcing client termination via client.terminate() (simulating transport drop code 4499)
[2026-11-15T19:55:42.204Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[2026-11-15T19:55:45.540Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":4786}
[2026-11-15T19:55:45.576Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded with verified wait threshold {"tDrop":1794772542204,"reconnectedAt":1794772545540,"measuredRetryWaitMs":3336,"minimumRequiredThresholdMs":1300,"exceedsMinimumExpectedWait":true}
[2026-11-15T19:55:45.577Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery
[2026-11-15T19:55:45.597Z] [RT-02] Session B received live message frame via WebSocket {"id":"ed477da0-e4a7-431f-83f3-a9177f9b55c2","content":"Segundo mensaje post-reconexion live (Canal recuperado)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T19:55:45.653Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection on recovered channel {"messageId":"ed477da0-e4a7-431f-83f3-a9177f9b55c2","matches":true}
[2026-11-15T19:55:45.653Z] [RT-06] Disposing Session A/B transports and asserting clean re-authentication as Session C
[2026-11-15T19:55:45.715Z] [RT-06] VERIFIED: Transport re-authentication confirmed with exact Session C identity (Note: UI logout/cache purge is a browser UI concern) {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador","matchesExpectedUserC":true}
[2026-11-15T19:55:45.715Z] [DONE] ALL TRANSPORT REALTIME DIMENSIONS PASSED WITH STRICT ASSERTIONS

================================================================
CF-05 TRANSPORT EXECUTION VERDICT: 100% PASS
Measured graphql-ws Natural Retry Delay: 3336 ms (threshold >= 1300 ms: PASS)
Database Persistence Re-Read Verification: PASS
Strict Assertions Evaluated: All passed
================================================================
```

---

## 2. Falsabilidad del Instrumento: Verificación de Controles Negativos

Para garantizar que el runner no emite falsos positivos y que cualquier desviación o fuga de paquetes bloquea inmediatamente la certificación con código de salida 1, se ejecutaron 4 controles negativos deliberados:

| Escenario Negativo Simulado | Código Esperado | Código Obtenido | Veredicto del Checker | Mensaje de Aserción Interceptado |
|---|:---:|:---:|:---:|---|
| `id-mismatch` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Message 1 ID mismatch: expected 7d00e8a6-c8be-4685-a16d-b522ee959791, received 00000000-0000-0000-0000-000000000000 |
| `leak-to-c` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Topic isolation violation: Observer C received 1 unexpected frames |
| `observer-error` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Observer C subscription experienced immediate error: Error: Simulated observer C subscription failure for checker verification |
| `short-wait` | 1 | 1 | **FAIL (Bloqueado)** | [ASSERTION_FAILED]: Natural retryWait was 500 ms, which is below the declared minimum threshold of 1300 ms (1000ms base + 300..2999ms jitter) |


**Conclusión de Instrumentación:** El checker de transporte es 100% estricto y falsable. Ninguna discrepancia de IDs, fuga hacia terceros observadores, error de suscripción o reconexión prematura por debajo de 1300 ms puede pasar inadvertida ni resultar en un veredicto aprobatorio.
