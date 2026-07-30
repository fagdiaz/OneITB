# Runbook de desarrollo - OneITB23

**Ultima revision**: 2026-07-30

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
$jwtKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
dotnet user-secrets set "Jwt:Key" $jwtKey --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "Seed:DemoPassword" "<password-demo-local-fuerte>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

`appsettings.Development.json` contiene un placeholder no usable para SQL. La cadena real, la clave JWT y la contrasena del seeder deben venir de `dotnet user-secrets` o de variables de entorno. La clave JWT rastreada fue retirada: el host falla de forma explicita si falta o no alcanza 32 bytes y diversidad suficiente.

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

Una vez levantada la base de datos con el Seeder, puedes iniciar sesion usando usuarios generados por `EnterpriseDemoSeeder`. Todos comparten la contrasena configurada de forma externa en `Seed:DemoPassword` / `ONEITB_SEED_DEMO_PASSWORD`. No existe una contrasena fallback hardcodeada.

| Rol | Usuario demo |
|---|---|
| Administrador | `admin1@itbeltran.com.ar` |
| Moderador | `moderador1@itbeltran.com.ar` |
| Profesor | `profesor1.ads@itbeltran.com.ar` |
| Estudiante | `estudiante1.ads@itbeltran.com.ar` |
| Egresado | `egresado1@itbeltran.com.ar` |
| Empleador | `empleador1@itbeltran.com.ar` |

El seeder normal es idempotente y **no reemplaza hashes de cuentas existentes**. Cambiar
`Seed:DemoPassword` no cambia automaticamente la clave de una base ya poblada. Para
estandarizar todas las credenciales demo se debe ejecutar el rebaseline controlado
descrito a continuacion; no se deben editar hashes ni cuentas directamente en SQL.

### Rebaseline controlado de la base demo

Este procedimiento es destructivo y esta limitado por guardas al contenedor local
`oneitb23-sql`, puerto `1433` y base `OneItb`. Nunca debe ejecutarse contra una base
externa o productiva. Antes de eliminar la base, el script:

1. valida contenedor, destino, secretos, build Release y ausencia de drift EF;
2. crea un backup `COPY_ONLY` con checksum;
3. ejecuta `RESTORE VERIFYONLY`;
4. copia el `.bak` a `backups/local-demo/`, ruta ignorada por Git;
5. reconstruye el esquema exclusivamente desde migraciones;
6. inicia el seeder dos veces y exige inventarios identicos.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/reset-demo-database.ps1 `
  -ConfirmDatabaseReset

powershell -ExecutionPolicy Bypass -File scripts/validate-demo-database.ps1
```

El segundo comando es finito: inicia una API temporal compilada, valida integridad,
autentica los seis roles y prueba feed, academico, chat, notificaciones, empleos,
administracion, moderacion y upload. El proceso temporal y el archivo de prueba se
eliminan siempre en `finally`; SQL Docker queda disponible.

Inventario canonico esperado despues del rebaseline:

| Conjunto | Cantidad |
|---|---:|
| Cuentas / usuarios | 15 / 15 |
| Carreras / materias / correlatividades | 9 / 6 / 4 |
| Inscripciones `UserCareer` | 10 |
| Recursos / progresos academicos | 12 / 18 |
| Publicaciones / comentarios / reacciones | 60 / 80 / 240 |
| Reportes / interacciones sociales | 2 / 10 |
| Mensajes / preferencias / notificaciones | 280 / 120 / 127 |
| Ofertas / postulaciones | 4 / 6 |
| Filas CV normalizadas | 60 |

La evidencia de una ejecucion valida debe mostrar `RestoreVerifyOnly: PASS`,
`Idempotent: True`, `IntegrityViolations: 0` y `RoleLogins: 6`. Nunca copiar a
documentacion contrasenas, JWT, hashes, connection strings ni el password `sa`.

#### Restauracion de la base demo

Si la reconstruccion posterior al backup falla, usar exclusivamente el nombre
`BackupFile` informado por el script. El archivo verificado permanece en el contenedor
bajo `/var/opt/mssql/backup/` y existe una copia local ignorada:

```powershell
$backupName = "<BackupFile informado por el reset>"
$password = ((Get-Content .env | Where-Object {
  $_ -like 'ONEITB_SQL_SA_PASSWORD=*'
}) -replace '^ONEITB_SQL_SA_PASSWORD=', '')

$restoreSql = @"
IF DB_ID(N'OneItb') IS NOT NULL
BEGIN
  ALTER DATABASE [OneItb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
END;
RESTORE DATABASE [OneItb]
FROM DISK = N'/var/opt/mssql/backup/$backupName'
WITH REPLACE, CHECKSUM;
ALTER DATABASE [OneItb] SET MULTI_USER;
"@

docker exec oneitb23-sql /opt/mssql-tools18/bin/sqlcmd `
  -C -b -S localhost -U sa -P $password -d master -Q $restoreSql
```

Tras restaurar, ejecutar `scripts/validate-demo-database.ps1`. Si el `.bak` ya no se
encuentra dentro del contenedor, copiar primero la version local mediante
`docker cp`; no improvisar una recreacion parcial.

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

En desarrollo, el frontend usa por defecto rutas same-origin (`/graphql`, `/api` y
`/uploads`) que Vite reenvia al perfil HTTPS `OneITB` en
`https://localhost:44397`. Esto evita que la sesion del navegador dependa del almacen
de certificados particular de Firefox o Chromium. `VITE_GRAPHQL_URL` y
`VITE_GRAPHQL_WS_URL` tienen prioridad cuando se necesita apuntar a un host explicito.
El proxy con `secure: false` existe solo en el servidor de desarrollo de Vite; no
debilita TLS ni CORS del backend y no forma parte del bundle productivo.

## Docker productivo y servicios opcionales

El entorno local de desarrollo sigue usando `docker-compose.yml` solo para SQL Server. El compose productivo separado agrega Redis, API y frontend Nginx:

```powershell
$env:ONEITB_SQL_SA_PASSWORD = "<password-fuerte>"
$env:ONEITB_JWT_ISSUER = "https://oneitb.example.edu/"
$env:ONEITB_JWT_AUDIENCE = "https://oneitb.example.edu/"
$env:ONEITB_JWT_KEY = "<clave-jwt-de-32-caracteres-o-mas>"
$env:ONEITB_MAGIC_LINK_FRONTEND_URL = "https://oneitb.example.edu"
$env:ONEITB_CORS_ORIGIN = "http://localhost"

# Redis y Cloudinary son opcionales
$env:ONEITB_REDIS_CONNECTION = "oneitb-redis:6379,abortConnect=false"
$env:ONEITB_CLOUDINARY_URL = "cloudinary://api_key:api_secret@cloud_name"

# SMTP es obligatorio en Production
$env:ONEITB_SMTP_HOST = "smtp.example.edu"
$env:ONEITB_SMTP_PORT = "587"
$env:ONEITB_SMTP_USER = "oneitb@example.edu"
$env:ONEITB_SMTP_PASS = "<smtp-secret>"
$env:ONEITB_SMTP_FROM = "oneitb@example.edu"
$env:ONEITB_SMTP_ENABLE_SSL = "true"

# Demo data queda deshabilitada por defecto en Production
$env:ONEITB_SEED_ENABLE_DEMO_DATA = "false"

# Microsoft Entra es opcional y queda deshabilitado sin App Registrations
$env:ONEITB_ENTRA_ENABLED = "false"

docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Si `ConnectionStrings:Redis` no existe, HotChocolate usa Pub/Sub en memoria. Si `CloudinarySettings:Url` no existe, `/api/upload` escribe en disco local bajo `wwwroot/uploads`. En Development, la ausencia total de SMTP activa `PickupDirectoryEmailService` y escribe archivos `.eml` ignorados bajo `API Graphql/OneITB/App_Data/MailDrop`; una configuracion SMTP parcial falla para evitar falsos positivos. En Production, SMTP completo es obligatorio.

`ONEITB_SEED_DEMO_PASSWORD` solo es obligatorio cuando `ONEITB_SEED_ENABLE_DEMO_DATA=true`. El seeder usa la misma politica BCrypt inyectada que el registro y no contiene contrasenas por defecto.

### SMTP real para cambios de postulacion

La plataforma envia correos cuando el empleador cambia una postulacion a `Reviewed` o `Rejected`. El envio real se activa solo si estas claves existen:

```powershell
dotnet user-secrets set "SmtpSettings:Host" "smtp.example.edu" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:Port" "587" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:User" "oneitb@example.edu" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:Pass" "<smtp-secret>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:From" "oneitb@example.edu" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:EnableSsl" "true" --project "API Graphql/OneITB/GraphQL.csproj"
```

No versionar credenciales SMTP. Para una demo local sin proveedor real, dejar todas las claves SMTP vacias y abrir el archivo `.eml` mas reciente de `App_Data/MailDrop`. El cuerpo y las credenciales temporales nunca se escriben en logs.

### Magic Link de empleadores

`requestMagicLink` devuelve solamente `{ accepted, message }`. La credencial aleatoria se envia en el fragmento `#token=` del enlace, se persiste como digest SHA-256 y se consume una sola vez. Al abrir el enlace, React retira el fragmento de la barra de direcciones antes de permitir el login.

En Development:

1. solicitar el enlace desde `/employer-login`;
2. abrir el `.eml` nuevo de `API Graphql/OneITB/App_Data/MailDrop`;
3. navegar al enlace incluido;
4. confirmar el acceso;
5. comprobar que el mismo enlace falla al reutilizarse.

### Microsoft Entra ID institucional

La integracion usa Authorization Code + PKCE en la SPA y un access token delegado
destinado a la API OneITB. No usa Google, Microsoft Graph como audiencia, implicit flow
ni client secret en React.

#### 1. Registrar la API

1. En Microsoft Entra admin center, crear una App Registration con tipo de cuenta
   **Accounts in this organizational directory only**.
2. Conservar `Directory (tenant) ID` y `Application (client) ID`.
3. En **Expose an API**, definir el Application ID URI `api://<API_CLIENT_ID>`.
4. Crear el scope delegado `access_as_user`; habilitarlo para usuarios o
   administradores segun la politica institucional.
5. En el manifest de la API, establecer `requestedAccessTokenVersion` en `2`.

#### 2. Registrar la SPA

1. Crear una segunda App Registration single-tenant.
2. En **Authentication**, agregar plataforma **Single-page application**.
3. Registrar exactamente `http://localhost:5173/login` y la URL `/login` del ambiente
   desplegado; no utilizar comodines.
4. En **API permissions**, agregar el permiso delegado
   `api://<API_CLIENT_ID>/access_as_user` y completar el consentimiento que exija el
   tenant.
5. No crear ni copiar un client secret a Vite. Tenant ID, client IDs, scope y redirect
   URI son identificadores publicos; los tokens siguen siendo credenciales efimeras.

#### 3. Configurar el backend

```powershell
dotnet user-secrets set "EntraId:Enabled" "true" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:TenantId" "<TENANT_ID>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:ClientId" "<API_CLIENT_ID>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:Audience" "<API_CLIENT_ID>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:RequiredScope" "access_as_user" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:AllowedDomain" "itbeltran.com.ar" --project "API Graphql/OneITB/GraphQL.csproj"
```

Una configuracion backend parcial con `Enabled=true` detiene el arranque. Con
`Enabled=false`, password local y Magic Link continuan disponibles.

#### 4. Configurar la SPA

Crear `FrontEnd/OneItb-FE/.env.local` (ignorado por Git):

```dotenv
VITE_ENTRA_CLIENT_ID=<SPA_CLIENT_ID>
VITE_ENTRA_TENANT_ID=<TENANT_ID>
VITE_ENTRA_API_SCOPE=api://<API_CLIENT_ID>/access_as_user
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/login
```

La accion Microsoft se oculta si faltan valores. MSAL usa `sessionStorage`; al cerrar
o reemplazar una sesion, OneITB purga MSAL, Apollo y WebSocket. Una cuenta nueva recibe
rol `Estudiante`. El primer enlace automatico de cuentas `Administrador`, `Moderador`,
`Profesor` o `Empleador` se rechaza y requiere una vinculacion institucional
preaprobada; esos usuarios conservan el login local mientras tanto.

#### 5. Gate de aceptacion real

La implementacion local se valida con tests, migracion, build y schema GraphQL. Para
elevarla de `[I]` a `[V]` se requiere una cuenta Microsoft 365 institucional real:

1. iniciar sesion desde `/login`;
2. comprobar que el consentimiento solicita solo el scope OneITB;
3. verificar el alta/vinculacion y el Boolean `institutionalAccountLinked`;
4. cerrar sesion y confirmar que no quedan datos de la cuenta anterior;
5. rechazar un token de otro tenant, audiencia o dominio;
6. conservar evidencia sin copiar access tokens, authorization codes ni JWT.

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

### Gate predefensa reproducible

El validador consolidado ejecuta tests, builds, consistencia del modelo EF, parseo de
Compose, auditoria de dependencias y controles de higiene sin dejar servidores activos:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-predefense.ps1
```

El modo runtime esta deshabilitado por defecto. Solo debe habilitarse en una ventana de
mantenimiento expresamente aprobada, contra una base de demostracion respaldada:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-predefense.ps1 -IncludeRuntime
```

Ese modo usa un puerto temporal configurable, datos acotados y un bloque `finally` para
restaurar silenciamientos, eliminar uploads/correos de prueba y detener el proceso que
inicio. No debe utilizarse para el ensayo ordinario de rate limiting si la politica
operativa vigente prohibe levantar instancias.

Interpretacion del resultado:

- `PASS`: gate ejecutado y resultado observado.
- `BLOCKED`: falta configuracion externa, acceso a Docker/registry o aprobacion
  institucional; no equivale a un fallo del codigo.
- `SKIPPED`: gate no solicitado en esa ejecucion.
- `FAIL`: defecto reproducible que impide el cierre.

Los proveedores SMTP, Redis y Cloudinary solo pueden elevarse a verificados usando
secretos no versionados. La auditoria npm debe informar por severidad: en el corte
2026-07-28 no hay vulnerabilidades altas o criticas; permanecen dos avisos moderados
upstream de React Router 6.30.4. OneITB es SPA sin SSR y sanitiza destinos internos de
notificaciones antes de entregarlos a React Router. La rama 7.x no se adopto durante
Code Freeze porque su corte evaluado introducia vulnerabilidades altas.

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

Si `sqllocaldb create` devuelve exito pero `sqllocaldb info MSSQLLocalDB` sigue informando que la instancia automatica no existe, el runtime LocalDB del host esta danado o bloqueado por Windows. En ese caso no marcar runtime como verificado; usar SQL Auth por `user-secrets` o reparar LocalDB fuera del repo.

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
