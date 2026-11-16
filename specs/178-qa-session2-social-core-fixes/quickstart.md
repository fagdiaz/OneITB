# Quickstart Validation: Spec 178

## Automated baseline

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"

Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run
npm.cmd run build
```

## Migration

```powershell
dotnet ef migrations add AddSocialAttachmentsCommentReactionsAndNotificationGrouping --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

## Runtime contract smoke

1. Iniciar Docker SQL y backend segun `docs/audit/RUNBOOK_DEV.md`.
2. Ejecutar `addInquiry` con dos descriptores de adjunto y comprobar nombre/orden.
3. Ejecutar `addComment` y `toggleCommentReaction` con dos usuarios.
4. Comprobar que `myNotifications` devuelve un solo grupo por publicacion/tipo y aumenta `aggregateCount`.
5. Abrir `/feed?inquiryId=<id>` y verificar scroll/hilo.

## Browser regression

1. Usuario con dos carreras: materias agrupadas y sin materias ajenas.
2. Seleccionar imagen + PDF, quitar una y volver a agregar; validar total 15 MB.
3. Pegar YouTube y confirmar preview antes de publicar.
4. Publicar YouTube + imagen + PDF y abrir cada modal/preview.
5. Comentar, verificar autofocus, adjuntar varios archivos y reaccionar a comentario/respuesta.
6. Desde la publicacion propia abrir el modal de usuarios que dieron like.
7. Con otra sesion generar varios likes/comentarios y comprobar agrupacion/navegacion.
8. Verificar footer debajo de paginacion en desktop/mobile y `print:hidden`.

## Rollback

La migracion es aditiva. El rollback elimina tablas/campos nuevos pero conserva `Inquiry.FileUrl` y `Comment.FileUrl`; por eso los adjuntos historicos de compatibilidad no se pierden.
