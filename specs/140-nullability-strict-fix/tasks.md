# Task Tracker: Nullability Strict Fix

- [x] T1: Revertir supresiones `<NoWarn>` en todos los `.csproj` y habilitar nullable en GraphQL.
- [x] T2: Auditar advertencias de compilación (`dotnet build`).
- [x] T3: Corregir advertencias CS8632 en `GraphQL.csproj` y firmas GraphQL, e implicit usings (System.IO.Path vs HotChocolate.Path).
- [x] T4: Corregir inicialización CS8618 en `EntityModel.cs` y entidades.
- [x] T5: Corregir referencias CS8604 y CS8603 en Servicios / Repositorios (AccountsService, UnitOfWork, Startup).
- [x] T6: Validar compilación limpia sin advertencias (0 Errores, 0 Advertencias).

