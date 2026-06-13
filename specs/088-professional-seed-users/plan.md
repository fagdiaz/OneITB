# Implementation Plan: Professional Seed Users

## Key Changes

1.  **Backend (`Data`)**:
    -   Instalar paquete NuGet `BCrypt.Net-Next` en `Data.csproj` si no está presente.
    -   Crear `DbInitializer.cs` en la capa `Data`.
    -   Definir 5 constantes de tipo `Guid` usando UUIDs realistas pregenerados.
    -   Crear 5 entidades `Account` asociadas a esos IDs con correos institucionales.
    -   Aplicar el método `BCrypt.Net.BCrypt.HashPassword("Test1234!")`.
    -   Crear 5 entidades `User` con los mismos IDs correspondientes a los 5 perfiles del sistema (`Administrador`, `Estudiante`, `Profesor`, `Moderador`, `Empleador`).
    -   Guardar cambios en el contexto.

2.  **Backend (`OneITB`)**:
    -   Actualizar `Program.cs` para invocar al `DbInitializer` de forma segura durante el arranque (`Host.Services.CreateScope()`), capturando su propio `OneItbContext` antes de iniciar el listener HTTP.
