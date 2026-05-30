# OneITB23

Aplicación web unificada para la gestión académica de OneITB. El sistema implementa una arquitectura desacoplada con un Backend en .NET 6 (API GraphQL con HotChocolate y Entity Framework Core) y un Frontend en React con Vite y Apollo Client.

## Gobernanza y Principios del Proyecto

El desarrollo en este repositorio se rige estrictamente por la **[Constitución de OneITB23 (v1.0.0)](file:///F:/React/OneITB23/.specify/memory/constitution.md)**. Todos los commits, pull requests y aportes de código (incluidos los generados por asistentes de IA) deben pasar los siguientes filtros de calidad:
1. **Arquitectura GraphQL Desacoplada**: Intercambio exclusivo a través del endpoint `/graphql` sin REST alternativos.
2. **Criptografía Robusta**: Contraseñas hasheadas únicamente con **BCrypt** en base de datos física `char(60)`.
3. **Protección ReDoS**: Expresiones regulares de entrada compiladas con límite de tiempo estricto de **250ms**.
4. **Integridad Referencial**: Restricción de borrado en cascada mediante la Fluent API `DeleteBehavior.Restrict`.
5. **Autenticación Pipeline**: Registro obligatorio de `UseAuthentication()` antes de `UseAuthorization()` en el pipeline de ASP.NET Core con validación JWT expirable.

## Estructura del Proyecto

- **[API Graphql](file:///F:/React/OneITB23/API%20Graphql)**: Código del servidor de la API GraphQL (en .NET 6).
- **[FrontEnd](file:///F:/React/OneITB23/FrontEnd)**: Código de la aplicación web cliente (en React + Vite).
- **[docs](file:///F:/React/OneITB23/docs)**: Documentos de auditoría, runbooks de desarrollo y estado de conformidad de la documentación.

## Configuración y Ejecución Rápida
Consulta el **[Desarrollo Runbook (RUNBOOK_DEV.md)](file:///F:/React/OneITB23/docs/audit/RUNBOOK_DEV.md)** para detalles exactos de comandos locales, migraciones de Entity Framework y los 35 smoke tests requeridos para despliegue.
