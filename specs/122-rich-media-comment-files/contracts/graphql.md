# GraphQL contract

## Mutation `addComment`

```graphql
addComment(
  inquiryId: UUID!
  content: String!
  parentCommentId: UUID
  fileUrl: String
): Comment!
```

`Comment.fileUrl` is nullable. Existing clients may omit the argument.

## Inquiry query comment selection

```graphql
comments {
  id
  content
  parentCommentId
  fileUrl
}
```
