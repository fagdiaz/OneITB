import { gql } from '@apollo/client';

export const CONFIRM_STUDENT_CAREER = gql`
  mutation ConfirmStudentCareer($careerId: Int!) {
    confirmStudentCareer(careerId: $careerId) {
      id
      name
      code
      isActive
    }
  }
`;

export const LINK_USER_TO_CAREERS = gql`
  mutation LinkUserToCareers($careerIds: [Int!]!) {
    linkUserToCareers(careerIds: $careerIds) {
      id
      name
      code
      isActive
    }
  }
`;
