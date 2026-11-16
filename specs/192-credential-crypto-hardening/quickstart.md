# Quickstart: Spec 192 Implementation and Validation

## Exposure Inventory

~~~powershell
rg -n "RequestMagicLink|requestMagicLink|Token =|HashPassword|Jwt.*Key|Body=\\{Body\\}" "API Graphql" "FrontEnd/OneItb-FE/src"
git grep -n -E "Jwt.*Key|Password=|api_secret|BEGIN .*PRIVATE KEY"
~~~

## Automated Gates

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
npm.cmd run test -- --run
npm.cmd run build
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
~~~

Run frontend commands from `FrontEnd/OneItb-FE`.

## Runtime Acceptance

1. Request a Magic Link and inspect the GraphQL payload: no token.
2. Open the Development pickup email or SMTP test mailbox.
3. Follow the fragment link and verify the URL is immediately cleaned.
4. Confirm first redemption returns JWT and second redemption fails generically.
5. Inspect the database: only a digest is stored.
6. Authenticate an existing low-cost hash and verify policy upgrade.
7. Start Production configuration without required secrets/providers and verify safe startup failure.

