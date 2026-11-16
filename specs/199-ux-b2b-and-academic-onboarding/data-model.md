# Data Model: UX B2B and Academic Onboarding

## Persistence impact

No EF Core entity, table, index, constraint, or migration is added.

## Existing entities reused

### User

- `Id: Guid`
- `Role: string`
- `UserCareers: ICollection<UserCareer>`

### Career

- `Id: int`
- `Name: string`
- `Code: string`
- `IsActive: bool`

### UserCareer

- `UserId: Guid`
- `CareerId: int`
- Explicit relationship already configured in `OneItbContext`.

## Frontend state model

### ResolvedMicrosoftEntraConfig

- `tenantId: string`
- `clientId: string`
- `clientIdSource: "canonical" | "legacy" | null`
- `apiScope: string`
- `redirectUri: string`
- `isConfigured: boolean`

### AcademicOnboardingStatus

- `state: "loading" | "anonymous" | "error" | "allowed" | "required"`
- `profile: User | null`
- `isCurrentIdentity: boolean`
- `careerIds: int[]`

### AcademicOnboardingForm

- `selectedCareerIds: int[]`
- `isSubmitting: boolean`
- `errorMessage: string`
- `destination: string`

## Invariants

1. Only canonical role `Estudiante` can enter the required state.
2. Required state needs a matching current identity and zero linked careers.
3. Selected IDs are unique positive integers from active catalog rows.
4. The application unlocks only after a matching `me` contains at least one career.
