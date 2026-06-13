# Mapa de dependencias V1

> Snapshot actualizado el 2026-06-13. El estado operativo vigente se mantiene
> en `fix-roadmap-13-06-2026.md`.

## Backend

```text
HotChocolate Query/Mutation
  -> Services interfaces
    -> Services implementations
      -> UnitOfWork / OneItbContext
        -> SQL Server
```

Excepcion temporal: los resolvers de `subjects`, `inquiries` y `addInquiry`
usan `OneItbContext` directamente. Deben revisarse durante la estabilizacion
para recuperar la separacion por servicios.

## Feed

```text
Feed.jsx
  -> GET_SUBJECTS
  -> GET_INQUIRIES
  -> CREATE_INQUIRY
  -> Apollo Client
  -> /graphql
  -> Query.GetSubjects / Query.GetInquiries / Mutation.AddInquiry
  -> OneItbContext
  -> SQL Server
```

Brecha actual:

```text
Frontend solicita Inquiry.user.idUsuario/nombre/apellidos
Esquema expone User.id/firstName/lastName
Inquiry no expone user
```

## Autenticacion

```text
Login.jsx
  -> login mutation
  -> AccountsService
  -> BCrypt verification
  -> JWT
  -> AuthContext
  -> Apollo authLink
```

Deuda actual: `AuthContext` y `GraphqlProvider` mantienen compatibilidad con
`token` y `access_token`; debe quedar una unica fuente de verdad.
