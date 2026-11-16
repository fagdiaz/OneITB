# Quickstart: Local Infrastructure and Moderator Acceptance

## Prerequisites

- Docker Desktop/Engine with Compose.
- Existing SQL Development configuration remains untouched.
- .NET 8 and Node dependencies already restored.
- No process uses the selected Redis/Mailpit ports.

## Complete Gate

From the repository root:

~~~powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-local-infrastructure.ps1
~~~

The default behavior starts only Redis/Mailpit, executes finite commands and removes the
acceptance services in `finally`.

## Diagnostic Modes

~~~powershell
# Reuse already-running acceptance services
.\scripts\validate-local-infrastructure.ps1 -SkipContainerStartup

# Keep services only for explicit manual inspection
.\scripts\validate-local-infrastructure.ps1 -KeepContainers

# Avoid occupied defaults
.\scripts\validate-local-infrastructure.ps1 `
  -RedisPort 16379 `
  -SmtpPort 11025 `
  -MailpitHttpPort 18025
~~~

`-KeepContainers` is never used by CI or final evidence.

## Expected Result

- Moderator, session, Redis and Mailpit gates PASS.
- External SMTP, Cloudinary and Google SSO remain BLOCKED.
- No API or frontend server starts.
- Default run leaves no acceptance container or occupied acceptance port.
