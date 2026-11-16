# Feature Specification: Spec 161 Session Cache, Search and Avatar Hardening

**Feature Branch**: `161-session-cache-search-avatar-hardening`
**Created**: 2026-07-04
**Status**: Draft
**Input**: QA hardening request for Apollo session bleed, cache field policy warnings, email search, authentication form localization, production registration constraints, and avatar canvas export accuracy.

## User Scenarios & Testing

### Scenario 1 - Logout Fully Clears Session Memory

When a user logs out and another user logs in on the same browser, Apollo must not keep cached profile, notification, chat, search or feed data from the previous account.

**Acceptance Criteria**

1. Logout clears `token` and `user` storage keys.
2. Logout explicitly clears Apollo's in-memory cache using the active Apollo client.
3. Authorization expiration handling continues to redirect to `/login`.
4. Cache purge does not trigger unsafe refetches with a removed token.

### Scenario 2 - Apollo Cache Warnings Are Eliminated Deliberately

When feed or message result sets are replaced due to new filters, pagination or session changes, Apollo should not warn that cache data may be lost.

**Acceptance Criteria**

1. `Query.inquiries` has an explicit field policy.
2. Paginated feed and messaging fields have explicit field policies.
3. The policy preserves existing UI behavior: filtered first-page results replace stale data; fetchMore/updateQuery remains the pagination authority.

### Scenario 3 - Search Finds Users by Institutional Email

When searching for a profile using an institutional email or email fragment, matching profiles appear in the global search profile section.

**Acceptance Criteria**

1. Backend profile search includes `Account.Email`.
2. Matching remains bounded by existing result limits.
3. Existing first name, last name and full name matches continue working.

### Scenario 4 - Registration Is Presentation-Ready

Public registration must enforce institutional email and present Spanish password copy correctly.

**Acceptance Criteria**

1. Registration role selection remains single-choice and excludes administrative roles.
2. Registration email requires `@itbeltran.com.ar` using the production mock regex.
3. Login/register visible copy uses `Contraseña`/`contraseña`, not `Contrasena`/`contrasena`.

### Scenario 5 - Avatar Export Matches Preview

When a user edits an avatar, the exported file must match the visible square preview, including pan, zoom, rotation, flip and filters.

**Acceptance Criteria**

1. Canvas preview and exported crop use the same square coordinate system.
2. Zoom slider supports values below `1` while preserving a fully covered square canvas.
3. Pan clamping prevents blank borders.
4. Exported blob is a square JPEG derived from the visible preview.

## Requirements

- **REQ-001**: Apollo client cache must be clearable from the auth logout flow.
- **REQ-002**: `InMemoryCache` must define explicit `Query` field policies for feed and messaging fields that are replaced or paginated.
- **REQ-003**: Backend public profile search must include institutional email matching.
- **REQ-004**: Authentication forms must display Spanish password labels with `ñ`.
- **REQ-005**: Public registration must enforce institutional email format `^[a-zA-Z0-9._%+-]+@itbeltran\.com\.ar$`.
- **REQ-006**: Public registration role selector must remain single-value and non-administrative.
- **REQ-007**: Avatar editor export must be mathematically consistent with the displayed crop.

## Constraints

- No new third-party dependencies.
- No schema or migration changes.
- No administrative role assignment from public registration.
- No plaintext secrets or changes to production security posture.
- Business data remains GraphQL; `/api/upload` remains the only REST exception.
- Preserve Spec 159/160 search scoping and chat behavior.

## Out of Scope

- Full runtime browser automation if the local dev server is not already running.
- CI pipeline changes.
- New search indexes or database schema changes.
