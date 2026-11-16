# Quickstart: Spec 190 Implementation and Validation

## Baseline Inventory

~~~powershell
rg -n "AllowedContentTypes|SaveAsync|ContentType" "API Graphql/OneITB/Controllers" "API Graphql/OneITB/Services/Storage"
rg -n "RequestMagicLink|LoginWithMagicLink|AddRateLimiter|RequireRateLimiting" "API Graphql"
~~~

## Automated Gates

~~~powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj"
~~~

## Runtime Gates

1. Upload valid fixtures for every supported family.
2. Upload renamed, truncated and malformed fixtures and confirm HTTP 400.
3. Confirm rejected files are absent from local/cloud storage.
4. Exercise Magic Link below and above every threshold only when an isolated runtime host is explicitly authorized.
5. Otherwise, use the deterministic `TimeProvider` tests to verify expiry and recovery without starting another server.
6. Inspect logs for raw email, token or file-body leakage.

## Expected Result

Valid files and valid bounded authentication requests succeed. Invalid content and exhausted buckets fail predictably without persistence or sensitive disclosure.

## Validation Note (2026-07-27)

The implementation pass executed the authenticated upload smoke. Per operator instruction, no additional server was started for the Magic Link smoke; threshold, recovery and concurrency were verified through the automated test suite instead.
