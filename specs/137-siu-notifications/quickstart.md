# Quickstart: SIU Sync and Notifications

## Prerequisites

1. Docker SQL is running:

```powershell
docker compose up -d
docker compose ps
```

2. Development connection string is configured through `dotnet user-secrets` as documented in `docs/audit/RUNBOOK_DEV.md`.

3. Apply migrations:

```powershell
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

## Backend validation

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Execute against `/graphql`:

1. Login as `admin@itbeltran.com.ar`.
2. Query careers and subjects.
3. Run `syncSiuGrades(subjectId)` as admin.
4. Login as `student@itbeltran.com.ar`.
5. Verify `myAcademicProgress` includes synced progress for the student's subject.
6. Verify student cannot run `syncSiuGrades`.
7. Query `myNotifications` and `unreadNotificationCount`.
8. Mark one/all notifications read.
9. Update preferences and confirm disabled categories do not create new notifications.

## Frontend validation

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
npm.cmd run dev
```

Manual flow:

1. Login as admin.
2. Open `/academic`, choose career and subject.
3. Click `Sincronizar SIU`.
4. Confirm summary appears without page reload.
5. Login as a student associated with that career.
6. Confirm notification bell shows unread academic notifications.
7. Open the bell menu, mark notifications as read, and confirm count updates.
8. Disable a notification preference and confirm the next matching event does not create a new notification.

## Expected limitations

- SIU provider is mocked.
- Live notifications use in-memory pub/sub and are single-instance only.
- Email/push/mobile notifications are out of scope.
