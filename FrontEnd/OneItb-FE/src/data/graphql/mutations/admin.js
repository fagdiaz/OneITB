import { gql } from '@apollo/client';

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: UUID!, $newRole: String!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      id
      success
      message
    }
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($userId: UUID!, $isActive: Boolean!) {
    updateUserStatus(userId: $userId, isActive: $isActive) {
      id
      success
      message
    }
  }
`;
