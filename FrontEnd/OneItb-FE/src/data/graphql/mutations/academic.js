import { gql } from '@apollo/client';

export const ADD_ACADEMIC_RESOURCE = gql`
  mutation AddAcademicResource(
    $subjectId: Int!
    $title: String!
    $description: String
    $fileUrl: String
    $externalUrl: String
  ) {
    addAcademicResource(
      subjectId: $subjectId
      title: $title
      description: $description
      fileUrl: $fileUrl
      externalUrl: $externalUrl
    ) {
      id
      title
      description
      fileUrl
      externalUrl
      resourceType
      createdAt
      isActive
      uploader {
        id
        firstName
        lastName
        role
      }
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
