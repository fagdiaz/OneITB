# Feature Specification: Local Backend Runtime Unblock

**Feature Branch**: `134-local-backend-runtime-unblock`

**Created**: 2026-06-23

**Status**: Planned

**Input**: Destrabar el backend local de OneITB23 en .NET 8 evitando bloqueos de SQL Server, certificados HTTPS de desarrollo y Windows Event Log, sin modificar produccion, GraphQL, migraciones ni logica de negocio.

## User Scenarios & Testing

### User Story 1 - Backend local arranca de forma reproducible (Priority: P1)

Como desarrollador, quiero iniciar el backend local con el perfil `Development` documentado para poder validar GraphQL, uploads, administracion y feed en runtime.

**Why this priority**: Es el bloqueo P0 actual del roadmap; sin backend local no se puede cerrar regresion end-to-end.

**Independent Test**: Ejecutar el runbook local desde una terminal limpia y confirmar que el proceso escucha en `https://localhost:44397/graphql` sin excepciones de SQL, certificados o Event Log.

**Acceptance Scenarios**:

1. **Given** un entorno local con SQL Server accesible, **When** se ejecuta `dotnet run --launch-profile OneITB`, **Then** el backend inicia en `Development` y responde GraphQL.
2. **Given** SQL Server local exige cifrado o usa certificado no confiable, **When** se usa la configuracion local, **Then** la conexion no falla por validacion de certificado TLS.
3. **Given** el usuario no tiene permisos para Windows Event Log, **When** el backend registra logs en Development, **Then** no intenta escribir en Event Log y no oculta el error real.

### User Story 2 - Certificado HTTPS local recuperable (Priority: P1)

Como desarrollador, quiero comandos exactos para limpiar y confiar certificados HTTPS de desarrollo para evitar fallas de Kestrel/redirect en el entorno local.

**Why this priority**: El frontend apunta por defecto a HTTPS `44397`; si el certificado dev no existe o no es confiable, los flujos reales no pueden validarse.

**Independent Test**: Ejecutar comandos `dotnet dev-certs`, reiniciar el backend y confirmar que HTTPS queda disponible.

**Acceptance Scenarios**:

1. **Given** certificados dev rotos o vencidos, **When** se ejecuta el procedimiento documentado, **Then** se elimina el certificado anterior y se confia uno nuevo.
2. **Given** el backend se inicia luego del procedimiento, **When** el navegador accede a GraphQL, **Then** no bloquea por certificado local.

### User Story 3 - Diagnostico claro de SSPI vs TLS (Priority: P2)

Como desarrollador, quiero distinguir si la falla viene de Kerberos/SSPI o de cifrado TLS para aplicar la correccion adecuada sin debilitar produccion.

**Why this priority**: `TrustServerCertificate=True` no corrige SSPI; el runbook debe evitar diagnosticos falsos.

**Independent Test**: Ejecutar pruebas de conexion documentadas y clasificar la falla antes de tocar configuracion.

**Acceptance Scenarios**:

1. **Given** un error `Failed to generate SSPI context`, **When** se sigue el diagnostico, **Then** se identifica como problema de autenticacion integrada Windows/SPN y no como certificado TLS.
2. **Given** el error persiste con `Trusted_Connection=True`, **When** se requiere destrabar localmente, **Then** existe una opcion dev-only con SQL Auth o LocalDB sin alterar produccion.

### Edge Cases

- El proceso no esta usando `ASPNETCORE_ENVIRONMENT=Development` y por eso toma `appsettings.json`.
- Una variable de entorno `ConnectionStrings__DefaultConnection` pisa `appsettings.Development.json`.
- SQL Server local exige cifrado pero el certificado no es confiable.
- SQL Server falla por Kerberos/SPN con `Trusted_Connection=True`.
- El certificado HTTPS de ASP.NET existe pero no esta confiado en Windows.
- Una configuracion de logging externa reintroduce Event Log en Development.

## Requirements

### Functional Requirements

- **FR-001**: La configuracion local MUST limitar excepciones de seguridad a `Development`.
- **FR-002**: La connection string de `Development` MUST permitir conexion local cuando SQL Server exige cifrado o usa certificado no confiable.
- **FR-003**: El plan MUST distinguir TLS/certificado SQL de SSPI/Kerberos.
- **FR-004**: El plan MUST incluir comandos exactos de `dotnet dev-certs` para limpiar y confiar el certificado HTTPS local.
- **FR-005**: El plan MUST evitar Event Log en Development y mantener logging por consola/debug.
- **FR-006**: La solucion MUST NOT modificar resolvers GraphQL, servicios de negocio, entidades, migraciones ni base productiva.
- **FR-007**: La validacion MUST probar backend build y un endpoint GraphQL real cuando el entorno lo permita.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El backend local inicia con `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` sin errores de SQL TLS, SSPI ni Event Log.
- **SC-002**: `https://localhost:44397/graphql` responde una query minima de GraphQL en menos de 5 segundos luego del arranque.
- **SC-003**: El procedimiento de certificados puede ejecutarse con comandos copy/paste desde el runbook.
- **SC-004**: Produccion conserva cifrado estricto y no confia certificados arbitrarios.

## Assumptions

- El entorno local objetivo es Windows con SQL Server Express o SQL Server local.
- El frontend local consume `https://localhost:44397/graphql`.
- La base local `OneItb` ya existe o se puede actualizar con EF desde el runbook.
- Si SSPI persiste por SPN/Kerberos, se acepta una alternativa de desarrollo local con SQL Auth o LocalDB documentada, sin secretos commiteados.
