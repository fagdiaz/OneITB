# Research: Profile Data Binding Fixes

## Decision: Persist avatar URL on User

**Rationale**: The upload endpoint already owns binary storage. The user profile only needs a durable URL reference, keeping GraphQL free of multipart uploads.

**Alternatives considered**: GraphQL Upload scalar, rejected because the project already standardized detached uploads.

## Decision: Career selection rides on updateProfile

**Rationale**: Profile edit is the user-owned identity form. Sending `careerIds` with the same mutation avoids split saves and UI inconsistency.

**Alternatives considered**: Keep separate `linkUserToCareers`; retained for compatibility but not used as the canonical profile editor flow.

## Decision: Title case names, case-insensitive email login

**Rationale**: Names are display identity and should be normalized. Email casing is risky for authentication, so login remains case-insensitive while display can be capitalized.
