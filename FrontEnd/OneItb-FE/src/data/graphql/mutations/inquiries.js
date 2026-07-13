import { gql } from '@apollo/client';

export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($subjectId: Int!, $title: String!, $content: String!, $fileUrl: String, $attachments: [SocialAttachmentInput!], $preferAttachmentCover: Boolean) {
    addInquiry(subjectId: $subjectId, title: $title, content: $content, fileUrl: $fileUrl, attachments: $attachments, preferAttachmentCover: $preferAttachmentCover) {
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
      preferAttachmentCover
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($inquiryId: UUID!, $content: String!, $parentCommentId: UUID, $replyTargetCommentId: UUID, $fileUrl: String, $attachments: [SocialAttachmentInput!]) {
    addComment(inquiryId: $inquiryId, content: $content, parentCommentId: $parentCommentId, replyTargetCommentId: $replyTargetCommentId, fileUrl: $fileUrl, attachments: $attachments) {
      id
      inquiryId
      userId
      parentCommentId
      replyToUserId
      replyToUser {
        id
        firstName
        lastName
        fullName
      }
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
  mutation EditInquiry($inquiryId: UUID!, $newTitle: String!, $newContent: String!, $attachments: [SocialAttachmentInput!], $preferAttachmentCover: Boolean) {
    editInquiry(inquiryId: $inquiryId, newTitle: $newTitle, newContent: $newContent, attachments: $attachments, preferAttachmentCover: $preferAttachmentCover) {
      id
      title
      content
      fileUrl
      preferAttachmentCover
      attachments {
        id
        fileUrl
        originalFileName
        contentType
        size
        sortOrder
      }
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
  mutation EditComment($commentId: UUID!, $newContent: String!, $attachments: [SocialAttachmentInput!]) {
    editComment(commentId: $commentId, newContent: $newContent, attachments: $attachments) {
      id
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

export const MODERATE_INQUIRY_VISIBILITY = gql`
  mutation ModerateInquiryVisibility($inquiryId: UUID!, $isHidden: Boolean!, $reason: String!) {
    moderateInquiryVisibility(inquiryId: $inquiryId, isHidden: $isHidden, reason: $reason) {
      id
      isHiddenByModerator
      updatedAt
    }
  }
`;

export const MODERATE_COMMENT_VISIBILITY = gql`
  mutation ModerateCommentVisibility($commentId: UUID!, $isHidden: Boolean!, $reason: String!) {
    moderateCommentVisibility(commentId: $commentId, isHidden: $isHidden, reason: $reason) {
      id
      inquiryId
      isHiddenByModerator
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
