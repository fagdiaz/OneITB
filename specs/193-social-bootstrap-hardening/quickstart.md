# Quickstart: Spec 193 Implementation and Validation

## Inventory

~~~powershell
rg -n "ToggleReactionAsync|ToggleCommentReactionAsync|EnsureUserCanCreateContentAsync|MutedUntil" "API Graphql/Services/Social"
rg -n "GlobalErrorBoundary|ApolloProvider|ThemeProvider|new GraphQLProvider" "FrontEnd/OneItb-FE/src"
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

## Runtime Gates

1. Silence a test user and attempt publication like/unlike.
2. Verify no Reaction/Notification change.
3. Verify an observer-level Mute still only filters the observer feed.
4. Load the SPA normally and confirm one Apollo client/WebSocket lifecycle.
5. Inject a Development-only client/theme/child error in tests and verify fallback.
6. Reload from fallback and confirm no automatic reload loop.

