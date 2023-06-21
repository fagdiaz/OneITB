import { gql } from '@apollo/client';

export const GET_USER = gql`
query UserById($id: Int!){
  userById {
    id,
    fullName,
    password
  }
}
`
