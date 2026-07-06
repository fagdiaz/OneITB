import { gql } from '@apollo/client';

export const ADD_ACADEMIC_RESOURCE = gql`
  mutation AddAcademicResource(
    $subjectId: Int!
    $title: String!
    $description: String
    $category: AcademicResourceCategory
    $version: Int
    $fileUrl: String
    $externalUrl: String
  ) {
    addAcademicResource(
      subjectId: $subjectId
      title: $title
      description: $description
      category: $category
      version: $version
      fileUrl: $fileUrl
      externalUrl: $externalUrl
    ) {
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
      uploader {
        id
        firstName
        lastName
        role
        avatarUrl
      }
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
    }
  }
`;

export const UPLOAD_ACADEMIC_RESOURCE = gql`
  mutation UploadAcademicResource(
    $subjectId: Int!
    $title: String!
    $description: String
    $category: AcademicResourceCategory
    $version: Int
    $fileUrl: String
    $externalUrl: String
  ) {
    uploadAcademicResource(
      subjectId: $subjectId
      title: $title
      description: $description
      category: $category
      version: $version
      fileUrl: $fileUrl
      externalUrl: $externalUrl
    ) {
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
      uploader {
        id
        firstName
        lastName
        role
        avatarUrl
      }
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
    }
  }
`;

export const DELETE_RESOURCE = gql`
  mutation DeleteResource($resourceId: UUID!) {
    deleteResource(resourceId: $resourceId) {
      id
      isActive
      updatedAt
    }
  }
`;

export const TOGGLE_ACADEMIC_RESOURCE_STATUS = gql`
  mutation ToggleAcademicResourceStatus($resourceId: UUID!) {
    toggleAcademicResourceStatus(resourceId: $resourceId) {
      id
      isActive
      updatedAt
    }
  }
`;

export const UPSERT_ACADEMIC_PROGRESS = gql`
  mutation UpsertAcademicProgress(
    $userId: UUID!
    $subjectId: Int!
    $score: Decimal
    $status: AcademicProgressStatus!
    $notes: String
  ) {
    upsertAcademicProgress(
      userId: $userId
      subjectId: $subjectId
      score: $score
      status: $status
      notes: $notes
    ) {
      id
      score
      status
      notes
      updatedAt
      user {
        id
        firstName
        lastName
        role
      }
      subject {
        id
        name
        code
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

export const SYNC_SIU_GRADES = gql`
  mutation SyncSiuGrades($subjectId: Int!) {
    syncSiuGrades(subjectId: $subjectId) {
      subjectId
      processed
      created
      updated
      skipped
      message
      skippedItems
    }
  }
`;
