# Data Model: Profile as a CV

No new persisted entities are introduced.

## Read Models

### PublicProfileSummary

- `id`: profile owner identifier.
- `firstName`, `lastName`, `fullName`: display identity.
- `role`: institutional role.
- `biography`: professional profile text.
- `linkedIn`, `facebook`, `instagram`, `phone`: optional contact/social fields.
- `careers`: enrolled career names.
- `totalPublications`: publication count.

### ProfileActivitySummary

- Derived client-side from public inquiries authored by the profile owner.
- Fields: `postCount`, `recentPosts`, `subjects`, `lastActivity`.
- Privacy: public activity only.

### OwnerAcademicSummary

- Derived client-side from `myAcademicProgress`.
- Fields: `approvedCount`, `regularCount`, `inProgressCount`, `latestSubjects`.
- Privacy: only loaded when `profile.id === auth.id`.

## Validation Rules

- Owner-only controls require exact ID match.
- Missing optional fields render graceful empty states.
- Social links are normalized for display and linking without mutating persisted data.
