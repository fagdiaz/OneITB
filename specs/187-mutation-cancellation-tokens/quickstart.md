# Quickstart: Spec 187 Validation

## Static Inventory

~~~powershell
rg -n "SaveChangesAsync\\(\\)|ToListAsync\\(\\)|SingleOrDefaultAsync\\([^,\\)]*\\)" "API Graphql/OneITB/GraphQL/Mutation.cs"
rg -n "CompleteAsync\\(\\)" "API Graphql/Services" --glob "*.cs"
~~~

## Automated Gates

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
~~~

## Runtime Check

1. Capture affected GraphQL SDL before changes.
2. Run a successful mutation control.
3. Execute a cancellable test operation and abort the request.
4. Confirm expected database state and absence of subsequent event publication.
5. Diff SDL and record results in evidence.md.

## Acceptance

No parameterless EF async call remains in scope, tests/build pass, SDL is unchanged and cancellation behavior is evidenced.
