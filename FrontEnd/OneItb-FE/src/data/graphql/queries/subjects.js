import { gql } from '@apollo/client';

export const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      code
      isActive
    }
  }
`;
