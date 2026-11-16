# Data Model: Social Policy and UI Bootstrap Resilience

## Persistent Model

No EF Core model or migration is required.

## Existing Policy State

### User.MutedUntil

Administrative sanction:

- nullable UTC timestamp;
- if greater than current UTC, content/reaction creation is denied;
- applies globally to the sanctioned account.

### UserInteraction(Type = Mute)

Observer preference:

- scoped to `ObserverId -> TargetId`;
- hides target content for that observer;
- does not prohibit the target from acting.

These concepts MUST remain separate.

## Frontend Runtime State

### AppProviders

| State | Rule |
|---|---|
| ApolloClient instance | created once per application lifecycle |
| Provider render | descendant of global boundary |

### BootstrapFailure

| Field | Rule |
|---|---|
| ErrorId | generated without requiring providers |
| SafeMessage | institutional generic copy |
| Cause | logged safely, never rendered with internals |

## Invariants

1. Muted reaction denial has zero persistent/event side effects.
2. No schema drift occurs.
3. Fallback rendering does not depend on the failing subsystem.
4. One application lifecycle owns one Apollo cache/client/WebSocket graph.
