# Runbook de desarrollo - OneITB23

**Ultima revision**: 2026-07-07

## Requisitos

- .NET SDK 8.
- Docker Desktop o Docker Engine con Compose para SQL Server local.
- Node.js compatible con Vite 8.
- Certificado HTTPS de desarrollo confiable.

## Backend

Antes de levantar el backend por primera vez, iniciar SQL Server en Docker y configurar el secreto local de conexion:

```powershell
Copy-Item .env.example .env
# Editar .env y definir ONEITB_SQL_SA_PASSWORD con un password fuerte local.
docker compose up -d

$password = ((Get-Content .env | Where-Object { $_ -like 'ONEITB_SQL_SA_PASSWORD=*' }) -replace '^ONEITB_SQL_SA_PASSWORD=', '')
$connection = "Server=localhost,1433;Database=OneItb;User Id=sa;Password=$password;Encrypt=False;TrustServerCertificate=True;"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" $connection --project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

`appsettings.Development.json` contiene un placeholder no usable. La cadena real de Development debe venir de `dotnet user-secrets` o de `ConnectionStrings__DefaultConnection`.

```powershell
dotnet restore "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Endpoints locales esperados:

- GraphQL HTTP/WebSocket: `https://localhost:44397/graphql`
- Upload REST: `https://localhost:44397/api/upload`
- Archivos: `https://localhost:44397/uploads/{file}`

### Credenciales de acceso por defecto (Data Seeder)

Una vez levantada la base de datos con el Seeder (requiere `ONEITB_SEED_DEMO_PASSWORD`), puedes iniciar sesión usando:

- **Usuario Admin:** `admin@itbeltran.com.ar`
- **Contraseña:** `<tu-ONEITB_SEED_DEMO_PASSWORD>` (o el valor ingresado en `.env` local)
- **Otros usuarios:** `student@itbeltran.com.ar`, `teacher@itbeltran.com.ar`, `moderator@itbeltran.com.ar`, `employer@itbeltran.com.ar` (todos comparten la misma contraseña configurada).

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
El perfil `OneITB` del backend escucha en el mismo puerto HTTPS para evitar diferencias entre `dotnet run`, Apollo y uploads.

## Docker productivo y servicios opcionales

El entorno local de desarrollo sigue usando `docker-compose.yml` solo para SQL Server. El compose productivo separado agrega Redis, API y frontend Nginx:

```powershell
$env:ONEITB_SQL_SA_PASSWORD = "<password-fuerte>"
$env:ONEITB_JWT_KEY = "<clave-jwt-de-32-caracteres-o-mas>"
$env:ONEITB_SEED_DEMO_PASSWORD = "<password-demo-fuerte>"
$env:ONEITB_CORS_ORIGIN = "http://localhost"

# Opcionales para produccion/cloud
$env:ONEITB_REDIS_CONNECTION = "oneitb-redis:6379,abortConnect=false"
$env:ONEITB_CLOUDINARY_URL = "cloudinary://api_key:api_secret@cloud_name"

docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Si `ConnectionStrings:Redis` no existe, HotChocolate usa Pub/Sub en memoria. Si `CloudinarySettings:Url` no existe, `/api/upload` escribe en disco local bajo `wwwroot/uploads`.

`ONEITB_SEED_DEMO_PASSWORD` es obligatorio para `docker-compose.prod.yml` porque la API inicializa cuentas demo/productivas en bases vacias sin versionar contrasenas. En Development, el host conserva el fallback local `Test1234!`; no usar ese fallback para produccion real.

Si el certificado HTTPS local no esta instalado o confiado:

```powershell
dotnet dev-certs https --check
dotnet dev-certs https --clean
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

## Validacion por tipo de cambio

### Gates locales obligatorios

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
Push-Location "FrontEnd/OneItb-FE"
npm.cmd run build
Pop-Location
git diff --check
```

El workflow `.github/workflows/quality-gates.yml` ejecuta estos gates en CI y agrega una verificacion de modelo EF sin secretos versionados.

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
3. URL devuelta comienza con `/uploads/` en modo local o es HTTPS de Cloudinary cuando `CloudinarySettings:Url` esta configurado.
4. Publicacion/comentario conserva la URL tras recargar.

## Problemas locales conocidos

### SQL Server Docker local

El runtime local canonico usa SQL Server 2022 en Docker para evitar dependencias de Windows Auth, SPN, Kerberos, LocalDB y `SQLEXPRESS`.

Comandos utiles:

```powershell
docker compose up -d
docker compose ps
docker inspect oneitb23-sql --format "{{json .State.Health}}"
docker compose logs oneitb-sql --tail 80
```

La cadena local validada usa SQL Auth contra `localhost,1433` y vive en user-secrets:

```powershell
$password = ((Get-Content .env | Where-Object { $_ -like 'ONEITB_SQL_SA_PASSWORD=*' }) -replace '^ONEITB_SQL_SA_PASSWORD=', '')
$connection = "Server=localhost,1433;Database=OneItb;User Id=sa;Password=$password;Encrypt=False;TrustServerCertificate=True;"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" $connection --project "API Graphql/OneITB/GraphQL.csproj"
```

`Encrypt=False` esta permitido solo en Development contra el contenedor local. No copiar esta cadena a produccion.

### SQL Server exige cifrado

Si aparece `The instance of SQL Server ... requires encryption`, revisar la cadena del entorno local y el certificado. `TrustServerCertificate=True` solo es aceptable en desarrollo controlado; no debe copiarse a produccion.

Configuracion historica reemplazada: antes se intento usar LocalDB para evitar dependencia de SPN/Kerberos de `localhost\SQLEXPRESS`, pero ese camino queda descartado para validaciones de specs:

Usar la cadena Docker documentada en la seccion anterior.

Si `sqllocaldb create` devuelve exito pero `sqllocaldb info MSSQLLocalDB` sigue informando que la instancia automatica no existe, el runtime LocalDB del host esta dañado o bloqueado por Windows. En ese caso no marcar runtime como verificado; usar SQL Auth por `user-secrets` o reparar LocalDB fuera del repo.

### SQL SSPI / Kerberos

`Failed to generate SSPI context` no es un error de certificado TLS. Es un problema de Windows Integrated Security, Kerberos o SPN contra la instancia SQL configurada.

Opciones locales permitidas:

1. Usar Docker SQL con SQL Auth mediante `dotnet user-secrets` o variable de entorno `ConnectionStrings__DefaultConnection`.
2. No commitear passwords.
3. Evitar `localhost\SQLEXPRESS` con Windows Auth y LocalDB para validaciones de specs.

Ejemplo de override local no versionado:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=OneItb;User Id=sa;Password=<local-secret>;Encrypt=False;TrustServerCertificate=True;" --project "API Graphql/OneITB/GraphQL.csproj"
```

### Windows Event Log deniega acceso

El host puede ocultar el error original al intentar escribir en Event Log sin permisos. Para diagnostico local usar logging de consola/archivo o ejecutar con una configuracion que no registre en Event Log.

El host actual limpia providers y registra Console/Debug en `Program.cs`; no registra Windows Event Log.

### Puerto HTTPS ocupado por IIS Express

Si `dotnet run` falla con `Failed to bind to address https://localhost:44397` o `SocketException (10013)`, revisar si IIS Express quedo activo desde Visual Studio:

```powershell
Get-Process iisexpress -ErrorAction SilentlyContinue
```

Cerrar solo IIS Express libera los binarios y el puerto local. Si Visual Studio mantiene archivos `Debug` bloqueados, validar con el build ya probado:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB -c Release --no-build
```

## Criterio de evidencia

Compilar no demuestra que GraphQL, autenticacion o persistencia funcionen. Si el runtime no puede iniciarse, registrar el bloqueo exacto en `specs/<feature>/evidence.md` y no declarar el flujo como verificado.
