import { gql } from '@apollo/client';

export const REPORT_INQUIRY = gql`
  mutation ReportInquiry($inquiryId: UUID!, $reason: String!) {
    reportInquiry(inquiryId: $inquiryId, reason: $reason) {
      id
      inquiryId
      reporterId
      status
      createdAt
    }
  }
`;
