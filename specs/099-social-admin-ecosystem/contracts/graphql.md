# GraphQL Contract

## Feed query

```graphql
query GetInquiries {
  inquiries {
    id
    title
    content
    publishDate
    user { id firstName lastName }
    subject { id name code }
    reactions { id userId }
    comments {
      id
      inquiryId
      userId
      parentCommentId
      content
      createdAt
      user { id firstName lastName }
    }
  }
}
```

## Mutations

```graphql
mutation CreateInquiry($subjectId: Int!, $title: String!, $content: String!) {
  addInquiry(subjectId: $subjectId, title: $title, content: $content) {
    id
    title
    content
    publishDate
  }
}

mutation AddComment($inquiryId: UUID!, $content: String!, $parentCommentId: UUID) {
  addComment(inquiryId: $inquiryId, content: $content, parentCommentId: $parentCommentId) {
    id
    inquiryId
    userId
    parentCommentId
    content
    createdAt
  }
}

mutation ToggleReaction($inquiryId: UUID!) {
  toggleReaction(inquiryId: $inquiryId) {
    inquiryId
    isReacted
    reactionCount
  }
}

mutation ReportInquiry($inquiryId: UUID!, $reason: String!) {
  reportInquiry(inquiryId: $inquiryId, reason: $reason) {
    id
    inquiryId
    reporterId
    status
    createdAt
  }
}
```

Actor identity is taken from the authenticated JWT.

## Administration

```graphql
query GetCommunityReports {
  communityReports {
    id
    reason
    status
    createdAt
    reporter { id firstName lastName }
    inquiry { id title }
  }
}
```

`communityReports` accepts Administrator and Moderator roles. Existing user management mutations remain Administrator-only.

