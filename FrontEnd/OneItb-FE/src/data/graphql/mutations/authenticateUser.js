import { gql } from '@apollo/client';

export const AUTHENTICATE_USER = gql`
mutation Login($input: LoginInput!) {
    login(input: $input) {                  
        token
      username
      isAuthenticated
      id
      role
    }
}
`;
