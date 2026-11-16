# Data Model: Profile/CV Consolidation & Cleanup

No new database entities or columns are introduced.

## Existing Entity: User

Fields used by this spec:

- `Id`
- `FirstName`
- `LastName`
- `Alias`
- `Role`
- `Biography`
- `LinkedIn`
- `Facebook`
- `Instagram`
- `Phone`
- `Account.Email` via existing GraphQL resolver

## Authorization Rules

- `me`: authenticated users only; returns the active user identified by JWT.
- `updateProfile`: authenticated users only; `input.id` must match JWT user id unless role is `Administrador`.
