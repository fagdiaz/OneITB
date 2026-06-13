import { gql } from '@apollo/client';

export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($subjectId: Int!, $title: String!, $content: String!) {
    addInquiry(subjectId: $subjectId, title: $title, content: $content) {
      id
      title
      content
      publishDate
    }
  }
`;

export const ADD_COMMENT = gql`
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
`;

export const TOGGLE_REACTION = gql`
  mutation ToggleReaction($inquiryId: UUID!) {
    toggleReaction(inquiryId: $inquiryId) {
      inquiryId
      isReacted
      reactionCount
    }
  }
`;
