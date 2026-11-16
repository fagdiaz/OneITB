# Research: Privacy Controls and SMTP Smoke Tests

## Decision: Persist privacy on `User`

**Rationale**: Profile privacy is a user-owned preference and belongs with profile identity state. A scalar boolean avoids a new table and keeps defaults explicit.

**Alternatives considered**: Separate `ProfileSettings` table. Rejected because there is only one setting and no additional aggregate behavior today.

## Decision: Mask DTO fields in GraphQL

**Rationale**: Backend masking prevents accidental disclosure from any frontend client. Existing `PublicProfileSummary` is the correct boundary.

**Alternatives considered**: Hide fields only in React. Rejected as insecure.

## Decision: Allow full view for owner, admin, moderator and followers

**Rationale**: Owner/admin/moderator access is required for self-service and governance. Existing `Follow` relation is used as the approved follower signal.

**Alternatives considered**: Add follower approval workflow. Rejected as too large for Code Freeze and not explicitly implemented elsewhere.

## Decision: SMTP smoke test uses `IEmailSender`

**Rationale**: Reusing the configured email sender verifies the exact production/fallback wiring without exposing SMTP internals.

**Alternatives considered**: Add REST health endpoint. Rejected because business operations must stay GraphQL.
