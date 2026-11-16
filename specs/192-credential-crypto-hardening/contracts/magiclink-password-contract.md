# Contract: Magic Link Delivery and Password Policy

## Request Magic Link

~~~graphql
mutation RequestMagicLink($email: String!, $cuit: String!) {
  requestMagicLink(email: $email, cuit: $cuit) {
    accepted
    message
  }
}
~~~

The payload is generic and never includes a token, account ID or existence signal.

## Email Link

The email contains a frontend URL with the credential in the fragment:

`{FrontendBaseUrl}/employer-login#token={one-time-credential}`

The frontend:

1. validates bounded token shape;
2. moves it to component memory;
3. removes the fragment using `history.replaceState`;
4. submits it only to `loginWithMagicLink`;
5. clears it after success/failure/navigation.

## Redemption

~~~graphql
mutation LoginWithMagicLink($token: String!) {
  loginWithMagicLink(token: $token)
}
~~~

Success remains the standard signed JWT string. Invalid, expired, replayed and throttled credentials use stable generic errors.

## Password Hashing Contract

- algorithm: BCrypt as currently persisted;
- production work factor: explicit validated configuration, default 12 and minimum 10;
- verification reads the cost embedded in existing hashes;
- successful login upgrades hashes below policy;
- no password or hash appears in GraphQL/logs.

## Environment Contract

| Environment | Magic Link delivery | JWT key |
|---|---|---|
| Development | ignored local pickup or explicitly configured SMTP | user-secrets |
| Test | fake sender | test-only strong deterministic fixture |
| Production | configured SMTP/provider required | environment/secret store required |

