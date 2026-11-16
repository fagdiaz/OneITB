# Quickstart: Academic Module

## Preconditions

1. SQL Server Docker is running:

```powershell
docker compose up -d
docker compose ps
```

2. Development connection string is configured via user-secrets as documented in `docs/audit/RUNBOOK_DEV.md`.

3. Migration is applied:

```powershell
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
```

## Backend Validation

1. Build:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

2. Run backend:

```powershell
$env:ASPNETCORE_ENVIRONMENT='Development'
$env:ASPNETCORE_URLS='http://localhost:5000'
dotnet "API Graphql/OneITB/bin/Release/net8.0/GraphQL.dll"
```

3. Authenticate as seeded admin (`admin@itbeltran.com.ar`) and execute:

- `addAcademicResource`
- `academicResources`
- `upsertAcademicProgress`
- `myAcademicProgress`
- `academicProgressForUser`

4. Execute one negative authorization case as a student:

- `academicProgressForUser` for another user must fail.
- `addAcademicResource` must fail.

## Frontend Validation

1. Build frontend:

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

2. Run frontend and backend.
3. Login as admin or professor.
4. Open `/academic`.
5. Select career and subject.
6. Create a resource and verify it appears.
7. Assign progress to a student and verify the progress list updates.
8. Login as a student and verify only own progress is visible.
