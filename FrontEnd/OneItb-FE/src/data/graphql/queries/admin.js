import { gql } from '@apollo/client';

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers {
    users {
      id
      firstName
      lastName
      role
      isActive
      mutedUntil
      totalPosts
      totalComments
      totalLikesReceived
      totalReportsReceived
      account {
        email
      }
    }
  }
`;

export const GET_COMMUNITY_REPORTS = gql`
  query GetCommunityReports {
    communityReports {
      id
      reason
      status
      createdAt
      reporter {
        id
        firstName
        lastName
      }
      inquiry {
        id
        title
      }
    }
  }
`;

export const GET_MODERATION_AUDITS = gql`
  query GetModerationAudits($first: Int!) {
    moderationAudits(first: $first) {
      id
      action
      summary
      createdAt
      actorUser {
        id
        firstName
        lastName
        role
      }
      targetUser {
        id
        firstName
        lastName
        role
      }
      targetInquiry {
        id
        title
      }
      targetComment {
        id
        content
      }
      targetReport {
        id
        status
        reason
      }
    }
  }
`;
