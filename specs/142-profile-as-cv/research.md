# Research: Profile as a CV

## Decision: Use the existing `publicProfile` GraphQL summary as the primary profile contract

**Rationale**: The backend already exposes `PublicProfileSummary` with full name, role, biography, social/contact fields, careers and total publication count. This avoids backend expansion and keeps the feature focused on UI/UX.

**Alternatives considered**: Continuing to alias `userById` was rejected because that object does not expose `careers` or `totalPublications` consistently.

## Decision: Show owner-only academic progress only when viewing `/profile`

**Rationale**: Academic progress can contain grades or status. It adds CV value to the owner but should not be exposed on public profiles without a dedicated privacy requirement.

**Alternatives considered**: Showing progress for every viewed profile was rejected because it would broaden privacy exposure.

## Decision: Derive public trajectory signals from careers and publication subjects

**Rationale**: Public posts already include subject metadata and can show areas of participation without requiring new backend data.

**Alternatives considered**: Adding a new backend profile aggregation endpoint was rejected as unnecessary for this visual refactor.

## Decision: Use Tailwind and FontAwesome only

**Rationale**: The project baseline uses Tailwind v4 and bundled FontAwesome. No design-system package is needed for a responsive institutional CV layout.

**Alternatives considered**: Installing component libraries was rejected to avoid bundle growth and visual inconsistency.
