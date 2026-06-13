import { gql } from '@apollo/client';

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers {
    users {
      id
      firstName
      lastName
      role
      isActive
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
