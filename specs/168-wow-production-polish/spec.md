# Spec 168: WOW Production Polish

## Objective

Expand OneITB23 with high-impact, production-safe features without hiding external blockers:

1. EF Core Audit Trail for critical entities.
2. Student academic certificate/export flow.
3. Public approved-certificate credential page.
4. Global real-time notification toasts.
5. Google SSO design recorded as blocked until real OAuth credentials and deployment origins are available.

## Scope

### In

- Backend EF entity, mapping, interceptor registration, migration and admin GraphQL query for audit logs.
- Public GraphQL query for approved academic certificates with minimal public data.
- React certificate export component inside `/academic`.
- React public route `/certificate/:id`.
- React notification provider with toast UI connected to the existing subscription.
- Roadmap/documentation updates.

### Out

- Google OAuth production login implementation without a real Google OAuth client id/secret and institutional policy approval.
- Server-side Open Graph rendering. The SPA route can set runtime meta tags, but crawler-perfect OG requires SSR or backend-rendered HTML.

## Acceptance Criteria

- Critical EF changes to `User`, `AcademicProgress`, `AcademicResource`, `Inquiry`, and `Comment` create audit rows without logging `Account.PasswordHash`.
- `auditLogs` is Admin-only.
- `publicCertificate(id)` only returns active approved academic progress.
- `/academic` lets the authenticated user export their own academic progress as CSV and print a formal certificate summary.
- `/certificate/:id` is public and read-only.
- A received GraphQL notification renders a deduplicated toast without requiring the bell dropdown to be open.
- Backend and frontend builds pass.

## Risks

- EF interceptor recursion: skip `AuditLog` entries and collect audit rows before calling SaveChanges.
- Pooled DbContext: interceptor must be stateless and singleton-safe.
- Public credential privacy: expose only approved progress.
- Subscription duplication: toast provider must dedupe by notification id.
