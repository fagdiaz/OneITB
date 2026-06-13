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

export const UPDATE_REPORT_STATUS = gql`
  mutation UpdateReportStatus($reportId: UUID!, $status: String!) {
    updateReportStatus(reportId: $reportId, status: $status) {
      id
      status
    }
  }
`;
