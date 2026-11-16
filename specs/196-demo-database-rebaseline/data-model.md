# Data Model: Canonical Demo Graph

## Identity

- 15 deterministic `Account`/`User` pairs:
  - 2 Administrators
  - 1 Moderator
  - 4 Professors
  - 4 Students
  - 2 Graduates
  - 2 Employers
- All accounts start unlocked with a BCrypt hash produced by `IPasswordHasher`.
- Existing-account hashes remain immutable during normal idempotent seeding.

## Academic

- 9 institutional careers, with 3 fully populated demonstration subjects in each of
  the two careers used by the canonical academic graph.
- User-career links for Professors, Students, and Graduates.
- Deterministic resources per subject, uploaded by a Professor.
- Deterministic progress per Student/Graduate and subject, assigned by a Professor.
- Representative CV education, experience, project, skill, and language rows.

## Social

- Two inquiries per eligible user and subject.
- Root comments and second-level replies only.
- Reactions and selected user interactions.
- Community reports suitable for moderation demonstration.
- No synthetic binary attachment is created because files require the authenticated
  upload contract and physical storage.

## Messaging and Notifications

- Two directed conversation sets per messaging user, ten chronological messages each.
- Unread messages and matching notifications.
- Notification preferences with one row per user/type where required.

## Employment

- Two offers per Employer.
- One deterministic application per Student/Graduate.
- Notifications for new offers and application status.

## Integrity Invariants

1. Account and User share the same key.
2. User-career and subject-prerequisite composite keys are unique.
3. Inquiry/Comment soft-delete and moderation flags are valid.
4. Comment nesting depth is at most two.
5. SocialAttachment owner is `InquiryId XOR CommentId`.
6. Job application pair is unique.
7. Academic progress pair is unique.
8. All canonical IDs and business keys remain stable across seed executions.
