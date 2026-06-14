import { gql } from '@apollo/client';

export const GET_INQUIRIES = gql`
  query GetInquiries {
    inquiries {
      id
      title
      content
      attachedFileUrl
      publishDate
      user {
        id
        firstName
        lastName
      }
      subject {
        id
        name
        code
      }
      reactions {
        id
        userId
      }
      comments {
        id
        inquiryId
        userId
        parentCommentId
        content
        createdAt
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
