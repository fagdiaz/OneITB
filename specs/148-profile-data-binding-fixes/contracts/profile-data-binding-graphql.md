# GraphQL Contract: Profile Data Binding

## Query `me`

```graphql
query GetUserProfile {
  me {
    id
    firstName
    lastName
    fullName
    email
    avatarUrl
    userCareers { career { id name code } }
  }
}
```

## Query `publicProfile`

```graphql
query PublicProfile($userId: UUID!) {
  publicProfile(userId: $userId) {
    id
    fullName
    avatarUrl
    careers
  }
}
```

## Mutation `updateProfile`

```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    success
    message
  }
}
```

Input adds:

- `avatarUrl: String`
- `careerIds: [Int!]`
