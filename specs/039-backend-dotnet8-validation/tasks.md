# Tasks: Backend .NET 8 Validation (039)

## Phase 1: Setup
- [x] T001 Update AGENTS.md + feature.json → 039

## Phase 2: Validation Tests

### Prueba 0 — dotnet restore
- [x] T002 `dotnet restore OneITB.sln`
  - **Resultado inicial**: NU1102 — `System.ComponentModel.Annotations 8.0.0` no existe en NuGet.
  - **Fix**: Eliminado de `Services.csproj` — en .NET 8 es inbox en el SDK base.
  - **Resultado final**: ✅ "Todos los proyectos están actualizados para la restauración."

### Prueba 1 — dotnet build
- [x] T003 `dotnet build OneITB.sln --no-restore`
  - **Resultado inicial**: 2 errores en `Startup.cs`:
    - `CS0103`: `DbContextKind` no existe → Breaking change HC 13→14
    - `CS1061`: `RegisterDbContext` no existe → Breaking change HC 13→14
  - **Fix aplicado**: `RegisterDbContext<T>(DbContextKind.Pooled)` → `RegisterDbContextFactory<T>()` (API de HC 14)
  - **Resultado final**: ✅ **Compilación correcta — 0 Errores, 0 Advertencias**
  - DLLs generados: Entities / Data / Services / GraphQL → `bin/Debug/net8.0/`

### Prueba 2 — EF Core Database Update
- [x] T004 `dotnet ef database update --project Data.csproj --startup-project GraphQL.csproj`
  - **Resultado**: ✅ **"Build succeeded." + "Done."** — Base de datos conectada y migrada.
  - **Nota**: Herramienta EF CLI local es `6.0.36` (anterior al runtime `8.0.6`). Funcional pero recomendado actualizar via `dotnet tool update --global dotnet-ef`.

## Phase 3: Documentation
- [x] T005 Update DEVELOPMENT_LOG.md
