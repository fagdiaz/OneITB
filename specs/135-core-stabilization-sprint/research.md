# Research: Core Stabilization Sprint

## Decision: Validate deferred features before implementing new P1 work

**Rationale**: Specs 118, 119, 121, and 122 were compile-validated while the local runtime was blocked. Updating roadmap status or building new work on top of those flows without live checks would violate evidence-based completion.

**Alternatives considered**:
- Implement P1 features first: rejected because failures in upload, subject, or admin security contracts could invalidate later work.
- Mark prior features verified from builds: rejected by constitution and roadmap rules.

## Decision: Use cursor-like feed pagination

**Rationale**: The feed is ordered by social priority and recency. Offset pagination is simpler but can duplicate or skip items when content changes between requests. A cursor based on the deterministic ordering keys gives a stable user experience and avoids loading the entire feed.

**Alternatives considered**:
- Raw offset pagination: simpler, but less stable under inserts/deletes.
- HotChocolate built-in paging only: useful but must preserve existing custom social priority and filters; implementation will use project patterns first.

## Decision: Preserve existing `GetInquiries` behavior while adding paginated contract

**Rationale**: Existing profile/feed queries may depend on `getInquiries`. Adding a paginated query or optional pagination fields reduces risk, then frontend can migrate the main feed to the bounded contract.

**Alternatives considered**:
- Breaking `getInquiries` to return a connection object: rejected because it risks broad frontend breakage.

## Decision: Add persistent `ModerationAudit`

**Rationale**: Existing moderation operations include user role/status, content soft-delete, report status, and silence actions. A dedicated durable record gives administrators a reviewable trail without overloading `CommunityReport`.

**Alternatives considered**:
- Store audit text in existing report rows: rejected because many moderation actions do not originate from reports.
- Log only to console/file: rejected because audit must be queryable from the admin panel and survive process restarts.

## Decision: Implement upload cleanup as service plus hosted scheduler

**Rationale**: Cleanup must be testable on demand and run automatically. Splitting the file-scanning component from the hosted interval makes runtime validation possible without waiting for a long timer.

**Alternatives considered**:
- Manual admin-only cleanup mutation: rejected as incomplete operational stability.
- Delete immediately after failed mutation in frontend only: helpful but insufficient because failures can happen after upload and before client cleanup.

## Decision: Conservative retention window for orphan files

**Rationale**: Detached upload means a file may exist briefly before its GraphQL mutation links it. Cleanup should avoid deleting fresh files that are in-flight.

**Alternatives considered**:
- Immediate deletion of unreferenced files: rejected due race risk.
- Never delete files automatically: rejected by P1 roadmap.

## Decision: Runtime validation uses seeded admin and local smoke artifacts

**Rationale**: The local environment now uses LocalDB and the app initializer can seed realistic users/content. Tests should prefer seeded accounts and small temporary upload files to avoid manual setup.

**Alternatives considered**:
- Browser-only validation: rejected because backend contracts need deterministic evidence.
- Unit tests only: useful later, but current blocker requires live persistence and auth checks.
