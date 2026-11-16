# Quickstart: Spec 160 Validation

## Build Validation

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

```powershell
cd FrontEnd/OneItb-FE
npm.cmd run build
```

## Manual QA Checklist

1. Open `/register`.
2. Confirm password mismatch blocks submit.
3. Confirm only `Estudiante`, `Profesor`, `Egresado` appear as roles.
4. Select at least one career and register a test account.
5. Confirm redirect to `/login` with success feedback.
6. Login and confirm feed is not empty when career has posts.
7. Open `/profile/edit`, save without changing avatar, refresh profile and confirm avatar remains.
8. Open avatar editor, zoom/pan aggressively and confirm saved preview never has blank borders.
9. Open `/chat`, verify unread conversations are visually highlighted and received bubbles show avatar/fallback.
10. Confirm no fake `En línea` label is shown for contacts.
11. In Header search, confirm career filter only appears for multi-career/global users and `Todas` behavior checks/unchecks subjects correctly.
