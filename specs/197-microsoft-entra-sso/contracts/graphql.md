# GraphQL Contract

## Mutation

```graphql
mutation MicrosoftLogin($accessToken: String!) {
  microsoftLogin(accessToken: $accessToken) {
    token
    username
    isAuthenticated
    id
    role
  }
}
```

## Profile field

```graphql
query GetUserProfile {
  me {
    institutionalAccountLinked
  }
}
```

## Controlled error codes

| Code | Meaning |
|---|---|
| `ENTRA_NOT_CONFIGURED` | Integration disabled or incomplete |
| `ENTRA_INVALID_TOKEN` | Token failed validation without revealing why |
| `ENTRA_ACCOUNT_CONFLICT` | Valid identity conflicts with an existing link |
| `ENTRA_RATE_LIMITED` | IP or identity exchange limit exceeded |
| `ENTRA_ACCOUNT_DISABLED` | Local OneITB account is inactive |

No error contains raw tokens, external object IDs, tenant IDs or account-enumeration
details.
