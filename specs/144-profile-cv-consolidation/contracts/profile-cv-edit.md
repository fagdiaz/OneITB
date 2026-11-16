# Contract: Profile/CV Edit

## Query

```graphql
query GetUserProfile {
  me {
    id
    firstName
    lastName
    fullName
    alias
    email
    role
    biography
    linkedIn
    facebook
    instagram
    phone
  }
}
```

## Mutation

```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    success
    message
  }
}
```

## Security

- `me` requires JWT authentication.
- `updateProfile` requires JWT authentication.
- Backend rejects cross-user updates unless the actor role is `Administrador`.
