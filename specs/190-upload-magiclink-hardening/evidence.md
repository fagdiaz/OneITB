# Evidence: Upload and Magic Link Abuse Hardening

## Scope

Spec 190 closes two audit findings without changing the EF Core model:

- uploaded content is inspected before either local or Cloudinary storage receives it;
- public Magic Link request/redemption operations have dedicated multi-dimensional limits in addition to the global HTTP policy.

## Implementation Evidence

### Upload boundary

- `IFileContentInspector` and `FileContentInspector` validate PDF, PNG, JPEG, GIF, WebP, legacy Office, OOXML, ZIP, UTF-8 text, MP4 and WebM.
- PDF headers must begin at byte zero; truncated and executable-prefixed payloads are rejected.
- ZIP/OOXML inspection bounds entry count and declared expansion, rejects unsafe paths and verifies canonical package entries.
- `UploadController` invokes inspection before `IFileStorageService.SaveAsync`.
- Rejections return HTTP 400 with stable code `UPLOAD_CONTENT_INVALID`; parser details and file bytes are not returned.
- Controller tests prove storage is never called after an inspection failure.

### Magic Link boundary

- `IMagicLinkRateLimiter` applies separate request and redemption policies.
- Request keys combine trusted client source with normalized-email fingerprints.
- Redemption keys combine trusted client source with one-time-credential fingerprints.
- HMAC-SHA256 fingerprints prevent raw email/token storage in limiter keys.
- Development/tests use a bounded, lock-protected in-memory provider.
- Configured production Redis uses one Lua operation to check/increment both dimensions atomically.
- Provider failure is fail-closed with `AUTH_TEMPORARILY_UNAVAILABLE`; exhausted buckets return `AUTH_RATE_LIMITED` and bounded retry metadata.
- Logging records operation and reason only, never email, CUIT, token or file content.
- Forwarded headers are processed before rate limiting and production trusts only the configured Docker proxy network.

## Commands and Results

### Focused tests

```text
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore --filter "FullyQualifiedName~Uploads|FullyQualifiedName~MagicLink"
PASS: 38/38
```

Coverage includes all supported file families, mismatches, truncation, PDF polyglot prefix, OOXML type mismatch, storage non-invocation, concurrent permit accounting, independent dimensions, expiry/recovery, capacity behavior, mutation short-circuit and distributed-provider failure behavior.

### Full backend suite

```text
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
PASS: 115/115
```

### Release build

```text
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
PASS: 0 warnings, 0 errors
```

### EF Core drift

```text
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --no-build
PASS: No changes have been made to the model since the last migration.
```

### Production compose

```text
docker compose -f docker-compose.prod.yml config --quiet
PASS
```

The compose exposes operation-specific limits through environment variables, selects Redis in production and declares an explicit trusted proxy subnet.

### Runtime upload smoke

```text
GraphQL { __typename }: HTTP 200
Valid PDF upload: HTTP 200; original filename preserved
Executable content disguised as PDF: HTTP 400; code UPLOAD_CONTENT_INVALID
```

The valid runtime fixture was removed from `wwwroot/uploads` after validation.

### Magic Link verification boundary

Per operator instruction on 2026-07-27, no additional web-server instance was started for a Magic Link runtime throttle/recovery smoke. This evidence does not claim that smoke occurred. Threshold, recovery, concurrency, independent dimensions, mutation pre-service rejection and fail-closed provider behavior are covered by deterministic automated tests.

### Security/diff scan

- Limiter logs contain only operation/reason metadata.
- No raw credential is included in limiter keys, errors or new logging.
- `git diff --check`: PASS; only repository line-ending notices were emitted.

## Residual Scope

- Magic Link still returns the one-time credential through GraphQL; out-of-band SMTP delivery and token digest storage belong to Spec 192.
- External antivirus/content-disarm services remain outside MVP scope.
- Production Redis behavior is configuration-validated and unit-reviewed; provider infrastructure smoke remains an environment deployment gate.

## Status

**Implemented (`[I]`)**. Code, tests, build, EF drift, compose validation and upload runtime smoke pass. Magic Link runtime smoke is explicitly deferred, so the roadmap must not label this spec `[V]`.
