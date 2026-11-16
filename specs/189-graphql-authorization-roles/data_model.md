# Data Model: Declarative GraphQL Mutation Authorization

## Persistent Model

No EF Core migration is expected. Authorization uses existing User.Role and resource ownership foreign keys.

## Authorization Subjects

| Principal role | Canonical capabilities |
|---|---|
| Administrador | Institutional administration plus explicitly approved moderation/academic/job actions |
| Moderador | Moderation only; no account or academic administration by implication |
| Profesor | Approved academic resource/progress actions within service scope |
| Estudiante | Self/social, academic read and job application actions |
| Egresado | Self/social and job application actions |
| Empleador | Offer creation and own-offer application management |

## Ownership Relations

- Inquiry.UserId and Comment.UserId define author actions.
- JobOffer.EmployerId defines offer/application status authority.
- AcademicResource.UploaderId plus subject/career rules define resource authority.
- User.Id defines profile self-service.

## Invariants

1. Role eligibility never implies ownership of arbitrary rows.
2. Ownership cannot bypass required authentication.
3. Authorization denial persists no state and emits no event/email.
4. Role strings in JWT, User and policy configuration remain canonical.

## Acceptance Criteria

- No schema migration/model drift.
- Matrix and tests cover each role and ownership boundary.
- Denied operations leave audited tables unchanged.
