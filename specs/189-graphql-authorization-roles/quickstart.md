# Quickstart: Spec 189 Validation

## Inventory

~~~powershell
rg -n "^\\s*\\[Authorize|^\\s*public async Task" "API Graphql/OneITB/GraphQL/Mutation.cs"
rg -n "Role|CanModerate|EmployerId|UploaderId|UserId" "API Graphql/Services" --glob "*.cs"
~~~

## Automated Gates

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
~~~

## Runtime Matrix Smoke

For each category, execute:

1. Anonymous request.
2. Authenticated request with wrong role.
3. Authenticated request with allowed role.
4. Allowed role targeting an unowned/out-of-scope row.

Record GraphQL codes and confirm denied database/event/email state remains unchanged.

## Acceptance

Static attributes are insufficient: real executor tests and runtime matrix checks must pass.
