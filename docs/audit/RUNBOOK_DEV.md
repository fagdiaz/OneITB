# Runbook de desarrollo, validación y recuperación - OneITB23

| Dato de control | Valor |
|---|---|
| **Última revisión contra repositorio** | 3 de agosto de 2026 |
| **Entorno local canónico** | Windows + PowerShell + SQL Server 2022 en Docker |
| **Backend** | `https://localhost:44397` y `http://localhost:5000` mediante perfil `OneITB` |
| **Frontend** | `http://localhost:5173` mediante Vite |
| **Base local** | `localhost,1433`, base `OneItb`, SQL Auth y secreto fuera de Git |
| **Propósito** | Instalar, iniciar, validar, recuperar y preparar la demo sin conocimiento implícito |
| **Fuente de arquitectura** | `docs/project_docs/architecture-and-design.md` |
| **Fuente de estado** | `docs/project_docs/ROADMAP.md` |

Este runbook contiene operaciones concretas. No acredita por sí mismo que una ejecución
haya ocurrido: cada validación debe conservar fecha, SHA, ambiente y resultado. Los comandos
se clasifican para evitar confundir una comprobación finita con un servidor bloqueante o una
reconstrucción destructiva.

---

## 1. Convenciones de seguridad y operación

### 1.1 Clasificación de comandos

| Clase | Ejemplos | Regla |
|---|---|---|
| **Finito y no destructivo** | build, tests, `docker compose config`, drift EF | Puede usarse como gate ordinario |
| **Finito con infraestructura temporal** | `validate-local-infrastructure.ps1` | Inicia contenedores con `-d` y los elimina en `finally` salvo opción explícita |
| **Finito con backend temporal** | `validate-demo-database.ps1`, `validate-predefense.ps1 -IncludeRuntime` | Inicia un proceso aislado, espera readiness y lo detiene; requiere ventana aprobada |
| **Bloqueante interactivo** | `dotnet run`, `npm.cmd run dev` | Ejecutar en terminales dedicadas; finalizar con `Ctrl+C` |
| **Destructivo** | `reset-demo-database.ps1 -ConfirmDatabaseReset` | Solo base demo local, backup verificado y confirmación explícita |
| **Externo** | SMTP/Cloudinary/Entra reales | Requiere credenciales, consentimiento y evidencia sin secretos |

### 1.2 Reglas obligatorias

1. Ejecutar comandos desde la raíz del repositorio, salvo que se indique otro directorio.
2. No copiar secretos, JWT, hashes, connection strings ni passwords a documentación, logs o commits.
3. No usar LocalDB ni `SQLEXPRESS` con Windows Auth para validar el proyecto.
4. No ejecutar el reset si el destino no es exactamente contenedor `oneitb23-sql`, puerto 1433 y base `OneItb`.
5. No presentar una plantilla Docker como despliegue productivo aceptado.
6. No ejecutar simultáneamente un backend manual y un validador runtime sobre el mismo puerto.
7. No compartir `inyectar-secretos.ps1`, `.env`, `.env.local` ni el contenido de user-secrets.

### 1.3 Directorios y archivos sensibles ignorados

```powershell
git check-ignore -v .env
git check-ignore -v inyectar-secretos.ps1
git check-ignore -v FrontEnd/OneItb-FE/.env
git check-ignore -v FrontEnd/OneItb-FE/.env.local
```

Los cuatro comandos deben mostrar una regla. Si alguno no está ignorado, detener la
operación antes de agregar archivos a Git. `inyectar-secretos.ps1` es un helper local, no
una fuente canónica ni un entregable. Debe ejecutarse con `-NoStartPrompt` cuando solo se
quiera configurar secretos sin abrir procesos:

```powershell
powershell -ExecutionPolicy Bypass -File .\inyectar-secretos.ps1 -NoStartPrompt
```

Antes de ejecutarlo, comprobar manualmente que el callback sea
`http://localhost:5173/auth/microsoft/callback`. No imprimir ni pegar sus valores en
evidencias. Si el archivo o una captura con valores reales salió del equipo, rotar las
credenciales afectadas.

---

## 2. Requisitos verificables

| Componente | Versión/condición |
|---|---|
| .NET SDK | 8.x; el equipo auditado dispone de 9.x compatible, pero el target es `net8.0` |
| EF CLI | `dotnet-ef` 8.0.6 |
| Node.js | `^20.19.0` o `>=22.12.0`, requerido por Vite 8 |
| npm | Compatible con el Node elegido y `package-lock.json` |
| Docker | Engine/Desktop activo con Compose v2 |
| PowerShell | 5.1 o superior para scripts `.ps1` |
| Certificado | Certificado HTTPS de desarrollo confiable para acceso directo al backend |
| Puertos | 1433 SQL, 44397 HTTPS API, 5000 HTTP API, 5173 Vite; 16379/11025/18025 para aceptación |

Comprobación inicial:

```powershell
dotnet --info
dotnet ef --version
node --version
npm.cmd --version
docker version
docker compose version
```

Si `dotnet ef` no existe:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.6
```

Si existe con otra versión compatible pero se requiere reproducibilidad exacta:

```powershell
dotnet tool update --global dotnet-ef --version 8.0.6
```

---

## 3. Preparación inicial del entorno local

### 3.1 Crear configuración Docker local

No sobrescribir un `.env` existente:

```powershell
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}
```

Editar `.env` y reemplazar `ONEITB_SQL_SA_PASSWORD` por una contraseña local fuerte. Los
valores de ejemplo no son credenciales válidas para un ambiente compartido.

Validar y levantar únicamente SQL en segundo plano:

```powershell
docker compose config --quiet
docker compose up -d oneitb-sql
docker compose ps
docker inspect oneitb23-sql --format "{{json .State.Health}}"
```

Continuar solo cuando el estado sea `healthy`.

### 3.2 Configurar user-secrets backend

```powershell
$password = ((Get-Content .env | Where-Object {
  $_ -like 'ONEITB_SQL_SA_PASSWORD=*'
}) -replace '^ONEITB_SQL_SA_PASSWORD=', '')

if ([string]::IsNullOrWhiteSpace($password)) {
  throw "ONEITB_SQL_SA_PASSWORD no está definido en .env"
}

$connection = "Server=localhost,1433;Database=OneItb;User Id=sa;Password=$password;Encrypt=False;TrustServerCertificate=True;"
$jwtKey = [Convert]::ToBase64String(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(48))

dotnet user-secrets set "ConnectionStrings:DefaultConnection" $connection `
  --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "Jwt:Key" $jwtKey `
  --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "Seed:DemoPassword" "<PASSWORD_DEMO_LOCAL_FUERTE>" `
  --project "API Graphql/OneITB/GraphQL.csproj"
```

La cadena de `appsettings.Development.json` contiene un placeholder deliberadamente
inutilizable. User-secrets debe prevalecer. `Encrypt=False` y
`TrustServerCertificate=True` solo se admiten contra el contenedor Development local.

### 3.3 Restaurar dependencias

```powershell
dotnet restore "API Graphql/OneITB/GraphQL.csproj"
dotnet restore "API Graphql/Tests/Services.Tests/Services.Tests.csproj"

Push-Location "FrontEnd/OneItb-FE"
npm.cmd ci
Pop-Location
```

Los gates usan `--no-restore`; esta preparación debe completarse primero.

### 3.4 Aplicar migraciones

```powershell
dotnet ef migrations list `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"

dotnet ef database update `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

El modelo vigente contiene 34 migraciones, hasta `AddEmployerOnboardingWorkflow`. El
número sirve como control de orientación y debe actualizarse si se crea una migración.

### 3.5 Certificado HTTPS

```powershell
dotnet dev-certs https --check
dotnet dev-certs https --check --trust
```

Solo si el certificado está dañado o no confiado:

```powershell
dotnet dev-certs https --clean
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

`--clean` elimina certificados de desarrollo existentes y puede afectar otros proyectos;
no usarlo como primer intento.

---

## 4. Inicio y detención ordinarios

### 4.1 Terminal 1 - Backend

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Es bloqueante. Mantener esa terminal abierta y detener con `Ctrl+C`. Endpoints directos:

- Health agregado: `https://localhost:44397/health`
- Liveness del proceso: `https://localhost:44397/health/live`
- Readiness SQL: `https://localhost:44397/health/ready`
- GraphQL HTTP/WS: `https://localhost:44397/graphql`
- Upload: `https://localhost:44397/api/upload`
- Archivos locales: `https://localhost:44397/uploads/{file}`

### 4.2 Terminal 2 - Frontend

```powershell
Push-Location "FrontEnd/OneItb-FE"
npm.cmd run dev
```

También es bloqueante. La aplicación se abre en `http://localhost:5173`. Vite usa rutas
same-origin `/graphql`, `/api` y `/uploads` y las proxyea al backend HTTPS con
`secure:false` solo dentro del servidor de desarrollo.

### 4.3 Detención

1. Presionar `Ctrl+C` en Vite.
2. Presionar `Ctrl+C` en backend.
3. Mantener SQL activo entre sesiones o detenerlo sin borrar volumen:

```powershell
docker compose stop oneitb-sql
```

Para volver a iniciarlo:

```powershell
docker compose up -d oneitb-sql
```

No usar `docker compose down -v`: elimina el volumen de datos.

### 4.4 Verificar perfil y modo de almacenamiento

1. Revisar el log de inicio del backend. Debe informar un único modo seleccionado
   (`Local` o `Cloudinary`) sin imprimir URL de proveedor, clave, secreto ni connection
   string.
2. Confirmar que Development carga `FileStorage:Provider=Local` desde
   `appsettings.Development.json`. El modo ya no se infiere por ausencia de URL. Para un
   smoke cloud local, usar secretos no versionados:

   ```powershell
   dotnet user-secrets set "FileStorage:Provider" "Cloudinary" --project "API Graphql/OneITB/GraphQL.csproj"
   dotnet user-secrets set "CloudinarySettings:Url" "cloudinary://API_KEY:API_SECRET@CLOUD_NAME" --project "API Graphql/OneITB/GraphQL.csproj"
   ```

   No registrar ni copiar el valor real en evidencia. Un provider ausente/desconocido,
   `Local` fuera de Development o Cloudinary incompleto deben impedir el inicio con un
   mensaje sanitizado; nunca existe fallback automático después de seleccionar cloud.
3. Autenticarse, abrir `/profile/edit` con throttling de red y confirmar que el formulario
   completo permanece en skeleton hasta recibir el `me` de la identidad activa. No deben
   aparecer valores parciales provenientes del token o de una sesión anterior.
4. Modificar un campo y provocar un refetch: el borrador no debe cambiar. Cancelar debe
   volver al perfil sin persistirlo.
5. Editar un avatar y comprobar en Network que `POST /api/upload` incluye JWT y responde
   `fileUrl` más `storageMode`. Ante `503`, debe devolver
   `UPLOAD_STORAGE_UNAVAILABLE`, `correlationId`, modo y `retryable=true`, sin detalles
   del proveedor. Antes de Guardar, la URL es solo candidata y no hay reintento automático.
6. Guardar y recargar `/profile`, `/profile/edit` y el header. Los tres deben mostrar la
   misma URL confirmada. Repetir con fallo de upload y fallo de `updateProfile`: el avatar
   anterior y el resto del borrador deben preservarse.
7. Repetir logout/login con otra cuenta y confirmar que no quedan datos, previews ni
   requests de la identidad anterior.

El modo Cloudinary solo puede marcarse aceptado después de configurar secretos reales en
el ambiente objetivo y completar upload, asociación GraphQL, lectura y refresh. Las pruebas
de selección de DI demuestran configuración, no disponibilidad del proveedor.

---

## 5. Seed y cuentas de demostración

En Development, `Seed:EnableDemoData=true`. El arranque ejecuta `DbInitializer` de forma
idempotente si existe `Seed:DemoPassword`. Un error de seed se registra; no debe asumirse
que la base quedó lista solo porque Kestrel inició.

### 5.1 Identidades canónicas

| Rol | Email |
|---|---|
| Administrador | `admin1@itbeltran.com.ar` |
| Moderador | `moderador1@itbeltran.com.ar` |
| Profesor | `profesor1.ads@itbeltran.com.ar` |
| Estudiante | `estudiante1.ads@itbeltran.com.ar` |
| Egresado | `egresado1@itbeltran.com.ar` |
| Empleador | `empleador1@itbeltran.com.ar` |

Todos usan el valor local de `Seed:DemoPassword`. El seeder no reescribe hashes existentes:
cambiar el secreto no cambia cuentas ya creadas. No editar hashes manualmente en SQL.

### 5.2 Inventario canónico tras rebaseline

| Conjunto | Cantidad |
|---|---:|
| Accounts / Users | 15 / 15 |
| Careers / Subjects / Prerequisites | 9 / 6 / 4 |
| UserCareer | 10 |
| AcademicResource / AcademicProgress | 12 / 18 |
| Inquiry / Comment / Reaction | 60 / 80 / 240 |
| Report / UserInteraction | 2 / 10 |
| Message / Preference / Notification | 280 / 120 / 127 |
| JobOffer / JobApplication | 4 / 6 |
| Filas CV normalizadas | 60 |

Validar inventario, integridad y seis logins con el procedimiento de la sección 9.3.

---

## 6. Ciclo de Entity Framework Core

### 6.1 Comprobación ordinaria

```powershell
dotnet ef migrations has-pending-model-changes `
  --configuration Release `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Exit code cero significa que el modelo coincide con snapshot/migraciones; no demuestra
que la migración esté aplicada en una base particular.

### 6.2 Crear una migración

Solo después de revisar modelo, constraints, índices y estrategia de datos:

```powershell
dotnet ef migrations add <MigrationName> `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

Antes de aplicar:

1. Revisar `Up`, `Down` y snapshot.
2. Confirmar que renombres usan `RenameColumn`/`RenameTable` y no drop/create accidental.
3. Confirmar `DeleteBehavior.Restrict` en nuevas relaciones de dominio.
4. Revisar índices únicos, filtros y constraints.
5. Definir backfill si la columna no admite null.
6. Crear backup si hay datos relevantes.

### 6.3 Aplicación

```powershell
dotnet ef database update `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

No aplicar migraciones de prueba a producción desde una notebook de desarrollo.

---

## 7. Rebaseline y restauración de la base demo

### 7.1 Advertencia

El rebaseline **elimina la base `OneItb` local**. Sus guardas limitan contenedor, puerto y
nombre, crean backup `COPY_ONLY` con checksum, ejecutan `RESTORE VERIFYONLY`, copian el
`.bak` a almacenamiento ignorado, migran y ejecutan seed dos veces.

Cerrar backend/IIS Express antes de comenzar. Restaurar dependencias previamente porque el
script usa `--no-restore`.

### 7.2 Ejecución

```powershell
powershell -ExecutionPolicy Bypass -File scripts/reset-demo-database.ps1 `
  -ConfirmDatabaseReset

powershell -ExecutionPolicy Bypass -File scripts/validate-demo-database.ps1
```

Ambos scripts son finitos, pero inician APIs temporales con `Start-Process` y las detienen en
`finally`. No ejecutarlos si una política de la sesión prohíbe iniciar servidores.

Evidencia mínima esperada:

- `RestoreVerifyOnly: PASS`
- `Idempotent: True`
- `IntegrityViolations: 0`
- `RoleLogins: 6`

### 7.3 Restauración

Usar exclusivamente `BackupFile` informado por el reset:

```powershell
$backupName = "<BackupFile informado>"
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

Si solo existe la copia local `backups/local-demo/`, copiarla primero al contenedor con
`docker cp`. Después ejecutar `validate-demo-database.ps1`.

---

## 8. Frontend y configuración Microsoft

### 8.1 Variables frontend

El archivo rastreado `.env.example` contiene identificadores vacíos y el callback correcto:

```dotenv
VITE_ENTRA_CLIENT_ID=
VITE_ENTRA_TENANT_ID=
VITE_ENTRA_API_SCOPE=
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback
```

Copiar a `.env.local` o usar el helper ignorado. `VITE_ENTRA_CLIENT_ID` es canónico;
`VITE_MICROSOFT_CLIENT_ID` es alias temporal y no debe tener un valor distinto.

### 8.2 App Registration API

1. Tipo: cuentas en cualquier directorio organizativo.
2. Exponer `api://<API_CLIENT_ID>`.
3. Crear scope delegado `access_as_user`.
4. Configurar `requestedAccessTokenVersion: 2`.
5. No usar Microsoft Graph como audience del token enviado a OneITB.

### 8.3 App Registration SPA

1. Aplicación pública, sin client secret.
2. Plataforma Single-page application.
3. Redirect exacto local: `http://localhost:5173/auth/microsoft/callback`.
4. Confirmar que la aplicación SPA sea la misma cuyo `Application (client) ID` figura en
   `VITE_ENTRA_CLIENT_ID`; registrar la URI en otra App Registration no corrige
   `AADSTS50011`.
5. Registrar el equivalente HTTPS del ambiente desplegado. HTTP solo se admite para
   `localhost`/loopback de desarrollo y el frontend rechaza HTTP en hosts remotos.
6. Guardar y contemplar una breve propagación antes del smoke.
7. Agregar permiso delegado `api://<API_CLIENT_ID>/access_as_user` y consentimiento.
8. No registrar `/login`: reproduce el flujo anidado que la Spec 200 eliminó.

### 8.4 Backend Entra

```powershell
dotnet user-secrets set "EntraId:Enabled" "true" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:TenantId" "common" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:ClientId" "<API_CLIENT_ID>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:Audience" "<API_CLIENT_ID>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:RequiredScope" "access_as_user" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "EntraId:AllowedDomain" "itbeltran.com.ar" --project "API Graphql/OneITB/GraphQL.csproj"
```

`TenantId=common` es válido. Una configuración parcial con `Enabled=true` debe impedir el
arranque. Con `false`, password y Magic Link continúan funcionando.

### 8.5 Gate manual Entra

1. Login redirige y vuelve exclusivamente por callback, sin popup ni bucle.
2. Consentimiento solicita solo el scope OneITB.
3. `institutionalAccountLinked` queda verdadero para la propia identidad.
4. Cuenta nueva recibe Estudiante y onboarding académico si no tiene carreras.
5. Logout elimina Apollo, WS, sesión local y estado MSAL.
6. Tokens de otra audience, tenant no admitido o dominio son rechazados.
7. No capturar tokens, authorization codes ni JWT en evidencia.

Hasta completar este recorrido con una cuenta Microsoft 365 real, Entra permanece `[I]/[B]`
según el gate del Roadmap.

---

## 9. Gates automatizados

### 9.1 Matriz de scripts

| Script | Inicia servidor web | Infra temporal | Destructivo | Uso |
|---|---|---|---|---|
| `validate-predefense.ps1` | No por defecto | No | No | Baseline conjunto, drift, Compose, npm audit y Git |
| `validate-predefense.ps1 -IncludeRuntime` | Sí, temporal | No | Muta fixtures y restaura | Aceptación GraphQL/upload/Magic Link aprobada |
| `validate-local-infrastructure.ps1` | No | Redis + Mailpit en `-d` | No | Integración Redis/SMTP y suites completas |
| `validate-demo-database.ps1` | Sí, temporal | Usa SQL existente | No, salvo fixtures que limpia | Inventario, seis roles y smoke de dominios |
| `reset-demo-database.ps1 -ConfirmDatabaseReset` | Sí, temporal para seed | Usa SQL existente | **Sí** | Backup, drop, migración y seed canónico |

### 9.2 Gate estático predefensa

Precondiciones: SQL healthy, user-secrets de conexión/seed, restores completos y Docker
accesible. El modo default no inicia backend:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-predefense.ps1
```

Ejecuta backend tests, frontend tests, builds, drift EF, parse Compose, salud SQL, npm audit,
`git diff --check`, cobertura de cancelación y estado de proveedores.

### 9.3 Gate integral de base demo

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-demo-database.ps1
```

Inicia una API temporal en puerto 5097, valida integridad, seis roles, aislamiento JWT,
feed, académico, chat, notificaciones, empleo, Admin, Moderador y upload, y limpia proceso/
archivo en `finally`.

### 9.4 Redis y SMTP local

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-local-infrastructure.ps1
```

El script levanta Redis 16379 y Mailpit SMTP 11025/UI 18025 en modo detached, ejecuta
tests de infraestructura, sesión, suites, builds y drift, verifica que SQL no cambió y
elimina los contenedores al terminar. `-KeepContainers` solo se usa para inspección manual.

### 9.5 Runtime predefensa explícito

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-predefense.ps1 -IncludeRuntime
```

Inicia una API temporal en 5094, prueba GraphQL, los seis roles, upload, paginación,
silenciamiento y Magic Link, restaura estado y detiene el proceso. No usar para una prueba
ordinaria de rate limiting si la sesión prohíbe servidores.

### 9.6 Interpretación

| Resultado | Significado |
|---|---|
| PASS | Comando ejecutado y resultado observado |
| FAIL | Defecto reproducible o cleanup incompleto |
| BLOCKED | Falta proveedor, credencial, red, Docker o aprobación externa |
| SKIPPED | Gate no solicitado; no equivale a PASS |

---

## 10. Gates manuales por rol

Ejecutar sobre dos perfiles de navegador aislados cuando se valida realtime. Registrar
solo capturas sin PII sensible ni tokens.

### 10.1 Estudiante

- Login local y, si corresponde, onboarding de carrera.
- Feed acotado a carreras, publicación, adjuntos, comentarios y reacciones.
- Perfil/CV, privacidad, recursos y progreso propio.
- Chat, badges y notificaciones.
- Postulación laboral y constancia.

### 10.2 Profesor

- Recursos académicos y estudiantes por materia.
- Carga de progreso con actor autorizado.
- Confirmar que materias de carreras vinculadas permiten gestión.
- Confirmar que una materia fuera de sus carreras devuelve rechazo controlado y no
  persiste recursos ni progreso (política equivalente cerrada en Spec 201).

### 10.3 Egresado

- Perfil/CV, muro permitido, recursos y Bolsa de Trabajo.
- Postulación y seguimiento de estado.

### 10.4 Empleador

- Magic Link single-use y acceso al Gestor de Ofertas y Postulaciones.
- Crear oferta, ver postulantes propios, cambiar estado y notificación/correo.
- Denegar acceso a ofertas ajenas y funciones académicas/Admin.

### 10.5 Moderador

- Reportes, hide/restore, silenciamiento y `ModerationAudit`.
- No editar texto ajeno ni ejecutar funciones Admin-only.

### 10.6 Administrador

- Usuarios, carreras, materias, reportes, contenido, auditoría y solicitudes empresariales.
- Aprobar/rechazar/reintentar onboarding B2B.
- Proteger cuentas Administrador de cambio/desactivación.
- Smoke SMTP solo desde rol Admin.

### 10.7 Sesión y realtime

1. Abrir usuario A en perfil normal y B en perfil privado/incógnito.
2. Enviar mensaje A -> B y verificar topic/badge.
3. Marcar leído y confirmar conteo no leído.
4. Cerrar A, ingresar con otra identidad y comprobar cache/WS limpios.
5. Repetir notificación sin fuga entre usuarios.

---

## 11. Correo, Magic Link y onboarding B2B

### 11.1 Development sin SMTP real

Si todas las claves SMTP están vacías, `PickupDirectoryEmailService` escribe `.eml` en:

```text
API Graphql/OneITB/App_Data/MailDrop
```

La carpeta está ignorada. Una configuración SMTP parcial falla para evitar falsos positivos.

### 11.2 SMTP por user-secrets

```powershell
dotnet user-secrets set "SmtpSettings:Host" "<HOST>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:Port" "587" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:User" "<USER>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:Pass" "<SECRET>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:From" "<FROM>" --project "API Graphql/OneITB/GraphQL.csproj"
dotnet user-secrets set "SmtpSettings:EnableSsl" "true" --project "API Graphql/OneITB/GraphQL.csproj"
```

No incluir valores reales en evidencias. Para aceptación local preferir Mailpit.

### 11.3 Solicitud empresarial

1. Enviar `/empleos/solicitud`.
2. Admin abre Solicitudes de Empleadores.
3. Aprobar o rechazar con confirmación.
4. Aprobación repetida no crea otra cuenta.
5. Verificar Outbox `Pending`/`Delivered` y correo pickup/Mailpit.
6. Consumir Magic Link una vez; el replay debe fallar.
7. Si SMTP falla, corregir configuración y usar Reintentar envío; no editar SQL.

La respuesta pública es intencionalmente genérica y no debe utilizarse para diagnosticar
duplicados. Esa información pertenece al panel Admin.

---

## 12. Plantilla Docker de producción

### 12.1 Validación sin despliegue

```powershell
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml build
```

Para `config`, definir las variables obligatorias en la sesión sin imprimirlas. No guardarlas
en scripts rastreados.

### 12.2 Inicio detached

```powershell
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

El compose incluye SQL, Redis, API y Nginx. SMTP es obligatorio en Production; demo seed
está deshabilitado. Cloudinary y Entra son opcionales por configuración. La API exige
`ONEITB_DB_CONNECTION_STRING` completa como secreto: debe incluir `Encrypt=True`,
`TrustServerCertificate=False` y apuntar a un SQL con certificado verificable. La
contraseña SA del contenedor no reemplaza esa cadena de aplicación.

### 12.3 Limitaciones que impiden certificar producción

- `GAP-INFRA-01`: la plantilla ya no embebe `TrustServerCertificate=True`; su cierre
  productivo requiere inyectar la cadena segura y comprobar handshake TLS contra el SQL
  real. Sin esa evidencia, permanece como gate de destino.
- `GAP-FILE-01`: `/uploads` local no autoriza por objeto; usar storage privado/URLs firmadas.
- Disco local no permite múltiples réplicas coherentes; usar storage compartido.
- La API expone `/health/live`, `/health/ready`, correlation ID y logs estructurados; faltan
  plataforma central, alertas, backup/restore de destino, rollback e incident response.
- SMTP, Redis administrado, Cloudinary y Entra requieren smokes con secretos reales.

Por estas razones `docker-compose.prod.yml` es una plantilla productiva implementada, no
evidencia de una producción aceptada.

---

## 13. Troubleshooting

### 13.1 Login devuelve NetworkError/CORS null

Orden de diagnóstico:

1. Confirmar que backend sigue ejecutándose y `/health` responde.
2. Confirmar que Vite usa `/graphql` same-origin y no una URL antigua absoluta.
3. Revisar Network: si no hay status HTTP, suele ser backend caído/certificado, no CORS lógico.
4. Abrir una vez `https://localhost:44397/health` y aceptar el certificado Development si corresponde.
5. Verificar perfil `OneITB` y puerto 44397.

### 13.2 Credenciales demo rechazadas

- Verificar que se usa exactamente el valor actual de `Seed:DemoPassword`.
- Recordar que cambiar el secreto no rehashea cuentas existentes.
- Ejecutar `validate-demo-database.ps1` para seis logins.
- Si se necesita normalizar passwords, usar rebaseline con backup; no editar hash SQL.

### 13.3 `AADSTS50011` - redirect URI no registrada

Este error ocurre antes de que Microsoft devuelva el control a OneITB. Significa que la
URI enviada por la SPA no coincide exactamente con una URI de la App Registration
indicada por el `client_id` de la solicitud.

1. En la URL de `authorize`, confirmar el `client_id` esperado y decodificar
   `redirect_uri`.
2. Abrir **Microsoft Entra ID > App registrations > OneITB > Authentication**.
3. En la plataforma **Single-page application (SPA)**, registrar exactamente
   `http://localhost:5173/auth/microsoft/callback`.
4. Verificar esquema, host, puerto, path y slash final; no agregar query, fragmento ni
   wildcard.
5. Guardar, esperar la propagación y repetir desde una pestaña limpia. Reiniciar Vite
   únicamente si cambió `.env`.

No intentar corregirlo ampliando CORS, deshabilitando CSP, agregando client secrets a la
SPA ni restaurando `loginPopup`. Los mensajes de CSP `unsafe-inline`, BSSO no soportado,
cookies particionadas, `Me.htm` en Quirks Mode o CORS de `OneCollector` pertenecen a
páginas/telemetría de Microsoft y no son la causa de `AADSTS50011`.

### 13.4 `block_nested_popups` o callback en Login

- Confirmar `VITE_ENTRA_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback`.
- Confirmar la misma URI exacta en App Registration SPA.
- Reiniciar Vite después de cambiar `.env`.
- No configurar `/login`, `loginPopup` ni redirect wildcard.

### 13.5 Microsoft vuelve a `/login` sin `AADSTS50011`

Si Azure acepta la cuenta y vuelve a la SPA, pero la URL termina en `/login`, separar el
diagnóstico de los warnings propios de Microsoft:

1. Confirmar que la aplicación cargada incluye la Spec 203 y que Vite recompiló el source.
2. En **Application > Session Storage**, comprobar solo la presencia de claves MSAL y del
   descriptor `oneitb-microsoft-redirect-flow`; no copiar sus valores a logs/capturas.
3. Repetir desde una pestaña limpia. Durante el retorno debe verse primero
   `Procesando...`/`Preparando tu sesión institucional...` y después `/feed` o
   `/onboarding/academic`.
4. Si aparece un error OneITB controlado, registrar solo el mensaje y la operación
   GraphQL, nunca access tokens, JWT ni claims.
5. Si vuelve a Login pero ya existen `token` y `user`, limpiar la sesión desde la UI y
   repetir; no editar manualmente storage para forzar el acceso.
6. Si Microsoft restaura `/login` con un flow vigente y una cuenta MSAL inequívoca, la
   aplicación debe reemplazar esa ruta por `/auth/microsoft/callback`. Si el backend
   rechaza el canje, debe quedar visible el error controlado en el callback y no una nueva
   expiración silenciosa.
7. Si el callback llega a `MicrosoftLogin` pero permanece cargando o devuelve
   `INTERNAL_ERROR`, verificar primero `docker compose ps` y el health de `oneitb23-sql`.
   Un probe `__typename` solo prueba que HotChocolate está vivo; repetir además una query
   acotada que use EF Core. No modificar Entra, CORS ni CSP para compensar una base caída.

Los avisos CSP `unsafe-inline`, `BSSO not supported`, cookies particionadas, Quirks Mode de
`Me.htm` y CORS de `OneCollector` proceden del dominio Microsoft. No se corrigen ampliando
CORS/CSP de OneITB y no prueban por sí solos un fallo del canje.

Clasificar la consola por origen antes de intervenir:

| Origen | Ejemplos | Acción |
|---|---|---|
| OneITB (`localhost`, operación GraphQL, callback propio) | `MicrosoftLogin` rechazado, timeout, ruta a Login, schema incompatible | Corregir o registrar con correlation ID, sin copiar tokens |
| Microsoft (`login.microsoftonline.com`, `login.live.com`) | CSP `unsafe-inline`, `BSSO not supported`, cookies particionadas, `Me.htm` Quirks | Tratar como diagnóstico externo salvo que Microsoft devuelva un código AADSTS accionable |
| Telemetría Microsoft (`browser.events.data.microsoft.com`) | CORS de `OneCollector` | No ampliar CORS/CSP de OneITB; no afecta el token ni el callback |
| Tooling Development | banners React/Apollo DevTools | No es defecto productivo; confirmar que no aparece en el build de producción |

### 13.6 SQL Docker

```powershell
docker compose ps
docker inspect oneitb23-sql --format "{{json .State.Health}}"
docker compose logs oneitb-sql --tail 80
```

### 13.7 SSPI/Kerberos

`Failed to generate SSPI context` pertenece a Windows Integrated Security/SPN, no al
certificado HTTPS. Usar SQL Docker con SQL Auth y user-secrets; no volver a
`localhost\SQLEXPRESS` ni LocalDB para gates.

### 13.8 SQL exige cifrado

En Development controlado puede usarse la cadena Docker de la sección 3.2. No copiar
`Encrypt=False` o `TrustServerCertificate=True` a un destino real.

### 13.9 Windows Event Log

El host limpia providers y usa Console/Debug. Si aparece denegación del Event Log, comprobar
que se ejecuta el host actual y no un perfil/configuración histórica.

### 13.10 Puerto ocupado

```powershell
Get-Process iisexpress -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 44397 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress,LocalPort,State,OwningProcess
```

Cerrar únicamente el proceso identificado y propio. No matar procesos por nombre o PID sin
confirmar su línea de comando.

### 13.11 Reset o validación interrumpidos

1. Confirmar que no quede el proceso temporal en 5094, 5096 o 5097.
2. Revisar la salida final/`finally` del script.
3. No repetir el reset hasta comprobar backup e integridad de SQL.
4. Restaurar con el `.bak` verificado si la base fue eliminada y la migración falló.

### 13.12 Aceptación responsive y visual offline (Specs 206-207)

Esta validación es manual y debe ejecutarse sobre el frontend construido desde el SHA
candidato. No requiere cambiar CSP, CORS ni instalar extensiones.

1. Con sesiones `Estudiante`, `Empleador` y `Administrador`, recorrer 320, 375, 768,
   split-screen, 1024, 1280 y 1440 px.
2. Verificar que los enlaces ocupan el espacio disponible antes de pasar al overflow;
   no debe existir scroll horizontal, solapamiento ni pérdida de badge/estado activo.
3. Abrir el overflow con teclado, recorrer destinos, cerrar con Escape y comprobar foco.
   Repetir con zoom del navegador y `prefers-reduced-motion`.
4. Revisar Header, Hero, sección de identidad y Footer en Clean Tech/Tech Noir. El
   Header debe mostrar solo `only-logo`; las demás superficies deben usar
   `logo-oneitb` en claro y `logo-oneitb-dark-mode` en oscuro, sin filtros ni bloom.
5. Con una preferencia oscura guardada, abrir y recargar `/onboarding/academic`: la ruta
   debe verse clara sin modificar `oneitb-theme`; al salir debe restaurarse el tema
   oscuro. Registrar ambos estados sin copiar tokens ni datos de sesión.
6. En DevTools de Firefox, deshabilitar caché y bloquear o dejar sin red los hosts
   externos. Recargar
   Login, feed, académico, empleos, perfil y admin sin cerrar los servicios locales.
7. Confirmar cero requests a Google Fonts, gstatic, cdnjs o `ui-avatars.com`, cero cajas
   de glyph ausente, cero `download failed`/`glyf bbox` para archivos OneITB y controles
   icon-only con nombre accesible. Los WOFF2 deben responder desde el origen local y usar
   nombres versionados generados por Vite.
8. Abrir la vista previa de impresión del CV y verificar tipografía, saltos y contraste.
9. Registrar navegador, ancho, rol, tema, Network/Console, capturas y resultado. Un fallo
   visual mantiene Specs 206-207 en `[I]`; no debe silenciarse para obtener PASS.

Los banners de React/Apollo DevTools y warnings emitidos dentro de páginas Microsoft son
ruido de desarrollo o de un tercero y se clasifican por separado de los errores propios.

### 13.12.1 Schema activo desactualizado durante onboarding

Si el cliente informa que `confirmStudentCareer` no existe y que `careerId` no fue usada,
no se debe cambiar la mutación ni usar `linkUserToCareers` como fallback. Ese par de
errores demuestra que el proceso que atiende `/graphql` sirve un schema anterior al
código del repositorio.

0. Ejecutar primero el preflight de Spec 213, que no inicia procesos ni expone secretos:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& "specs/213-runtime-contract-entra-transition/runtime-contract.ps1"
```

El resultado PASS debe incluir `X-OneITB-Build`, `inquiriesPage`, `microsoftLogin` y
`confirmStudentCareer`. Un listener no atribuible por permisos se informa como warning;
la respuesta HTTP, el build header y la introspección son los checks autoritativos.

1. Ejecutar la prueba finita del contrato:

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release `
  --filter "FullyQualifiedName~StudentEnrollmentGraphQLContractTests"
```

2. Con la API activa, ejecutar una introspección finita y comprobar el campo/argumento:

```powershell
$body = @{ query = 'query { __type(name:"Mutation") { fields { name args { name } } } }' } |
  ConvertTo-Json -Compress
$schema = Invoke-RestMethod -Method Post -Uri 'http://localhost:5173/graphql' `
  -ContentType 'application/json' -Body $body
$schema.data.__type.fields |
  Where-Object name -eq 'confirmStudentCareer' |
  ConvertTo-Json -Depth 5
```

3. Si no aparece, identificar el PID que escucha `44397`/`5000`, verificar que su
ejecutable pertenezca a este workspace y detener solamente ese proceso. Reconstruir e
iniciar la API actual con el procedimiento acotado de este runbook; no dejar dos procesos
GraphQL en paralelo.
4. Repetir la introspección antes de reintentar el onboarding. La UI muestra una
recuperación controlada, pero eso no convierte un schema obsoleto en PASS.

### 13.13 Aceptación del PDF optimizado para ATS - Spec 208

La validación combina DOM, navegador y artefacto. Una prueba de componentes o un build no
demuestran por sí solos que el driver elegido genere texto extraíble.

1. Completar un perfil de prueba aprobado con todas las secciones y contenido suficiente
   para producir al menos dos páginas. No modificar perfiles reales solo para este gate.
2. Desde `/profile` y `/profile/edit`, confirmar el mismo orden: Contacto, Perfil
   profesional, Habilidades, Experiencia laboral, Proyectos, Formación académica e Idiomas.
3. Activar **PDF optimizado para ATS**, imprimir a A4 con escala predeterminada y guardar
   el archivo fuera del repositorio, por ejemplo en `artifacts/oneitb-cv-ats.pdf`.
4. Verificar disponibilidad de Poppler sin instalar ni descargar automáticamente:

```powershell
Get-Command pdftotext,pdfinfo,pdffonts -ErrorAction SilentlyContinue
```

5. Desde `FrontEnd/OneItb-FE`, ejecutar una inspección finita con términos no sensibles:

```powershell
npm.cmd run analyze:ats -- .\artifacts\oneitb-cv-ats.pdf `
  --expect "Perfil profesional" `
  --expect "Experiencia laboral" `
  --expect "Formación académica" `
  --min-pages 2 `
  --require-links
```

El resultado aceptable es `PASS`: texto no vacío, términos presentes/en orden, Unicode
sin reemplazos, páginas A4, `Encrypted: no`, fuentes utilizables y enlaces cuando el
driver los emite. `POPLER_NOT_AVAILABLE`, falta del diálogo nativo o links no emitidos se
registran `BLOCKED`; no se convierten en PASS. El script usa un directorio temporal,
elimina la extracción y nunca imprime el texto completo ni valores personales.

---

## 14. Evidencia y cierre predefensa

### 14.1 Evidencia mínima por ejecución

- Fecha/hora y zona horaria.
- SHA exacto y estado limpio/sucio del worktree.
- Versiones de .NET, Node, npm y Docker.
- Comando exacto sin valores sensibles.
- Resultado PASS/FAIL/BLOCKED/SKIPPED.
- Conteos de tests/build y duración relevante.
- Resultado drift EF y salud de SQL.
- Roles y flujos recorridos.
- Capturas sanitizadas de UI/Network/Console cuando corresponda.
- Cleanup y puertos liberados.

### 14.2 Checklist del SHA candidato

1. Integrar cambios y comprobar que no hay secretos/artefactos temporales rastreados.
2. Ejecutar `validate-predefense.ps1`.
3. Ejecutar `validate-local-infrastructure.ps1`.
4. Ejecutar `validate-demo-database.ps1` en ventana aprobada.
5. Recorrer manualmente los seis roles.
6. Probar chat/notificaciones con dos perfiles aislados.
7. Probar onboarding B2B y acceso Empleador.
8. Confirmar que se mantienen los cierres de `GAP-AUTH-01`, `GAP-AUTH-02` y
   `GAP-PRIV-01`; registrar
   `GAP-FILE-01` como aceptación exclusiva de demo controlada y `GAP-INFRA-01` como gate
   de TLS del destino.
9. Etiquetar el SHA que se presentará y crear snapshot offline.
10. No modificar código después del gate sin repetir la validación afectada.

### 14.3 Criterio de evidencia

Compilar no demuestra GraphQL, autenticación, realtime o persistencia. Si una dependencia
externa no puede probarse, registrar `BLOCKED` con causa concreta y utilizar un fallback
local únicamente para la demo. Nunca convertir ausencia de configuración en PASS.
