# Implementation Plan: Nullability Strict Fix

## Architecture

- **Backend**: .NET 8, C#. Propiedades nulas, firmas de métodos, constructores de entidades y repositorios.

## Steps

1. Remover `<NoWarn>` de los `.csproj` y añadir `<Nullable>enable</Nullable>` a `GraphQL.csproj`.
2. Compilar el backend y capturar todas las advertencias.
3. Modificar `EntityModel.cs` para manejar la inicialización del `Id` (ej. `public string Id { get; set; } = string.Empty;`).
4. Modificar `Mutation.cs` y `Query.cs` para corregir los usos de `?` sin contexto nulo o añadir `#nullable enable` si es necesario.
5. Corregir advertencias en `UnitOfWork.cs` y `AccountsService.cs`.
6. Validar que la compilación pase 100% limpia.
