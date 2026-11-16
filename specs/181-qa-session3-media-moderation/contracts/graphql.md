# GraphQL Contract Delta

```graphql
type Inquiry {
  preferAttachmentCover: Boolean!
  isHiddenByModerator: Boolean!
}

type Comment {
  isHiddenByModerator: Boolean!
}

extend type Mutation {
  addInquiry(subjectId: Int!, title: String!, content: String!, fileUrl: String, attachments: [SocialAttachmentInput!], preferAttachmentCover: Boolean): Inquiry!
  editInquiry(inquiryId: UUID!, newTitle: String!, newContent: String!, attachments: [SocialAttachmentInput!], preferAttachmentCover: Boolean): Inquiry!
  editComment(commentId: UUID!, newContent: String!, attachments: [SocialAttachmentInput!]): Comment!
  moderateInquiryVisibility(inquiryId: UUID!, isHidden: Boolean!, reason: String!): Inquiry!
  moderateCommentVisibility(commentId: UUID!, isHidden: Boolean!, reason: String!): Comment!
}
```

## Authorization matrix

| Operation | Author | Moderator | Administrator | Other authenticated |
|---|---:|---:|---:|---:|
| edit/toggle own content | yes | only if author | only if author | only if author |
| moderate visibility with reason | no | yes | yes | no |
| create second-level reply | yes | yes | yes | yes |
| create third-level reply | rejected | rejected | rejected | rejected |

Validation failures use GraphQL code `USER_ERROR`; unexpected failures remain sanitized.
