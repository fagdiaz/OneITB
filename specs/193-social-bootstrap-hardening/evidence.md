# Evidence: Social Policy and UI Bootstrap Resilience

## Planning Baseline (2026-07-27)

- Confirmed: `ToggleReactionAsync` does not call the central `MutedUntil` guard.
- Confirmed: `ToggleCommentReactionAsync`, publication creation and comment creation do call it.
- Confirmed: observer-level `InteractionType.Mute` is a separate feed preference and is correctly implemented.
- Confirmed: `GlobalErrorBoundary` is nested below `ApolloProvider` and `ThemeProvider`.
- Confirmed: `new GraphQLProvider().apolloInstance` is evaluated while constructing the outer element and can fail before the current boundary mounts.

## Implementation Evidence (2026-07-28)

### Social policy

- TDD baseline: both muted-user tests failed because `ToggleReactionAsync` allowed insert and delete.
- `ToggleReactionAsync` now calls the central `EnsureUserCanCreateContentAsync` guard before loading or mutating the publication reaction.
- Tests prove a denied like inserts nothing, a denied unlike preserves the existing row and neither path invokes `INotificationService`.
- Cancellation is propagated before side effects.
- Observer-owned `InteractionType.Mute` remains a feed filter and does not set or emulate the administrative `MutedUntil` sanction.
- `Mutation.ToggleReaction` maps policy rejection to the stable GraphQL code `USER_ERROR`.

### Bootstrap resilience

- `main.jsx` delegates to an async bootstrap guard and dynamically loads the application/provider graph.
- `GlobalErrorBoundary` is the outer React boundary around Apollo, Theme and the application tree.
- `AppProviders` lazily owns one Apollo client per mounted application lifecycle.
- A provider-independent `InterfaceFailureView` handles client factory, Apollo provider, theme provider and child failures.
- A static DOM fallback remains available when React root creation itself fails.
- Diagnostics contain only error ID, error type and Development component stack; exception messages, tokens, cache and user data are excluded.
- Existing Spec 188 cache purge, session epoch and WebSocket cleanup tests remain green.

### Commands and results

~~~text
dotnet test ... --filter "SocialServiceTests.ToggleReactionAsync_RejectsMutedUser..."
TDD FAIL as expected: 2 denied paths previously accepted.

npm.cmd run test -- --run src/ApplicationRoot.test.jsx src/bootstrap.test.jsx
TDD FAIL as expected: bootstrap modules did not yet exist.

dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
PASS: 147/147 after the final resolver-contract test.

npm.cmd run test -- --run
PASS: 30 files / 72 tests.

dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
PASS: 0 warnings / 0 errors.

npm.cmd run build
PASS: 379 modules, 762 ms in the final QA gate.

dotnet ef migrations has-pending-model-changes --configuration Release --no-build ...
PASS: no model changes. A process-only JWT test key was supplied because tracked configuration intentionally contains no signing secret.

git -c core.autocrlf=false diff --check
PASS.
~~~

## Deferred Runtime Evidence

- Authenticated like/unlike smoke for a silenced account: not executed because this session must not start a web server.
- Normal and forced-failure browser bootstrap smoke: not executed for the same reason.
- No Kestrel, Vite development server or other blocking process was started.

## Status

**Implemented `[I]`**. Automated policy, resolver, bootstrap, session, build and EF gates pass. Runtime/browser smokes are required before elevation to `[V]`.
