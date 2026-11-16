# Evidence: Production Security and Seeding

**Spec**: 171-production-security-and-seeding  
**Date**: 2026-07-07

## Commands

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`
- `dotnet ef migrations add AddAccountLockout --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`
- `dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release`
- `$env:ONEITB_SQL_SA_PASSWORD='Temp_Strong_Passw0rd!'; $env:ONEITB_JWT_KEY='oneitb23-prod-temp-signing-key-32chars'; $env:ONEITB_SEED_DEMO_PASSWORD='Temp_Demo_Passw0rd!'; docker compose -f docker-compose.prod.yml config`

## Results

- Backend build: PASS, 0 warnings, 0 errors.
- EF migration generation: PASS, created `20260707211602_AddAccountLockout`.
- Backend tests: PASS, 38/38.
- EF pending model changes: PASS, no pending changes after migration.
- Production compose config: PASS with process-local temporary variables; no secret value was written to tracked files.

## Notes

- Scope intentionally excludes React UI.
- `login` keeps the existing `AuthPayload` GraphQL contract to avoid a frontend breaking change during Code Freeze.
- The original prompt requested a `UserError` union, but the existing GraphQL contract and frontend login flow use thrown `GraphQLException` errors. The implementation returns controlled GraphQL errors with stable codes (`AUTH_INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`) without changing the payload shape.
- Production demo data requires `Seed__DemoPassword` / `ONEITB_SEED_DEMO_PASSWORD`; Development keeps `Test1234!` fallback in host startup for local continuity.
