# Data Model: Mega Refactor Core

## Career

- `Id`: integer identifier.
- `Name`: required unique display name.
- `IsActive`: hides deprecated programs without deleting them.
- Relationships:
  - Has many `UserCareer`.
  - Has many `SubjectCareer`.

## UserCareer

- Composite identity: `UserId` + `CareerId`.
- Relationships:
  - Belongs to `User`.
  - Belongs to `Career`.
- Rules:
  - A user can have zero or many careers.
  - Duplicate user-career links are not allowed.

## SubjectCareer

- Composite identity: `SubjectId` + `CareerId`.
- Relationships:
  - Belongs to `Subject`.
  - Belongs to `Career`.
- Rules:
  - A subject can be available in multiple careers.
  - A career can expose many subjects.

## UserInteraction

- `Id`: Guid identifier.
- `ObserverId`: user who created the relationship.
- `TargetId`: user affected by the relationship.
- `Type`: `Follow`, `Mute`, or `Block`.
- `CreatedAt`: UTC timestamp.
- Relationships:
  - `Observer` belongs to `User`.
  - `Target` belongs to `User`.
- Rules:
  - `ObserverId` cannot equal `TargetId`.
  - Only one interaction can exist for the same observer/target pair.
  - A new interaction replaces the prior interaction type.
  - `Block` and `Mute` exclude target content from the observer feed.
  - `Follow` increases target content priority.

## Inquiry

- Existing publication entity.
- New fields:
  - `IsActive`: true by default.
  - `UpdatedAt`: nullable UTC timestamp for edits.
- Rules:
  - Inactive inquiries are hidden from normal feed queries.
  - Only the author, moderators, and administrators can deactivate.
  - Only the author can edit title/content.

## Comment

- Existing comment/reply entity.
- New fields:
  - `IsActive`: true by default.
  - `UpdatedAt`: nullable UTC timestamp for edits.
- Rules:
  - Inactive comments are hidden from normal comment trees.
  - Only the author, moderators, and administrators can deactivate.
  - Only the author can edit content.

## PublicProfileSummary

- Read-only projection over user profile data.
- Fields:
  - User identity and role.
  - Biography/social links already stored on `User`.
  - Careers.
  - Recent active inquiries.
- Rules:
  - Must not expose passwords, tokens, or account secrets.
