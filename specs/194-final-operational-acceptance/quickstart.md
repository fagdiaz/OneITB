# Quickstart: Final Operational Acceptance

## Automated baseline

From the repository root:

~~~powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\validate-predefense.ps1
~~~

The default command is non-runtime and does not start application servers. It must not
print secret values.

The temporary runtime path is opt-in and may only be used in an explicitly approved
maintenance window:

~~~powershell
.\scripts\validate-predefense.ps1 -IncludeRuntime
~~~

That mode must terminate every process it starts and restore every fixture it owns.

## Manual provider checks

Set provider secrets through user-secrets or environment variables. Never add them to tracked files.

Required groups:

- SMTP: `SmtpSettings:Host`, `Port`, `User`, `Pass`.
- Redis: `ConnectionStrings:Redis`.
- Cloudinary: `CloudinarySettings:Url`.

Run only the provider gate being validated and record `VERIFIED`, `BLOCKED` or `FAILED`.

## Browser regression

1. Obtain explicit approval before starting backend/Vite acceptance processes.
2. Verify health before opening the browser.
3. Exercise each role checklist.
4. Capture application-owned console errors/warnings.
5. Logout between roles and validate A -> B isolation.
6. Stop both processes and confirm ports are released.

## Final checks

~~~powershell
git diff --check
git status --short
Get-Process dotnet,node -ErrorAction SilentlyContinue
~~~

Expected: no acceptance-owned process, no run-owned fixture and canonical documents synchronized with evidence.
