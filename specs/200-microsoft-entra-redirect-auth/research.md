# Research: Microsoft Entra Redirect Authentication

## Decision 1 - Dedicated callback instead of `/login`

`/login` contains an interactive Microsoft action. Returning authentication responses to
that screen previously enabled nested interactions inside a popup. The callback is
therefore isolated at `/auth/microsoft/callback` and has no authentication button.

## Decision 2 - Remain on callback after MSAL processing

MSAL normally may navigate back to the page that initiated the request. The client uses
`navigateToLoginRequestUrl: false` so routing and the OneITB exchange are controlled by
the callback rather than by a second Login render.

## Decision 3 - Preserve the access-token contract

The backend validates a delegated access token for the OneITB API scope. An ID token is
not a substitute. After redirect processing, the callback selects the account and calls
`acquireTokenSilent` for the existing scope before invoking GraphQL.

## Decision 4 - Deduplicate the complete transaction

A component-local ref is insufficient under Strict Mode remounts. A module-level map
stores the in-flight/completed promise by random flow ID. The operation includes token
acquisition, GraphQL exchange, local session hydration, and navigation. Failures evict
the entry so an explicit retry can start a new flow.

## Rejected Alternatives

- Keep `loginPopup`: retains mobile/accessibility and nested-popup failure modes.
- Exchange an ID token: violates the current backend contract and token audience model.
- Automatically invoke another redirect from callback: risks infinite retry loops.
- Persist Microsoft access tokens manually: expands exposure without necessity.
