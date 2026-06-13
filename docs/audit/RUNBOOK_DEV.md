# RUNBOOK_DEV - OneITB23

## Requisitos

- .NET SDK 8.
- Node.js compatible con Vite 8 y npm.
- SQL Server.
- `dotnet-ef` 8.x.

## Backend

```powershell
dotnet restore "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj"
```

IIS Express usa actualmente:

- HTTP: `http://localhost:64303`
- HTTPS: `https://localhost:44397`
- GraphQL: `https://localhost:44397/graphql`

Si Visual Studio o IIS Express bloquea los binarios `Debug`, validar con
configuracion `Release` sin detener procesos del desarrollador.

## Base de datos

La cadena de desarrollo debe incluir `TrustServerCertificate=True`.

```powershell
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

No ejecutar `database drop`, eliminar migraciones ni limpiar datos sin
autorizacion explicita.

## Frontend

```powershell
Set-Location FrontEnd/OneItb-FE
npm.cmd ci
npm.cmd run build
npm.cmd run dev
```

En PowerShell se usa `npm.cmd` para evitar bloqueos de `npm.ps1` por la
politica de ejecucion.

## Validacion minima por tipo de cambio

### Backend o GraphQL

1. Compilar el backend en `Release`.
2. Iniciar o reutilizar el servidor local.
3. Introspectar el esquema activo.
4. Ejecutar la query o mutacion afectada.
5. Verificar errores GraphQL y efecto en SQL Server.

### Frontend

1. Ejecutar `npm.cmd run build`.
2. Abrir el flujo afectado en el navegador.
3. Revisar consola y red.
4. Confirmar estados de carga, exito y error.

### Persistencia

1. Crear o modificar el registro desde la UI.
2. Confirmar respuesta GraphQL.
3. Recargar el navegador.
4. Confirmar que el dato permanece.

## Smoke tests de estabilizacion

- [ ] Backend compila con 0 errores.
- [ ] Frontend compila con 0 errores.
- [ ] `/graphql` responde.
- [ ] Login valido entrega JWT.
- [ ] Login invalido devuelve error controlado.
- [ ] `ValidateLifetime` esta activo.
- [ ] CORS esta restringido al origen configurado.
- [ ] Apollo envia `Authorization: Bearer <token>`.
- [ ] Sesion usa una unica clave de token.
- [ ] `subjects` coincide con el esquema activo.
- [ ] `inquiries` coincide con el esquema activo.
- [ ] `Inquiry` expone autor y materia sin N+1.
- [ ] `addInquiry` rechaza solicitudes sin JWT.
- [ ] Una publicacion autenticada se persiste.
- [ ] La publicacion aparece sin recargar.
- [ ] La publicacion permanece despues de recargar.
- [ ] Los errores del feed se muestran en la UI.
- [ ] `PasswordHash` no se expone en GraphQL.
- [ ] BCrypt se almacena como `char(60)`.
- [ ] Relaciones criticas usan `DeleteBehavior.Restrict`.

Los checks ejecutados deben registrarse en la spec activa. Los no ejecutados
permanecen pendientes.
