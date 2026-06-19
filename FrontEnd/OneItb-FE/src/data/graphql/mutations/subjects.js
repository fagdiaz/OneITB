import { gql } from '@apollo/client';

export const ADD_SUBJECT = gql`
  mutation AddSubject($name: String!, $code: String!, $careerId: Int!, $year: Int, $prerequisiteIds: [Int!]) {
    addSubject(name: $name, code: $code, careerId: $careerId, year: $year, prerequisiteIds: $prerequisiteIds) {
      id
      code
      name
      year
      isActive
      career { id name code }
      prerequisites { id name code year }
    }
  }
`;

export const UPDATE_SUBJECT = gql`
  mutation UpdateSubject($id: Int!, $name: String!, $code: String!, $careerId: Int!, $year: Int, $prerequisiteIds: [Int!]) {
    updateSubject(id: $id, name: $name, code: $code, careerId: $careerId, year: $year, prerequisiteIds: $prerequisiteIds) {
      id
      code
      name
      year
      isActive
      career { id name code }
      prerequisites { id name code year }
    }
  }
`;

export const TOGGLE_SUBJECT_STATUS = gql`
  mutation ToggleSubjectStatus($id: Int!) {
    toggleSubjectStatus(id: $id) {
      id
      code
      name
      year
      isActive
      career { id name code }
      prerequisites { id name code year }
    }
  }
`;
