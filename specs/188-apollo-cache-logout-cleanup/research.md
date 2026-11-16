# Research: Apollo Logout Session Isolation

## Audited Baseline

- AuthContext.logout removes localStorage credentials, resets provider values, clears React auth state and awaits GraphQLProvider.clearApolloStore().
- AuthContext.login also clears Apollo before installing the new session.
- GraphqlProvider.handleSessionExpired removes localStorage and invokes clearStore, but it is a separate flow with forced page navigation.
- The graphql-ws client reads the token in connectionParams, but an already-open socket/subscription may retain the previous authenticated session until disposed.
- No focused frontend test currently proves cache and subscription isolation across users.

## Ordering Decision

The safe transition is:

1. Acquire an idempotent termination guard.
2. Remove credentials and provider identity.
3. Set React authentication false so protected trees/subscriptions unmount.
4. Invalidate old-session event delivery.
5. Await Apollo clearStore without refetch.
6. Redirect/notify according to reason.
7. Release the guard only after cleanup settles.

Login must await the same cleanup promise before storing new credentials.

## Cache vs Transport

clearStore removes normalized entities but does not itself prove WebSocket isolation. The implementation needs a session generation check or a restartable transport lifecycle so payloads associated with a previous generation are ignored after termination. Directly disposing a singleton graphql-ws client without recreating the Apollo link is unsafe.

## Rejected Alternatives

- **resetStore on logout**: can refetch mounted queries after credentials are removed.
- **Only clear localStorage**: Apollo and component state still retain sensitive data.
- **window.location reload as the sole fix**: hides lifecycle defects and is hard to test.
- **Create a new Apollo client per render**: destroys cache predictability and causes churn.
- **Dispose the singleton socket permanently**: future subscriptions may never reconnect.

## Quick Win

Guard localStorage user hydration with safe JSON parsing. Corrupt local state should fall back to anonymous and trigger the same cleanup path rather than crash the application before route guards render.

## Acceptance Research Gate

Tests must include cache, UI identity and late-event behavior. A spy proving clearStore was called is necessary but not sufficient.
