# Contract: Moderation Guard and Frontend Bootstrap

## Publication Reaction Denial

For an authenticated user where `MutedUntil > UtcNow`:

- `toggleReaction(inquiryId)` returns the existing controlled social/user error;
- no `Reaction` row is inserted or removed;
- no grouped notification is created/reopened;
- cancellation remains unmodified.

When silence is absent/expired, existing payload shape remains:

~~~graphql
type ToggleReactionPayload {
  inquiryId: UUID!
  isReacted: Boolean!
  reactionCount: Int!
  reactionId: UUID
}
~~~

## Bootstrap Tree Contract

~~~text
root.render(
  GlobalErrorBoundary
    AppProviders
      ApolloProvider
        ThemeProvider
          App
)
~~~

`AppProviders` owns one lazily created Apollo client. The error fallback is renderable without router, Apollo, auth or theme context.

## Pre-Mount Failure Contract

Errors before React boundary coverage are caught by the bootstrap entry point and render equivalent institutional fallback markup into `#root`.

## Logging Contract

Allowed:

- generated error ID;
- safe error message/name;
- component stack in Development;
- correlation ID when available.

Forbidden:

- JWT/localStorage values;
- Apollo cache or GraphQL variables;
- email, CV or message content;
- automatic session clearing solely due to a render error.

