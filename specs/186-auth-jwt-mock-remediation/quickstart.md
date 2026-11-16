# Quickstart: Spec 186 Validation

## Preconditions

- Provide JWT configuration through development secrets/environment.
- Start SQL Server using the canonical Docker runbook.
- Do not persist production credentials in test output.

## Commands

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
rg -n "Mock_JWT|token_placeholder|new JwtSecurityTokenHandler" "API Graphql" --glob "*.cs"
~~~

## Runtime Scenario

1. Request a valid employer magic link in an isolated environment.
2. Redeem once and use the token only for the next local request.
3. Execute a protected operation with Authorization: Bearer.
4. Redeem again and confirm stable rejection.
5. Record results without secrets in evidence.md.

## Acceptance

Tests, Release build, no-model-drift scan and live bearer validation must all pass.
