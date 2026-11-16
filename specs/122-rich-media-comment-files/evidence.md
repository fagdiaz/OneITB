# Evidence: multimedia enriquecida y adjuntos en comentarios

**Date**: 2026-06-19
**Branch**: `122-rich-media-comment-files`

## Implemented

- `Comment.FileUrl` nullable, maximo 500, expuesto por HotChocolate.
- `addComment` acepta `fileUrl` opcional y el servicio valida rutas `/uploads/`.
- Upload admite GIF y WebP ademas de los formatos de la spec 121.
- Parser seguro para `watch`, `youtu.be`, `shorts` y `embed`, limitado a hosts de YouTube e ID de 11 caracteres.
- Render compartido para imagenes, PDF, presentaciones y documentos.
- Comentarios y respuestas cargan archivos antes de ejecutar GraphQL, preservan el draft ante errores y muestran medios compactos.

## Commands and results

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations add AddFileUrlToComment --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
npm.cmd run build
```

- Backend Release: PASS, 0 errors and 0 warnings in final build.
- Frontend Vite: PASS; inherited bundle-size and Vite plugin deprecation warnings remain.
- Migration `20260619200051_AddFileUrlToComment`: PASS and applied.
- Pending EF model changes: none.
- Parser: PASS, 6 YouTube cases and 6 file classification/name cases.
- Browser: publication attachment control rendered and included GIF/WebP in the accepted formats.

## Runtime blocked

The backend failed before listening because SQL Server requires encryption unsupported by this process. Error logging then also failed due Windows Event Log permissions. Therefore live GraphQL introspection, authenticated comment upload, rich cards with persisted data and reload persistence were not verified in this run. The frontend correctly reported GraphQL network failures while the backend was unavailable.
