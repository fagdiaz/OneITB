# Evidencia de Ejecución en Vivo: Validación Realtime CF-05 (graphql-ws sin mock)

- **Fecha de Ejecución:** 2026-11-15T16:40:46-03:00
- **Script Runner:** `scripts/run-cf05-live-validation.ps1`
- **Script Node:** `scripts/verify-cf05-realtime-live.mjs`
- **Cliente WebSocket:** `graphql-ws` v5.16.0 (sin mock, temporización natural de retryWait)
- **Runtime Backend:** ASP.NET Core 8 Kestrel en http://127.0.0.1:5098 (ws://127.0.0.1:5098/graphql)
- **Base de Datos:** Docker SQL Server 2022 (oneitb23-sql)
- **Código de Salida:** 0 (PASS)

---

## Salida de Consola Literal del Runner

```text
[CF-05 RUNNER] Target HTTP: http://127.0.0.1:5098/graphql
[CF-05 RUNNER] Target WS:   ws://127.0.0.1:5098/graphql
[CF-05 RUNNER] graphql-ws version: 5.16.0 (unmocked)
[2026-11-15T19:40:41.625Z] [INIT] Starting Live CF-05 Realtime Runner against Kestrel ASP.NET Core 8 
[2026-11-15T19:40:41.626Z] [AUTH] Authenticating test accounts against Kestrel /graphql 
[2026-11-15T19:40:42.805Z] [AUTH] Session A authenticated {"email":"estudiante1.ads@itbeltran.com.ar","id":"2e9b3337-1824-339f-b73f-28b9d2cc7832","role":"Estudiante"}
[2026-11-15T19:40:43.068Z] [AUTH] Session B authenticated {"email":"profesor1.ads@itbeltran.com.ar","id":"35a605e9-120c-e91b-cb8d-a8326ae09a48","role":"Profesor"}
[2026-11-15T19:40:43.332Z] [AUTH] Session C authenticated {"email":"moderador1@itbeltran.com.ar","id":"d95fe123-ce75-fe5b-d78c-614456713c50","role":"Moderador"}
[2026-11-15T19:40:43.332Z] [RT-01] Initiating unmocked graphql-ws connection for Session B 
[2026-11-15T19:40:43.384Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":52}
[2026-11-15T19:40:43.385Z] [RT-03] Setting up active passive observer Session C (Moderador) on WebSocket 
[2026-11-15T19:40:43.398Z] [RT-03] Session C connected to WebSocket 
[2026-11-15T19:40:43.751Z] [RT-02] Session A emitting mutation sendMessage to Session B 
[2026-11-15T19:40:43.892Z] [RT-02] Message 1 persisted by backend {"id":"3d4357cd-95ae-4516-91cd-06e39ce7da4e","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","httpLatencyMs":141}
[2026-11-15T19:40:43.897Z] [RT-02] Session B received live message frame via WebSocket {"id":"3d4357cd-95ae-4516-91cd-06e39ce7da4e","content":"Mensaje de prueba live CF-05 (Entrega unmocked)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T19:40:43.954Z] [RT-02] VERIFIED: Message 1 delivered in real-time to Session B {"messageId":"3d4357cd-95ae-4516-91cd-06e39ce7da4e","expectedId":"3d4357cd-95ae-4516-91cd-06e39ce7da4e","matches":true}
[2026-11-15T19:40:44.470Z] [RT-03] VERIFIED: Topic isolation check on Observer C {"framesDeliveredToC":0,"leaksDetected":0,"isolationPassed":true}
[2026-11-15T19:40:44.470Z] [RT-04] Session B invoking markConversationRead for Session A 
[2026-11-15T19:40:44.504Z] [RT-04] VERIFIED: markConversationRead persisted in DB {"markedCount":1,"otherUserId":"2e9b3337-1824-339f-b73f-28b9d2cc7832"}
[2026-11-15T19:40:44.504Z] [RT-05] Forcing abnormal socket drop via client.terminate() (simulating network loss) 
[2026-11-15T19:40:44.505Z] [SOCKET_B] Session B WebSocket closed event {"code":4499,"reason":"Terminated"}
[2026-11-15T19:40:46.616Z] [RT-01] Session B WebSocket connected & connection_ack received {"latencyMs":3284}
[2026-11-15T19:40:46.674Z] [RT-05] VERIFIED: graphql-ws natural auto-reconnection succeeded {"tDrop":1794771644504,"reconnectedAt":1794771646616,"measuredRetryWaitMs":2112,"expectedRange":">= 1300 ms (1000ms base + 300..2999ms jitter)","exceedsMinimumExpectedWait":true}
[2026-11-15T19:40:46.674Z] [RT-05] Session A sending 2nd message post-reconnection to verify channel recovery 
[2026-11-15T19:40:46.701Z] [RT-02] Session B received live message frame via WebSocket {"id":"bee790ad-84ae-49e4-b3c3-570129bedf69","content":"Segundo mensaje post-reconexion live (Canal recuperado)","senderId":"2e9b3337-1824-339f-b73f-28b9d2cc7832","receiverId":"35a605e9-120c-e91b-cb8d-a8326ae09a48"}
[2026-11-15T19:40:46.752Z] [RT-05] VERIFIED: Message 2 delivered post-reconnection {"messageId":"bee790ad-84ae-49e4-b3c3-570129bedf69","expectedId":"bee790ad-84ae-49e4-b3c3-570129bedf69","matches":true}
[2026-11-15T19:40:46.752Z] [RT-06] Session A performing logout: terminating transports and resetting store 
[2026-11-15T19:40:46.752Z] [RT-06] Session A client disposed. Authenticating as Session C on the same client context 
[2026-11-15T19:40:46.823Z] [RT-06] VERIFIED: Context hydrated with Session C only {"currentUserId":"d95fe123-ce75-fe5b-d78c-614456713c50","currentUserRole":"Moderador","matchesExpectedUserC":true,"userADataResidualDetected":false}
[2026-11-15T19:40:46.823Z] [DONE] ALL 6 REALTIME DIMENSIONS (RT-01 TO RT-06) PASSED AGAINST LIVE RUNTIME WITH UNMOCKED graphql-ws 

================================================================
CF-05 LIVE EXECUTION VERDICT: 100% PASS
Measured graphql-ws Natural Retry Delay: 2112 ms
Third-Party Observer Leaks: 0
================================================================
```
