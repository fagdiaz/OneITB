# Acta de Validación de Infraestructura Local y Aceptación de Servicios (CF-03)

- **Fecha de Ejecución:** 2026-11-15T16:16:22-03:00
- **Script Ejecutado:** `scripts/validate-local-infrastructure.ps1`
- **Comando:** `powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/validate-local-infrastructure.ps1"`
- **Código de Salida:** `0` (`PASS`)
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA Candidato:** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`
- **Entorno de Contenedores:** Docker Compose acceptance (`docker-compose.acceptance.yml`, proyecto `oneitb195acceptance`)

---

## 1. Registro Cronológico de Etapas Ejecutadas

| Paso | Control / Etapa | Resultado | Detalle |
|---|---|:---:|---|
| 1 | **Acceptance Compose configuration** | `PASS` | `docker compose -f docker-compose.acceptance.yml config --quiet` verificado sin advertencias. |
| 2 | **Detached Redis & Mailpit startup** | `PASS` | Contenedores `oneitb23-acceptance-redis` (puerto 16379) y `oneitb23-acceptance-mailpit` (puertos 11025 y 18025) iniciados en modo detached. |
| 3 | **Redis & Mailpit health check** | `PASS` | Ambos contenedores alcanzaron estado `healthy` dentro del timeout configurado (60s). |
| 4 | **Real Redis & SMTP integration tests** | `PASS` | `dotnet test Services.Tests.csproj -c Release --no-restore --filter Category=Infrastructure`: 2/2 superados en 3 s. Conexión TCP real a Redis y entrega SMTP a Mailpit verificadas. |
| 5 | **Student-to-Moderator session isolation** | `PASS` | `npm.cmd run test -- --run src/context/AuthContext.test.jsx src/data/graphql/GraphqlProvider.test.js`: 15/15 tests superados en 2.19 s. Aislamiento de sesión y desuscripción de transportes confirmados. |
| 6 | **Backend automated suite** | `PASS` | `dotnet test Services.Tests.csproj -c Release --no-restore --filter "Category!=GOB12SqlConcurrency&Category!=GOB15BcryptBenchmark&Category!=VendorAdvisoryGHSA"`: 396/396 tests superados en 41 s. 0 errores, 0 omisiones. |
| 7 | **Frontend automated suite** | `PASS` | `npm.cmd run test -- --run`: 389/389 tests superados en 70 suites en 32.53 s. 0 errores. |
| 8 | **Backend Release build** | `PASS` | Compilación neta Release net8.0: 0 advertencias, 0 errores en 2.04 s. |
| 9 | **Frontend production build** | `PASS` | Empaquetado Vite en 588 ms (569 módulos transformados). |
| 10 | **EF Core pending model changes** | `PASS` | `dotnet ef migrations has-pending-model-changes`: cero drift entre modelo y migraciones compiladas. |
| 11 | **Patch whitespace integrity** | `PASS` | `git diff --check`: cero conflictos de espacio en blanco o finales de línea. |
| 12 | **SQL container invariant** | `PASS` | Fingerprint de contenedor `oneitb23-sql` (`Id|Running|StartedAt`) comparado antes y después: idéntico. Cero alteraciones del contenedor SQL preexistente. |
| 13 | **Acceptance container cleanup** | `PASS` | `docker compose down --remove-orphans` ejecutado; contenedores `oneitb23-acceptance-redis` y `oneitb23-acceptance-mailpit` y red `oneitb195acceptance` eliminados. |
| 14 | **Port availability verification** | `PASS` | Puertos TCP 16379, 11025 y 18025 liberados y confirmados disponibles tras el ciclo de teardown. |

---

## 2. Dictamen de Infraestructura Local (CF-03)

El script oficial de aceptación de infraestructura local concluyó con:
```
Spec 195 local infrastructure acceptance: PASS
External SMTP, Cloudinary, Microsoft Entra tenant acceptance and network WebSocket handshakes remain unverified.
Exit Code: 0
```
Todos los servicios de soporte efímeros (Redis 7 y Mailpit) fueron creados, validados en vivo contra el backend y destruidos limpiamente sin dejar puertos ocupados ni modificar el contenedor SQL principal.
