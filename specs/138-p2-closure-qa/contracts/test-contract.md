# Test Contract: P2 Closure QA

## Command

```powershell
dotnet test "API Graphql/OneITB/OneITB.sln" -c Release
```

## Required Test Coverage

### AcademicService

- Rejects manual progress writes by non-manager role before saving.
- Rejects academic progress when the target user is not a student.
- Rejects academic progress when the student is outside the subject career.
- Allows manager to upsert progress and emits an academic progress notification.
- SIU sync is admin-only.
- SIU sync creates progress for eligible student records.
- Repeated SIU sync updates instead of duplicating progress.
- SIU sync skips unknown or ineligible SIU records.

### NotificationService

- Creates default preferences for all notification types.
- Creates notifications only for active users.
- Suppresses notifications for disabled preferences.
- Marks only owner notifications as read.
- Mark-all-read affects only the current user.
- Persists notification even if topic publication fails.

## Non-Goals

- No browser tests.
- No GraphQL integration tests.
- No SQL Server Docker dependency.
