Serie de pruebas para F:\React\OneITB23\API Graphql\Tests\Services.Tests\bin\Release\net8.0\Services.Tests.dll (.NETCoreApp,Version=v8.0)
Versión 17.14.1 (x64) de VSTest

Iniciando la ejecución de pruebas, espere...
1 archivos de prueba en total coincidieron con el patrón especificado.

Pruebas ejecutadas (GOB12SqlConcurrency):
1. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.OneUpload_TwoClientIds_ExactlyOneAtomicWinner(differentRecipients: False) [PASS]
2. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.OneUpload_TwoClientIds_ExactlyOneAtomicWinner(differentRecipients: True) [PASS]
3. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_ConcurrentIdenticalCalls_ReturnTheSameOriginal(withUpload: False) [PASS]
4. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_ConcurrentIdenticalCalls_ReturnTheSameOriginal(withUpload: True) [PASS]
5. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SameClientMessageId_DifferentRecipients_ExactlyOneWinnerAndOneRejection [PASS] (RC-04 adversarial test)
6. Services.Tests.Hardening.Gob12.PrivateUploadSqlRaceTests.SqlCatalog_EnforcesFilteredIdempotencyAndUniqueAttachmentConsumption [PASS]
7. Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.CurrentVersionAndAlreadyStaleVersion_OnlyCurrentWriterPersists(secondIsAdmin: False) [PASS]
8. Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.CurrentVersionAndAlreadyStaleVersion_OnlyCurrentWriterPersists(secondIsAdmin: True) [PASS]
9. Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SameVersionBothValidated_BarrierBeforeSave_RowVersionRejectsLateWriter(secondIsAdmin: False) [PASS]
10. Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SameVersionBothValidated_BarrierBeforeSave_RowVersionRejectsLateWriter(secondIsAdmin: True) [PASS]
11. Services.Tests.Hardening.Gob12.SectionGradeSqlRaceTests.SqlControl_TwoTrackedCopies_RejectStaleUpdateAndPreserveWinningScore [PASS]

Correctas! - Con error: 0, Superado: 11, Omitido: 0, Total: 11, Duración: 11 s - Services.Tests.dll (net8.0)
Fecha/Timestamp: 2026-11-15 13:34:25 UTC-3
Aislamiento: IsolationLevel.Serializable con resolución atómica de colisiones, validación estricta de ReceiverId y recuperación de idempotencia.
Instancia: Microsoft SQL Server 2022 Developer (Docker container oneitb23-sql:1433, healthy)
Comando: dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore --filter "Category=GOB12SqlConcurrency"
Bases de prueba descartables: OneITB_GOB12_<GUID> creadas con EnsureCreatedAsync y eliminadas en DisposeAsync por Gob12SqlFixture.
