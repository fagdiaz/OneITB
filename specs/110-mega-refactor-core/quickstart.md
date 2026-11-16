# Quickstart: Mega Refactor Core Validation

## Backend

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build
```

## Frontend

```powershell
Set-Location FrontEnd/OneItb-FE
npm.cmd run build
npm.cmd run dev
```

## Runtime Checks

1. Login as `student@itbeltran.com.ar` / `Test1234!`.
2. Open the mini chat widget, navigate to `/chat`, then back to `/feed`.
3. Confirm zero cross-render React warnings in the browser console.
4. Link the user to multiple careers and verify publication creation shows career before subject.
5. Create a publication under a selected career and subject.
6. Filter the feed by search text, career and subject.
7. Edit and deactivate a publication and a comment; reload and confirm inactive content is hidden.
8. Follow one author, mute another and block another; reload and confirm feed ordering/exclusion.
9. Visit a public profile and confirm it is read-only; open profile editing only from the account menu.
10. Record exact commands, GraphQL operations and browser findings in `evidence.md`.
