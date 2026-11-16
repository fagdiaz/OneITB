# GraphQL Contract: Unified Profile/CV

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
    cvDataJson
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

Input fields:

- `id`
- `biography`
- `linkedIn`
- `facebook`
- `instagram`
- `phone`
- `cvDataJson`

## Authorization

- Query `me`: authenticated users only.
- Mutation `updateProfile`: authenticated users only; non-admin actors may update only their own profile.
