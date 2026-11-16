# Evidence: Jobs Module and Enterprise Seeder

## Commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS inicial, 0 errores.
- `dotnet ef migrations add AddJobOffers --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS final, 0 warnings, 0 errores.
- `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`: PASS, sin cambios pendientes.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 38/38.
- `npm.cmd run build`: PASS final, 351 modulos, build en 787 ms.
- `npm.cmd test -- --run`: BLOQUEADO por `EPERM` al abrir `FrontEnd/OneItb-FE/node_modules/.vite-temp/...`; el cache temporal no pudo eliminarse por lock/permisos del entorno. El build Vite posterior paso.

## Runtime / Schema

- `dotnet run --no-build --no-restore --configuration Release --project "API Graphql/OneITB/GraphQL.csproj" --no-launch-profile --urls "http://localhost:5445"` con `ASPNETCORE_ENVIRONMENT=Development`: PASS, backend escucha en `http://localhost:5445`.
- `POST /graphql` `{ __typename }`: PASS, `{"data":{"__typename":"Query"}}`.
- Login `admin1@itbeltran.com.ar` / `Admin123!`: PASS, rol `Administrador`.
- Query autenticada `jobOffers(onlyActive: true, first: 3)`: PASS, devuelve ofertas con `employer.firstName`, `employer.lastName`, `employer.fullName`, `role` y `email`.
- Mutation autenticada `createJobOffer(...)`: PASS, creo `QA Automation Trainee` para `OneITB Labs` con autor `Admin Uno`.
- Nota: el launch profile HTTPS `OneITB` queda bloqueado en esta sesion por certificado dev ausente/vencido; se uso HTTP temporal como en specs previas para smoke de schema.

## Notes

- The implementation keeps `DbInitializer.Initialize` as the startup entrypoint and delegates graph seeding to `EnterpriseDemoSeeder.SeedAsync`.
- `AddJobOffers` contiene `FK_JobOffers_Users_EmployerId` con `ReferentialAction.Restrict`.
- La primera query de empleos mostro campos calculados de `User` vacios al combinar `[UseProjection]` con resolvers `fullName/email`; se corrigio quitando proyeccion del campo `jobOffers` y manteniendo graph loading explicito en `JobService`.
