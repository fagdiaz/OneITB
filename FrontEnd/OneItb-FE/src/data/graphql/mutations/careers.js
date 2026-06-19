import { gql } from '@apollo/client';

export const LINK_USER_TO_CAREERS = gql`
  mutation LinkUserToCareers($careerIds: [Int!]!) {
    linkUserToCareers(careerIds: $careerIds) {
      id
      success
      message
    }
  }
`;
