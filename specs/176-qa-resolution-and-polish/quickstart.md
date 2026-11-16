# Quickstart: Spec 176 Validation

## Build Gates

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

```powershell
git -c core.autocrlf=false diff --check
```

## Manual Browser Checks

1. Open register page and confirm no Alias field is visible.
2. Click password eye buttons in login/register while typing; input focus must stay active.
3. Use split-screen width and confirm header does not create horizontal page scroll.
4. Open global search as Admin/Moderador and select careers; selected items must remain readable.
5. Save `/profile/edit`; successful save redirects to `/profile`.
6. Open chat widget, click outside; widget closes.
7. Open chat widget, navigate to another route; widget closes.
