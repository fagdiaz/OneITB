import { gql } from '@apollo/client';

export const SUBMIT_EMPLOYER_REQUEST = gql`
  mutation SubmitEmployerRequest($input: EmployerRequestInput!) {
    submitEmployerRequest(input: $input) {
      accepted
      referenceCode
      message
    }
  }
`;

export const GET_EMPLOYER_REQUESTS = gql`
  query EmployerRequests($status: EmployerRequestStatus, $first: Int!, $offset: Int!) {
    employerRequests(status: $status, first: $first, offset: $offset) {
      items {
        id
        companyName
        contactName
        email
        phone
        taxId
        comments
        status
        rejectionReason
        createdAt
        processedAt
        processedByAdminId
        provisionedUserId
        privacyConsentAt
        emailDeliveryStatus
        lastEmailAttemptAt
        emailDeliveryAttempts
      }
      totalCount
      hasNextPage
      nextOffset
    }
  }
`;

const EMPLOYER_REQUEST_ACTION_FIELDS = gql`
  fragment EmployerRequestActionFields on EmployerRequestActionPayload {
    accountCreated
    emailDeliveryStatus
    message
    request {
      id
      status
      rejectionReason
      processedAt
      processedByAdminId
      provisionedUserId
      emailDeliveryStatus
      lastEmailAttemptAt
      emailDeliveryAttempts
    }
  }
`;

export const APPROVE_EMPLOYER_REQUEST = gql`
  ${EMPLOYER_REQUEST_ACTION_FIELDS}
  mutation ApproveEmployerRequest($requestId: UUID!) {
    approveEmployerRequest(requestId: $requestId) {
      ...EmployerRequestActionFields
    }
  }
`;

export const REJECT_EMPLOYER_REQUEST = gql`
  ${EMPLOYER_REQUEST_ACTION_FIELDS}
  mutation RejectEmployerRequest($requestId: UUID!, $reason: String!) {
    rejectEmployerRequest(requestId: $requestId, reason: $reason) {
      ...EmployerRequestActionFields
    }
  }
`;

export const RESEND_EMPLOYER_WELCOME = gql`
  ${EMPLOYER_REQUEST_ACTION_FIELDS}
  mutation ResendEmployerWelcome($requestId: UUID!) {
    resendEmployerWelcome(requestId: $requestId) {
      ...EmployerRequestActionFields
    }
  }
`;
