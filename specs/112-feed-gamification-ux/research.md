# Research: Feed Gamification UX

## Decision: Use existing user metrics for badges

**Rationale**: Spec 111 exposes post, comment, like, and report counters. The UI can derive badges without adding persisted badge state.

**Alternatives considered**: Persisting badge entities was rejected because the requested badges are lightweight and threshold-based.

## Decision: Link names through React Router

**Rationale**: The public profile route already exists and should be reused from feed/comment surfaces.

**Alternatives considered**: Opening a modal profile preview was rejected to keep this slice focused.

## Decision: Admin content preview as local modal

**Rationale**: Admin reviewers need full content without route changes. A local modal is sufficient and avoids introducing a new admin route.

**Alternatives considered**: A dedicated detail page was rejected as heavier navigation.
