# Contract: OneITB Session Commit After Microsoft Redirect

## Preconditions

- MSAL interaction status is `None`.
- A valid, unexpired redirect flow exists.
- Exactly one active/eligible Microsoft account exists.
- The delegated token exchange returns authenticated OneITB identity data.

## Establishment

`login(oneItbJwt, user, { identityProvider: 'microsoft' })` MUST:

1. wait for prior termination;
2. invalidate prior Apollo/WS transport;
3. preserve MSAL cache;
4. replace canonical OneITB token/user state;
5. increment the session epoch.

All callers omitting the option use `local` and MUST clear stale MSAL state.

## Completion Gate

The callback MAY complete and navigate only when all are true:

- `isAuthenticated === true`;
- canonical token is non-empty;
- canonical `auth.id` equals the exchanged `userId`.
- canonical session epoch advanced beyond the pre-exchange value.

The completed flow stores no token or personal claims. Timeout/failure clears transient
flow and provider state and renders a controlled recovery action.
