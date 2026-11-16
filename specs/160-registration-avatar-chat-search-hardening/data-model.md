# Data Model: Spec 160

## Existing Entities

### User

- `Id`: Guid
- `FirstName`, `LastName`: normalized display names
- `Role`: must be one of allowed roles
- `AvatarUrl`: optional uploaded image path
- Relationships:
  - `Account`: 1:1 credentials
  - `UserCareers`: N:M academic identity
  - `SentMessages` / `ReceivedMessages`: messaging

### UserCareer

- `UserId`: Guid
- `CareerId`: int
- Restrictive FK relationship already defined.
- Used by Spec 159 and Spec 160 to determine feed/search visibility.

### Message

- `SenderId`, `ReceiverId`
- `Sender` / `Receiver`: navigation properties used by GraphQL to expose avatars.
- `IsRead`: unread state source.

## Contract Adjustments

### RegisterInput

Extend/normalize registration input to include:

- `Role`: required string, backend allow-list only `Estudiante`, `Profesor`, `Egresado`.
- `CareerIds`: required list of int with at least one active career.

Backward compatibility:

- Existing `EnrolledCareers` can remain unused for compatibility, but new frontend must send `careerIds`.

## Validation Rules

- Registration rejects admin/moderator/employer/user roles from public mutation.
- Career IDs must be positive, distinct and active.
- Avatar save preserves current URL unless a new edited upload URL exists.
- Avatar canvas saved output must have no blank border caused by zoom/pan.
