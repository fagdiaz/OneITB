# Research: Moderation Roles Safety

## Decision: Store temporary silence as `MutedUntil` on `User`

**Rationale**: A nullable timestamp is enough for the required moderation durations and avoids introducing a larger moderation-history model in this slice.

**Alternatives considered**: A separate `UserMute` table was rejected for this spec because audit history is not requested yet.

## Decision: Keep role as the existing string model and add `Egresado` as a supported value

**Rationale**: The current project stores roles as strings. Introducing an enum migration would create more churn than value for this incremental role addition.

**Alternatives considered**: A role enum or role table would be cleaner long term but would require broader auth and seeding changes.

## Decision: Block silenced users at service/mutation boundary

**Rationale**: Blocking in the backend prevents bypassing frontend controls and keeps moderation enforceable.

**Alternatives considered**: Frontend-only blocking was rejected as insecure.

## Decision: Expose metrics as GraphQL computed fields

**Rationale**: User metrics are read-only aggregates needed by moderation UI and avoid storing denormalized counters in this slice.

**Alternatives considered**: Persisted counters were rejected because they need backfill and update hooks.
