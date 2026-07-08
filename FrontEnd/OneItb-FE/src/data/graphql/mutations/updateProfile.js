import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      success
      message
    }
  }
`;

export const TOGGLE_PROFILE_PRIVACY = gql`
  mutation ToggleProfilePrivacy($isPublic: Boolean!) {
    toggleProfilePrivacy(isPublic: $isPublic) {
      id
      success
      message
    }
  }
`;
