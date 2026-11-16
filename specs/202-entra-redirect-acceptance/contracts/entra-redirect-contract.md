# Contract: Microsoft Entra SPA Redirect

## Request

- Authorization method: redirect, not popup.
- Client: configured OneITB SPA application.
- Redirect URI: exact local or deployed callback ending in
  `/auth/microsoft/callback`.
- Scope: delegated OneITB API scope plus OIDC scopes managed by MSAL.
- Prompt: account selection is allowed.

## Callback

- Route does not render an interactive sign-in button while MSAL handles the redirect.
- Account selection fails closed if the response is ambiguous.
- Delegated token acquisition is silent after redirect completion.
- GraphQL token exchange runs exactly once per flow descriptor.
- Successful exchange installs only the canonical OneITB JWT session.

## Configuration Validation

- `http` is valid only on `localhost` or `127.0.0.1`.
- Non-local origins require `https`.
- Query, fragment, username, and password are forbidden.
- Callback path must equal `/auth/microsoft/callback`.

## Failure

- `AADSTS50011`: operator fixes the SPA registration; application headers remain unchanged.
- User cancellation: callback shows a recoverable error and explicit retry.
- Invalid/expired flow: callback clears temporary state and returns safely to login.
- Backend token rejection: no local session is installed.
