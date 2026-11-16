# Research: Social Policy and UI Bootstrap Resilience

## Audited Baseline

### Social policy

- `AddInquiryAsync` and `AddCommentAsync` call `EnsureUserCanCreateContentAsync`.
- `ToggleCommentReactionAsync` also calls the guard with action `reaccionar`.
- `ToggleReactionAsync` checks only that the user is active and therefore ignores `MutedUntil`.
- The method can both insert and delete a `Reaction` and may emit a grouped notification.
- `InteractionType.Mute` is an observer-owned social graph preference used by feed exclusion; it is separate from administrative `User.MutedUntil`.

### Frontend bootstrap

Current tree:

~~~text
ApolloProvider(new GraphQLProvider().apolloInstance)
  ThemeProvider
    GlobalErrorBoundary
      App
~~~

The boundary can catch descendants of `GlobalErrorBoundary`, but not provider errors above it. Additionally, `new GraphQLProvider()` is evaluated while constructing the element tree, before any error boundary can catch it.

## Decisions

### D1 - Reuse the centralized moderation guard

Call `EnsureUserCanCreateContentAsync(userId, "reaccionar", cancellationToken)` at the start of publication reaction handling. Do not duplicate a second `MutedUntil` query or alter observer-level mute behavior.

The guard/write race is acceptable under the current policy because silence state is not transactionally coupled to every social write. A second database-level constraint is not practical. Tests use deterministic pre-existing silence.

### D2 - Make the error boundary truly outer

Target React tree:

~~~text
GlobalErrorBoundary
  AppProviders
    ApolloProvider
      ThemeProvider
        App
~~~

`AppProviders` lazily creates one Apollo client inside its render lifecycle (for example, a stable state initializer), allowing the outer boundary to catch factory/provider errors.

### D3 - Add a pre-mount bootstrap guard

Failures before `root.render` or while locating the root element cannot be caught by a React boundary. Wrap bootstrap in `try/catch` and render a small dependency-free fallback into the root. Share presentation through a pure fallback component/function where feasible without requiring providers.

### D4 - Keep fallback self-contained

No `useTheme`, Apollo hooks, router or auth context. Use static dual-safe colors and a robust error ID generator with a fallback when Web Crypto is unavailable.

## Rejected Alternatives

- Optional chaining around providers: does not catch construction errors.
- Move only the existing boundary one JSX level up while still evaluating `new GraphQLProvider()` as a prop: construction can still throw before boundary mount.
- Create Apollo client inside component body each render: causes cache/session/WebSocket duplication.
- Clear session automatically on any render error: conflates UI faults with authentication and can destroy valid state.
- Treat personal Mute as administrative sanction: changes product semantics.

## Observability

Error telemetry/logging must include error ID, safe message and component stack in Development. It must exclude Apollo cache contents, JWT/localStorage values and GraphQL variables.

