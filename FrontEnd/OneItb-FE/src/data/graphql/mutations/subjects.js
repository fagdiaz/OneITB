import { gql } from '@apollo/client';

export const ADD_SUBJECT = gql`
  mutation AddSubject($code: String!, $name: String!) {
    addSubject(code: $code, name: $name) {
      id
      code
      name
      isActive
    }
  }
`;

export const UPDATE_SUBJECT = gql`
  mutation UpdateSubject($id: Int!, $code: String!, $name: String!) {
    updateSubject(id: $id, code: $code, name: $name) {
      id
      code
      name
      isActive
    }
  }
`;

export const TOGGLE_SUBJECT_STATUS = gql`
  mutation ToggleSubjectStatus($id: Int!) {
    toggleSubjectStatus(id: $id) {
      id
      code
      name
      isActive
    }
  }
`;
