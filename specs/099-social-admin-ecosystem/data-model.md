# Data Model: Social and Administration Ecosystem

## Comment

- `Id: Guid`, required, application generated
- `InquiryId: Guid`, required FK to `Inquiry`
- `UserId: Guid`, required FK to `User`
- `ParentCommentId: Guid?`, optional self FK to `Comment`
- `Content: string`, required, 1-1000 characters
- `CreatedAt: DateTime`, required UTC
- Navigations: `Inquiry`, `User`, `ParentComment`, `Replies`
- Delete rules: all relationships `Restrict`
- Indexes: `InquiryId`, `UserId`, `ParentCommentId`

Validation: a parent must exist and belong to the same inquiry.

## Reaction

- `Id: Guid`, required, application generated
- `InquiryId: Guid`, required FK to `Inquiry`
- `UserId: Guid`, required FK to `User`
- `CreatedAt: DateTime`, required UTC
- Navigations: `Inquiry`, `User`
- Delete rules: all relationships `Restrict`
- Unique index: `(InquiryId, UserId)`

State transition: absent -> active reaction -> absent.

## CommunityReport

- `Id: Guid`, required, application generated
- `InquiryId: Guid`, required FK to `Inquiry`
- `ReporterId: Guid`, required FK to `User`
- `Reason: string`, required, 1-500 characters
- `Status: string`, required, `Pending`, `Resolved`, or `Dismissed`
- `CreatedAt: DateTime`, required UTC
- Navigations: `Inquiry`, `Reporter`
- Delete rules: both relationships `Restrict`
- Invariant: only one pending report per reporter and inquiry

## Inquiry extensions

- Collections: `Comments`, `Reactions`, `Reports`
- Existing `UserId` and `SubjectId` relationships remain explicit and restricted

## Seed invariants

- At least 5 unique subject codes
- Exactly 10 fixed demonstration users managed by the seed
- 3 fixed inquiries per seeded user
- Stable comment, reaction and report identifiers
- Re-running initialization adds only missing managed records

