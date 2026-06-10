# Research Notes: Fix Profile GraphQL 400 (027)

## Query Parameters and Syntax
We investigated the GraphQL schema definitions mapping:
- In `Startup.cs`, `ObjectType<User>` maps `alias` directly to `descriptor.Field("alias")` which resolves to the `FirstName` field.
- The GraphQL client query previously sent `username: alias`, which represents a rename query syntax. However, it also declared a query signature that expected parameter variable `$id` which wasn't declared or required by the `users` collection query method `GetUsers([Service] IUsersService usersService)`.
- Eliminating the unused parameter definition `($id: ID!)` resolves the HTTP 400 parsing block.
