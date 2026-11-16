# Research: Local Backend Runtime Unblock

## Decision: keep production SQL strict and scope trust to Development

**Rationale**: The constitution explicitly forbids trusting arbitrary SQL Server certificates in production. `appsettings.json` should keep `Encrypt=True;TrustServerCertificate=False`. Local certificate trust belongs only in `appsettings.Development.json` or local environment variables.

**Alternatives considered**:

- Change production/default connection string to trust the certificate: rejected as unsafe.
- Disable SQL encryption globally: rejected as unsafe and unnecessary.

## Decision: diagnose SSPI separately from TLS

**Rationale**: `Failed to generate SSPI context` is caused by Windows Integrated Security/Kerberos/SPN or account context. `TrustServerCertificate=True` does not fix SSPI. The local unblock plan must include a fallback to LocalDB or SQL Auth if `Trusted_Connection=True` remains broken.

**Alternatives considered**:

- Treat every SQL startup failure as certificate-related: rejected because it creates false fixes.
- Require SPN/domain repair before development can continue: rejected as too heavyweight for local academic development.

## Decision: use `dotnet dev-certs` recovery commands

**Rationale**: The backend and frontend are aligned on `https://localhost:44397`. A broken ASP.NET dev certificate blocks browser and HTTPS validation even if the app builds.

**Alternatives considered**:

- Switch the app to HTTP-only: rejected because it diverges from frontend defaults and hides HTTPS-specific issues.

## Decision: keep Event Log disabled for local host logging

**Rationale**: Windows Event Log often requires permissions that local dev accounts do not have. Console/Debug logging is sufficient for local diagnosis and avoids masking the original startup error.

**Alternatives considered**:

- Run IDE as administrator: rejected as a fragile developer requirement.
- Add file logging dependency: rejected as unnecessary for the current unblock.
