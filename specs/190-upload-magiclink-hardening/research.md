# Research: Upload and Magic Link Abuse Hardening

## Audited Baseline

- `UploadController.Upload` limits requests to 15 MB and validates extension plus `IFormFile.ContentType`.
- `LocalFileStorageService` and `CloudinaryStorageService` persist immediately after controller validation.
- No binary signature or container-structure inspection exists before `IFileStorageService.SaveAsync`.
- `Startup.ConfigureServices` registers one fixed-window limiter keyed only by remote IP (default 100 requests/minute).
- `MapControllers` and `MapGraphQL` use that global policy.
- `requestMagicLink` and `loginWithMagicLink` share `/graphql`, so endpoint-level ASP.NET rate limiting cannot distinguish those operations by route.
- `EmployerAuthService` normalizes email/token and uses a 256-bit random one-time token with atomic consumption.

## Decisions

### D1 - Validate content before storage

Introduce a bounded inspection service at the web boundary. It opens an independent read stream, validates the expected signature/package and closes it before storage opens its own stream. This avoids mutating stream position and keeps both local/cloud providers unchanged.

### D2 - Use format-aware validation

| Family | Minimum evidence |
|---|---|
| PDF | `%PDF-` header and non-truncated prefix |
| PNG | canonical 8-byte signature |
| JPEG | SOI plus supported marker prefix |
| GIF | `GIF87a` or `GIF89a` |
| WebP | `RIFF` and `WEBP` markers |
| Legacy Office | OLE Compound File signature |
| DOCX | valid ZIP package with `[Content_Types].xml` and `word/document.xml` |
| PPTX | valid ZIP package with `[Content_Types].xml` and `ppt/presentation.xml` |
| XLSX | valid ZIP package with `[Content_Types].xml` and `xl/workbook.xml` |
| ZIP | valid ZIP structure with bounded entry inventory |
| MP4 | ISO base media `ftyp` box |
| WebM | EBML signature |
| TXT | valid bounded UTF-8/text heuristic with no NUL content |

OOXML must not be accepted solely because it begins with `PK`.

### D3 - Separate operation throttling from HTTP throttling

Create `IMagicLinkRateLimiter` at the application boundary. The request operation consumes both an IP bucket and a normalized-email bucket. Redemption consumes an IP bucket and a non-reversible fingerprint bucket. The raw token is never a cache key or log field.

Suggested defaults, all configurable:

- request per IP: 10 per 15 minutes;
- request per normalized email: 3 per 15 minutes;
- redemption per IP: 20 per 15 minutes;
- redemption per token fingerprint: 5 per 15 minutes.

### D4 - Distributed production, in-memory development

Use a shared Redis-backed implementation when the configured Redis connection is available. Use a bounded in-memory implementation for Development/tests. Failure behavior must be explicit: production cannot silently become unlimited; local development cannot require Redis.

## Rejected Alternatives

- Trusting `ContentType`: it is client-controlled.
- Reading only the first four bytes for all formats: insufficient for OOXML and MP4/WebM distinctions.
- Extracting uploaded archives: unnecessary and increases traversal/resource risks.
- Adding a second route policy to `/graphql`: it still cannot identify the operation reliably.
- Using raw email/token as logs or metrics labels: leaks personal/credential data and creates unbounded cardinality.
- Silently disabling throttling when Redis fails: unsafe fail-open behavior.

## Residual Risk

Signature validation reduces disguised-file risk but is not malware analysis. Production operations should retain the option to add asynchronous antivirus/quarantine scanning later without changing the upload contract.

