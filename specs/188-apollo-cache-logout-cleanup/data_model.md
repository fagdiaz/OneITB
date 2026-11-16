# Data Model: Apollo Logout Session Isolation

## Persistent Data

No backend entity or EF migration is involved.

## Client Session State

| State | Owner | Cleanup requirement |
|---|---|---|
| token/user | localStorage and GeneralDataProvider | Remove synchronously |
| auth/isAuthenticated/token | AuthContext | Reset before protected queries continue |
| normalized entities | Apollo InMemoryCache | Await clearStore |
| active query observers | mounted React/Apollo hooks | Unmount or skip on auth false |
| WebSocket session | graphql-ws connection/subscriptions | Invalidate old generation and reconnect lazily |
| expiration message | sessionStorage | Preserve only the intended one-shot flag |
| sessionVersion | AuthContext | Increment once per completed transition |

## Invariants

1. No user-scoped cache entity survives completed logout.
2. Old-session events cannot write after the session generation changes.
3. New credentials are installed only after prior cleanup completes.
4. Concurrent logout signals converge on one idempotent transition.
5. Anonymous startup tolerates missing or malformed persisted user data.

## Acceptance Criteria

- Cache and rendered identity are clean between users.
- Transport reconnects with only the current token.
- No server or database schema change occurs.
