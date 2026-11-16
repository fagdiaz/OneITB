# Evidence: SIU Sync and Notifications

## Status

Completed.

## Baseline

### Setup

- Active feature: `specs/137-siu-notifications`.
- Branch: `137-siu-notifications`.
- Docker SQL: `oneitb23-sql` healthy on `0.0.0.0:1433->1433`.

### Baseline commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors; existing nullable warnings remained.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS; existing Vite warnings remained (`vite:react-babel` deprecation and chunk size).

## Implementation Evidence

### EF Core

- Added `Notification`, `NotificationPreference` and `NotificationType`.
- Added explicit DbSets and Fluent API mapping in `OneItbContext`.
- Generated migration:
  - `dotnet ef migrations add AddNotificationsAndSiuSync --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- Migration review:
  - Tables: `Notifications`, `NotificationPreferences`.
  - FKs to `Users`: explicit `ReferentialAction.Restrict`.
  - Unique preference key: `(UserId, Type)`.
  - No extra shadow FK columns were generated.
- Applied migration:
  - `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS against Docker SQL.
- Model drift:
  - `dotnet ef migrations has-pending-model-changes --configuration Release --no-build --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS, `No changes have been made to the model since the last migration.`

### Backend Runtime

Backend launched with:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Kestrel output:

- `Now listening on: https://localhost:44397`
- `Now listening on: http://localhost:5000`
- `Hosting environment: Development`

### GraphQL Runtime Validation

Executed `specs/137-siu-notifications/runtime-validation.ps1` against `https://localhost:44397/graphql`.

Result: PASS.

Key checks:

- `query { __typename }`: `Query`.
- Admin login: `admin@itbeltran.com.ar` role `Administrador`.
- Student login: `student@itbeltran.com.ar` role `Estudiante`.
- Subject selected: `PROG1 / Programacion I`.
- `syncSiuGrades(subjectId: 1)` as admin: PASS.
- Repeated `syncSiuGrades(subjectId: 1)`: `created=0`, confirming no duplicate `AcademicProgress` rows.
- `syncSiuGrades` as student: rejected with authorization error.
- Student received unread `SIU_SYNC` notification.
- `markNotificationRead`: returned `isRead=true`.
- `updateNotificationPreference(ACADEMIC_RESOURCE, false)`: returned disabled preference.
- Admin-created academic resource did not create `ACADEMIC_RESOURCE` notification for the student while disabled.
- Preference was re-enabled after suppression validation.

Note: The first validation attempt used `http://localhost:5000/graphql`; `UseHttpsRedirection` dropped Authorization during redirect in PowerShell. The script was corrected to HTTPS and passed.

### WebSocket Runtime Validation

Executed:

```powershell
node "specs/137-siu-notifications/websocket-validation.mjs"
```

Result: PASS.

Key checks:

- Authenticated subscription as student to `notificationReceived`.
- Admin created an academic resource.
- Student received private event:
  - `WebSocket validation PASS: ACADEMIC_RESOURCE 54066d97-f42c-4120-b138-6f525be02954`

Note: The Node validation script disables TLS verification for the local dev certificate only inside the ignored spec script. Application code still uses the configured HTTPS/WSS URLs.

## Frontend Evidence

- Added Apollo operations in `src/data/graphql/notifications.js`.
- Added `NotificationBell.jsx` with:
  - `GET_MY_NOTIFICATIONS`
  - `GET_UNREAD_NOTIFICATION_COUNT`
  - `GET_MY_NOTIFICATION_PREFERENCES`
  - `NOTIFICATION_RECEIVED`
  - mark read / mark all read / update preference mutations
- Integrated the notification bell into `Nav.jsx`.
- Added admin-only SIU sync button and summary panel in `AcademicDashboard.jsx`.
- React hook placement reviewed: hooks remain top-level; subscription changes are handled in `useEffect`.

## Final Quality Gates

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors; existing nullable warnings remain.
- `npm.cmd run build`: PASS; existing Vite warnings remain.
- `dotnet ef migrations has-pending-model-changes --configuration Release --no-build --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`: PASS.
- `git diff --check`: PASS; CRLF warnings only.
- Secret scan over modified/new tracked files: PASS, no matches.

## Remaining Scope

- Academic P2 still has one pending roadmap item: resource search, categories and versioning.
- Pub/sub remains in-memory and single-instance until a distributed transport is introduced.
