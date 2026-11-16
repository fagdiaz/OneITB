# Data Model: Microsoft Entra Redirect Acceptance

No relational schema or EF Core migration is required.

## Public SPA Configuration

- `clientId`: public application identifier; GUID; not a secret.
- `tenantId`: `common` or a GUID authority segment.
- `apiScope`: delegated OneITB API scope beginning with `api://`.
- `redirectUri`: exact callback URI with no query, fragment, or credentials.

## External Registration Contract

- Platform: Single-page application (SPA).
- Local URI: `http://localhost:5173/auth/microsoft/callback`.
- Production URI: HTTPS origin plus `/auth/microsoft/callback`.
- Matching rule: exact URI registration.

## Persistent Identity

Unchanged from Spec 197: the backend persists external identity binding only after token
validation. Microsoft access tokens remain ephemeral and are not stored in SQL Server,
localStorage, audit payloads, or documentation.
