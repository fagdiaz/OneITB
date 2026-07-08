import { gql } from '@apollo/client';

export const SEARCH_PUBLIC_PROFILES = gql`
  query SearchPublicProfiles($searchTerm: String, $first: Int!) {
    searchPublicProfiles(searchTerm: $searchTerm, first: $first) {
      id
      fullName
      role
      avatarUrl
      isPublicProfile
      canViewSensitiveProfile
      careers
    }
  }
`;
