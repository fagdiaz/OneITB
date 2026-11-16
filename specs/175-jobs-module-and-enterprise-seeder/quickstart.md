# Quickstart: Jobs Module and Enterprise Seeder

## Backend migration

```powershell
dotnet ef migrations add AddJobOffers --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release
```

## Backend build

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

## Frontend build

```powershell
cd "FrontEnd/OneItb-FE"
npm.cmd run build
```

## GraphQL smoke

```graphql
query {
  jobOffers(onlyActive: true, first: 5) {
    nodes {
      id
      title
      company
      location
      employer { id fullName email role }
    }
  }
}
```

```graphql
mutation {
  createJobOffer(
    title: "Desarrollador React Junior"
    company: "Beltran Tech Lab"
    description: "Participacion en producto educativo con React y GraphQL."
    location: "CABA / Hibrido"
  ) {
    id
    title
    company
  }
}
```
