# Quickstart: UX Alignment and SMTP

## Local fallback

1. Leave `SmtpSettings` unset.
2. Run backend build.
3. Execute `updateApplicationStatus` for a valid application.
4. Confirm the mutation returns the updated application and the email attempt is logged by the console fallback.

## SMTP-enabled runtime

Set configuration through environment variables or user secrets:

```powershell
dotnet user-secrets set "SmtpSettings:Host" "smtp.example.edu"
dotnet user-secrets set "SmtpSettings:Port" "587"
dotnet user-secrets set "SmtpSettings:User" "oneitb@example.edu"
dotnet user-secrets set "SmtpSettings:Pass" "<secret>"
dotnet user-secrets set "SmtpSettings:From" "oneitb@example.edu"
dotnet user-secrets set "SmtpSettings:EnableSsl" "true"
```

Then update a postulacion to `REVIEWED` or `REJECTED`.

## Frontend check

1. Open `/empleos/mis-ofertas`.
2. Verify no visible text says `ATS`.
3. Open a candidate modal.
4. Verify the title says `Perfil Academico`.
5. Hover and click the status buttons to verify immediate feedback.
