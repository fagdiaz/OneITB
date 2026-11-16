# Data Model: SIU Sync and Notifications

## Notification

Persistent alert for one user.

Fields:
- `Id` (`Guid`): primary key.
- `UserId` (`Guid`): recipient user FK.
- `Message` (`string`, required, max 300): user-facing summary.
- `ActionUrl` (`string`, optional, max 300): frontend route or URL.
- `Type` (`NotificationType`): category such as academic resource or grade update.
- `IsRead` (`bool`): unread/read state, default `false`.
- `CreatedAt` (`DateTime` UTC): creation timestamp.
- `ReadAt` (`DateTime?` UTC): timestamp when read.

Relationships:
- `Notification.UserId -> User.Id`, `DeleteBehavior.Restrict`.

Indexes:
- `(UserId, IsRead, CreatedAt)` for unread count and menu.
- `(UserId, CreatedAt)` for newest notifications.

Validation:
- Message is required and trimmed.
- `ActionUrl` is optional and must be relative (`/academic`) or absolute `http/https`.
- Notifications are never physically deleted in this feature.

## NotificationPreference

Per-user opt-in/opt-out state for notification categories.

Fields:
- `Id` (`Guid`): primary key.
- `UserId` (`Guid`): owner FK.
- `Type` (`NotificationType`): preference category.
- `IsEnabled` (`bool`): enabled/disabled state.
- `UpdatedAt` (`DateTime` UTC): last update timestamp.

Relationships:
- `NotificationPreference.UserId -> User.Id`, `DeleteBehavior.Restrict`.

Indexes:
- Unique `(UserId, Type)`.

Validation:
- Missing row means enabled.
- Only the authenticated user can modify their preferences.

## NotificationType

Enum:
- `AcademicResource`
- `AcademicProgress`
- `SiuSync`

Usage:
- `AcademicResource`: resource publication notifications.
- `AcademicProgress`: manual or SIU grade/progress updates.
- `SiuSync`: optional admin-facing sync summary notifications.

## SiuGradeRecord

Normalized external record returned by the SIU adapter. It is not persisted directly.

Fields:
- `StudentEmail` (`string`): local matching key for mock integration.
- `SubjectId` (`int`): local subject requested for sync.
- `Score` (`decimal?`): grade, 0 to 10.
- `Status` (`AcademicProgressStatus`): local progress status.
- `Notes` (`string?`): source note.

Validation:
- Invalid score or missing email is skipped.
- Records for inactive or unrelated students are skipped.

## SiuSyncResult

GraphQL DTO returned by the sync mutation.

Fields:
- `SubjectId`
- `Processed`
- `Created`
- `Updated`
- `Skipped`
- `Message`
- `SkippedItems`

State rules:
- Sync is idempotent over `(UserId, SubjectId)`.
- Sync never creates users or enrollments.
- Sync never changes subject/career membership.
