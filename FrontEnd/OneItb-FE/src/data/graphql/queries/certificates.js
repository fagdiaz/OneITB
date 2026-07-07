import { gql } from '@apollo/client';

export const GET_PUBLIC_CERTIFICATE = gql`
  query GetPublicCertificate($id: UUID!) {
    publicCertificate(id: $id) {
      id
      studentFullName
      subjectName
      subjectCode
      careerName
      score
      status
      updatedAt
    }
  }
`;
