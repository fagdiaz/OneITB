# GraphQL Contract: Spec 178

## Input

```graphql
input SocialAttachmentInput {
  fileUrl: String!
  originalFileName: String!
  contentType: String!
  size: Long!
  sortOrder: Int!
}
```

## Extended mutations

```graphql
addInquiry(
  subjectId: Int!
  title: String!
  content: String!
  fileUrl: String
  attachments: [SocialAttachmentInput!]
): Inquiry!

addComment(
  inquiryId: UUID!
  content: String!
  parentCommentId: UUID
  fileUrl: String
  attachments: [SocialAttachmentInput!]
): Comment!

toggleCommentReaction(commentId: UUID!): ToggleCommentReactionPayload!
```

`fileUrl` remains nullable for backward compatibility. New clients send `attachments`.

## New query

```graphql
inquiryReactionUsersPage(
  inquiryId: UUID!
  first: Int!
  after: String
): ReactionUserPage!
```

Only the inquiry author, Administrador or Moderador can query the list. Page size is clamped to 50.

## Extended output

```graphql
type SocialAttachment {
  id: UUID!
  fileUrl: String!
  originalFileName: String!
  contentType: String!
  size: Long!
  sortOrder: Int!
  createdAt: DateTime!
}

type Inquiry {
  attachments: [SocialAttachment!]!
}

type Comment {
  attachments: [SocialAttachment!]!
  reactions: [CommentReaction!]!
}

type Notification {
  aggregateCount: Int!
  relatedInquiryId: UUID
  updatedAt: DateTime
}
```

## Error cases

- una materia ajena/inactiva devuelve error controlado y no persiste;
- adjuntos invalidos, duplicados, mas de 10 o por encima de 15 MB agregados se rechazan;
- reaccion sobre contenido inexistente/inactivo se rechaza;
- listado de likes por no propietario se rechaza sin revelar usuarios;
- preferencias deshabilitadas o auto-interacciones no crean notificacion.
