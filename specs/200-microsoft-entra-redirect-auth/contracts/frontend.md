# Frontend Contract: Microsoft Redirect Authentication

## Initiation

- Method: `loginRedirect(microsoftLoginRequest)`.
- Preconditions: MSAL configured, `inProgress === None`, no local initiation pending.
- Side effect: an ephemeral flow descriptor is written without credentials.

## Callback

- Route: `/auth/microsoft/callback`.
- Busy condition: `inProgress !== InteractionStatus.None`.
- Account source: active account, otherwise first returned cached account.
- Token source: `acquireTokenSilent` for `VITE_ENTRA_API_SCOPE`.
- Exchange: existing `microsoftLogin(accessToken: String!)` mutation.
- Session: existing `AuthContext.login(token, user)`.
- Success navigation: sanitized `returnTo`, otherwise `/feed`, with history replacement.

## Failure

- No automatic login redirect is started.
- Error UI uses `role=alert` and provides an explicit return to `/login`.
- Tokens and claims are not displayed or logged.
