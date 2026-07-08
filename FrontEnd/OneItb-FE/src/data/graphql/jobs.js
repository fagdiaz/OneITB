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

export const JOB_OFFER_CREATED = gql`
  ${JOB_OFFER_FIELDS}
  subscription JobOfferCreated {
    jobOfferCreated {
      ...JobOfferFields
    }
  }
`;
