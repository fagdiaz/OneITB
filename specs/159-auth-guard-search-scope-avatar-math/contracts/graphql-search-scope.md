# Contract: GraphQL Search and Scope

## Queries

### `inquiries`

Existing query remains compatible:

```graphql
query GetInquiries($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!]) {
  inquiries(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds) {
    id
    title
    subject { id name code career { id name code } }
  }
}
```

Rules:
- `careerId` remains legacy compatibility.
- `careerIds` supports multi-career filtering.
- For normal authenticated users, backend intersects requested careers with the user's enrolled careers.
- For normal authenticated users with no requested career filter, backend uses all enrolled careers.
- Admin and Moderator bypass career scoping.

### `inquiriesPage`

Same scope semantics:

```graphql
query GetInquiriesPage($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!], $first: Int!, $after: String) {
  inquiriesPage(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds, first: $first, after: $after) {
    hasNextPage
    nextCursor
    totalCount
    items { id title content }
  }
}
```

## Search Semantics

Search matches:
- Inquiry title/content
- Subject name/code
- Career code/name
- Author first/last/full name
- Author email
- Comment content
- Comment author first/last/full name

## Security Expectation

A normal user must not receive an inquiry whose `subject.careerId` is outside their enrolled careers, even if:
- the search term matches another user's name,
- the other user shares one career with the viewer,
- the other user also posts in another career.
