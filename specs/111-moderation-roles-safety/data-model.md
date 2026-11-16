# Data Model: Moderation Roles Safety

## User

- Existing account entity.
- Adds `MutedUntil: DateTime?`.
- Supported role values include `Administrador`, `Moderador`, `Profesor`, `Estudiante`, `Egresado`, and existing project roles.
- Computed moderation metrics:
  - `TotalPosts`
  - `TotalComments`
  - `TotalLikesReceived`
  - `TotalReportsReceived`

## Inquiry

- Existing publication entity.
- Exposes computed `ReportCount` from associated community reports.
- No physical delete introduced.

## Comment

- Existing comment entity.
- Exposes `ReportCount`; current value is zero until comment reports are persisted.
- No physical delete introduced.

## State Rules

- If `MutedUntil` is null or before current UTC time, the user is not silenced.
- If `MutedUntil` is after current UTC time, the user cannot create publications or comments.
- Administrator users cannot be silenced, deactivated, or role-edited.
