import { gql } from '@apollo/client';

export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($subjectId: Int!, $title: String!, $content: String!, $fileUrl: String, $attachments: [SocialAttachmentInput!]) {
    addInquiry(subjectId: $subjectId, title: $title, content: $content, fileUrl: $fileUrl, attachments: $attachments) {
      id
      title
      content
      fileUrl
      attachments {
        id
        fileUrl
        originalFileName
        contentType
        size
        sortOrder
      }
      publishDate
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($inquiryId: UUID!, $content: String!, $parentCommentId: UUID, $fileUrl: String, $attachments: [SocialAttachmentInput!]) {
    addComment(inquiryId: $inquiryId, content: $content, parentCommentId: $parentCommentId, fileUrl: $fileUrl, attachments: $attachments) {
      id
      inquiryId
      userId
      parentCommentId
      content
      fileUrl
      attachments {
        id
        fileUrl
        originalFileName
        contentType
        size
        sortOrder
      }
      reactions {
        id
        userId
      }
      createdAt
    }
  }
`;

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($inquiryId: UUID!) {
    toggleReaction(inquiryId: $inquiryId) {
      inquiryId
      isReacted
      reactionCount
      reactionId
    }
  }
`;

export const TOGGLE_COMMENT_REACTION = gql`
  mutation ToggleCommentReaction($commentId: UUID!) {
    toggleCommentReaction(commentId: $commentId) {
      commentId
      isReacted
      reactionCount
      reactionId
    }
  }
`;

export const EDIT_INQUIRY = gql`
  mutation EditInquiry($inquiryId: UUID!, $newTitle: String!, $newContent: String!) {
    editInquiry(inquiryId: $inquiryId, newTitle: $newTitle, newContent: $newContent) {
      id
      title
      content
      updatedAt
    }
  }
`;

export const TOGGLE_INQUIRY_STATUS = gql`
  mutation ToggleInquiryStatus($inquiryId: UUID!) {
    toggleInquiryStatus(inquiryId: $inquiryId) {
      id
      isActive
      updatedAt
    }
  }
`;

export const EDIT_COMMENT = gql`
  mutation EditComment($commentId: UUID!, $newContent: String!) {
    editComment(commentId: $commentId, newContent: $newContent) {
      id
      content
      updatedAt
      isActive
    }
  }
`;

export const TOGGLE_COMMENT_STATUS = gql`
  mutation ToggleCommentStatus($commentId: UUID!) {
    toggleCommentStatus(commentId: $commentId) {
      id
      isActive
      updatedAt
    }
  }
`;

export const INTERACT_WITH_USER = gql`
  mutation InteractWithUser($targetUserId: UUID!, $type: InteractionType!) {
    interactWithUser(targetUserId: $targetUserId, type: $type) {
      id
      observerId
      targetId
      type
    }
  }
`;
