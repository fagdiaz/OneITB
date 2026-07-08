import { gql } from '@apollo/client';

const JOB_OFFER_FIELDS = gql`
  fragment JobOfferFields on JobOffer {
    id
    title
    company
    description
    location
    isActive
    createdAt
    employer {
      id
      fullName
      email
      role
      avatarUrl
    }
    applications {
      id
      status
      appliedAt
    }
  }
`;

const JOB_APPLICATION_FIELDS = gql`
  fragment JobApplicationFields on JobApplication {
    id
    status
    appliedAt
    applicant {
      id
      firstName
      lastName
      fullName
      email
      role
      biography
      avatarUrl
      linkedIn
      phone
      userCareers {
        career {
          id
          name
        }
      }
      cvExperiences {
        id
        company
        role
        description
        startDate
        endDate
        isHidden
        sortOrder
      }
      cvEducations {
        id
        institution
        degree
        description
        startDate
        endDate
        isHidden
        sortOrder
      }
      cvSkills {
        id
        name
        level
        isHidden
        sortOrder
      }
    }
  }
`;

export const GET_JOB_OFFERS = gql`
  ${JOB_OFFER_FIELDS}
  query JobOffers($onlyActive: Boolean, $first: Int, $after: String) {
    jobOffers(onlyActive: $onlyActive, first: $first, after: $after) {
      nodes {
        ...JobOfferFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_JOB_OFFER = gql`
  ${JOB_OFFER_FIELDS}
  mutation CreateJobOffer(
    $title: String!
    $company: String!
    $description: String!
    $location: String!
  ) {
    createJobOffer(
      title: $title
      company: $company
      description: $description
      location: $location
    ) {
      ...JobOfferFields
    }
  }
`;

export const GET_MY_JOB_OFFERS = gql`
  ${JOB_OFFER_FIELDS}
  ${JOB_APPLICATION_FIELDS}
  query MyJobOffers($first: Int, $after: String) {
    myJobOffers(first: $first, after: $after) {
      nodes {
        ...JobOfferFields
        applications {
          ...JobApplicationFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const APPLY_TO_JOB = gql`
  ${JOB_APPLICATION_FIELDS}
  mutation ApplyToJob($jobOfferId: UUID!) {
    applyToJob(jobOfferId: $jobOfferId) {
      ...JobApplicationFields
    }
  }
`;

export const UPDATE_APPLICATION_STATUS = gql`
  ${JOB_APPLICATION_FIELDS}
  mutation UpdateApplicationStatus($applicationId: UUID!, $status: JobApplicationStatus!) {
    updateApplicationStatus(applicationId: $applicationId, status: $status) {
      ...JobApplicationFields
    }
  }
`;

export const JOB_OFFER_CREATED = gql`
  ${JOB_OFFER_FIELDS}
  subscription JobOfferCreated {
    jobOfferCreated {
      ...JobOfferFields
    }
  }
`;
