# Evidence: Enterprise Jobs ATS Seeder QA

## Commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS inicial, 0 warnings, 0 errores.
- `dotnet ef migrations add AddJobApplications --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS final, 0 warnings, 0 errores.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
- `npm.cmd run build`: PASS, 352 modulos, build en 855 ms.
- `npm.cmd test -- --run`: BLOQUEADO por `EPERM` al abrir `FrontEnd/OneItb-FE/node_modules/.vite-temp/...`; mismo bloqueo ambiental registrado en specs previas.
- Runtime smoke con backend temporal: BLOQUEADO por el entorno de Codex al intentar usar `Start-Process`; no se intento workaround por politica de herramienta.

## QA / Security Review

- `JobApplication` usa FKs explicitas a `JobOffer` y `User`, ambas con `DeleteBehavior.Restrict`.
- `JobApplications` tiene indice unico `(JobOfferId, ApplicantId)` para impedir postulaciones duplicadas por concurrencia o doble click.
- `JobService.ApplyToJobAsync` restringe postulaciones a `Estudiante` y `Egresado`, rechaza ofertas inactivas y devuelve error controlado si ya existe postulacion.
- `JobService.UpdateApplicationStatusAsync` valida que `JobOffer.EmployerId == currentUserId`; no permite modificar ofertas ajenas.
- Queries de jobs usan graph loading explicito con `Include`, `ThenInclude`, `AsNoTracking` y `AsSplitQuery` para evitar N+1 evidente sin DataLoader adicional.
- React no agrega event listeners nuevos; las subscriptions Apollo quedan administradas por `useSubscription` y los estados locales no actualizan componentes desmontados mediante efectos manuales.

## Runtime Notes

- Se aplico la migracion local `AddJobApplications` correctamente.
- El schema runtime de GraphQL no pudo fumarse en esta sesion por bloqueo del entorno al iniciar un backend temporal; queda explicitamente no verificado en runtime browser.
