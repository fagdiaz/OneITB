import { gql } from '@apollo/client';

export const REQUEST_MAGIC_LINK = gql`
    mutation RequestMagicLink($email: String!, $cuit: String!) {
        requestMagicLink(email: $email, cuit: $cuit) {
            accepted
            message
        }
    }
`;

export const LOGIN_WITH_MAGIC_LINK = gql`
    mutation LoginWithMagicLink($token: String!) {
        loginWithMagicLink(token: $token)
    }
`;
