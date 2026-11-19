# Registro de Ejecución de Concurrencia SQL Real (GOB12SqlConcurrency)

- **Fecha y Hora:** 2026-11-15 13:51:00 UTC-3 (16:51:00 UTC)
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **Commit Evaluado:** `a62c4e3642bf356b728f6fb7b1494b0d4966b294` (HEAD, código de producción y pruebas idéntico a `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`)
- **Estado del Árbol de Trabajo:** Limpio (`working tree clean`)
- **Instancia de Base de Datos:** Microsoft SQL Server 2022 Developer (Docker container `oneitb23-sql` en `127.0.0.1:1433`, healthy)
- **Comando Ejecutado:**
```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore --filter "Category=GOB12SqlConcurrency"
```

## Salida de Consola VSTest (.NET 8.0 Release)

```text
  Entities -> F:\React\OneITB23\API Graphql\Entities\bin\Release\net8.0\Entities.dll
  Data -> F:\React\OneITB23\API Graphql\Data\bin\Release\net8.0\Data.dll
  Services -> F:\React\OneITB23\API Graphql\Services\bin\Release\net8.0\Services.dll
  GraphQL -> F:\React\OneITB23\API Graphql\OneITB\bin\Release\net8.0\GraphQL.dll
  Services.Tests -> F:\React\OneITB23\API Graphql\Tests\Services.Tests\bin\Release\net8.0\Services.Tests.dll
Serie de pruebas para F:\React\OneITB23\API Graphql\Tests\Services.Tests\bin\Release\net8.0\Services.Tests.dll (.NETCoreApp,Version=v8.0)
Versión 17.14.1 (x64) de VSTest

Iniciando la ejecución de pruebas, espere...
1 archivos de prueba en total coincidieron con el patrón especificado.

Correctas! - Con error:     0, Superado:    11, Omitido:     0, Total:    11, Duración: 14 s - Services.Tests.dll (net8.0)
```

## Detalle de Pruebas Evaluadas (11/11 PASS)

1. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.OneUpload_TwoClientIds_ExactlyOneAtomicWinner(differentRecipients: False)` [PASS]
2. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.OneUpload_TwoClientIds_ExactlyOneAtomicWinner(differentRecipients: True)` [PASS]
3. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_ConcurrentIdenticalCalls_ReturnTheSameOriginal(withUpload: False)` [PASS]
4. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_ConcurrentIdenticalCalls_ReturnTheSameOriginal(withUpload: True)` [PASS]
5. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_DifferentRecipients_ExactlyOneWinnerAndOneRejection` [PASS] (Prueba adversarial de RC-04: valida 1 ganador, 1 fila persistida y 1 rechazo ArgumentException por destinatario discrepante)
6. `Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SqlCatalog_EnforcesFilteredIdempotencyAndUniqueAttachmentConsumption` [PASS]
7. `Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.CurrentVersionAndAlreadyStaleVersion_OnlyCurrentWriterPersists(secondIsAdmin: False)` [PASS]
8. `Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.CurrentVersionAndAlreadyStaleVersion_OnlyCurrentWriterPersists(secondIsAdmin: True)` [PASS]
9. `Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SameVersionBothValidated_BarrierBeforeSave_RowVersionRejectsLateWriter(secondIsAdmin: False)` [PASS]
10. `Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SameVersionBothValidated_BarrierBeforeSave_RowVersionRejectsLateWriter(secondIsAdmin: True)` [PASS]
11. `Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SqlControl_TwoTrackedCopies_RejectStaleUpdateAndPreserveWinningScore` [PASS]

## Respaldo Arquitectónico y Limpieza

- **Aislamiento de Concurrencia:** `IsolationLevel.Serializable` con manejo resiliente de deadlocks SQL 1205 / colisiones de clave única 2601/2627 en `MessagingService.SendPrivateMessageAsync`.
- **Validación de Destinatario:** En el bloque catch de fallback idempotente, se valida estrictamente `if (idempotent.ReceiverId != receiverId) throw new ArgumentException(...)`, impidiendo entregas cruzadas y garantizando resolución atómica.
- **Bases de Datos Efímeras:** Cada test genera una base de datos aislada `OneITB_GOB12_<GUID>` mediante `EnsureCreatedAsync` y la destruye en `DisposeAsync`, garantizando independencia total sin dejar residuos.
