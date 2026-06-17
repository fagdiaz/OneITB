import { gql } from '@apollo/client';

export const GET_CAREERS = gql`
  query GetCareers {
    careers {
      id
      name
      isActive
    }
  }
`;

export const GET_MY_CAREERS = gql`
  query GetMyCareers {
    myCareers {
      id
      name
      isActive
    }
  }
`;
