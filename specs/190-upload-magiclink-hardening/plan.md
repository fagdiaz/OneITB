# Implementation Plan: Upload and Magic Link Abuse Hardening

## Summary

Add bounded format-aware upload inspection before storage and operation-specific Magic Link throttling that composes with the existing global per-IP policy.

## Technical Context

- Backend: .NET 8, ASP.NET Core, HotChocolate 14.2, local/Cloudinary storage.
- Primary paths: `UploadController.cs`, storage services, `EmployerAuthService.cs`, `Mutation.cs`, `Startup.cs`, configuration and tests.
- Data: no EF migration.
- Risk: HIGH (public authentication boundary and untrusted binary input).

## Constitution Check

- **GraphQL/REST boundary**: PASS; upload remains the approved REST exception and Magic Link remains GraphQL.
- **Security**: PASS; client metadata is no longer authoritative and credential keys are non-reversible.
- **Compatibility**: PASS with controlled error-contract additions.
- **Evidence**: PASS; storage-spy, limiter concurrency and runtime tests are mandatory.
- **Secrets**: PASS; no raw tokens/emails in logs or tracked configuration.

## Implementation Phases

1. Add positive/negative binary fixtures and failing controller tests.
2. Define `IFileContentInspector` and canonical supported-format mapping.
3. Implement bounded signature checks and safe OOXML/ZIP package inspection.
4. Invoke inspection before `IFileStorageService.SaveAsync`; map failures to sanitized 400 responses.
5. Add failing Magic Link rate-limit tests for IP, identity, expiry and concurrency.
6. Define `IMagicLinkRateLimiter` with in-memory and conditional distributed implementations.
7. Resolve trusted client source at the GraphQL boundary and pass only normalized throttle context.
8. Enforce request/redemption limits before database work while preserving generic errors.
9. Add validated configuration defaults, bounded key expiry and outage behavior.
10. Run focused/full tests, Release build and a real upload smoke. Verify Magic Link threshold/recovery with deterministic automated tests when an additional server process is not authorized.

## Planned Touchpoints

- `API Graphql/OneITB/Controllers/UploadController.cs`: `Upload`.
- `API Graphql/OneITB/Services/Storage/IFileStorageService.cs`: storage boundary compatibility only.
- `API Graphql/OneITB/Services/Storage/`: new inspector/result implementations beside storage adapters.
- `API Graphql/Services/Auth/IEmployerAuthService.cs` and `EmployerAuthService.cs`: throttle enforcement.
- `API Graphql/OneITB/GraphQL/Mutation.cs`: trusted request context for both Magic Link operations.
- `API Graphql/OneITB/Startup.cs`: inspector/limiter DI, trusted forwarded headers and middleware order.
- `API Graphql/OneITB/appsettings*.json` and `.env.example`: non-secret validated limits.
- `API Graphql/Tests/Services.Tests/`: upload, limiter and GraphQL integration coverage.

## Test Strategy

- Unit tests for every signature and malformed/truncated variant.
- Controller tests proving storage is never invoked on rejection.
- Local and Cloudinary contract tests using the same validated input.
- Deterministic `TimeProvider` tests for limiter windows.
- Parallel threshold tests proving atomic permit accounting.
- GraphQL integration tests for generic throttled responses.
- Runtime smoke with valid and hostile upload payloads.
- Automated mutation/limiter verification for Magic Link threshold, provider failure, concurrency, expiry and recovery.

## Rollback

The inspector and dedicated limiter are additive DI services. Rollback removes their registrations/calls without data migration. Existing global HTTP rate limiting remains active.

## Definition of Done

No unsupported or mismatched file reaches storage; Magic Link abuse is bounded by source and identity; valid flows remain operational; all evidence is recorded without secrets.
