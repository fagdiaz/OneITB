import { gql } from '@apollo/client';

export const ADD_USER = gql`
mutation AddUser(
    $fullName: String!
    $email: String!
    $password: String!
    $alias: String!
    $userName: String!
    $accountId: Int!
)
{
    addUser(
        input: {
            fullName: $fullName
            email: $email
            password: $password
            alias: $alias
            userName: $userName
            accountId: $accountId
            }
        )
        {                  
            id,
            fullName,
            email           
        }
}
`;

