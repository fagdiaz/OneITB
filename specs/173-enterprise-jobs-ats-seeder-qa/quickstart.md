# Quickstart: Enterprise Jobs ATS Seeder QA

## Migration

```powershell
dotnet ef migrations add AddJobApplications --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
```

## Smoke GraphQL

1. Login as `estudiante1.ads@itbeltran.com.ar`.
2. Query `jobOffers(onlyActive: true, first: 5)` and verify `myApplication`.
3. Mutate `applyToJob(jobOfferId)`.
4. Login as `empleador1@itbeltran.com.ar`.
5. Query `myJobOffers(first: 20)` and mutate `updateApplicationStatus`.
