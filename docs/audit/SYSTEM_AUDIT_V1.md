# Estado Actual de la Arquitectura del Sistema

Este documento describe la arquitectura real detectada en el espacio de trabajo de la aplicación, identificando las tecnologías, flujos de datos y estructura de los componentes principales.

## 1. Visión General de la Pila Tecnológica

El sistema se divide en una arquitectura clásica Cliente-Servidor (Frontend y Backend desacoplados), comunicados de manera exclusiva a través de un único endpoint GraphQL.

### Backend (API)
- **Framework Core**: .NET 6 (ASP.NET Core).
- **Servidor GraphQL**: HotChocolate (integrado con ASP.NET Core).
- **Acceso a Datos**: Entity Framework Core (`Microsoft.EntityFrameworkCore`).
- **Base de Datos**: SQL Server.
- **Autenticación**: JSON Web Tokens (JWT) gestionados a través de `JwtBearerDefaults`.
- **Arquitectura de Código**: Dividida en 3 proyectos lógicos dentro de la misma solución (`.sln`):
  - `Data`: Define el contexto de Entity Framework (`OneItbContext`) y almacena las migraciones (Code-First).
  - `Entities`: Contiene los modelos del dominio (ej. `User`, `Account`) y las enumeraciones (ej. `States`, `Countries`).
  - `Services`: Contiene la lógica de negocio (`UsersService`, `AccountsService`).
  - `OneITB` (Proyecto Principal): Inicialización de la API, middlewares (`Startup.cs`, `Program.cs`) y la definición estricta de Mutaciones (`Mutation.cs`) y Consultas (`Query.cs`) para HotChocolate.

### Frontend (SPA)
- **Librería Core**: React (v18.2.0).
- **Bundler / Build Tool**: Vite (v4.2.0).
- **Cliente GraphQL**: Apollo Client (`@apollo/client` v3.7.12) para gestión de estado remoto y fetching.
- **Enrutamiento**: React Router DOM (v6.10.0) implementando layouts públicos y privados.
- **Estilos**: Vanilla CSS (`styles.css`, `responsive.css`) integrados de forma global.

---

## 2. Flujos de Datos Principales

### Flujo de Inicialización (Frontend)
1. Vite sirve `index.html` que carga `main.jsx`.
2. `main.jsx` envuelve la aplicación en el `<ApolloProvider>` (configurado en `GraphqlProvider.js` apuntando a `https://localhost:44397/graphql`).
3. El `App.jsx` instancia el `<AuthProvider>` (contexto de React) que lee inmediatamente el `localStorage` para hidratar la sesión previa si existe.
4. `Routing.jsx` decide qué layout renderizar (`PublicLayout` o `PrivateLayout`) basándose en la variable de estado proporcionada por `AuthProvider`.

### Flujo de Autenticación (Login)
1. El componente `Login.jsx` captura las credenciales del formulario.
2. Dispara la mutación GraphQL `authenticateUser` a través de Apollo Client.
3. **Backend**: HotChocolate recibe la petición, enruta al método `AuthenticateUser` en `Mutation.cs`.
4. `Mutation.cs` delega a `UsersService.GetByEmailAndPassword`.
5. `UsersService` consulta directamente a SQL Server vía `OneItbContext`.
6. Si es exitoso, `UsersService.GenerateToken` crea un string JWT.
7. Se retorna un objeto `UserPayload` que contiene el token y la data del usuario.
8. **Frontend**: Guarda el `token` y el `user` en `localStorage` y actualiza el estado de `AuthProvider`.

### Flujo de Consultas de Datos (Ej. Obtener Usuarios)
1. Un componente dispara el hook de Apollo `useQuery(GET_USERS)`.
2. La petición se envía a `/graphql`.
3. **Backend**: `Query.GetUsers` enruta la solicitud a `UsersService.GetAllAsync()`.
4. Devuelve un `IQueryable<User>` (o lista). Entity Framework construye la sentencia SQL y la ejecuta contra la base de datos.
5. Los modelos de la capa `Entities` son serializados automáticamente por HotChocolate y enviados al Frontend en formato JSON.

---

## 3. Puntos Críticos y Decisiones Arquitectónicas Actuales

- **Ausencia de DTOs (Data Transfer Objects)**: El backend devuelve las entidades de la base de datos (Ej: `User.cs`) directamente a través del motor GraphQL. Esto genera un fuerte acoplamiento entre la estructura de la base de datos y la vista, además de ser el causante directo de la fuga de datos sensibles como contraseñas.
- **Lógica de negocio mixta**: Algunas reglas de negocio (como comprobar el dominio del email respecto a la cuenta) existen en los "Resolvers" GraphQL (`Mutation.cs`) en vez de residir puramente en la capa de `Services`.
- **Inconsistencias en almacenamiento Frontend**: Existen múltiples archivos que intentan manejar el estado del usuario (`GeneralDataProvider.js` guarda `access_token`, mientras que `Login.jsx` guarda `token`). Esto muestra fragmentación en la gestión de sesión.
- **Seguridad perimetral laxa**: Endpoint de API con orígenes ilimitados permitidos (CORS) y middlewares de pipeline de ASP.NET incompletos, delegando la responsabilidad de "seguridad" enteramente al frontend de forma visual. (Ver `SECURITY_AUDIT_V1.md` para detalles completos).

---

## Estado de la Base de Datos
- **Instancia:** SQL Server Express (Localhost).
- **Migraciones Aplicadas:** 4 migraciones completadas (Account, User, Materia, Consulta).
- **Arquitectura:** Estructura unificada bajo el patrón Shared Primary Key utilizando `Guid` como identificador único para identidades de usuario.

## Auditoría de Seguridad
- **Hashing:** Implementado BCrypt (Hash fijo de 60 caracteres).
- **Validación Email:** Protección activa contra ReDoS mediante Regex compilada (timeout 250ms).
- **Integridad:** Bloqueo de cascadas implementado vía `DeleteBehavior.Restrict` en el motor relacional.