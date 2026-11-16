# Evidence: archivos adjuntos en publicaciones

**Date**: 2026-06-19
**Branch**: `121-file-upload-inquiries`

## Implemented contract

- `Inquiry.FileUrl` reemplaza `AttachedFileUrl` en EF Core, servicios, HotChocolate y Apollo.
- `POST /api/upload` exige JWT, acepta un archivo por formulario, limita la carga funcional a 15 MB y usa nombres GUID.
- `UseStaticFiles()` ya estaba activo y las URLs se sirven como `/uploads/{guid}.{ext}`.
- El feed usa un input oculto, muestra el nombre seleccionado, bloquea doble envio y diferencia `Subiendo...` de `Publicando...`.
- Los archivos de ejecucion quedan ignorados, conservando solo `.gitkeep`.

## Commands executed

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations add AddFileUrlToInquiry --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
npm.cmd run build
```

## Results

- Backend Release: PASS, 0 errors. Existing nullable warnings remain outside this feature.
- Migration: PASS. `20260619041019_AddFileUrlToInquiry` uses `RenameColumn` in both directions and preserves existing values.
- Database update: PASS.
- Pending EF model changes: none.
- Frontend Vite build: PASS. Existing bundle-size and Vite plugin deprecation warnings remain.
- Browser rendering: PASS for the hidden file input, allowed formats, `Adjuntar archivo` control and visible 15 MB limit.

## Runtime limitation

The backend process did not begin listening on `https://localhost:44397` and remained blocked during startup without output. It was terminated after the timeout. Consequently, the authenticated upload response, live GraphQL schema and persisted browser reload could not be validated end to end in this execution. The browser showed the expected GraphQL network failures while the backend was unavailable; this is recorded as blocked, not passed.
