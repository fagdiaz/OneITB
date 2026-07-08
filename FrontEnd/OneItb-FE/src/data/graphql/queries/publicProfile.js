import { gql } from '@apollo/client';

export const GET_PUBLIC_PROFILE = gql`
  query PublicProfile($userId: UUID!) {
    publicProfile(userId: $userId) {
      id
      firstName
      lastName
      fullName
      role
      biography
      linkedIn
      facebook
      instagram
      phone
      avatarUrl
      isPublicProfile
      canViewSensitiveProfile
      cvExperiences {
        id
        company
        role
        startDate
        endDate
        location
        description
        hidden: isHidden
        sortOrder
      }
      cvEducations {
        id
        institution
        degree
        startDate
        endDate
        location
        description
        hidden: isHidden
        sortOrder
      }
      cvProjects {
        id
        name
        role
        startDate
        endDate
        url
        description
        hidden: isHidden
        sortOrder
      }
      cvSkills {
        id
        name
        level
        hidden: isHidden
        sortOrder
      }
      cvLanguages {
        id
        name
        level
        hidden: isHidden
        sortOrder
      }
      careers
      totalPublications
      totalComments
    }
  }
`;
