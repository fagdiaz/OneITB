# Research: UX Alignment and SMTP

## Decision: Use built-in `System.Net.Mail` for SMTP

**Rationale**: The sprint is under Code Freeze and should not add a package unless required. `System.Net.Mail` is sufficient for plain institutional notifications, compiles on .NET 8, and avoids dependency restore risk.

**Alternatives considered**:

- MailKit: richer and modern, but adds dependency churn during Code Freeze.
- Keep simulation only: fails the production maturity goal.

## Decision: Console fallback when SMTP settings are incomplete

**Rationale**: Local development and CI must not depend on external SMTP credentials. A fallback logger preserves observability without breaking startup.

**Alternatives considered**:

- Throw on missing SMTP: correct for strict production but would break local runtime and tests.
- Store SMTP values in appsettings: rejected because secrets must not be tracked.

## Decision: Email failure does not rollback status change

**Rationale**: Application status is the source of truth. Email is a side effect and external provider failure should not undo an employer action that already passed authorization and persistence.

**Alternatives considered**:

- Fail mutation if email fails: creates inconsistent UX and couples core workflow to provider availability.
- Queue emails: better production architecture but out of scope for Code Freeze and no new persistence.
