import { gql } from '@apollo/client';

export const GET_INQUIRIES = gql`
  query GetInquiries($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!]) {
    inquiries(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds) {
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
        avatarUrl
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
          avatarUrl
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

export const GET_INQUIRIES_PAGE = gql`
  query GetInquiriesPage($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!], $first: Int!, $after: String) {
    inquiriesPage(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds, first: $first, after: $after) {
      hasNextPage
      nextCursor
      totalCount
      items {
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
          avatarUrl
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
            avatarUrl
            role
            totalPosts
            totalComments
            totalLikesReceived
            totalReportsReceived
          }
        }
      }
    }
  }
`;
