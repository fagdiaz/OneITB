# GraphQL Contract: Mega Refactor Core

Field names are canonical English camelCase. Spanish is only allowed in visible UI text.

## Types

```graphql
enum InteractionType {
  FOLLOW
  MUTE
  BLOCK
}

type Career {
  id: Int!
  name: String!
  isActive: Boolean!
}

type UserInteraction {
  id: UUID!
  observerId: UUID!
  targetId: UUID!
  type: InteractionType!
  createdAt: DateTime!
}

type PublicProfileSummary {
  user: User!
  careers: [Career!]!
  recentInquiries: [Inquiry!]!
}
```

## Queries

```graphql
query Careers {
  careers {
    id
    name
    isActive
  }
}

query MyCareers {
  myCareers {
    id
    name
  }
}

query Subjects($careerId: Int) {
  subjects(careerId: $careerId) {
    id
    code
    name
    isActive
  }
}

query Inquiries($searchTerm: String, $careerId: Int, $subjectIds: [Int!]) {
  inquiries(searchTerm: $searchTerm, careerId: $careerId, subjectIds: $subjectIds) {
    id
    title
    content
    isActive
    user { id firstName lastName role }
    subject { id name }
  }
}

query PublicProfile($userId: UUID!) {
  publicProfile(userId: $userId) {
    user { id firstName lastName role biography linkedIn facebook instagram phone }
    careers { id name }
    recentInquiries { id title content }
  }
}
```

## Mutations

```graphql
mutation LinkUserToCareers($careerIds: [Int!]!) {
  linkUserToCareers(careerIds: $careerIds) {
    id
    name
  }
}

mutation EditInquiry($inquiryId: UUID!, $newTitle: String!, $newContent: String!) {
  editInquiry(inquiryId: $inquiryId, newTitle: $newTitle, newContent: $newContent) {
    id
    title
    content
    updatedAt
  }
}

mutation ToggleInquiryStatus($inquiryId: UUID!) {
  toggleInquiryStatus(inquiryId: $inquiryId) {
    id
    isActive
  }
}

mutation EditComment($commentId: UUID!, $newContent: String!) {
  editComment(commentId: $commentId, newContent: $newContent) {
    id
    content
    updatedAt
  }
}

mutation ToggleCommentStatus($commentId: UUID!) {
  toggleCommentStatus(commentId: $commentId) {
    id
    isActive
  }
}

mutation InteractWithUser($targetUserId: UUID!, $type: InteractionType!) {
  interactWithUser(targetUserId: $targetUserId, type: $type) {
    id
    targetId
    type
  }
}
```

## Authorization Contract

- Career reads are authenticated where they expose current-user enrollment.
- Content editing requires the authenticated author.
- Content status toggling requires author, moderator, or administrator.
- Social interactions require authenticated users and reject self-interaction.
- Public profile read must not expose credential fields.
