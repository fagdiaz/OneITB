# Data Model: Upload and Magic Link Abuse Hardening

## Persistent Model

No EF Core entity or migration is expected. Upload inspection is transient and Magic Link throttling is operational state with bounded expiry.

## Transient Models

### FileInspectionRequest

| Field | Type | Rule |
|---|---|---|
| Extension | string | normalized lower-case allowed extension |
| DeclaredContentType | string | normalized allowed MIME candidate |
| Length | long | greater than zero and at most 15 MB |
| OpenReadStream | function | independent stream factory |

### FileInspectionResult

| Field | Type | Rule |
|---|---|---|
| IsValid | bool | true only when all format checks pass |
| DetectedFormat | enum | canonical supported format |
| FailureCode | string? | stable internal category, never parser details |

### MagicLinkThrottleRequest

| Field | Type | Rule |
|---|---|---|
| Operation | enum | Request or Redeem |
| NetworkKey | string | normalized trusted client source |
| IdentityFingerprint | string | keyed/non-reversible email or token fingerprint |
| OccurredAt | DateTimeOffset | UTC from `TimeProvider` |

### MagicLinkThrottleDecision

| Field | Type | Rule |
|---|---|---|
| IsAllowed | bool | false after either bucket is exhausted |
| RetryAfter | TimeSpan? | bounded remaining window |
| ReasonCode | string | internal stable code without identity |

## Invariants

1. Invalid file content never reaches `IFileStorageService`.
2. Inspection never persists or logs file bytes.
3. Raw Magic Link tokens never become limiter keys, metrics labels or logs.
4. Limiter entries expire and remain bounded.
5. No database schema drift is introduced.
