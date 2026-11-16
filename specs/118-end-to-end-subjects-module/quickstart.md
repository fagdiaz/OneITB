# Quickstart: End-to-End Subjects Module

```powershell
dotnet ef migrations add AddAcademicRulesToSubjects --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet ef database update --configuration Release --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run build
```

Runtime validation:

1. Login as administrator.
2. Create a subject with career, year, and prerequisites.
3. Reload and verify all values in the subject table.
4. Edit the academic configuration and verify persistence.
