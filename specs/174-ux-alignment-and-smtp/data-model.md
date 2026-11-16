# Data Model: UX Alignment and SMTP

No database schema changes are introduced by this spec.

## Existing Entity: JobApplication

- **Id**: existing identifier.
- **Status**: existing state. Email notification is attempted when status becomes `Reviewed` or `Rejected`.
- **Applicant**: existing relationship used to resolve recipient name and account email.
- **JobOffer**: existing relationship used to resolve job title and company.

## Runtime Contract: Email Delivery Request

- **To**: recipient email address.
- **Subject**: institutional Spanish subject.
- **Body**: plain text body with status, offer title and company.
- **Persistence**: none. The request is delivered or logged.

## Configuration: SmtpSettings

- **Host**: SMTP server host.
- **Port**: SMTP server port.
- **User**: SMTP username.
- **Pass**: SMTP password from environment/user secrets.
- **From**: optional sender address; defaults to user.
- **EnableSsl**: optional boolean; defaults to true.
