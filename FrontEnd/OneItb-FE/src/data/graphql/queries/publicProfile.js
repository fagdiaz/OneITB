import { gql } from '@apollo/client';

export const GET_PUBLIC_PROFILE = gql`
  query PublicProfile($userId: UUID!) {
    publicProfile: userById(id: $userId) {
      id
      firstName
      lastName
      fullName
      role
      biography
      linkedIn
      facebook
      instagram
      phone
    }
  }
`;
