# State Model: Microsoft Session Commit

This spec introduces no database entity or migration. It formalizes transient frontend
state.

## Identity Provider

- `local`: password, employer, Magic Link, or other non-MSAL establishment; stale MSAL
  cache is cleared before committing OneITB state.
- `microsoft`: MSAL-backed establishment; MSAL cache is preserved while OneITB JWT/user are
  committed.

## Callback Phases

1. `handlingRedirect`: MSAL is processing the response.
2. `exchangingToken`: delegated API token is acquired and exchanged once.
3. `committingSession`: OneITB credentials were accepted; callback waits for matching auth
   context state.
4. `completed`: flow is marked complete and internal navigation occurs.
5. `failed`: transient flow/provider state is cleared and a controlled error is shown.

## Pending Session Descriptor

- `flow`: validated flow ID, internal `returnTo`, creation time.
- `userId`: OneITB user ID returned by the backend.
- `expectedSessionVersion`: minimum canonical session epoch produced by this login.

It contains no access token or JWT and is held only in component memory.
