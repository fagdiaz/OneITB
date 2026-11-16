# Research: Microsoft Entra Institutional SSO

## Decision 1: Authorization Code + PKCE

The SPA uses MSAL and Authorization Code with PKCE. Implicit flow is rejected. The SPA
is a public client and therefore receives no client secret.

## Decision 2: API access token exchange

React requests the delegated OneITB API scope and sends that access token to
`microsoftLogin`. An ID token proves sign-in to the SPA but is not accepted as API
authorization. A Microsoft Graph token is also rejected because its audience is not the
OneITB API.

## Decision 3: Single tenant

Authority and metadata are tenant-specific. The validator independently verifies `tid`
and exact issuer/audience. `common`, consumer identities and guest tenants are outside
scope.

## Decision 4: Immutable identity

`oid` plus `tid` is the stable external key. Email is used only for the first validated
link to an existing institutional account. Subsequent login resolves by the immutable
external key.

## Decision 5: Local authorization remains canonical

Entra roles/groups are ignored. New identities receive Student. OneITB roles and the
OneITB JWT remain the only authorization source for GraphQL.

## Decision 6: Token lifecycle

MSAL stores its transient cache in `sessionStorage`. OneITB never persists Microsoft
access, ID or refresh tokens. Logout clears MSAL and the existing Apollo/WebSocket/local
session boundary.

## Primary references

- Microsoft identity platform authorization code flow:
  https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow
- Access token validation:
  https://learn.microsoft.com/entra/identity-platform/access-tokens
- Expose an API and delegated scopes:
  https://learn.microsoft.com/entra/identity-platform/quickstart-configure-app-access-web-apis
- MSAL React SPA guidance:
  https://learn.microsoft.com/entra/identity-platform/quickstart-single-page-app-sign-in
