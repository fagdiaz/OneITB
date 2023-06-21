import { gql } from '@apollo/client';

export const AUTHENTICATE_USER = gql`
  mutation AuthenticateUser($email: String!, $password: String!) {
    authenticateUser(email: $email, password: $password ) {
      user {
        id
        fullName     
        email        
      }
      token
    }
  }
`;
