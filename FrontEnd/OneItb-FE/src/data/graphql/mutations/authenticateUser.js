import { gql } from '@apollo/client';

export const AUTHENTICATE_USER = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      username
      isAuthenticated
      id
      role
      email
    }
  }
`;

export const MICROSOFT_LOGIN = gql`
  mutation MicrosoftLogin($accessToken: String!) {
    microsoftLogin(accessToken: $accessToken) {
      token
      username
      isAuthenticated
      id
      role
      email
    }
  }
`;
