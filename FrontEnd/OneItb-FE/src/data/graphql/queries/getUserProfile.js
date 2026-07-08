import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      firstName
      lastName
      fullName
      alias
      email
      role
      biography
      linkedIn
      facebook
      instagram
      phone
      avatarUrl
      isPublicProfile
      userCareers {
        career {
          id
          name
          code
          isActive
        }
      }
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
    }
  }
`;
