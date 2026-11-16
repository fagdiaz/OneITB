# Data Model: Core Stabilization Sprint

## Existing Entities Used

### Subject

- Existing academic entity.
- Must be validated with:
  - career association
  - year value
  - prerequisite collection

### Inquiry

- Existing publication entity.
- Used by feed pagination, file references, cleanup preservation, moderation audit target, and runtime upload validation.
- Soft-delete remains active.

### Comment

- Existing comment entity.
- Used by file references, cleanup preservation, moderation audit target, and runtime rich-media validation.
- Soft-delete remains active.

### User

- Existing identity/profile entity.
- Used as actor and target for admin/superadmin validation and moderation audit.

### CommunityReport

- Existing report entity.
- Used by moderation audit and admin review flows.

## New Entity: ModerationAudit

Purpose: durable record of successful moderation/admin actions.

Fields:

- `Id`: unique identifier.
- `ActorUserId`: administrator or moderator who performed the action.
- `TargetUserId`: optional target user.
- `TargetInquiryId`: optional target publication.
- `TargetCommentId`: optional target comment.
- `TargetReportId`: optional target report.
- `Action`: required action code such as `UpdateUserRole`, `UpdateUserStatus`, `SilenceUser`, `ToggleInquiryStatus`, `ToggleCommentStatus`, `UpdateReportStatus`.
- `Summary`: bounded human-readable summary for admin review.
- `CreatedAt`: UTC timestamp.

Relationships:

- `ActorUser` required, `DeleteBehavior.Restrict`.
- Optional target relationships to `User`, `Inquiry`, `Comment`, and `CommunityReport`, all `DeleteBehavior.Restrict`.

Validation:

- `Action` required and bounded.
- `Summary` required and bounded.
- At least one target identifier should be present.
- Audit rows are append-only for this sprint.

## New Contract Shape: InquiryPage

Purpose: bounded feed result.

Fields:

- `Items`: ordered publications.
- `NextCursor`: opaque string or null.
- `HasNextPage`: boolean.
- `TotalCount`: optional count for UI display when inexpensive.

Ordering:

- First by followed-author priority for authenticated users.
- Then by creation timestamp descending.
- Then by identifier descending as deterministic tie-breaker.

## Upload Cleanup Candidate

Purpose: in-memory representation of files under upload storage.

Fields:

- `RelativeUrl`: `/uploads/{file}`.
- `PhysicalPath`: absolute path.
- `LastWriteTimeUtc`: file timestamp.
- `IsReferenced`: true if linked by any `Inquiry.FileUrl` or `Comment.FileUrl`.

Deletion rule:

- Delete only when `IsReferenced == false` and age exceeds configured retention.
