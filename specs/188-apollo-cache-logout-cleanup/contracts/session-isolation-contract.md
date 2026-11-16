# Contract: Apollo Logout Session Isolation

## Canonical Termination API

The frontend exposes one asynchronous operation conceptually equivalent to:

~~~javascript
await terminateSession({ reason: 'manual' | 'expired' | 'remote' });
~~~

The operation is idempotent and completes only after credentials, React auth state, Apollo cache and old-session transport delivery are invalidated.

## Ordering Contract

1. Credentials become unavailable to links.
2. Protected UI is marked unauthenticated.
3. Old session observers/transports are invalidated.
4. Apollo clearStore completes.
5. Navigation and reason-specific message execute.

## Login Contract

- Login awaits pending termination.
- Cache is clean before current credentials are stored.
- Session-expiration guard resets for the new session.
- Private queries/subscriptions start with the new token.

## Error Contract

- Cleanup failures are logged without cached entity contents or tokens.
- The UI remains anonymous even if cache cleanup reports an error.
- Multiple 401/403 responses trigger one user-visible expiration notification.

## Verification Contract

Tests must assert actual cache contents and rendered identity, not only invocation counts. A late old-generation subscription payload must be ignored.
