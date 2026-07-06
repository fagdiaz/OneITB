import { gql } from '@apollo/client';

export const GET_ACADEMIC_RESOURCES = gql`
  query GetAcademicResources($subjectId: Int!, $searchTerm: String, $category: AcademicResourceCategory) {
    academicResources(subjectId: $subjectId, searchTerm: $searchTerm, category: $category) {
      id
      title
      description
      fileUrl
      externalUrl
      resourceType
      category
      version
      createdAt
      isActive
      subject {
        id
        name
        code
        career {
          id
          name
          code
        }
      }
      uploader {
        id
        firstName
        lastName
        role
        avatarUrl
      }
    }
  }
`;

export const GET_RESOURCES_BY_SUBJECT = gql`
  query GetResourcesBySubject($subjectId: Int!, $searchTerm: String, $category: AcademicResourceCategory) {
    resourcesBySubject(subjectId: $subjectId, searchTerm: $searchTerm, category: $category) {
      id
      title
      description
      fileUrl
      externalUrl
      resourceType
      category
      version
      createdAt
      isActive
      subject {
        id
        name
        code
        career {
          id
          name
          code
        }
      }
      uploader {
        id
        firstName
        lastName
        role
        avatarUrl
      }
    }
  }
`;

export const GET_MY_ACADEMIC_PROGRESS = gql`
  query GetMyAcademicProgress {
    myAcademicProgress {
      id
      score
      status
      notes
      updatedAt
      subject {
        id
        name
        code
        career {
          id
          name
          code
        }
      }
      assignedBy {
        id
        firstName
        lastName
        role
      }
    }
  }
`;

export const GET_ACADEMIC_PROGRESS_FOR_USER = gql`
  query GetAcademicProgressForUser($userId: UUID!) {
    academicProgressForUser(userId: $userId) {
      id
      score
      status
      notes
      updatedAt
      subject {
        id
        name
        code
        career {
          id
          name
          code
        }
      }
      assignedBy {
        id
        firstName
        lastName
        role
      }
    }
  }
`;

export const GET_ACADEMIC_STUDENTS = gql`
  query GetAcademicStudents($subjectId: Int!) {
    academicStudents(subjectId: $subjectId) {
      id
      firstName
      lastName
      role
    }
  }
`;
