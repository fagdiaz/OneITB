# Evidence: Spec 170 - Cloud, DevOps & Scalability

## Commands

- `dotnet add "API Graphql/OneITB/GraphQL.csproj" package HotChocolate.Subscriptions.Redis --version 14.2.0`: PASS.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: initial FAIL due namespace/path issues introduced during refactor.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 warnings, 0 errors after fixes.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 35/35.
- `npm.cmd run build`: PASS, 346 modules before audit fix; PASS, 349 modules after audit fix.
- `docker compose -f docker-compose.prod.yml config` with ephemeral local environment variables: PASS.
- `npm.cmd test -- --run`: PASS, 3/3 before and after audit fix.
- `docker compose -f docker-compose.prod.yml build`: PASS before audit fix; final PASS after audit fix with `npm ci` reporting 0 vulnerabilities.
- `npm.cmd audit --omit=dev`: initial FAIL with production vulnerabilities in `react-router`/`graphql`.
- `npm.cmd audit fix`: PASS.
- `npm.cmd audit --omit=dev`: final PASS, `found 0 vulnerabilities`.

## Implementation Notes

- Production Docker:
  - Backend multi-stage image publishes `GraphQL.csproj` from repository root context.
  - Frontend multi-stage image builds Vite and serves static assets through Nginx.
  - Nginx proxies `/graphql`, `/api` and `/uploads` to the API service and supports WebSocket upgrade.
  - `docker-compose.prod.yml` declares SQL Server, Redis, API and frontend with no committed secrets.
- Redis:
  - `Startup.cs` uses Redis Subscriptions when `ConnectionStrings:Redis` or `Redis:ConnectionString` exists.
  - Local fallback remains `AddInMemorySubscriptions()`.
- Storage:
  - `UploadController` delegates to `IFileStorageService`.
  - `LocalFileStorageService` is the default.
  - `CloudinaryStorageService` activates only when `CloudinarySettings:Url` is present.
  - Social and academic file URL validators accept `/uploads/` or HTTPS Cloudinary URLs only.
- Security:
  - Fixed-window rate limiting applies to controllers and GraphQL.
  - `/health` is exposed for container healthchecks.
  - Security headers middleware adds `nosniff`, `DENY`, referrer and permissions policies.
  - HSTS is enabled outside Development.

## Residual Risk

- Full production compose runtime with migrations and authenticated traffic was not launched with real secrets. The compose was statically validated and both images were built successfully.
- Redis and Cloudinary are implemented and compilable, but require real production variables and smoke tests to elevate from `[I]` to `[V]`.
- Azure App Service and Azure SQL deployment remain pending operational work.
