# Implementation Plan: Fix GraphQL Query Names

## Key Changes

1.  **Frontend (`queries/subjects.js`)**:
    -   Sustituir `getSubjects` por `subjects`.
2.  **Frontend (`queries/inquiries.js`)**:
    -   Sustituir `getInquiries` por `inquiries`.
3.  **Frontend (`Feed.jsx`)**:
    -   Sustituir referencias `getSubjects` por `subjects`.
    -   Sustituir referencias `getInquiries` por `inquiries`.
