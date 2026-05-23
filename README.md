# OneITB23

Aplicación web unificada para la gestión académica de OneITB. El sistema implementa una arquitectura desacoplada con un Backend en .NET 6 (API GraphQL con HotChocolate y Entity Framework Core) y un Frontend en React con Vite y Apollo Client.

## Estructura del Proyecto

- **[API Graphql](file:///F:/React/OneITB23/API%20Graphql)**: Código del servidor de la API GraphQL.
- **[FrontEnd](file:///F:/React/OneITB23/FrontEnd)**: Código de la aplicación web cliente.
- **[docs](file:///F:/React/OneITB23/docs)**: Documentos de auditoría de arquitectura y seguridad.

## Configuración de Entorno Local
Para entornos de desarrollo con instancias locales de SQL Server, asegure la configuración `TrustServerCertificate=True` en `appsettings.Development.json`.
