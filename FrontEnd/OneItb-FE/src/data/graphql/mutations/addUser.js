import { gql } from '@apollo/client';

export const ADD_USER = gql`
mutation AddUser(
    $fullName: String!
    $alias: String!
    $password: String!
    $email: String!
)
{
    addUser(
        input: {
            fullName: $fullName
            alias: $alias
            password: $password
            email: $email
            }
        )
        {                  
            id,
            fullName,
            email           
        }
}
`;

