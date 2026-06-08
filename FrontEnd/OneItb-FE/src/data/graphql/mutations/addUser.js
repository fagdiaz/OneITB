import { gql } from '@apollo/client';

export const ADD_USER = gql`
mutation RegisterUser($input: RegisterInput!) {
    registerUser(input: $input) {                  
        id
        success
        message           
    }
}
`;
