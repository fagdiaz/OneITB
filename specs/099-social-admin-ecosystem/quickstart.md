# Quickstart: Social and Administration Ecosystem

1. Build the backend:
   `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`
2. Create the migration:
   `dotnet ef migrations add AddSocialEcosystem --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
3. Apply the migration:
   `dotnet ef database update --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"`
4. Start the backend twice and verify stable seed counts.
5. Authenticate with a seeded account and execute `contracts/graphql.md`.
6. Run `npm.cmd run build` from `FrontEnd/OneItb-FE`.
7. Verify create, like, comment, reply and report persistence in the browser.
8. Open `/admin`, verify all tabs, then confirm unauthorized administration data is rejected.

Expected seed password: `Test1234!`.

