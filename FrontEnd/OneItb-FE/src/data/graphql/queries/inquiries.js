import { gql } from '@apollo/client';

export const GET_INQUIRIES = gql`
  query GetInquiries($searchTerm: String, $careerId: Int, $subjectIds: [Int!]) {
    inquiries(searchTerm: $searchTerm, careerId: $careerId, subjectIds: $subjectIds) {
      id
      title
      content
      fileUrl
      publishDate
      isActive
      reportCount
      user {
        id
        firstName
        lastName
        role
        totalPosts
        totalComments
        totalLikesReceived
        totalReportsReceived
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
        fileUrl
        createdAt
        isActive
        reportCount
        user {
          id
          firstName
          lastName
          role
          totalPosts
          totalComments
          totalLikesReceived
          totalReportsReceived
        }
      }
    }
  }
`;
