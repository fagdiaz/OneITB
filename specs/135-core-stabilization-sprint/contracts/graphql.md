# GraphQL Contract Notes: Core Stabilization Sprint

## Runtime validation contracts

The following existing operations must be exercised against the live schema before roadmap verification:

- Subjects:
  - query subjects with career, year, prerequisites
  - mutation add subject with career, year, prerequisites
- Superadmin security:
  - mutation update user role with admin password when promoting to administrator
  - mutation update user role/status rejects administrator targets
- Upload and rich media:
  - authenticated upload through `POST /api/upload`
  - mutation add inquiry with `fileUrl`
  - mutation add comment with `fileUrl`
  - query feed/comments returns `fileUrl`

## New feed pagination query

Preferred additive contract:

```graphql
query GetInquiriesPage(
  $searchTerm: String
  $careerId: Int
  $subjectIds: [Int!]
  $first: Int = 10
  $after: String
) {
  inquiriesPage(
    searchTerm: $searchTerm
    careerId: $careerId
    subjectIds: $subjectIds
    first: $first
    after: $after
  ) {
    items {
      id
      title
      content
      fileUrl
      createdAt
      user { id nombre apellido rol }
      subject { id name code career { id name } }
      comments { id content fileUrl createdAt }
    }
    hasNextPage
    nextCursor
    totalCount
  }
}
```

Compatibility rule: existing `inquiries` query must continue to work unless all frontend consumers are migrated safely.

## New moderation audit query

```graphql
query GetModerationAudits($first: Int = 50) {
  moderationAudits(first: $first) {
    id
    action
    summary
    createdAt
    actorUser { id nombre apellido rol }
    targetUser { id nombre apellido rol }
    targetInquiry { id title }
    targetComment { id content }
    targetReport { id status reason }
  }
}
```

Authorization:

- Administrators can query audit rows.
- Moderators may be allowed only if existing project policy already grants them admin-panel audit visibility; otherwise administrator-only.

## Moderation mutation audit expectations

Successful executions of these existing mutations should create audit entries:

- `updateUserRole`
- `updateUserStatus`
- `silenceUser`
- `toggleInquiryStatus`
- `toggleCommentStatus`
- `updateReportStatus`

Rejected authorization/security attempts must not create success audit rows.
