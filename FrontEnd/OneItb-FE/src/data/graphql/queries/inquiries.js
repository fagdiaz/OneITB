import { gql } from '@apollo/client';

export const GET_INQUIRIES = gql`
  query GetInquiries($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!], $inquiryId: UUID) {
    inquiries(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds, inquiryId: $inquiryId) {
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
      isActive
      isHiddenByModerator
      preferAttachmentCover
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
        isActive
        isHiddenByModerator
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
  query GetInquiriesPage($searchTerm: String, $careerId: Int, $careerIds: [Int!], $subjectIds: [Int!], $inquiryId: UUID, $first: Int!, $after: String) {
    inquiriesPage(searchTerm: $searchTerm, careerId: $careerId, careerIds: $careerIds, subjectIds: $subjectIds, inquiryId: $inquiryId, first: $first, after: $after) {
      hasNextPage
      nextCursor
      totalCount
      items {
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
        isActive
        isHiddenByModerator
        preferAttachmentCover
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
          isActive
          isHiddenByModerator
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

export const GET_INQUIRY_REACTION_USERS_PAGE = gql`
  query GetInquiryReactionUsersPage($inquiryId: UUID!, $first: Int!, $after: String) {
    inquiryReactionUsersPage(inquiryId: $inquiryId, first: $first, after: $after) {
      hasNextPage
      nextCursor
      totalCount
      items {
        id
        firstName
        lastName
        avatarUrl
        role
      }
    }
  }
`;
