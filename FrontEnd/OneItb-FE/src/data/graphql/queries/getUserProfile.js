import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    users {
      id
      firstName
      lastName
      fullName
      alias
      email
      biography
      linkedIn
      facebook
      instagram
      phone
    }
  }
`;
