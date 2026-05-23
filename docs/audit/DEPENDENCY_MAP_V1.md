# DEPENDENCY_MAP_V1

## Backend

### Diagrama ASCII
```
GraphQL (Query/Mutation)
  -> Services (UsersService, AccountsService)
      -> Data (OneItbContext)
          -> Entities (User, Account, Enums)
```

### Tabla de dependencias (backend)
| Clase | Depende de | Motivo |
|---|---|---|
| `GraphQL.Query` | `Services.Users.UsersService` | Resolver de consultas GraphQL consume servicio |
| `GraphQL.Mutation` | `Services.Users.UsersService`, `Services.Accounts.AccountsService`, `IConfiguration` | Resolver de mutaciones ejecuta l?gica y genera token |
| `Services.Users.UsersService` | `OneItb.Data.OneItbContext`, `IConfiguration`, `JwtSecurityTokenHandler` | Acceso DB y generaci?n de JWT |
| `Services.Accounts.AccountsService` | `OneItb.Data.OneItbContext` | Lectura de cuentas |
| `OneItb.Data.OneItbContext` | `Entities.Models.User`, `Entities.Models.Account` | DbSet de entidades |

## Frontend

### Diagrama ASCII (Login flow)
```
Login.jsx
  -> authenticateUser mutation
    -> ApolloClient (GraphqlProvider)
      -> /graphql
  -> localStorage (token/user)
  -> AuthProvider (context)
  -> PrivateLayout (gating)
```

### Diagrama ASCII (Query flow)
```
GET_USERS query
  -> ApolloClient
    -> /graphql
  -> Query.GetUsers
  -> UsersService.GetAllAsync
  -> DbContext.Users
```

### Diagrama ASCII (Mutation flow)
```
ADD_USER mutation
  -> ApolloClient
    -> /graphql
  -> Mutation.AddUser
  -> AccountsService.GetById
  -> UsersService.GetByEmail + CreateAsync
  -> DbContext.SaveChangesAsync
```

### Tabla de dependencias (frontend)
| M?dulo | Depende de | Motivo |
|---|---|---|
| `src/main.jsx` | `ApolloProvider`, `GraphqlProvider` | Inicializa Apollo Client global |
| `src/router/Routing.jsx` | `AuthProvider`, `PrivateLayout`, `PublicLayout` | Orquestaci?n de rutas |
| `AuthProvider` | `localStorage` | Inicializa sesi?n desde storage |
| `PrivateLayout` | `useAuth` | Gating por `auth.id` |
| `GraphqlProvider` | `ApolloClient` | Configuraci?n del endpoint GraphQL |
| `Login.jsx` | `authenticateUser` mutation, `localStorage` | Login y persistencia de sesi?n |
| `Register.jsx` | `addUser` mutation | Alta de usuarios |
