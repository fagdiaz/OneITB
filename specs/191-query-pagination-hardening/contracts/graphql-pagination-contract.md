# Contract: Bounded Social and Academic Queries

## Social Feed/Search

Canonical operation:

~~~graphql
query GetInquiriesPage(
  $searchTerm: String
  $careerId: Int
  $careerIds: [Int!]
  $subjectIds: [Int!]
  $inquiryId: UUID
  $authorId: UUID
  $first: Int!
  $after: String
) {
  inquiriesPage(
    searchTerm: $searchTerm
    careerId: $careerId
    careerIds: $careerIds
    subjectIds: $subjectIds
    inquiryId: $inquiryId
    authorId: $authorId
    first: $first
    after: $after
  ) {
    items { id }
    totalCount
    hasNextPage
    nextCursor
  }
}
~~~

- `first` is clamped to 1..25.
- `after` is opaque and invalid values return a controlled user error.
- visibility, career scope, mute/block and order are server-authoritative.
- `authorId` is applied server-side before pagination for profile summaries.
- the legacy unbounded `inquiries` field is removed.

## Academic Students

Target operation:

~~~graphql
query GetAcademicStudents($subjectId: Int!, $first: Int!, $after: String) {
  academicStudents(subjectId: $subjectId, first: $first, after: $after) {
    items {
      id
      firstName
      lastName
    }
    totalCount
    hasNextPage
    nextCursor
  }
}
~~~

- only Administrador/Profesor may execute it;
- service scope validates actor, active subject and eligible career;
- ordering is `LastName`, `FirstName`, `Id`;
- maximum page size is 50.

## Cancellation Contract

Both operations accept the request cancellation token and pass it to every EF terminal call. Cancellation is not translated into a user/business error.
