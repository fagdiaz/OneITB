# Runbook de desarrollo - OneITB23

**Ultima revision**: 2026-06-19

## Requisitos

- .NET SDK 8.
- SQL Server accesible con la cadena configurada.
- Node.js compatible con Vite 8.
- Certificado HTTPS de desarrollo confiable.

## Backend

```powershell
dotnet restore "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj"
```

Endpoints locales esperados:

- GraphQL HTTP/WebSocket: `https://localhost:44397/graphql`
- Upload REST: `https://localhost:44397/api/upload`
- Archivos: `https://localhost:44397/uploads/{file}`

## Entity Framework Core

```powershell
dotnet ef migrations list --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef migrations has-pending-model-changes --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Cada migracion debe revisarse antes de aplicarse. Un cambio de nombre debe usar `RenameColumn`; las nuevas FKs deben declarar su comportamiento de borrado.

## Frontend

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

El frontend usa `VITE_GRAPHQL_URL`; el valor local por defecto es `https://localhost:44397/graphql`.

## Validacion por tipo de cambio

### Backend o GraphQL

1. Build Release sin errores.
2. Migraciones sincronizadas.
3. Introspeccion del campo afectado en el servidor real.
4. Ejecucion autenticada de la query/mutation.

### Frontend

1. Build Vite.
2. Verificacion en navegador del flujo modificado.
3. Revision de consola y Network.
4. Recarga para confirmar cache y persistencia.

### Archivos

1. Upload sin JWT devuelve `401`.
2. Archivo invalido o mayor a 15 MB se rechaza.
3. URL devuelta comienza con `/uploads/`.
4. Publicacion/comentario conserva la URL tras recargar.

## Problemas locales conocidos

### SQL Server exige cifrado

Si aparece `The instance of SQL Server ... requires encryption`, revisar la cadena del entorno local y el certificado. `TrustServerCertificate=True` solo es aceptable en desarrollo controlado; no debe copiarse a produccion.

### Windows Event Log deniega acceso

El host puede ocultar el error original al intentar escribir en Event Log sin permisos. Para diagnostico local usar logging de consola/archivo o ejecutar con una configuracion que no registre en Event Log.

## Criterio de evidencia

Compilar no demuestra que GraphQL, autenticacion o persistencia funcionen. Si el runtime no puede iniciarse, registrar el bloqueo exacto en `specs/<feature>/evidence.md` y no declarar el flujo como verificado.
