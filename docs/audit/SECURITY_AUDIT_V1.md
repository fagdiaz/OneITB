# Reporte de Auditoría de Seguridad y Vulnerabilidades

## 1. Vulnerabilidades y Fallas Críticas Detectadas

El análisis profundo del repositorio identificó múltiples fallas críticas de seguridad que comprometen la integridad de los datos, la autenticación y la exposición del sistema.

### 1.1. Manejo Inseguro de Contraseñas (Texto Plano)
- **Archivo**: `API Graphql/Services/Users/UsersService.cs`
- **Severidad**: CRÍTICA (P0)
- **Detalle**: El método `CreateAsync` inserta los usuarios en la base de datos sin aplicar ningún algoritmo de hashing. Además, el método `GetByEmailAndPassword` valida el inicio de sesión comparando directamente en texto plano: `u.Password == password`. En caso de una filtración de la base de datos, todas las credenciales de los usuarios quedarán expuestas.

### 1.2. Ausencia de Middleware de Autenticación
- **Archivo**: `API Graphql/OneITB/Startup.cs`
- **Severidad**: CRÍTICA (P0)
- **Detalle**: Aunque el proyecto configura el servicio `AddJwtBearer` y hace una llamada a `app.UseAuthorization()`, omite el uso obligatorio de `app.UseAuthentication()`. Esto significa que el contexto HTTP nunca establece la identidad del usuario a partir del token JWT y el servidor HotChocolate no puede evaluar correctamente si un usuario está autenticado, dejando endpoints desprotegidos.

### 1.3. Exposición de Datos Sensibles por GraphQL
- **Archivos**: `API Graphql/Entities/Models/User.cs`, `API Graphql/OneITB/GraphQL/Query.cs`, `FrontEnd/OneItb-FE/src/data/graphql/queries/getUsers.js`
- **Severidad**: ALTA (P1)
- **Detalle**: GraphQL retorna directamente la entidad `User` de Entity Framework. Como la entidad tiene la propiedad `Password`, cualquier cliente puede solicitar este campo en su consulta. De hecho, el frontend actualmente tiene una query `getUsers.js` que explícitamente pide el `password`.

### 1.4. Tokens JWT sin Expiración (Sesiones Permanentes)
- **Archivos**: `API Graphql/OneITB/Startup.cs`, `API Graphql/Services/Users/UsersService.cs`
- **Severidad**: ALTA (P1)
- **Detalle**: La configuración del JWT tiene `ValidateLifetime = false`. Además, al crear el token en `GenerateToken`, no se especifica el parámetro `expires`. Esto permite que un token generado no expire nunca, por lo que si es robado, el atacante tendrá acceso perpetuo.

### 1.5. Configuración CORS Excesivamente Permisiva
- **Archivo**: `API Graphql/OneITB/Startup.cs`
- **Severidad**: MEDIA (P2)
- **Detalle**: Se define la política CORS como `builder.WithOrigins("*").AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();`. Esto permite que cualquier origen externo (otra web) pueda hacer peticiones a la API directamente desde el navegador de un usuario.

---

## 2. Recomendaciones y Plan de Acción Técnico

Para transformar este sistema actual en uno estable y seguro, se deben ejecutar los siguientes pasos técnicos en orden de prioridad.

### Paso 1: Hashing de Contraseñas en el Backend
1. **Instalar Dependencia**: Añadir un paquete de hashing como `BCrypt.Net-Next` al proyecto `Services`.
2. **Modificar `UsersService.cs` (Creación)**:
   ```csharp
   public async Task<User> CreateAsync(User user)
   {
       // Hashear el password antes de guardarlo
       user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
       await context.Users.AddAsync(user);
       await context.SaveChangesAsync();
       return user;
   }
   ```
3. **Modificar `UsersService.cs` (Autenticación)**:
   ```csharp
   public User GetByEmailAndPassword(string email, string password)
   {
       var user = context.Users.FirstOrDefault(u => u.Email == email);
       if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
       {
           return user;
       }
       return null;
   }
   ```

### Paso 2: Corrección del Pipeline de Autenticación
1. **Modificar `Startup.cs` (Método Configure)**:
   Asegurarse de que `UseAuthentication` esté presente y justo antes de `UseAuthorization`.
   ```csharp
   app.UseRouting();
   app.UseCors(MyAllowSpecificOrigins);
   
   app.UseAuthentication(); // <- AÑADIR ESTA LÍNEA
   app.UseAuthorization();
   ```
2. **Activar Validación de Expiración (`Startup.cs` - ConfigureServices)**:
   Cambiar `ValidateLifetime = false` a `ValidateLifetime = true`.

### Paso 3: Ocultar Campos Sensibles en GraphQL
1. **Modificar `User.cs` (Modelo de Entidad)**:
   Para prevenir que GraphQL exponga la contraseña en cualquier query o mutación, utilizar decoradores de HotChocolate para ignorar el campo.
   ```csharp
   using HotChocolate;

   public class User : EntityModel
   {
       // ...
       [GraphQLIgnore]
       public string Password { get; set; }
   }
   ```
2. **Modificar Frontend (`getUsers.js` y otros)**:
   Remover la solicitud del campo `password` de todas las mutaciones y queries de Apollo Client en el código React.

### Paso 4: Seguridad en la Generación del JWT
1. **Modificar `UsersService.cs` (GenerateToken)**:
   Definir una fecha de expiración para el token (ej. 2 horas).
   ```csharp
   var token = new JwtSecurityToken(
       issuer: configuration["Jwt:Issuer"],
       audience: configuration["Jwt:Issuer"],
       claims: claims,
       expires: DateTime.UtcNow.AddHours(2), // <- AÑADIR EXPIRACIÓN
       signingCredentials: creds
   );
   ```

### Paso 5: Proteger Rutas GraphQL
1. **Modificar Resolvers (`Query.cs` y `Mutation.cs`)**:
   Descomentar y aplicar el atributo `[Authorize]` proporcionado por `HotChocolate.AspNetCore.Authorization` en todas las consultas (como `GetUsers`) y mutaciones que requieran que el usuario esté logueado, exceptuando `AuthenticateUser` y `AddUser`.

### Paso 6: Configurar CORS y Cabeceras en Frontend
1. **Ajustar CORS en Backend**:
   Reemplazar el comodín `*` con la URL del Frontend (ej. `http://localhost:5173` o el definido en los `appsettings`).
2. **Inyección de Token en Apollo Client (`GraphqlProvider.js`)**:
   Actualmente el frontend guarda el token pero el `ApolloProvider` probablemente no lo envía. Es crucial configurar el `authLink` de Apollo para adjuntar el JWT en cada petición:
   ```javascript
   import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
   import { setContext } from '@apollo/client/link/context';

   const httpLink = createHttpLink({ uri: "https://localhost:44397/graphql" });
   
   const authLink = setContext((_, { headers }) => {
     const token = localStorage.getItem('token');
     return {
       headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
       }
     }
   });

   export const client = new ApolloClient({
     link: authLink.concat(httpLink),
     cache: new InMemoryCache()
   });
   ```

## 3. Blindaje de Seguridad Implementado (Mitigación Exitosa)

Se ha completado e inyectado con éxito la primera fase del blindaje de seguridad en las capas críticas del Backend, mitigando vulnerabilidades críticas de nivel P0 y P1:

### 3.1. Hashing Robusto con BCrypt (`char(60)`)
* **Implementación**: Se integró el algoritmo criptográfico **BCrypt** de última generación (`BCrypt.Net-Next`) para el almacenamiento de contraseñas de las cuentas.
* **Seguridad en Persistencia**: La base de datos almacena el hash resultante en una columna de tipo físico fijo **`char(60)`**, asegurando que los hashes se mantengan íntegros, con el factor de costo (rounds) adecuado, evitando cualquier vulnerabilidad de filtrado de contraseñas en texto plano.
* **Verificación Asertiva**: Se implementó una comprobación defensiva rígida en los setters del dominio que rechaza cualquier hash con longitud y prefijo inválidos antes de persistir los cambios.

### 3.2. Protección Activa Contra Ataques ReDoS (Regular Expression Denial of Service)
* **Vulnerabilidad Mitigada**: Prevención de ataques de denegación de servicio por expresiones regulares catastróficas al procesar emails de entrada.
* **Implementación Defensiva**: La validación de correo electrónico (`EmailRegex`) utiliza una **Regex compilada y optimizada** (`RegexOptions.Compiled`) con un **límite de tiempo estricto (timeout)** establecido en **250 milisegundos** (`TimeSpan.FromMilliseconds(250)`). Esto garantiza que cualquier intento de explotar el motor de expresiones regulares detenga inmediatamente la ejecución y prevenga el agotamiento de CPU del servidor.

### 3.3. Restricciones de Integridad Relacional (`DeleteBehavior.Restrict`)
* **Seguridad y Control de Datos**: Mitigación de borrados accidentales en cascada en relaciones de negocio críticas (ej: entre `Consultas`, `Usuarios` y `Materias`).
* **Implementación de Base de Datos**: A través de Fluent API, las claves foráneas de las relaciones complejas están configuradas de manera rígida con **`DeleteBehavior.Restrict`** en lugar del comportamiento por defecto `Cascade`. Esto previene que la eliminación física de un registro padre (ej: una materia o un usuario) borre de forma automática y descontrolada el historial transaccional de consultas asociadas.