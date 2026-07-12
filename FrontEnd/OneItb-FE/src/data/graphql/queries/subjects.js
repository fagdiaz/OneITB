import { gql } from '@apollo/client';

export const GET_SUBJECTS = gql`
  query GetSubjects($careerId: Int) {
    subjects(careerId: $careerId) {
      id
      name
      code
      year
      isActive
      career {
        id
        name
        code
        isActive
      }
      prerequisites {
        id
        name
        code
        year
      }
    }
  }
`;
