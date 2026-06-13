# Tasks: Professional Seed Users

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Sembrado de Base de Datos

- [x] T001 Instalar `BCrypt.Net-Next` en `Data.csproj`.
- [x] T002 Crear archivo `DbInitializer.cs` con constantes GUID.
- [x] T003 Instanciar `Account` y `User` con `HashPassword` y guardarlos en el contexto EF Core.
- [x] T004 Inyectar el proceso de inicialización en `Program.cs`.
- [x] T005 Ejecutar `dotnet build` para verificar cero errores.
