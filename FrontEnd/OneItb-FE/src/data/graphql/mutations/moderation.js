import { gql } from '@apollo/client';

export const REPORT_CONTENT = gql`
    mutation ReportContent($reporterId: UUID!, $contentId: String!, $contentType: String!, $reason: String!) {
        reportContent(reporterId: $reporterId, contentId: $contentId, contentType: $contentType, reason: $reason)
    }
`;
